"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { IMediaAssetDoc } from "@/database/media-asset.model";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  IconBrain,
  IconTrash,
  IconMaximize,
} from "@tabler/icons-react";
import {formatDate, shortId} from "@/lib/utils";

type SortKey = "newest" | "oldest";

export default function PhotosPage() {
  const [mediaAssets, setMediaAssets] = useState<IMediaAssetDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState<SortKey>("newest");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<IMediaAssetDoc | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch("/api/assets", { method: "GET" });
        if (!response.ok) throw new Error("Failed to fetch media assets");
        const { mediaAssets } = await response.json();
        setMediaAssets(mediaAssets);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const sorted = useMemo(() => {
    const list = [...mediaAssets];

    list.sort((a: any, b: any) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sort === "newest" ? tb - ta : ta - tb;
    });

    return list;
  }, [mediaAssets, sort]);

  const handleDelete = async (assetId: string) => {
    try {
      const res = await fetch(`/api/assets/${assetId}`, { method: "DELETE" });
      if (!res.ok) return console.error("Failed to delete asset");

      setMediaAssets((prev) => prev.filter((a) => a._id.toString() !== assetId));

      if (previewAsset?._id.toString() === assetId) {
        setPreviewOpen(false);
        setPreviewAsset(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openPreview = (asset: IMediaAssetDoc) => {
    setPreviewAsset(asset);
    setPreviewOpen(true);
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-10">
        <p className="text-muted-foreground">Loading photos…</p>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl primary-text-gradient font-semibold">Photos</h1>
          <p className="text-sm text-muted-foreground">
            {sorted.length} self photos
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
          <p className="text-lg font-medium">No photos yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Upload a self photo to get started.
          </p>
        </div>
      ) : (
        <>
          {/* Grid */}
          <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {sorted.map((asset, idx) => {
              const id = asset._id.toString();
              const uploaded = formatDate((asset as any).createdAt);
              const label = `Photo ${String(sorted.length - idx).padStart(2, "0")}`;

              return (
                <div
                  key={id}
                  className="group rounded-2xl border bg-muted/10 overflow-hidden"
                >
                  <div className="relative aspect-3/4 w-full sm:pb-0">
                    <Image
                      src={(asset as any).blobUrl}
                      alt="user photo"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1280px) 50vw, 25vw"
                      onClick={() => openPreview(asset)}
                    />

                    {/* top gradient */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/0 to-black/35 opacity-90 pointer-events-none" />

                    {/* hover actions */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-full bg-black/55 text-white hover:bg-black/70"
                        onClick={() => openPreview(asset)}
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
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-full bg-black/55 text-white hover:bg-black/70"
                        onClick={() => {
                          window.location.href = `/ai-review/${asset.analysisId}`;
                        }}
                        type="button"
                      >
                        <IconBrain className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* overlay strip */}
                    <div className="absolute inset-x-3 bottom-3 sm:bottom-3 sm:inset-x-3">
                      <div className="relative rounded-xl overflow-hidden">
                        {/* gradient glow */}
                        <div className="pointer-events-none absolute inset-0 primary-gradient opacity-40 blur-2xl" />

                        {/* dark glass */}
                        <div className="relative rounded-xl bg-black/50 backdrop-blur-md p-1.5 sm:p-3 flex items-center justify-end">
                          {/* DESKTOP TEXT ONLY */}
                          <div className="min-w-0 hidden sm:block">
                            <p className="text-white text-sm font-medium leading-snug">
                              {label}
                            </p>
                            <p className="text-white/70 text-xs leading-snug">
                              Uploaded {uploaded} • ID {shortId(id)}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            className="w-full sm:w-auto primary-gradient text-white border-0 hover:opacity-95"
                            onClick={() => openPreview(asset)}
                            type="button"
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </section>

          {/* Preview dialog */}
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="p-0 overflow-hidden w-[92vw] max-w-6xl max-h-[90vh] sm:w-auto rounded-2xl sm:rounded-3xl">
              {/* Header */}
              <DialogHeader className="px-5 py-4 backdrop-blur-xl border-b border-white/10 relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 primary-gradient opacity-20 blur-3xl" />
                <DialogTitle className="relative text-lg text-white">
                  Photo • {previewAsset ? shortId(previewAsset._id.toString()) : ""}
                </DialogTitle>
              </DialogHeader>

              {previewAsset && (
                <div className="grid grid-cols-1 md:grid-cols-7 overflow-y-auto max-h-[calc(90vh-64px)]">
                  {/* Main image */}
                  <div className="md:col-span-4 relative h-[72vh]">
                    {/* subtle border frame */}
                    <div className="absolute inset-3 rounded-2xl border border-white/10 overflow-hidden bg-black">
                      <Image
                        src={(previewAsset as any).blobUrl}
                        alt="preview"
                        fill
                        className="object-contain"
                        sizes="(max-width: 1024px) 100vw, 900px"
                      />
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="md:col-span-3 backdrop-blur-xl border-l border-white/10 p-4 space-y-4">
                    {/* Info bubble (optional but makes it feel consistent/premium) */}
                    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md">
                      <div className="relative p-3 z-10 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Details</p>
                        <p className="text-xs text-white/85 leading-snug">
                          Uploaded {formatDate((previewAsset as any).createdAt)} • ID{" "}
                          {shortId(previewAsset._id.toString())}
                        </p>
                      </div>

                      {/* subtle gradient accent */}
                      <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none">
                        <div className="absolute inset-0 primary-gradient opacity-20" />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 mb-8">
                      <Button
                        className="w-full"
                        onClick={() => {
                          window.location.href = `/ai-review/${(previewAsset as any).analysisId}`;
                        }}
                        type="button"
                      >
                        <IconBrain className="h-5 w-5 mr-2" />
                        View AI Review
                      </Button>

                      <Button
                        className="w-full bg-red-500/15 text-red-200 border border-red-500/30 hover:bg-red-500/25 hover:border-red-400/40"
                        onClick={() => handleDelete(previewAsset._id.toString())}
                        type="button"
                      >
                        <IconTrash className="h-5 w-5 mr-2" />
                        Delete photo
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
