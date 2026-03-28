import { cn } from "@/lib/utils";

interface TranscriptMessage {
  order?: number;
  speaker: "user" | "match" | "unknown";
  text: string;
}

interface ConversationThreadProps {
  transcript: TranscriptMessage[];
}

export default function ConversationThread({ transcript }: ConversationThreadProps) {
  if (!transcript.length) {
    return (
      <p className="text-sm text-zinc-500 text-center py-6">No messages extracted.</p>
    );
  }

  return (
    <div className="space-y-2 py-2">
      {transcript.map((msg, idx) => {
        const isUser = msg.speaker === "user";
        const isMatch = msg.speaker === "match";

        if (msg.speaker === "unknown") {
          return (
            <div key={idx} className="flex justify-center">
              <span className="text-xs text-zinc-600 bg-white/4 rounded-full px-3 py-1">
                {msg.text}
              </span>
            </div>
          );
        }

        return (
          <div
            key={idx}
            className={cn("flex", isUser ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[72%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                isUser
                  ? "rounded-br-sm bg-gradient-to-br from-[#ff46c5] to-[#a855f7] text-white"
                  : "rounded-bl-sm bg-white/10 text-zinc-100"
              )}
            >
              {msg.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
