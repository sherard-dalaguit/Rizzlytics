import {ITranscriptMessage} from "@/database/conversation-snapshot.model";

/**
 * Merges transcript chunks while removing overlap between screenshots.
 *
 * This is useful when consecutive screenshots of the same chat contain
 * repeated messages at the seam.
 */
export function mergeTranscript(
  existing: ITranscriptMessage[],
  incoming: ITranscriptMessage[]
): ITranscriptMessage[] {
  const cleanExisting = existing.filter(isRealMessage);
  const cleanIncoming = incoming.filter(isRealMessage);

  // Allow a few junk / OCR artifact messages at the start of the incoming batch
  const maxStartOffset = Math.min(3, cleanIncoming.length);

  for (let offset = 0; offset <= maxStartOffset; offset++) {
    const shiftedIncoming = cleanIncoming.slice(offset);
    const maxOverlap = Math.min(cleanExisting.length, shiftedIncoming.length);

    for (let overlap = maxOverlap; overlap > 0; overlap--) {
      const tail = cleanExisting.slice(cleanExisting.length - overlap);
      const head = shiftedIncoming.slice(0, overlap);

      const allMatch = tail.every((existingMessage, index) =>
        sameMessage(existingMessage, head[index])
      );

      if (allMatch) {
        return reindexMessages([
          ...cleanExisting,
          ...shiftedIncoming.slice(overlap),
        ]);
      }
    }
  }

  return reindexMessages([...cleanExisting, ...cleanIncoming]);
}

/**
 * Deduplicates an already-merged transcript by removing accidental
 * consecutive duplicate messages.
 *
 * Example:
 * [A, B, B, C] => [A, B, C]
 */
export function deduplicateTranscript(
  messages: ITranscriptMessage[]
): ITranscriptMessage[] {
  const cleanedMessages = messages.filter(isRealMessage);

  if (cleanedMessages.length === 0) {
    return [];
  }

  const deduplicated: ITranscriptMessage[] = [cleanedMessages[0]];

  for (let index = 1; index < cleanedMessages.length; index++) {
    const currentMessage = cleanedMessages[index];
    const previousMessage = deduplicated[deduplicated.length - 1];

    if (!sameMessage(previousMessage, currentMessage)) {
      deduplicated.push(currentMessage);
    }
  }

  return reindexMessages(deduplicated);
}

/**
 * Convenience helper if you want to both merge and dedupe in one call.
 */
export function mergeAndDeduplicateTranscript(
  existing: ITranscriptMessage[],
  incoming: ITranscriptMessage[]
): ITranscriptMessage[] {
  return deduplicateTranscript(mergeTranscript(existing, incoming));
}

function sameMessage(
  first: ITranscriptMessage,
  second: ITranscriptMessage
): boolean {
  return (
    first.speaker === second.speaker &&
    normalize(first.text) === normalize(second.text)
  );
}

function isRealMessage(message: ITranscriptMessage): boolean {
  const normalizedText = normalize(message.text);

  if (!normalizedText) {
    return false;
  }

  // Filters obvious OCR junk like: `   '   |   ...
  if (/^[`'"|.,]+$/.test(normalizedText)) {
    return false;
  }

  return true;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\s+/g, " ")
    .replace(/\s*([?.!,])\s*/g, "$1")
    .trim();
}

function reindexMessages(
  messages: ITranscriptMessage[]
): ITranscriptMessage[] {
  return messages.map((message, index) => ({
    ...message,
    order: index,
  }));
}