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

import type { IMediaAssetDoc } from "@/database/media-asset.model";
import type { IProfileDoc } from "@/database/profile.model";
import { formatDate, shortId } from "@/lib/utils";

type SortKey = "newest" | "oldest";

function asAssetArray(value: any): IMediaAssetDoc[] {
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

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<IProfileDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState<SortKey>("newest");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewProfile, setPreviewProfile] = useState<IProfileDoc | null>(null);
  const [activeUrl, setActiveUrl] = useState<string>("");

  const isActive = (url: string) => url === activeUrl;

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await fetch("/api/profiles", { method: "GET" });
        if (!res.ok) throw new Error("Failed to fetch profiles");
        const data = await res.json();

        // expect { profiles } from your /api/profiles route
        const list: IProfileDoc[] = data.profiles ?? [];
        setProfiles(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const sorted = useMemo(() => {
    const list = [...profiles];
    list.sort((a: any, b: any) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sort === "newest" ? tb - ta : ta - tb;
    });
    return list;
  }, [profiles, sort]);

  const openPreview = (profile: IProfileDoc) => {
    const assets = asAssetArray((profile as any).myProfileAssetIds);
    const url = firstBlobUrl(assets);

    setPreviewProfile(profile);
    setActiveUrl(url);
    setPreviewOpen(true);
  };

  const handleDelete = async (profileId: string) => {
    try {
      const res = await fetch(`/api/profiles/${profileId}`, { method: "DELETE" });
      if (!res.ok) return console.error("Failed to delete profile");

      setProfiles((prev) => prev.filter((p) => p._id.toString() !== profileId));

      if (previewProfile?._id.toString() === profileId) {
        setPreviewOpen(false);
        setPreviewProfile(null);
        setActiveUrl("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-10">
        <p className="text-muted-foreground">Loading profiles…</p>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl primary-text-gradient font-semibold">Profiles</h1>
          <p className="text-sm text-muted-foreground">{sorted.length} profiles</p>
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
          <p className="text-lg font-medium">No profiles yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Upload a profile photo set to get started.
          </p>
        </div>
      ) : (
        <>
          {/* List */}
          <section className="space-y-4">
            {sorted.map((profile, idx) => {
              const id = profile._id.toString();
              const label = `Profile ${String(sorted.length - idx).padStart(2, "0")}`;
              const uploaded = formatDate((profile as any).createdAt);

              const assets = asAssetArray((profile as any).myProfileAssetIds);
              const photoCount =
                assets.length || (profile as any).myProfileAssetIds?.length || 0;

              const hasContext = Boolean((profile as any).contextInput?.trim());
              const stack = assets.slice(0, 3);

              const analysisId = (profile as any).analysisId?.toString?.() ?? (profile as any).analysisId;

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
                              alt="profile preview"
                              fill
                              className="object-cover"
                              sizes="160px"
                              onClick={() => openPreview(profile)}
                            />
                          ) : (
                            <div className="h-full w-full bg-muted/20" />
                          )}

                          <div className="absolute inset-x-0 bottom-0 pointer-events-none">
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
                          <Badge variant="outline">Photos: {photoCount}</Badge>
                          {hasContext && <Badge variant="outline">Has context</Badge>}
                          {analysisId ? <Badge variant="outline">Has analysis</Badge> : null}
                        </div>
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-full bg-black/55 text-white hover:bg-black/70"
                        onClick={() => openPreview(profile)}
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
                        className="primary-gradient text-white border-0 hover:opacity-95 disabled:opacity-60"
                        disabled={!analysisId}
                        onClick={() => {
                          if (!analysisId) return;
                          window.location.href = `/ai-review/${analysisId}`;
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
                  Profile • {previewProfile ? shortId(previewProfile._id.toString()) : ""}
                </DialogTitle>
              </DialogHeader>

              {previewProfile && (
                <div className="grid grid-cols-1 md:grid-cols-7">
                  {/* Main image */}
                  <div className="md:col-span-4 relative h-[72vh]">
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-b via-black/0 z-10" />

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
                        <p className="text-xs font-medium text-muted-foreground">Profile photos</p>
                        <Badge variant="outline">
                          {asAssetArray((previewProfile as any).myProfileAssetIds).length || 0}
                        </Badge>
                      </div>

                      {!asAssetArray((previewProfile as any).myProfileAssetIds).length ? (
                        <p className="text-xs text-muted-foreground">No photos uploaded.</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {asAssetArray((previewProfile as any).myProfileAssetIds)
                            .slice(0, 12)
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

                    {/* Context bubble */}
                    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md">
                      <div className="relative p-3 z-10">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Context
                        </p>

                        <p className="text-xs text-white/85 leading-snug line-clamp-5">
                          {(previewProfile as any).contextInput?.trim()
                            ? (previewProfile as any).contextInput
                            : "No context provided."}
                        </p>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none">
                        <div className="absolute inset-0 primary-gradient opacity-20" />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button
                        className="w-full disabled:opacity-60"
                        disabled={!(previewProfile as any).analysisId}
                        onClick={() => {
                          const analysisId =
                            (previewProfile as any).analysisId?.toString?.() ??
                            (previewProfile as any).analysisId;
                          if (!analysisId) return;
                          window.location.href = `/ai-review/${analysisId}`;
                        }}
                        type="button"
                      >
                        <IconBrain className="h-5 w-5 mr-2" />
                        View AI Review
                      </Button>

                      <Button
                        className="w-full bg-red-500/15 text-red-200 border border-red-500/30 hover:bg-red-500/25 hover:border-red-400/40"
                        onClick={() => handleDelete(previewProfile._id.toString())}
                        type="button"
                      >
                        <IconTrash className="h-5 w-5 mr-2" />
                        Delete profile
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
