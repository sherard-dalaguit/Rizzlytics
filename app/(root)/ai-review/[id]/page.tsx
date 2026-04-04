import React from "react";
import {
  capitalize,
  fetchMediaAsset,
  fetchMediaAssets,
  pickHeadlineAndBullets,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import CopyButton from "@/components/ai-review/CopyButton";
import QuickRepliesResults from "@/components/analysis/QuickRepliesResults";
import TakeawayCard from "@/components/analysis/TakeawayCard";
import Image from "next/image";
import {
  Dialog,
  DialogContent, DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ImageGrid = ({
  title,
  urls,
}: {
  title: string;
  urls: string[];
}) => {
  if (!urls.length) return null;

  return (
    <div className="rounded-2xl border bg-muted/20 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant="outline">{urls.length}</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {urls.map((url, idx) => (
          <Dialog key={`${title}-${idx}`}>
            <DialogTrigger asChild>
              <button className="group w-full text-left">
                <div className="relative w-full overflow-hidden rounded-xl border bg-background/40">
                  <div className="relative aspect-3/4 w-full">
                    <Image
                      src={url}
                      alt={`${title} ${idx + 1}`}
                      fill
                      className="object-cover transition-transform group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-0">
                    {/* Gradient fade layer */}
                    <div className="absolute inset-0 primary-gradient opacity-70 transition-opacity duration-200 group-hover:opacity-90 mask-[linear-gradient(to_top,black,transparent)]" />

                    {/* Text layer (unmasked) */}
                    <div className="relative p-3">
                      <p className="text-xs text-white font-medium drop-shadow-sm">
                        Click to expand
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl p-6 overflow-hidden">
              <DialogTitle>{title}</DialogTitle>

              <div className="relative w-full">
                {/* Tall-friendly container; screenshots are usually portrait */}
                <div className="relative w-full max-h-[80vh] aspect-3/4 mx-auto">
                  <Image
                    src={url}
                    alt={`${title} (expanded) ${idx + 1}`}
                    fill
                    className="object-contain rounded-xl"
                    sizes="(max-width: 1024px) 100vw, 900px"
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
};

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/ai-analysis/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold">Analysis not found</h1>
        <p className="text-muted-foreground mt-2">
          This analysis may have been deleted or the ID is invalid.
        </p>
      </main>
    );
  }

  // 1) Parse
  const { analysis } = await response.json();
  const { result } = analysis;

  // 2) Reply coach — separate layout, return early
  if (analysis.type === "quick_replies") {
    const conversation = analysis.conversationId ?? null;
    const transcript = (conversation as any)?.transcript ?? [];
    const contextText = (conversation as any)?.contextInput ?? null;

    return (
      <QuickRepliesResults
        analysis={analysis}
        transcript={transcript}
        contextText={contextText}
      />
    );
  }

  // 3) Normalize result arrays (always populated for photo/conversation/profile)
  result.strengths = result.strengths ?? [];
  result.weaknesses = result.weaknesses ?? [];
  result.nextSteps = result.nextSteps ?? [];
  result.takeaways = result.takeaways ?? [];
  result.attractionSignals = result.attractionSignals ?? { positive: [], negative: [], uncertain: [] };

  // 4) Normalize “source” shape
  const isConversation = analysis.type === "conversation";
  const isPhoto = analysis.type === "photo";
  const isProfile = analysis.type === "profile";

  const conversation = isConversation ? analysis.conversationId : null; // populated doc (or null)
  const photoAssetId = isPhoto ? analysis.selfPhotoAssetId : null;
  const profile = isProfile ? analysis.profileId : null;

  // 3) Extract ids (no fetching yet)
  const threadIds: string[] = conversation?.threadScreenshotAssetIds ?? [];
  const otherProfileIds: string[] = conversation?.otherProfileAssetIds ?? [];
  const contextText: string | null = conversation?.contextInput ?? null;
  const profilePhotoIds: string[] = profile?.myProfileAssetIds ?? [];
  const profileContextText: string | null = profile?.contextInput ?? null;

  // 4) Fetch assets (single block)
  const [
    photoAsset,
    threadAssets,
    otherProfileAssets,
    profileAssets,
  ] = await Promise.all([
    photoAssetId ? fetchMediaAsset(photoAssetId.toString()) : Promise.resolve(null),
    threadIds.length ? fetchMediaAssets(threadIds) : Promise.resolve([]),
    otherProfileIds.length ? fetchMediaAssets(otherProfileIds) : Promise.resolve([]),
    profilePhotoIds.length ? fetchMediaAssets(profilePhotoIds) : Promise.resolve([]),
  ]);

  // 5) Map to urls (UI-ready)
  const photoUrl = photoAsset?.blobUrl ?? null;
  const threadUrls = threadAssets.map((a: any) => a?.blobUrl).filter(Boolean) as string[];
  const otherProfileUrls = otherProfileAssets.map((a: any) => a?.blobUrl).filter(Boolean) as string[];
  const profileUrls = profileAssets.map((a: any) => a?.blobUrl).filter(Boolean) as string[];

  // 6) UI helpers
  const { headline, bullets } = pickHeadlineAndBullets(result.summary ?? "");
  const hasSuggestedReplies = (result.suggestedReplies?.length ?? 0) > 0;

  const topRepliesCount = 4;

  const splitStep = (step: string): { headline: string; body: string } => {
    // @ts-ignore
    const match = step.match(/^(.+?[.!?])(\s+)(.+)$/s);
    if (match) return { headline: match[1], body: match[3] };
    return { headline: step, body: "" };
  };

  const sections = {
    positive: result.attractionSignals?.positive ?? [],
    negative: result.attractionSignals?.negative ?? [],
    uncertain: result.attractionSignals?.uncertain ?? [],
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      {/* ================= HERO HEADER ================= */}
      <section className="mb-10">
        <div className="rounded-2xl border bg-muted/20 px-6 py-6 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-30 primary-gradient blur-3xl" />
          <div className="relative">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-semibold leading-tight primary-text-gradient">
                  {capitalize(analysis.type)} Analysis
                </h1>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{capitalize(analysis.status)}</Badge>
                  {(() => {
                    const outcome = (result.rating?.overall ?? "mixed").toLowerCase();
                    const config: Record<string, { label: string; className: string }> = {
                      poor: { label: "Needs work", className: "bg-red-500/15 text-red-400 ring-1 ring-red-500/30" },
                      mixed: { label: "Mixed signals", className: "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30" },
                      good: { label: "Looking good", className: "bg-sky-400/15 text-sky-300 ring-1 ring-sky-400/30" },
                      strong: { label: "Strong", className: "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30" },
                    };
                    const { label, className } = config[outcome] ?? config.mixed;
                    return (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
                        {label}
                      </span>
                    );
                  })()}
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
          {/* ===== Overall diagnosis (hero) ===== */}
          <section className="space-y-3">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-semibold primary-text-gradient">Overall diagnosis</h2>
              <span className="text-xs text-muted-foreground">
                Read time: ~30s
              </span>
            </div>

            <div className="rounded-2xl border bg-muted/30 p-6 space-y-4 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-0.5 primary-gradient opacity-80" />
              <p className="text-lg font-medium leading-relaxed">{headline}</p>

              {bullets.length > 0 && (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {bullets.map((s: string, idx: number) => (
                    <li key={idx} className="flex gap-2">
                      <span className="mt-0.5">•</span>
                      <span className="leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* ===== Signals ===== */}
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold primary-text-gradient">Attraction signals</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {([
                {
                  key: "positive",
                  label: "What's working",
                  dot: "bg-emerald-400",
                  column: "border-emerald-500/20 bg-emerald-500/5",
                  item: "border-l-2 border-l-emerald-500/40 bg-emerald-500/5",
                  text: "text-emerald-100",
                },
                {
                  key: "negative",
                  label: "What's hurting it",
                  dot: "bg-red-400",
                  column: "border-red-500/20 bg-red-500/5",
                  item: "border-l-2 border-l-red-500/40 bg-red-500/5",
                  text: "text-red-100",
                },
                {
                  key: "uncertain",
                  label: "Could go either way",
                  dot: "bg-amber-400",
                  column: "border-amber-500/20 bg-amber-500/5",
                  item: "border-l-2 border-l-amber-500/40 bg-amber-500/5",
                  text: "text-amber-100",
                },
              ] as const).map(({ key, label, dot, column, item, text }) => {
                const signals = sections[key] ?? [];
                return (
                  <div key={key} className={`rounded-2xl border p-5 space-y-4 ${column}`}>
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${dot}`} />
                      <h3 className="text-sm font-semibold text-white">{label}</h3>
                      <span className="ml-auto text-xs text-muted-foreground">{signals.length}</span>
                    </div>
                    <div className="space-y-2">
                      {signals.length === 0 ? (
                        <p className="text-sm text-muted-foreground">None detected.</p>
                      ) : (
                        signals.map((signal: string, idx: number) => (
                          <div key={idx} className={`rounded-lg pl-3 pr-3 py-3 ${item}`}>
                            <p className={`text-sm leading-relaxed ${text}`}>{signal}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold primary-text-gradient">Supporting context</h2>
            <p className="text-sm text-muted-foreground">
              {analysis.type === "photo"
                ? "View the analyzed photo below."
                : "View the screenshots and any added context below."}
            </p>

            {/* PHOTO MODE */}
            {analysis.type === "photo" && (
              <div className="rounded-2xl border bg-muted/20 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Analyzed photo</h3>
                  <Badge variant="outline">1</Badge>
                </div>

                {!photoUrl ? (
                  <p className="text-sm text-muted-foreground">
                    Photo not available (missing asset URL).
                  </p>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="group w-full text-left">
                        <div className="relative w-full overflow-hidden rounded-xl border bg-background/40">
                          <div className="max-w-sm mx-auto">
                            <div className="relative aspect-3/4 w-full overflow-hidden rounded-xl border">
                              <Image
                                src={photoUrl}
                                alt="Analyzed photo"
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>

                          <div className="absolute inset-x-0 bottom-0">
                            {/* Gradient fade layer */}
                            <div className="absolute inset-0 primary-gradient opacity-70 transition-opacity duration-200 group-hover:opacity-90 mask-[linear-gradient(to_top,black,transparent)]" />

                            {/* Text layer (unmasked) */}
                            <div className="relative p-3">
                              <p className="text-xs text-white font-medium drop-shadow-sm">
                                Click to expand
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>
                    </DialogTrigger>

                    <DialogContent className="max-w-3xl p-8 overflow-hidden">
                      <DialogTitle>Analyzed photo</DialogTitle>

                      <div className="relative w-full">
                        <div className="relative w-full max-h-[80vh] aspect-3/4 mx-auto">
                          <Image
                            src={photoUrl}
                            alt="Analyzed photo (expanded)"
                            fill
                            className="object-contain rounded-xl"
                            sizes="(max-width: 1024px) 100vw, 900px"
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            )}

            {/* CONVERSATION MODE */}
            {analysis.type === "conversation" && (
              <div className="space-y-4">
                {/* Optional context input */}
                {contextText && contextText.trim().length > 0 && (
                  <div className="rounded-2xl border bg-muted/20 p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Extra context</h3>
                      <Badge variant="outline">Optional</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {contextText}
                    </p>
                  </div>
                )}

                {/* Thread screenshots (required) */}
                {threadUrls.length === 0 ? (
                  <div className="rounded-2xl border bg-muted/20 p-5">
                    <p className="text-sm text-muted-foreground">
                      Thread screenshots not available (missing asset URLs).
                    </p>
                  </div>
                ) : (
                  <ImageGrid title="Thread screenshots" urls={threadUrls} />
                )}

                {/* Other profile screenshots (optional) */}
                {otherProfileUrls.length > 0 && (
                  <ImageGrid title="Other profile screenshots" urls={otherProfileUrls} />
                )}
              </div>
            )}

            {/* PROFILE MODE */}
            {analysis.type === "profile" && (
              <div className="space-y-4">
                {/* Optional context input */}
                {profileContextText && profileContextText.trim().length > 0 && (
                  <div className="rounded-2xl border bg-muted/20 p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Extra context</h3>
                      <Badge variant="outline">Optional</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {profileContextText}
                    </p>
                  </div>
                )}

                {profileUrls.length === 0 ? (
                  <div className="rounded-2xl border bg-muted/20 p-5">
                    <p className="text-sm text-muted-foreground">
                      Profile photos not available (missing asset URLs).
                    </p>
                  </div>
                ) : (
                  <ImageGrid title="Profile photos" urls={profileUrls.slice(0, 9)} />
                )}
              </div>
            )}
          </section>

        </div>

        {/* ================= SIDEBAR (RIGHT) ================= */}
        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 h-fit">
          {/* Takeaways (conversation) / Next steps (photo + profile) */}
          {isConversation ? (
            <div className="rounded-2xl border border-white/10 bg-white/3 p-5 space-y-4 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-0.5 primary-gradient opacity-80" />
              <div>
                <h2 className="text-lg font-semibold text-white">Takeaways for next time</h2>
                <p className="mt-0.5 text-xs text-zinc-400">Patterns to fix before your next conversation.</p>
              </div>

              {result.takeaways.length > 0 ? (
                <div className="space-y-3">
                  {result.takeaways.map((t: any, idx: number) => (
                    <TakeawayCard key={idx} takeaway={t} index={idx} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {result.nextSteps.map((step: string, idx: number) => (
                    <div key={idx} className="rounded-xl border border-white/10 bg-white/3 p-4 flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/8 text-xs font-semibold text-zinc-400 ring-1 ring-white/10">
                        {idx + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-zinc-300">{step}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border p-5 bg-muted/20 space-y-4 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-0.5 primary-gradient opacity-80" />
              <h2 className="text-lg font-semibold">What to do next</h2>

              <div className="space-y-3">
                {result.nextSteps.map((step: string, idx: number) => {
                  const { headline, body } = splitStep(step);
                  return (
                    <div key={idx} className="rounded-lg border bg-background/40 p-4 flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/8 text-xs font-semibold text-muted-foreground ring-1 ring-white/10">
                        {idx + 1}
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-snug">{headline}</p>
                        {body && (
                          <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reply Coach CTA (conversation type only) */}
          {isConversation && (
            <div className="rounded-2xl border border-white/10 p-5 bg-white/2 space-y-3">
              <div>
                <p className="text-sm font-semibold text-white">Still texting?</p>
                <p className="text-sm text-zinc-400 mt-0.5 leading-relaxed">
                  Use Quick Replies to get live reply options for an active conversation — not a post-mortem.
                </p>
              </div>
              <a
                href="/ai-review"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/8 transition-colors"
              >
                Open Quick Replies →
              </a>
            </div>
          )}

          {/* Suggested replies (photo/profile only — conversation uses Reply Coach) */}
          {hasSuggestedReplies && !isConversation && (
            <div className="rounded-2xl border p-5 bg-muted/20 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Suggested replies</h2>
                <Badge variant="outline">{result.suggestedReplies!.length}</Badge>
              </div>

              <div className="space-y-3">
                {result.suggestedReplies!
                  .slice(0, topRepliesCount)
                  .map((reply: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-lg border bg-background/40 p-4 space-y-3"
                    >
                      <p className="text-sm leading-relaxed">“{reply.text}”</p>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{capitalize(reply.intent)}</Badge>
                        <Badge variant="outline">{capitalize(reply.tone)}</Badge>
                      </div>
                      <CopyButton value={reply.text} size="sm" variant="outline">
                        Copy
                      </CopyButton>
                    </div>
                  ))}
              </div>

              {result.suggestedReplies!.length > topRepliesCount && (
                <Accordion type="single" collapsible>
                  <AccordionItem value="more" className="border-none">
                    <AccordionTrigger className="py-2 text-sm">
                      Show {result.suggestedReplies!.length - topRepliesCount} more
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {result.suggestedReplies!
                          .slice(topRepliesCount)
                          .map((reply: any, idx: number) => (
                            <div
                              key={idx}
                              className="rounded-lg border bg-background/40 p-4 space-y-3"
                            >
                              <p className="text-sm leading-relaxed">“{reply.text}”</p>

                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary">
                                  {capitalize(reply.intent)}
                                </Badge>
                                <Badge variant="outline">{capitalize(reply.tone)}</Badge>
                              </div>
                              <CopyButton value={reply.text} size="sm" variant="outline">
                                Copy
                              </CopyButton>
                            </div>
                          ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="rounded-2xl border p-5 bg-muted/20 space-y-2">
            <h2 className="text-lg font-semibold">Details</h2>
            <p className="text-sm text-muted-foreground">
              Analysis ID: <span className="font-mono">{analysis._id}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Created: {new Date(analysis.createdAt).toLocaleString()}
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Page;
