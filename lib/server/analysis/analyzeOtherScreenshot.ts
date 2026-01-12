'use server';

import {PutBlobResult} from "@vercel/blob";
import {openai} from "@/lib/server/openai";

/**
 * Analyzes the other profile’s dating photo image\(s\) and produces a single context string.
 *
 * Purpose:
 * - Takes one or more uploaded images representing the other person’s profile photos
 * - Extracts salient, non\-sensitive visual details \(e\.g\., setting, activities, style\)
 * - Summarizes those details into a concise context string for downstream analysis
 *
 * Notes:
 * - This function should avoid guessing protected attributes \(e\.g\., age, ethnicity, religion, etc\.\)
 * - Returns a plain string suitable for injecting into prompts or storing alongside the profile
 *
 * @param otherBlob - Uploaded image blob for the other profile’s photo \(or a representative image from a set\)
 * @returns A concise context string describing what’s visible in the photo image\(s\)
 */
const analyzeOtherScreenshot = async (otherBlob: PutBlobResult): Promise<string> => {
  if (!otherBlob) throw new Error("No other profile photo blob provided for analysis");

  const response = await openai.responses.create({
    model: "gpt-4o",
    input: [{
      role: "user",
      content: [
        {
          type: "input_text",
          text: `
            You are an assistant that extracts high-signal, non-sensitive context from dating profile photos.

            INPUT:
            - One or more images from a person's dating profile.
            
            GOAL:
            - Produce a concise description of what the photos communicate about the person’s *presentation and vibe*.
            
            INSTRUCTIONS:
            - Describe observable details only.
            - Focus on:
              - Setting(s) and environment (e.g., indoors, outdoors, travel, social scenes)
              - Activities or hobbies shown
              - Clothing style and grooming
              - Overall mood or energy conveyed (e.g., playful, relaxed, polished, adventurous)
              - Social framing (solo shots, group shots, candid vs posed)
            - Frame the description in a way that helps someone understand how this person might be perceived on a dating app.
            
            CONSTRAINTS:
            - Do NOT guess or infer protected or sensitive attributes (e.g., age, ethnicity, religion, income, sexual orientation).
            - Do NOT speculate beyond what is visually apparent.
            - Do NOT include moral judgments or attractiveness scores.
            
            OUTPUT:
            - A single plain-text context string (2-3 sentences).
            - Write in neutral, descriptive language suitable for use as contextual input in an AI analysis pipeline.
            
            EXAMPLE OUTPUT STYLE:
            - "Photos show a casually dressed person in outdoor and social settings, including travel and group shots, suggesting an active and socially engaged lifestyle with a relaxed, approachable vibe."
          `
        },
        { type: "input_image", image_url: otherBlob.url, detail: "auto" }
      ]
    }]
  })

  const contextString = response.output_text ?? "";

  if (!contextString) {
    throw new Error("No context string generated from other profile photo analysis");
  }

  return contextString;
}

export default analyzeOtherScreenshot;