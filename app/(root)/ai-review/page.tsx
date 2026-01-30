import React from "react";
import {
  IconPhoto,
  IconMessageCircle2,
  IconCheck,
  IconArrowRight,
  IconInfoCircle,
  IconLayersSubtract,
} from "@tabler/icons-react";

import PhotoAnalysis from "@/components/analysis/PhotoAnalysis";
import ConversationAnalysis from "@/components/analysis/ConversationAnalysis";
import ProfileAnalysis from "@/components/analysis/ProfileAnalysis";
import { cn } from "@/lib/utils";

type ToolCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  chip?: string;
  children: React.ReactNode;
  accent?: "pink" | "violet" | "blue";
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

function SectionCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/3 p-6">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-[120%] -translate-x-1/2 rounded-full bg-white/5 blur-2xl" />
      <div className="relative flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2">
            {icon ? <span className="text-zinc-300">{icon}</span> : null}
            <h3 className="text-base font-semibold text-white">{title}</h3>
          </div>
          {subtitle ? (
            <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}

function BulletRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/2 p-3">
      <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
        <IconCheck className="h-4 w-4 text-zinc-200" />
      </div>
      <div className="text-sm text-zinc-300">{children}</div>
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
          thread—then iterate with clear next steps.
        </p>
      </section>

      {/* Top row: Photos → Profiles → Conversations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ToolCard
          title="Photos"
          description="Analyze one photo to improve first impressions: lighting, framing, style, and vibe."
          icon={<IconPhoto />}
          chip="Single"
          accent="pink"
        >
          <PhotoAnalysis />
        </ToolCard>

        <ToolCard
          title="Profiles"
          description="Analyze a set of photos together to optimize your overall profile story and consistency."
          icon={<IconLayersSubtract />}
          chip="Set"
          accent="violet"
        >
          <ProfileAnalysis />
        </ToolCard>

        <ToolCard
          title="Conversations"
          description="Diagnose messaging dynamics and momentum—get specific next replies and escalation moves."
          icon={<IconMessageCircle2 />}
          chip="Thread"
          accent="blue"
        >
          <ConversationAnalysis />
        </ToolCard>
      </div>

      {/* Bottom half */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left column */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <SectionCard
            title="Quick start"
            subtitle="The fastest path to real improvement (no fluff)."
            icon={<IconArrowRight className="h-4 w-4" />}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <BulletRow>
                Run <span className="text-white">Photos</span> on your top 1–2
                candidates.
              </BulletRow>
              <BulletRow>
                Then use <span className="text-white">Profiles</span> to make
                the whole set cohesive.
              </BulletRow>
              <BulletRow>
                Use <span className="text-white">Conversations</span> only when
                you have a real thread to diagnose.
              </BulletRow>
              <BulletRow>
                Re-run after edits until the signals are clean.
              </BulletRow>
            </div>
          </SectionCard>

          <SectionCard
            title="What each tool optimizes"
            subtitle="So the output feels consistent and predictable."
            icon={<IconInfoCircle className="h-4 w-4" />}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/2 p-4">
                <p className="text-sm font-semibold text-white">Photos</p>
                <p className="mt-1 text-sm text-zinc-400">
                  “Is this a strong photo?” — lighting, framing, expression,
                  outfit, background.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/2 p-4">
                <p className="text-sm font-semibold text-white">Profiles</p>
                <p className="mt-1 text-sm text-zinc-400">
                  “Does this set tell a story?” — variety, balance, consistency,
                  and lifestyle.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/2 p-4 sm:col-span-2">
                <p className="text-sm font-semibold text-white">Conversations</p>
                <p className="mt-1 text-sm text-zinc-400">
                  “What’s the dynamic?” — momentum, interest level, texting
                  mistakes, and exact next replies.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <SectionCard
            title="FAQ"
            subtitle="Quick trust-builders."
            icon={<IconInfoCircle className="h-4 w-4" />}
          >
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/2 p-4">
                <p className="text-sm font-semibold text-white">
                  Does this store my photos?
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  Only what’s needed to generate your review (you control what
                  you upload).
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/2 p-4">
                <p className="text-sm font-semibold text-white">
                  Why do Photos and Profiles both exist?
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  Photos scores a single image. Profiles checks how your photos
                  work together as a set.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/2 p-4">
                <p className="text-sm font-semibold text-white">
                  What should I run first?
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  Photo → Profile set → Conversation thread (once you’ve got
                  matches).
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/2 p-4">
                <p className="text-sm font-semibold text-white">
                  Can I re-run after changes?
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  Yes — iterating is the whole point. Improve → re-run → confirm.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
