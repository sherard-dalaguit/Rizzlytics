import { Badge } from "@/components/ui/badge";
import CopyButton from "@/components/ai-review/CopyButton";
import ConversationThread from "@/components/analysis/ConversationThread";
import { capitalize } from "@/lib/utils";
import Link from "next/link";

interface Reply {
  text: string;
  tone: "playful" | "direct" | "curious" | "grounded";
  intent: "re-engage" | "escalate" | "clarify" | "disengage";
  why: string;
}

interface TranscriptMessage {
  order?: number;
  speaker: "user" | "match" | "unknown";
  text: string;
}

interface QuickRepliesResultsProps {
  analysis: {
    _id: string;
    createdAt: string;
    result: {
      situationRead?: string;
      momentum?: "building" | "stalling" | "dying" | "strong";
      replies?: Reply[];
    };
  };
  transcript: TranscriptMessage[];
  contextText?: string | null;
}

const momentumConfig = {
  strong: {
    label: "Strong",
    classes: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25",
  },
  building: {
    label: "Building",
    classes: "bg-sky-500/15 text-sky-300 ring-sky-500/25",
  },
  stalling: {
    label: "Stalling",
    classes: "bg-amber-500/15 text-amber-300 ring-amber-500/25",
  },
  dying: {
    label: "Dying",
    classes: "bg-rose-500/15 text-rose-300 ring-rose-500/25",
  },
};

export default function QuickRepliesResults({
  analysis,
  transcript,
  contextText,
}: QuickRepliesResultsProps) {
  const { result } = analysis;
  const momentum = result.momentum ?? "stalling";
  const replies = result.replies ?? [];
  const mc = momentumConfig[momentum];

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <section className="rounded-2xl border bg-muted/20 px-6 py-6 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-30 primary-gradient blur-3xl" />
        <div className="relative space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-semibold leading-tight primary-text-gradient">
              Quick Replies
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${mc.classes}`}
            >
              {mc.label} momentum
            </span>
          </div>

          {result.situationRead && (
            <p className="text-base text-zinc-300 leading-relaxed max-w-2xl">
              {result.situationRead}
            </p>
          )}
        </div>
      </section>

      {/* Reply options — hero section */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold primary-text-gradient">
            Reply options
          </h2>
          <span className="text-xs text-zinc-500">{replies.length} options</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {replies.map((reply, idx) => (
            <div
              key={idx}
              className="relative rounded-2xl border border-white/10 bg-white/3 p-5 space-y-3 hover:bg-white/5 transition-colors"
            >
              {/* Top-right copy button */}
              <div className="absolute top-4 right-4">
                <CopyButton value={reply.text} size="sm" variant="outline" />
              </div>

              {/* Reply text */}
              <p className="text-base font-medium text-white pr-16 leading-snug">
                &ldquo;{reply.text}&rdquo;
              </p>

              {/* Why this works */}
              <p className="text-sm text-zinc-400 leading-relaxed">{reply.why}</p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="secondary">{capitalize(reply.intent)}</Badge>
                <Badge variant="outline">{capitalize(reply.tone)}</Badge>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Conversation thread */}
      {transcript.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold primary-text-gradient">
            Conversation thread
          </h2>

          <div className="rounded-2xl border border-white/10 bg-white/2 px-5 py-4 max-h-[480px] overflow-y-auto">
            <ConversationThread transcript={transcript} />
          </div>

          {contextText && contextText.trim().length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/2 p-4 space-y-1">
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Your context</p>
              <p className="text-sm text-zinc-300">{contextText}</p>
            </div>
          )}
        </section>
      )}

      {/* CTA to full analysis */}
      <section className="rounded-2xl border border-white/10 bg-white/2 p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">Want the full breakdown?</p>
          <p className="text-sm text-zinc-400 mt-0.5">
            Run a full conversation analysis for momentum scoring, what worked, what didn&apos;t, and next steps.
          </p>
        </div>
        <Link
          href="/ai-review"
          className="shrink-0 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/8 transition-colors"
        >
          Full analysis →
        </Link>
      </section>

      {/* Meta */}
      <div className="rounded-2xl border border-white/10 p-5 bg-white/2 space-y-1">
        <p className="text-xs text-zinc-500">
          Analysis ID: <span className="font-mono">{analysis._id}</span>
        </p>
        <p className="text-xs text-zinc-500">
          Created: {new Date(analysis.createdAt).toLocaleString()}
        </p>
      </div>
    </main>
  );
}
