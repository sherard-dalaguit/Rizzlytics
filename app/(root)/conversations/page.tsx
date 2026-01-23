"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { IconBrain, IconTrash, IconMaximize } from "@tabler/icons-react";

import { IConversationSnapshotDoc } from "@/database/conversation-snapshot.model";
import { IMediaAssetDoc } from "@/database/media-asset.model";
import { formatDate, shortId } from "@/lib/utils";

type SortKey = "newest" | "oldest";

function asAssetArray(
  value: any
): IMediaAssetDoc[] {
  // when populated, mongoose gives you objects with blobUrl etc.
  // when not populated, it’ll be ObjectIds -> we return []
  if (!Array.isArray(value)) return [];
  if (!value.length) return [];
  if (typeof value[0] === "string") return [];
  return value as IMediaAssetDoc[];
}

function firstBlobUrl(assets: IMediaAssetDoc[]) {
  return assets?.[0]?.blobUrl ?? "";
}

export default function ConversationsPage() {
  const [snapshots, setSnapshots] = useState<IConversationSnapshotDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState<SortKey>("newest");

  type Rail = "thread" | "profile";

  const [rail, setRail] = useState<Rail>("thread");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSnapshot, setPreviewSnapshot] = useState<IConversationSnapshotDoc | null>(null);
  const [activeUrl, setActiveUrl] = useState<string>("");

  const isActive = (url: string) => url === activeUrl;

  useEffect(() => {
    const fetchSnapshots = async () => {
      try {
        const res = await fetch("/api/conversations", { method: "GET" });
        if (!res.ok) throw new Error("Failed to fetch conversations");
        const { conversationSnapshots } = await res.json();
        setSnapshots(conversationSnapshots);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSnapshots();
  }, []);

  const sorted = useMemo(() => {
    const list = [...snapshots];
    list.sort((a: any, b: any) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sort === "newest" ? tb - ta : ta - tb;
    });
    return list;
  }, [snapshots, sort]);

  const openPreview = (snap: IConversationSnapshotDoc) => {
    const threadAssets = asAssetArray((snap as any).threadScreenshotAssetIds);
    const url = firstBlobUrl(threadAssets);

    setPreviewSnapshot(snap);
    setRail("thread");
    setActiveUrl(url);
    setPreviewOpen(true);
  };


  const handleDelete = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}`, { method: "DELETE" });
      if (!res.ok) return console.error("Failed to delete conversation");

      setSnapshots((prev) => prev.filter((c) => c._id.toString() !== conversationId));

      if (previewSnapshot?._id.toString() === conversationId) {
        setPreviewOpen(false);
        setPreviewSnapshot(null);
        setActiveUrl("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-10">
        <p className="text-muted-foreground">Loading conversations…</p>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl primary-text-gradient font-semibold">Conversations</h1>
          <p className="text-sm text-muted-foreground">
            {sorted.length} conversations
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

      {/* Empty */}
      {!sorted.length ? (
        <div className="rounded-2xl border bg-muted/20 p-10 text-center">
          <p className="text-lg font-medium">No conversations yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Upload a message thread to get started.
          </p>
        </div>
      ) : (
        <>
          {/* List */}
          <section className="space-y-4">
            {sorted.map((snap, idx) => {
              const id = snap._id.toString();
              const label = `Conversation ${String(sorted.length - idx).padStart(2, "0")}`;
              const uploaded = formatDate((snap as any).createdAt);

              const threadAssets = asAssetArray((snap as any).threadScreenshotAssetIds);
              const otherAssets = asAssetArray((snap as any).otherProfileAssetIds);

              const threadCount = threadAssets.length || (snap as any).threadScreenshotAssetIds?.length || 0;
              const otherCount = otherAssets.length || (snap as any).otherProfileAssetIds?.length || 0;

              const hasContext = Boolean((snap as any).contextInput?.trim());
              const status = (snap as any).extraction?.status as "queued" | "succeeded" | "failed" | undefined;

              const stack = threadAssets.slice(0, 3);

              return (
                <div
                  key={id}
                  className="group rounded-2xl border bg-muted/10 overflow-hidden hover:bg-muted/15 transition"
                >
                  <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                    {/* Left: stacked preview */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative w-40 h-30 shrink-0">
                        {/* back cards */}
                        {[2, 1].map((layer) => (
                          <div
                            key={layer}
                            className="absolute inset-0 rounded-xl overflow-hidden border bg-black/30"
                            style={{
                              transform: `translate(${layer * 8}px, ${layer * 8}px)`,
                              opacity: 0.45,
                            }}
                          />
                        ))}

                        {/* top image */}
                        <div className="absolute inset-0 rounded-xl overflow-hidden border">
                          {stack[0]?.blobUrl ? (
                            <Image
                              src={stack[0].blobUrl}
                              alt="thread preview"
                              fill
                              className="object-cover"
                              sizes="160px"
                              onClick={() => openPreview(snap)}
                            />
                          ) : (
                            <div className="h-full w-full bg-muted/20" />
                          )}

                          <div className="absolute inset-x-0 bottom-0 pointer-events-none">
                            {/* Gradient fade */}
                            <div className="absolute inset-0 primary-gradient opacity-70 mask-[linear-gradient(to_top,black,transparent)]" />

                            <div className="relative p-4" />
                          </div>
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="min-w-0 ml-4 space-y-1">
                        <p className="text-white font-medium leading-snug truncate">{label}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {uploaded} • ID {shortId(id)}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <Badge variant="outline">
                            Thread: {threadCount}
                          </Badge>
                          <Badge variant="outline">
                            Profile: {otherCount}
                          </Badge>

                          {hasContext && <Badge variant="outline">Has context</Badge>}
                        </div>
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-full bg-black/55 text-white hover:bg-black/70"
                        onClick={() => openPreview(snap)}
                        type="button"
                      >
                        <IconMaximize className="h-5 w-5" />
                      </Button>

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
                        onClick={() => {
                          // if analysisId is stored on snapshot, this is all you need
                          window.location.href = `/ai-review/${(snap as any).analysisId}`;
                        }}
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

          {/* Preview dialog */}
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="max-w-6xl p-0 overflow-hidden">
              <DialogHeader className="px-5 py-4 backdrop-blur-xl border-b border-white/10 relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 primary-gradient opacity-20 blur-3xl" />
                <DialogTitle className="relative text-lg text-white">
                  Conversation • {previewSnapshot ? shortId(previewSnapshot._id.toString()) : ""}
                </DialogTitle>
              </DialogHeader>

              {previewSnapshot && (
                <div className="grid grid-cols-1 md:grid-cols-7">
                  {/* Main image */}
                  <div className="md:col-span-4 relative h-[72vh] ">
                    {/* soft vignette */}
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-b via-black/0 z-10" />

                    {/* subtle border frame */}
                    <div className="absolute inset-3 rounded-2xl border border-white/10 overflow-hidden bg-black">
                      {activeUrl ? (
                        <Image
                          src={activeUrl}
                          alt="preview"
                          fill
                          className="object-contain"
                          sizes="(max-width: 1024px) 100vw, 900px"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                          No preview available
                        </div>
                      )}
                    </div>

                  </div>


                  {/* Sidebar */}
                  <div className="md:col-span-3 backdrop-blur-xl border-l border-white/10 p-4 space-y-4">
                  {/* Thumbnails */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground">Screenshots</p>

                        {/* tiny rail toggle (optional, but clean) */}
                        <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
                          <button
                            type="button"
                            onClick={() => setRail("thread")}
                            className={[
                              "px-3 py-1 text-xs rounded-lg transition",
                              rail === "thread"
                                ? "primary-gradient text-white shadow"
                                : "text-white/60 hover:text-white",
                            ].join(" ")}
                          >
                            Thread
                          </button>

                          <button
                            type="button"
                            onClick={() => setRail("profile")}
                            className={[
                              "px-3 py-1 text-xs rounded-lg transition",
                              rail === "profile"
                                ? "primary-gradient text-white shadow"
                                : "text-white/60 hover:text-white",
                            ].join(" ")}
                          >
                            Other profile
                          </button>
                        </div>

                      </div>

                      {/* THREAD */}
                      {rail === "thread" && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Thread screenshots</p>

                          <div className="grid grid-cols-2 gap-2">
                            {asAssetArray((previewSnapshot as any).threadScreenshotAssetIds)
                              .slice(0, 10)
                              .map((a) => (
                                <button
                                  key={a._id.toString()}
                                  onClick={() => setActiveUrl((a as any).blobUrl)}
                                  type="button"
                                  className={[
                                    "relative aspect-9/16 rounded-xl overflow-hidden border transition",
                                    isActive((a as any).blobUrl)
                                      ? "border-white/40 ring-2 ring-white/20"
                                      : "border-white/10 hover:border-white/25 hover:opacity-95",
                                  ].join(" ")}
                                >
                                  <Image
                                    src={(a as any).blobUrl}
                                    alt="thumb"
                                    fill
                                    className="object-cover"
                                    sizes="180px"
                                  />
                                </button>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* OTHER PROFILE */}
                      {rail === "profile" && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Other profile screenshots</p>

                          {!asAssetArray((previewSnapshot as any).otherProfileAssetIds).length ? (
                            <p className="text-xs text-muted-foreground">
                              No other profile screenshots uploaded.
                            </p>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {asAssetArray((previewSnapshot as any).otherProfileAssetIds)
                                .slice(0, 10)
                                .map((a) => (
                                  <button
                                    key={a._id.toString()}
                                    onClick={() => setActiveUrl((a as any).blobUrl)}
                                    type="button"
                                    className={[
                                      "relative aspect-9/16 rounded-xl overflow-hidden border transition",
                                      isActive((a as any).blobUrl)
                                        ? "border-white/40 ring-2 ring-white/20"
                                        : "border-white/10 hover:border-white/25 hover:opacity-95",
                                    ].join(" ")}
                                  >
                                    <Image
                                      src={(a as any).blobUrl}
                                      alt="thumb"
                                      fill
                                      className="object-cover"
                                      sizes="180px"
                                    />
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Context bubble */}
                    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md">
                      {/* content */}
                      <div className="relative p-3 z-10">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Context
                        </p>

                        <p className="text-xs text-white/85 leading-snug line-clamp-5">
                          {(previewSnapshot as any).contextInput}
                        </p>
                      </div>

                      {/* gradient overlay */}
                      <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none">
                        <div className="absolute inset-0 primary-gradient opacity-20" />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={() => {
                          window.location.href = `/ai-review/${(previewSnapshot as any).analysisId}`;
                        }}
                        type="button"
                      >
                        <IconBrain className="h-5 w-5 mr-2" />
                        View AI Review
                      </Button>

                      <Button
                        className="w-full bg-red-500/15 text-red-200 border border-red-500/30 hover:bg-red-500/25 hover:border-red-400/40"
                        onClick={() => handleDelete(previewSnapshot._id.toString())}
                        type="button"
                      >
                        <IconTrash className="h-5 w-5 mr-2" />
                        Delete conversation
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </main>
  );
}
