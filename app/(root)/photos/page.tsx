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
                  <div className="relative aspect-3/4 w-full">
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

                    {/* bottom strip */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="relative rounded-xl overflow-hidden">
                        {/* gradient glow */}
                        <div className="pointer-events-none absolute inset-0 primary-gradient opacity-40 blur-2xl" />

                        {/* dark glass layer */}
                        <div className="relative rounded-xl bg-black/50 backdrop-blur-md px-3 py-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium leading-snug">{label}</p>
                            <p className="text-white/70 text-xs leading-snug">
                              Uploaded {uploaded} • ID {shortId(id)}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            className="primary-gradient text-white border-0 hover:opacity-95"
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
            <DialogContent className="max-w-4xl p-8 overflow-hidden">
              <DialogHeader className="px-5 pt-5 pb-3">
                <div className="flex items-center justify-between gap-3">
                  <DialogTitle className="text-lg">
                    Photo • {previewAsset ? shortId(previewAsset._id.toString()) : ""}
                  </DialogTitle>
                </div>
              </DialogHeader>

              {previewAsset && (
                <div className="grid grid-cols-1 md:grid-cols-3">
                  {/* image */}
                  <div className="md:col-span-2 relative h-[70vh] bg-black">
                    <Image
                      src={(previewAsset as any).blobUrl}
                      alt="preview"
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, 900px"
                    />
                  </div>

                  {/* actions */}
                  <div className="md:col-span-1 border-l bg-muted/10 p-5 space-y-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Actions</p>
                      <p className="text-xs text-muted-foreground">
                        AI Review lives in the analysis flow.
                      </p>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => {
                        window.location.href = `/ai-review/${previewAsset.analysisId}`;
                      }}
                      type="button"
                    >
                      <IconBrain className="h-5 w-5 mr-2" />
                      View AI Review
                    </Button>

                    <Button
                      className="w-full"
                      variant="destructive"
                      onClick={() => handleDelete(previewAsset._id.toString())}
                      type="button"
                    >
                      <IconTrash className="h-5 w-5 mr-2" />
                      Delete photo
                    </Button>
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
