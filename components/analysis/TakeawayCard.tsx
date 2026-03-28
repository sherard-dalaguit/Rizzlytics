import React from "react";
import { cn } from "@/lib/utils";

type TakeawayCategory = "tone" | "pacing" | "escalation" | "opener" | "mindset";

type Takeaway = {
  title: string;
  why: string;
  category: TakeawayCategory;
};

const categoryConfig: Record<TakeawayCategory, { label: string; className: string }> = {
  tone: {
    label: "Tone",
    className: "bg-sky-400/10 text-sky-300 ring-sky-400/20",
  },
  pacing: {
    label: "Pacing",
    className: "bg-violet-400/10 text-violet-300 ring-violet-400/20",
  },
  escalation: {
    label: "Escalation",
    className: "bg-[#ff46c5]/10 text-[#ff46c5] ring-[#ff46c5]/20",
  },
  opener: {
    label: "Opener",
    className: "bg-amber-400/10 text-amber-300 ring-amber-400/20",
  },
  mindset: {
    label: "Mindset",
    className: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20",
  },
};

export default function TakeawayCard({
  takeaway,
  index,
}: {
  takeaway: Takeaway;
  index: number;
}) {
  const config = categoryConfig[takeaway.category];

  return (
    <div className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-2">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/8 text-xs font-semibold text-zinc-400 ring-1 ring-white/10">
          {index + 1}
        </span>
        <p className="text-sm font-semibold text-white leading-snug">{takeaway.title}</p>
      </div>
      <p className="pl-8 text-xs text-zinc-400 leading-relaxed">{takeaway.why}</p>
      <div className="pl-8">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1",
            config.className
          )}
        >
          {config.label}
        </span>
      </div>
    </div>
  );
}
