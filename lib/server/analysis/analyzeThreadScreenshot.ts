'use server';

import {PutBlobResult} from "@vercel/blob";
import extractRawText from "@/lib/server/analysis/extractRawText";
import formatTranscriptMessage from "@/lib/server/analysis/formatTranscriptMessage";
import {ITranscriptMessage} from "@/database/conversation-snapshot.model";

/**
 * Runs the full screenshot -> transcript pipeline
 *
 * Pipeline:
 * 1. Extracts raw text from the thread screenshot using OpenAI Vision
 * 2. Normalizes and formats the text into structured messages
 *
 * This is the main entry point for analyzing a thread screenshot.
 * @param threadBlob - The blob of the thread screenshot to analyze
 * @returns A structured transcript message array extracted from the screenshot
 */
const analyzeThreadScreenshot = async (threadBlob: PutBlobResult): Promise<ITranscriptMessage[]> => {
  const rawText = await extractRawText(threadBlob);
  const transcriptMessages = await formatTranscriptMessage(rawText);

  if (!transcriptMessages) throw new Error("Failed to format transcript messages");
  return transcriptMessages;
}

export default analyzeThreadScreenshot;