"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconBolt, IconBrain, IconTrash } from "@tabler/icons-react";
import { formatDate, shortId } from "@/lib/utils";

type Momentum = "building" | "stalling" | "dying" | "strong";

interface ReplyAnalysis {
  _id: string;
  createdAt: string;
  result: {
    situationRead?: string;
    momentum?: Momentum;
    replies?: { text: string; tone: string; intent: string; why: string }[];
  };
}

const momentumConfig: Record<Momentum, { label: string; classes: string }> = {
  strong: { label: "Strong", classes: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25" },
  building: { label: "Building", classes: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/25" },
  stalling: { label: "Stalling", classes: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25" },
  dying: { label: "Dying", classes: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/25" },
};

type SortKey = "newest" | "oldest";

export default function ReplyCoachPage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<ReplyAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("newest");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/ai-analysis?type=reply_coach");
        if (!res.ok) throw new Error("Failed to fetch");
        const { analyses } = await res.json();
        setAnalyses(analyses);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sorted = useMemo(() => {
    const list = [...analyses];
    list.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return sort === "newest" ? tb - ta : ta - tb;
    });
    return list;
  }, [analyses, sort]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/ai-analysis/${id}`, { method: "DELETE" });
      if (!res.ok) return console.error("Failed to delete");
      setAnalyses((prev) => prev.filter((a) => a._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl primary-text-gradient font-semibold">Reply Coach</h1>
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 ring-1 ring-emerald-500/20">
              <IconBolt className="h-3 w-3 mr-1" />
              Live
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {sorted.length} session{sorted.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {loading ? (
        <section className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-muted/10 p-5">
              <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-9 w-24 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </section>
      ) : !sorted.length ? (
        <div className="rounded-2xl border bg-muted/20 p-10 text-center">
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <IconBolt className="h-6 w-6 text-emerald-300" />
            </div>
          </div>
          <p className="text-lg font-medium">No reply coach sessions yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Use Reply Coach on the AI Review page while you&apos;re in an active conversation.
          </p>
          <Button
            className="mt-5 primary-gradient text-white"
            onClick={() => router.push("/ai-review")}
          >
            Go to AI Review
          </Button>
        </div>
      ) : (
        <section className="space-y-4">
          {sorted.map((analysis, idx) => {
            const id = analysis._id;
            const label = `Session ${String(sorted.length - idx).padStart(2, "0")}`;
            const uploaded = formatDate(analysis.createdAt);
            const momentum = analysis.result.momentum ?? "stalling";
            const mc = momentumConfig[momentum];
            const replyCount = analysis.result.replies?.length ?? 0;
            const topReply = analysis.result.replies?.[0];

            return (
              <div
                key={id}
                className="group rounded-2xl border bg-muted/10 overflow-hidden hover:bg-muted/15 transition"
              >
                <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4 md:items-start md:justify-between">
                  {/* Left: meta + preview */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${mc.classes}`}>
                        {mc.label}
                      </span>
                      <Badge variant="outline">{replyCount} replies</Badge>
                      <span className="text-xs text-muted-foreground">
                        {label} · {uploaded} · ID {shortId(id)}
                      </span>
                    </div>

                    {/* Situation read */}
                    {analysis.result.situationRead && (
                      <p className="text-sm text-zinc-300 leading-relaxed line-clamp-2">
                        {analysis.result.situationRead}
                      </p>
                    )}

                    {/* Top reply preview */}
                    {topReply && (
                      <div className="rounded-xl border border-white/10 bg-white/3 px-4 py-3">
                        <p className="text-xs text-zinc-500 mb-1">Top reply</p>
                        <p className="text-sm text-white font-medium">&ldquo;{topReply.text}&rdquo;</p>
                      </div>
                    )}
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-2 justify-end shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-full bg-black/55 text-white hover:bg-black/70"
                      onClick={() => handleDelete(id)}
                      type="button"
                    >
                      <IconTrash className="h-5 w-5" />
                    </Button>

                    <Button
                      className="primary-gradient text-white border-0 hover:opacity-95"
                      onClick={() => router.push(`/ai-review/${id}`)}
                      type="button"
                    >
                      <IconBrain className="h-5 w-5 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}
