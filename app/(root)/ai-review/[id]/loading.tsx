import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10">

      {/* ================= HERO HEADER ================= */}
      <section className="mb-10">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-muted/20 px-6 py-6 md:px-8 md:py-8">
          <div className="pointer-events-none absolute inset-0 opacity-25 primary-gradient blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px primary-gradient opacity-80" />

          <div className="relative">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">

              {/* Left: title + summary + badges */}
              <div className="space-y-4 min-w-0">
                <div className="space-y-2">
                  <Skeleton className="h-10 w-64" /> {/* "{Type} Analysis" */}
                  <Skeleton className="h-5 w-[80%]" /> {/* heroSummary */}
                  <Skeleton className="h-5 w-[60%]" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-28 rounded-full" /> {/* outcome badge */}
                  <Skeleton className="h-6 w-32 rounded-full" /> {/* positive signals */}
                  <Skeleton className="h-6 w-32 rounded-full" /> {/* negative signals */}
                  <Skeleton className="h-6 w-24 rounded-full" /> {/* next steps */}
                </div>
              </div>

              {/* Right: score */}
              <div className="flex shrink-0 items-end gap-3 xl:flex-col xl:items-end xl:text-right">
                <div className="leading-none">
                  <Skeleton className="h-12 w-28" /> {/* "7.8 /10" */}
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16" /> {/* SHORTLABEL */}
                  <Skeleton className="h-3 w-28" /> {/* "First-impression read" */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= LAYOUT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ================= MAIN (LEFT) ================= */}
        <div className="lg:col-span-2 space-y-8">

          {/* ===== Overall diagnosis ===== */}
          <section className="space-y-3">
            <div className="flex items-end justify-between">
              <Skeleton className="h-7 w-52" /> {/* "Overall diagnosis" */}
              <Skeleton className="h-3 w-20" /> {/* "Read time: ~30s" */}
            </div>

            <div className="rounded-2xl border bg-muted/30 p-6 space-y-4 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-0.5 primary-gradient opacity-80" />
              <Skeleton className="h-5 w-[75%]" /> {/* diagnosisIntro */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-[95%]" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-[70%]" />
              </div>
            </div>
          </section>

          {/* ===== Attraction signals ===== */}
          <section className="space-y-3">
            <Skeleton className="h-7 w-48" /> {/* "Attraction signals" */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                "border-emerald-500/20 bg-emerald-500/5",
                "border-red-500/20 bg-red-500/5",
                "border-amber-500/20 bg-amber-500/5",
              ].map((colClass, col) => (
                <div key={col} className={`rounded-2xl border p-5 space-y-4 ${colClass}`}>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-2.5 w-2.5 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="ml-auto h-3 w-5" />
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="rounded-lg pl-3 pr-3 py-3 bg-white/3">
                        <Skeleton className="h-4 w-[90%]" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ===== Supporting context ===== */}
          <section className="space-y-3">
            <Skeleton className="h-7 w-52" /> {/* "Supporting context" */}
            <Skeleton className="h-4 w-64" /> {/* subtitle */}

            <div className="rounded-2xl border bg-muted/20 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-6 w-8 rounded-full" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="relative w-full overflow-hidden rounded-xl border bg-background/40">
                    <div className="relative aspect-3/4 w-full">
                      <Skeleton className="absolute inset-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ================= SIDEBAR (RIGHT) ================= */}
        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 h-fit">

          {/* Next steps / Takeaways */}
          <div className="rounded-2xl border border-white/10 bg-white/3 p-5 space-y-4 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-0.5 primary-gradient opacity-80" />
            <div>
              <Skeleton className="h-5 w-44" />
              <Skeleton className="mt-1 h-3 w-56" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/3 p-4 flex gap-3">
                  <Skeleton className="mt-0.5 h-5 w-5 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-[80%]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meta / Details */}
          <div className="rounded-2xl border p-5 bg-muted/20 space-y-2">
            <Skeleton className="h-5 w-16" /> {/* "Details" */}
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[70%]" />
          </div>
        </aside>
      </div>
    </main>
  );
}