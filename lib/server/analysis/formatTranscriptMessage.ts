import {ITranscriptMessage} from "@/database/conversation-snapshot.model";

const formatTranscriptMessage = async (rawText: string): Promise<ITranscriptMessage[]> => {
  const messages: ITranscriptMessage[] = [];

  for (const line of rawText.split("\n")) {
    const speaker =
      line.startsWith("L ")
        ? "match"
        : line.startsWith("R ")
          ? "user"
          : "unknown";

    const text = line.slice(2).trim();
    if (!text) continue;

    messages.push({ speaker, text } as ITranscriptMessage);
  }

  return messages;
}

export default formatTranscriptMessage;