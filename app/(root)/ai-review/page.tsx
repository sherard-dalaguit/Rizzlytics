import React from "react";
import {
  IconPhoto,
  IconMessageCircle2,
  IconLayersSubtract,
  IconBolt,
} from "@tabler/icons-react";

import PhotoAnalysis from "@/components/analysis/PhotoAnalysis";
import ConversationAnalysis from "@/components/analysis/ConversationAnalysis";
import ProfileAnalysis from "@/components/analysis/ProfileAnalysis";
import QuickRepliesForm from "@/components/analysis/QuickRepliesForm";
import { cn } from "@/lib/utils";

type ToolCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  chip?: string;
  children: React.ReactNode;
  accent?: "pink" | "violet" | "blue" | "green";
};

function ToolCard({
  title,
  description,
  icon,
  chip,
  children,
  accent = "pink",
}: ToolCardProps) {
  const accentClasses = {
    pink: {
      glow: "from-[#ff46c5]/25 via-[#ff46c5]/10 to-transparent",
      border: "group-hover:border-[#ff46c5]/40",
      icon: "text-[#ff46c5]",
      chip: "bg-[#ff46c5]/10 text-[#ff46c5] ring-[#ff46c5]/20",
    },
    violet: {
      glow: "from-[#d1b3ff]/25 via-[#d1b3ff]/10 to-transparent",
      border: "group-hover:border-[#d1b3ff]/40",
      icon: "text-[#d1b3ff]",
      chip: "bg-[#d1b3ff]/10 text-[#d1b3ff] ring-[#d1b3ff]/20",
    },
    blue: {
      glow: "from-sky-400/20 via-sky-400/10 to-transparent",
      border: "group-hover:border-sky-400/35",
      icon: "text-sky-300",
      chip: "bg-sky-400/10 text-sky-200 ring-sky-300/20",
    },
    green: {
      glow: "from-emerald-400/20 via-emerald-400/10 to-transparent",
      border: "group-hover:border-emerald-400/35",
      icon: "text-emerald-300",
      chip: "bg-emerald-400/10 text-emerald-200 ring-emerald-300/20",
    },
  }[accent];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/3 p-6",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.03)]",
        "transition-all duration-300 hover:-translate-y-1 hover:bg-white/5",
        accentClasses.border
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-linear-to-br",
          accentClasses.glow
        )}
      />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[120%] -translate-x-1/2 rounded-full bg-white/5 blur-2xl" />

      <div className="relative flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex p-2 items-center justify-center rounded-full bg-white/4 ring-1 ring-white/10">
              <div className={cn("h-6 w-6", accentClasses.icon)}>{icon}</div>
            </div>

            <div className="pt-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  {title}
                </h2>
                {chip ? (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                      accentClasses.chip
                    )}
                  >
                    {chip}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-zinc-300/80">
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="mb-4 h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />
          {children}
        </div>
      </div>
    </div>
  );
}


export default function AIReview() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <section className="mb-10 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-semibold tracking-tight primary-text-gradient">
            AI Review
          </h1>
          <span className="inline-flex items-center rounded-full bg-white/4 px-3 py-1 text-xs text-zinc-300 ring-1 ring-white/10">
            Tools
          </span>
        </div>
        <p className="max-w-2xl text-sm text-zinc-400">
          Analyze a single photo, your full profile photo set, or a conversation
          thread&#8212;then iterate with clear next steps.
        </p>
      </section>

      {/* Tool grid: Photos | Profiles / Reply Coach | Conversations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ToolCard
          title="Photos"
          description="Upload a photo and get honest feedback on lighting, pose, background, and expression — so you know exactly what to keep, fix, or swap out."
          icon={<IconPhoto />}
          chip="Single"
          accent="pink"
        >
          <PhotoAnalysis />
        </ToolCard>

        <ToolCard
          title="Profiles"
          description="Upload your full photo lineup and find out which photos to lead with, which to cut, and whether your set tells a coherent story."
          icon={<IconLayersSubtract />}
          chip="Set"
          accent="violet"
        >
          <ProfileAnalysis />
        </ToolCard>

        <ToolCard
          title="Quick Replies"
          description="You're mid-conversation and not sure what to say. Screenshot it, get 4-6 reply options with reasoning in seconds. Use this while you're actively texting - not after."
          icon={<IconBolt />}
          chip="Live"
          accent="green"
        >
          <QuickRepliesForm />
        </ToolCard>

        <ToolCard
          title="Conversations"
          description="The conversation ran its course - now debrief it. See what worked, what killed momentum, and what to do differently next time."
          icon={<IconMessageCircle2 />}
          chip="Post-mortem"
          accent="blue"
        >
          <ConversationAnalysis />
        </ToolCard>
      </div>

      <p className="text-xs text-zinc-500">
        Your uploads are only used to generate your review. Delete anything anytime from Photos or Conversations.
      </p>
    </main>
  );
}
