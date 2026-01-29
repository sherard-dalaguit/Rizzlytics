import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      {/* ================= HERO HEADER ================= */}
      <section className="mb-10">
        <div className="rounded-2xl border bg-muted/20 px-6 py-6 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-30 primary-gradient blur-3xl" />
          <div className="relative">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <Skeleton className="h-10 w-72" /> {/* "{Type} Analysis" */}
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-6 w-24 rounded-full" /> {/* Status badge */}
                  <Skeleton className="h-4 w-36" /> {/* Confidence */}
                  <Skeleton className="h-6 w-40 rounded-full" /> {/* Outcome badge */}
                </div>
              </div>

              {/* optional quick action area */}
              <div className="flex gap-2 md:pt-1">
                <Skeleton className="h-9 w-32 rounded-xl" /> {/* Copy top reply */}
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
              <Skeleton className="h-7 w-56" /> {/* Overall diagnosis */}
              <Skeleton className="h-3 w-24" /> {/* read time */}
            </div>

            <div className="rounded-2xl border bg-muted/30 p-6 space-y-4 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-0.5 primary-gradient opacity-80" />
              <Skeleton className="h-6 w-[85%]" /> {/* headline */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-[92%]" />
                <Skeleton className="h-4 w-[88%]" />
                <Skeleton className="h-4 w-[80%]" />
              </div>
            </div>
          </section>

          {/* ===== Attraction signals ===== */}
          <section className="space-y-3">
            <div className="flex items-end justify-between">
              <Skeleton className="h-7 w-52" />
              <Skeleton className="h-3 w-40" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, col) => (
                <div
                  key={col}
                  className="rounded-2xl border p-5 bg-muted/20 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-6 w-10 rounded-full" />
                  </div>

                  <div className="space-y-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-lg border bg-background/40 p-3 space-y-2"
                      >
                        <Skeleton className="h-4 w-[92%]" />
                        <Skeleton className="h-4 w-[75%]" />
                      </div>
                    ))}
                  </div>

                  <Skeleton className="h-8 w-32" /> {/* accordion trigger placeholder */}
                </div>
              ))}
            </div>
          </section>

          {/* ===== Breakdown ===== */}
          <section className="space-y-3">
            <Skeleton className="h-7 w-36" /> {/* Breakdown */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, panel) => (
                <div
                  key={panel}
                  className="rounded-2xl border p-5 bg-muted/20 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-6 w-10 rounded-full" />
                  </div>

                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-lg border bg-background/40 p-4 space-y-2"
                      >
                        <Skeleton className="h-4 w-[90%]" />
                        <Skeleton className="h-4 w-[70%]" />
                      </div>
                    ))}
                  </div>

                  <Skeleton className="h-8 w-36" /> {/* "Show more" */}
                </div>
              ))}
            </div>
          </section>

          {/* ===== Supporting context ===== */}
          <section className="space-y-3">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-[520px] max-w-full" />

            {/* Mode-agnostic skeleton: looks like ImageGrid + optional context bubble */}
            <div className="space-y-4">
              {/* optional context bubble */}
              <div className="rounded-2xl border bg-muted/20 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-[95%]" />
                <Skeleton className="h-4 w-[85%]" />
                <Skeleton className="h-4 w-[75%]" />
              </div>

              {/* ImageGrid */}
              <div className="rounded-2xl border bg-muted/20 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-44" />
                  <Skeleton className="h-6 w-10 rounded-full" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="relative w-full overflow-hidden rounded-xl border bg-background/40"
                    >
                      <div className="relative aspect-3/4 w-full">
                        <Skeleton className="absolute inset-0" />
                      </div>

                      <div className="absolute inset-x-0 bottom-0">
                        <div className="absolute inset-0 primary-gradient opacity-30 mask-[linear-gradient(to_top,black,transparent)]" />
                        <div className="relative p-3">
                          <Skeleton className="h-3 w-28" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* optional second ImageGrid (other profile / profile set) */}
              <div className="rounded-2xl border bg-muted/20 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-56" />
                  <Skeleton className="h-6 w-10 rounded-full" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="relative w-full overflow-hidden rounded-xl border bg-background/40"
                    >
                      <div className="relative aspect-3/4 w-full">
                        <Skeleton className="absolute inset-0" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0">
                        <div className="absolute inset-0 primary-gradient opacity-30 mask-[linear-gradient(to_top,black,transparent)]" />
                        <div className="relative p-3">
                          <Skeleton className="h-3 w-28" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ================= SIDEBAR (RIGHT) ================= */}
        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 h-fit">
          {/* Next steps */}
          <div className="rounded-2xl border p-5 bg-muted/20 space-y-4 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-0.5 primary-gradient opacity-80" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border bg-background/40 p-4 space-y-2"
                >
                  <Skeleton className="h-4 w-[92%]" />
                  <Skeleton className="h-4 w-[78%]" />
                </div>
              ))}
            </div>

            <Skeleton className="h-9 w-full rounded-xl" /> {/* "See all next steps" */}
          </div>

          {/* Suggested replies (present skeleton — fine if real page hides) */}
          <div className="rounded-2xl border p-5 bg-muted/20 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-10 rounded-full" />
            </div>

            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border bg-background/40 p-4 space-y-3"
                >
                  <Skeleton className="h-4 w-[92%]" />
                  <Skeleton className="h-4 w-[70%]" />

                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>

                  <Skeleton className="h-9 w-20 rounded-xl" /> {/* Copy */}
                </div>
              ))}
            </div>

            <Skeleton className="h-8 w-36" /> {/* "Show more" */}
          </div>

          {/* Meta */}
          <div className="rounded-2xl border p-5 bg-muted/20 space-y-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        </aside>
      </div>
    </main>
  );
}
