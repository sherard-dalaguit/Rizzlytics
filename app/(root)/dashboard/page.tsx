"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDate, shortId } from "@/lib/utils";
import {
  IconArrowRight,
  IconBrain,
  IconMessageCircle2,
  IconPhoto,
  IconSparkles,
  IconUser,
} from "@tabler/icons-react";

type MediaAssetLike = {
  _id: string;
  blobUrl?: string;
  createdAt?: string | Date;
  analysisId?: string;
};

type ConversationSnapshotLike = {
  _id: string;
  createdAt?: string | Date;
  threadScreenshotAssetIds?: Array<{ blobUrl?: string } | string>;
  otherProfileAssetIds?: Array<{ blobUrl?: string } | string>;
  contextInput?: string;
  analysisId?: string;
};

type ProfileLike = {
  _id: string;
  createdAt?: string | Date;
  myProfileAssetIds?: Array<{ blobUrl?: string } | string>;
  contextInput?: string;
  analysisId?: string;
};

function safeTime(value: unknown): number {
  if (!value) return 0;
  const t = new Date(value as string | Date).getTime();
  return Number.isFinite(t) ? t : 0;
}

function resolveFirstThumb(convo: ConversationSnapshotLike | null): string | null {
  if (!convo) return null;
  const first = Array.isArray(convo.threadScreenshotAssetIds)
    ? convo.threadScreenshotAssetIds[0]
    : null;

  if (!first) return null;
  if (typeof first === "object" && first.blobUrl) return first.blobUrl;
  return null;
}

function resolveFirstProfileThumb(profile: ProfileLike | null): string | null {
  if (!profile) return null;
  const first = Array.isArray(profile.myProfileAssetIds)
    ? profile.myProfileAssetIds[0]
    : null;

  if (!first) return null;
  if (typeof first === "object" && first.blobUrl) return first.blobUrl;
  return null;
}

function countAssetIds(list: unknown[] | undefined): number {
  if (!Array.isArray(list)) return 0;
  return list.length;
}

function getLatestReviewHref(params: {
  latestPhoto: MediaAssetLike | null;
  latestConvo: ConversationSnapshotLike | null;
  latestProfile: ProfileLike | null;
}) {
  const { latestPhoto, latestConvo, latestProfile } = params;

  const photoT = latestPhoto ? safeTime(latestPhoto.createdAt) : 0;
  const convoT = latestConvo ? safeTime(latestConvo.createdAt) : 0;
  const profileT = latestProfile ? safeTime(latestProfile.createdAt) : 0;

  if (photoT >= convoT && photoT >= profileT) {
    return latestPhoto?.analysisId ? `/ai-review/${latestPhoto.analysisId}` : "/ai-review";
  }

  if (convoT >= photoT && convoT >= profileT) {
    return latestConvo?.analysisId ? `/ai-review/${latestConvo.analysisId}` : "/ai-review";
  }

  return latestProfile?.analysisId ? `/ai-review/${latestProfile.analysisId}` : "/ai-review";
}

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<MediaAssetLike[]>([]);
  const [convos, setConvos] = useState<ConversationSnapshotLike[]>([]);
  const [profiles, setProfiles] = useState<ProfileLike[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const [photosRes, convosRes, profilesRes] = await Promise.all([
          fetch("/api/assets", { method: "GET" }),
          fetch("/api/conversations", { method: "GET" }),
          fetch("/api/profiles", { method: "GET" }),
        ]);

        if (photosRes.ok) {
          const data = await photosRes.json();
          setPhotos(data.mediaAssets ?? []);
        } else {
          console.error("Failed to fetch /api/assets");
        }

        if (convosRes.ok) {
          const data = await convosRes.json();
          setConvos(data.conversationSnapshots ?? []);
        } else {
          console.error("Failed to fetch /api/conversations");
        }

        if (profilesRes.ok) {
          const data = await profilesRes.json();
          setProfiles(data.profiles ?? []);
        } else {
          console.error("Failed to fetch /api/profiles");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const sortedPhotos = useMemo(
    () => [...photos].sort((a, b) => safeTime(b.createdAt) - safeTime(a.createdAt)),
    [photos]
  );

  const sortedConvos = useMemo(
    () => [...convos].sort((a, b) => safeTime(b.createdAt) - safeTime(a.createdAt)),
    [convos]
  );

  const sortedProfiles = useMemo(
    () => [...profiles].sort((a, b) => safeTime(b.createdAt) - safeTime(a.createdAt)),
    [profiles]
  );

  const latestPhoto = sortedPhotos[0] ?? null;
  const latestConvo = sortedConvos[0] ?? null;
  const latestProfile = sortedProfiles[0] ?? null;

  const photoCount = sortedPhotos.length;
  const convoCount = sortedConvos.length;
  const profileCount = sortedProfiles.length;
  const totalCount = photoCount + convoCount + profileCount;

  const convWithContext = useMemo(
    () => sortedConvos.filter((c) => Boolean(c.contextInput?.trim())).length,
    [sortedConvos]
  );

  const latestReviewHref = useMemo(
    () =>
      getLatestReviewHref({
        latestPhoto,
        latestConvo,
        latestProfile,
      }),
    [latestPhoto, latestConvo, latestProfile]
  );

  const heroTitle =
    totalCount === 0 ? "Start your first analysis" : "You’re fully analyzed";

  const heroSubtitle =
    totalCount === 0
      ? "Upload a few photos or a conversation thread so Rizzlytics can give you a real baseline."
      : "Now just improve one thing at a time. Small iterations beat random changes.";

  const focusCard = useMemo(() => {
    if (totalCount === 0) {
      return {
        eyebrow: "Today’s focus",
        title: "Upload your first photos",
        description:
          "Start with 3–5 photos so the AI has enough signal to compare strengths, weaknesses, and consistency.",
        cta: "Go to Photos",
        href: "/photos",
        icon: <IconPhoto className="h-5 w-5" />,
      };
    }

    if (photoCount > 0 && profileCount === 0) {
      return {
        eyebrow: "Today’s focus",
        title: "Create your first profile set",
        description:
          "You already have photos. Bundle the strongest ones into a profile so the advice maps to what you’ll actually use.",
        cta: "Go to Profiles",
        href: "/profiles",
        icon: <IconUser className="h-5 w-5" />,
      };
    }

    if (convoCount > 0 && convWithContext < convoCount) {
      return {
        eyebrow: "Today’s focus",
        title: "Add context to an older conversation",
        description:
          "A single line of context makes the rewrite advice much more precise and useful.",
        cta: "Review Conversations",
        href: "/conversations",
        icon: <IconMessageCircle2 className="h-5 w-5" />,
      };
    }

    return {
      eyebrow: "Today’s focus",
      title: "Open your latest AI review",
      description:
        "Don’t try to fix everything. Pick one photo swap or one message rewrite and implement it today.",
      cta: "Open AI Review",
      href: latestReviewHref,
      icon: <IconBrain className="h-5 w-5" />,
    };
  }, [totalCount, photoCount, profileCount, convoCount, convWithContext, latestReviewHref]);

  const quickActions = useMemo(() => {
    const actions = [
      {
        label: "Photos",
        href: "/photos",
        icon: <IconPhoto className="h-4 w-4" />,
      },
      {
        label: "Profiles",
        href: "/profiles",
        icon: <IconUser className="h-4 w-4" />,
      },
      {
        label: "Conversations",
        href: "/conversations",
        icon: <IconMessageCircle2 className="h-4 w-4" />,
      },
    ];

    if (totalCount > 0) {
      actions.push({
        label: "Latest AI Review",
        href: latestReviewHref,
        icon: <IconSparkles className="h-4 w-4" />,
      });
    }

    return actions;
  }, [totalCount, latestReviewHref]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="space-y-8">
          <section className="space-y-2">
            <Skeleton className="h-10 w-52" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </section>

          <section className="rounded-3xl border border-white/10 bg-muted/10 p-6 md:p-8">
            <div className="space-y-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-[420px] max-w-full" />
              <Skeleton className="h-4 w-[560px] max-w-full" />
              <div className="pt-2">
                <Skeleton className="h-11 w-40 rounded-xl" />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <div className="rounded-3xl border border-white/10 bg-muted/10 p-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-[320px] max-w-full" />
                  <Skeleton className="h-4 w-[500px] max-w-full" />
                  <Skeleton className="h-11 w-44 rounded-xl" />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-muted/10 p-5">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-28" />
                  <div className="flex flex-wrap gap-3">
                    <Skeleton className="h-10 w-28 rounded-xl" />
                    <Skeleton className="h-10 w-32 rounded-xl" />
                    <Skeleton className="h-10 w-36 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 lg:col-span-5">
              <Skeleton className="h-4 w-32" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-muted/10 p-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-4 w-48 max-w-full" />
                      <Skeleton className="h-3 w-36 max-w-full" />
                    </div>
                    <Skeleton className="h-9 w-16 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="space-y-8">
        <section className="space-y-2">
          <h1 className="inline-block bg-clip-text text-4xl font-semibold text-transparent primary-text-gradient">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            A cleaner view of what to do next.
          </p>
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-muted/10">
          <div className="pointer-events-none absolute inset-0 primary-gradient opacity-15 blur-3xl" />

          <div className="relative p-6 md:p-8">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                Rizzlytics
              </p>

              <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                {heroTitle}
              </h2>

              <p className="max-w-2xl text-sm leading-relaxed text-white/70">
                {heroSubtitle}
              </p>

              <div className="pt-3">
                <Button
                  className="primary-gradient border-0 text-white hover:opacity-95"
                  onClick={() => router.push(focusCard.href)}
                  type="button"
                >
                  {focusCard.icon}
                  <span className="ml-2">{focusCard.cta}</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <FocusCard
              eyebrow={focusCard.eyebrow}
              title={focusCard.title}
              description={focusCard.description}
              cta={focusCard.cta}
              icon={focusCard.icon}
              onClick={() => router.push(focusCard.href)}
            />

            <QuickActionsCard
              actions={quickActions}
              onNavigate={(href) => router.push(href)}
            />
          </div>

          <div className="space-y-4 lg:col-span-5">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Recent activity</p>
              <p className="text-xs text-muted-foreground">
                Jump back into your latest items.
              </p>
            </div>

            <RecentCompactCard
              kind="Latest photo"
              thumbnailUrl={latestPhoto?.blobUrl}
              title={
                latestPhoto
                  ? `Photo • ${shortId(
                    latestPhoto._id?.toString?.() ?? String(latestPhoto._id)
                  )}`
                  : "No photos yet"
              }
              subtitle={
                latestPhoto?.createdAt
                  ? `Uploaded ${formatDate(latestPhoto.createdAt)}`
                  : "Upload a few photos to get started."
              }
              meta={latestPhoto ? `${photoCount} total` : undefined}
              onClick={() => router.push("/photos")}
            />

            <RecentCompactCard
              kind="Latest conversation"
              thumbnailUrl={resolveFirstThumb(latestConvo)}
              title={
                latestConvo
                  ? `Conversation • ${shortId(
                    latestConvo._id?.toString?.() ?? String(latestConvo._id)
                  )}`
                  : "No conversations yet"
              }
              subtitle={
                latestConvo?.createdAt
                  ? `Uploaded ${formatDate(latestConvo.createdAt)}`
                  : "Upload a thread to get started."
              }
              meta={
                latestConvo
                  ? `${countAssetIds(latestConvo.threadScreenshotAssetIds)} screenshots`
                  : undefined
              }
              onClick={() => router.push("/conversations")}
            />

            <RecentCompactCard
              kind="Latest profile"
              thumbnailUrl={resolveFirstProfileThumb(latestProfile)}
              title={
                latestProfile
                  ? `Profile • ${shortId(
                    latestProfile._id?.toString?.() ?? String(latestProfile._id)
                  )}`
                  : "No profiles yet"
              }
              subtitle={
                latestProfile?.createdAt
                  ? `Created ${formatDate(latestProfile.createdAt)}`
                  : "Create a profile set to get started."
              }
              meta={
                latestProfile
                  ? `${countAssetIds(latestProfile.myProfileAssetIds)} photos`
                  : undefined
              }
              onClick={() => router.push("/profiles")}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function FocusCard({
                     eyebrow,
                     title,
                     description,
                     cta,
                     icon,
                     onClick,
                   }: {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-muted/10 p-6 md:p-7">
      <div className="pointer-events-none absolute inset-0 primary-gradient opacity-10 blur-3xl" />

      <div className="relative space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80">
            {icon}
          </div>

          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.16em] text-white/45">
              {eyebrow}
            </p>
            <h3 className="text-2xl font-semibold text-white">{title}</h3>
          </div>
        </div>

        <p className="max-w-2xl text-sm leading-relaxed text-white/70">
          {description}
        </p>

        <div className="pt-1">
          <Button
            className="primary-gradient border-0 text-white hover:opacity-95"
            onClick={onClick}
            type="button"
          >
            {cta}
            <IconArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function QuickActionsCard({
                            actions,
                            onNavigate,
                          }: {
  actions: Array<{
    label: string;
    href: string;
    icon: React.ReactNode;
  }>;
  onNavigate: (href: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-muted/10 p-5">
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-white">Quick actions</p>
          <p className="text-xs text-muted-foreground">
            Secondary actions — useful, but not your main focus.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              className="border border-white/10 bg-white/5 text-white hover:bg-white/10"
              onClick={() => onNavigate(action.href)}
              type="button"
            >
              <span className="mr-2 inline-flex">{action.icon}</span>
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecentCompactCard({
                             kind,
                             thumbnailUrl,
                             title,
                             subtitle,
                             meta,
                             onClick,
                           }: {
  kind: string;
  thumbnailUrl?: string | null;
  title: string;
  subtitle: string;
  meta?: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-muted/10 p-4">
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt="thumbnail"
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-white/30">
              —
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
            {kind}
          </p>
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          <p className="truncate text-xs text-white/60">{subtitle}</p>

          {meta ? (
            <p className="mt-1 text-xs text-white/40">{meta}</p>
          ) : null}
        </div>

        <Button
          className={cn(
            "border border-white/10 bg-white/5 text-white hover:bg-white/10"
          )}
          onClick={onClick}
          type="button"
        >
          View
        </Button>
      </div>
    </div>
  );
}