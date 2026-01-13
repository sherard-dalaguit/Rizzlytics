import "server-only";

import {PutBlobResult} from "@vercel/blob";
import {openai} from "@/lib/server/openai";

/**
 * Extracts raw, human-visible text froma  screenshot of a message thread.
 *
 * This function sends the uploaded image to an AI vision model and returns
 * only the text that appears in the image, in reading order. It performs
 * no interpretation, summarization, or cleanup - the output is intended to
 * be a faithful OCR-style capture of what a human would read on the screen.
 * @param threadBlob - The blob of the thread screenshot to extract text from
 * @returns The raw extracted text from the screenshot
 */
const extractRawText = async (threadBlob: PutBlobResult) => {
  if (!threadBlob) throw new Error("No thread blob provided for text extraction");

  const response = await openai.responses.create({
    model: "gpt-4o",
    input: [{
      role: "user",
      content: [
        {
          type: "input_text",
          text: `
            Extract all visible message text from this screenshot. 
            Preserve line breaks and emojis. 
            If the message starts from the left side of the screen, prepend the letter L right before the message text. 
            If the message starts from the right side of the screen, prepend the letter R right before the message text.
            Always include a space after the L or R, before the message text.
            Do not include any text that is not part of the message thread (e.g., UI elements, timestamps, buttons).
            Provide the output as plain text with no additional commentary.
          `
        },
        { type: "input_image", image_url: threadBlob.url, detail: "auto" }
      ]
    }]
  })

  const rawText = response.output_text ?? "";

  if (!rawText) {
    throw new Error("No text extracted from thread screenshot");
  }

  return rawText
}

export default extractRawText;