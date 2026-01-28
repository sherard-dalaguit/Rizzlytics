"use client";

import React, {useEffect, useMemo, useState} from "react";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {cn, formatDate, shortId} from "@/lib/utils";
import {
  IconArrowRight,
  IconBrain,
  IconMessageCircle2,
  IconPhoto,
  IconSparkles,
  IconTrendingUp, IconUser,
} from "@tabler/icons-react";

type MediaAssetLike = {
  _id: any;
  blobUrl?: string;
  createdAt?: string | Date;
  analysisId?: any;
};

type ConversationSnapshotLike = {
  _id: any;
  createdAt?: string | Date;
  threadScreenshotAssetIds?: any[]; // may be populated docs or ids
  otherProfileAssetIds?: any[]; // may be populated docs or ids
  contextInput?: string;
  analysisId?: any;
};

type ProfileLike = {
  _id: any;
  createdAt?: string | Date;
  myProfileAssetIds?: any[]; // populated docs or ids
  contextInput?: string;
  analysisId?: any;
};

function safeTime(value: any): number {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
}

function resolveFirstProfileThumb(profile: ProfileLike | null): string | null {
  if (!profile) return null;
  const first = Array.isArray(profile.myProfileAssetIds) ? profile.myProfileAssetIds[0] : null;
  if (!first) return null;
  if (typeof first === "object" && (first as any).blobUrl) return (first as any).blobUrl;
  return null;
}


export default function DashboardPage() {
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
          console.error("Failed to fetch /api/conversation-snapshots");
        }

        if (profilesRes.ok) {
          const data = await profilesRes.json();
          setProfiles(data.profiles ?? []);
        } else {
          console.error("Failed to fetch /api/profiles");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const sortedPhotos = useMemo(() => {
    return [...photos].sort((a, b) => safeTime(b.createdAt) - safeTime(a.createdAt));
  }, [photos]);

  const sortedConvos = useMemo(() => {
    return [...convos].sort((a, b) => safeTime(b.createdAt) - safeTime(a.createdAt));
  }, [convos]);

  const sortedProfiles = useMemo(() => {
    return [...profiles].sort((a, b) => safeTime(b.createdAt) - safeTime(a.createdAt));
  }, [profiles]);

  const latestPhoto = sortedPhotos[0] ?? null;
  const latestConvo = sortedConvos[0] ?? null;
  const latestProfile = sortedProfiles[0] ?? null;

  const photoCount = sortedPhotos.length;
  const convoCount = sortedConvos.length;
  const profileCount = sortedProfiles.length;

  const convWithContext = useMemo(() => {
    return sortedConvos.filter((c) => Boolean(c.contextInput?.trim())).length;
  }, [sortedConvos]);

  const lastUploadAt = useMemo(() => {
    const photoT = latestPhoto ? safeTime(latestPhoto.createdAt) : 0;
    const convoT = latestConvo ? safeTime(latestConvo.createdAt) : 0;
    return Math.max(photoT, convoT);
  }, [latestPhoto, latestConvo, latestProfile]);

  const lastUploadLabel = useMemo(() => {
    if (!lastUploadAt) return "—";
    return formatDate(new Date(lastUploadAt));
  }, [lastUploadAt]);

  // “Next steps” suggestions (simple + defensible)
  const nextSteps = useMemo(() => {
    const steps: Array<{
      title: string;
      description: string;
      cta: string;
      href: string;
      icon: React.ReactNode;
    }> = [];

    // If no uploads
    if (photoCount === 0 && convoCount === 0) {
      steps.push({
        title: "Upload your first photo",
        description: "Start with 3–5 photos so the AI has signal to compare.",
        cta: "Go to Photos",
        href: "/photos",
        icon: <IconPhoto className="h-5 w-5" />,
      });
      steps.push({
        title: "Upload a conversation thread",
        description: "Add screenshots + a bit of context to get actionable rewrites.",
        cta: "Go to Conversations",
        href: "/conversations",
        icon: <IconMessageCircle2 className="h-5 w-5" />,
      });
      return steps;
    }

    // If only photos
    if (photoCount > 0 && convoCount === 0) {
      steps.push({
        title: "Run a conversation analysis",
        description: "Photos are your hook — convos are how you convert.",
        cta: "Upload conversation",
        href: "/conversations",
        icon: <IconMessageCircle2 className="h-5 w-5" />,
      });
      steps.push({
        title: "Iterate one photo",
        description: "Swap your weakest photo for a cleaner, brighter, higher-signal shot.",
        cta: "Review photos",
        href: "/photos",
        icon: <IconSparkles className="h-5 w-5" />,
      });
      return steps;
    }

    // If only conversations
    if (photoCount === 0 && convoCount > 0) {
      steps.push({
        title: "Upload a photo set",
        description: "A strong stack raises match quality before the first message.",
        cta: "Upload photos",
        href: "/photos",
        icon: <IconPhoto className="h-5 w-5" />,
      });
      steps.push({
        title: "Rewrite your last thread",
        description: "Open the last AI review and rewrite the next 3 messages using the pattern.",
        cta: "Open AI Review",
        href: latestConvo?.analysisId ? `/ai-review/${latestConvo.analysisId}` : "/ai-review",
        icon: <IconBrain className="h-5 w-5" />,
      });
      return steps;
    }

    if (photoCount > 0 && profileCount === 0) {
      steps.push({
        title: "Create a profile set",
        description: "Bundle your best photos into one profile analysis (this is what you’ll actually use).",
        cta: "Go to Profiles",
        href: "/profiles",
        icon: <IconPhoto className="h-5 w-5" />,
      });
      return steps;
    }

    // Both exist
    steps.push({
      title: "Improve one thing today",
      description: "Pick ONE: swap a photo or rewrite ONE conversation segment. Small iterations compound.",
      cta: "Open AI Review",
      href: (() => {
        // choose most recent analysis between latest photo + latest convo
        const photoT = latestPhoto ? safeTime(latestPhoto.createdAt) : 0;
        const convoT = latestConvo ? safeTime(latestConvo.createdAt) : 0;
        return photoT >= convoT
          ? latestPhoto?.analysisId
            ? `/ai-review/${latestPhoto.analysisId}`
            : "/ai-review"
          : latestConvo?.analysisId
            ? `/ai-review/${latestConvo.analysisId}`
            : "/ai-review";
      })(),
      icon: <IconBrain className="h-5 w-5" />,
    });

    if (convWithContext < convoCount) {
      steps.push({
        title: "Add context to older convos",
        description: "A single line of context can turn generic advice into exact rewrites.",
        cta: "Review conversations",
        href: "/conversations",
        icon: <IconSparkles className="h-5 w-5" />,
      });
    } else {
      steps.push({
        title: "Upgrade your weakest photo",
        description: "Replace one low-signal photo (dark / blurry / awkward crop) with a cleaner shot.",
        cta: "Review photos",
        href: "/photos",
        icon: <IconPhoto className="h-5 w-5" />,
      });
    }

    return steps.slice(0, 2);
  }, [photoCount, convoCount, latestPhoto, latestConvo, convWithContext]);

  if (loading) {
    return (
      <main className="max-w-352 mx-auto px-6 py-10">
        <p className="text-muted-foreground">Loading dashboard…</p>
      </main>
    );
  }

  const snapshotLabel =
    photoCount === 0 && convoCount === 0 && profileCount === 0
      ? "No uploads yet"
      : `Snapshot • ${photoCount} photo${photoCount === 1 ? "" : "s"} • ${profileCount} profile${
        profileCount === 1 ? "" : "s"
      } • ${convoCount} conversation${convoCount === 1 ? "" : "s"}`;

  return (
    <main className="max-w-352 mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <section className="space-y-1">
        <h1 className="text-4xl primary-text-gradient font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your next best moves, based on what you’ve uploaded so far.
        </p>
      </section>

      {/* Hero */}
      <section className="rounded-2xl border border-white/10 bg-muted/10 overflow-hidden relative">
        {/* ambient gradient */}
        <div className="pointer-events-none absolute inset-0 primary-gradient opacity-15 blur-3xl" />

        <div className="relative p-6 md:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2">
            <p className="text-xs text-white/60 flex items-center gap-2">
              <IconTrendingUp className="h-4 w-4" />
              {snapshotLabel}
            </p>

            <h2 className="text-2xl md:text-3xl font-semibold text-white">
              {photoCount + convoCount === 0 ? "Start your first analysis" : "You’re fully analyzed — now iterate"}
            </h2>

            <p className="text-sm text-white/70 max-w-2xl">
              {photoCount + convoCount === 0
                ? "Upload a photo or conversation to get a high-signal diagnostic and action plan."
                : "Use the action cards below to fix the highest-impact issues first. One clean change per day beats random changes."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              className="primary-gradient text-white border-0 hover:opacity-95"
              onClick={() => (window.location.href = "/photos")}
              type="button"
            >
              <IconPhoto className="h-5 w-5 mr-2" />
              Photos
            </Button>

            <Button
              className="bg-white/5 border border-white/10 text-white hover:bg-white/10"
              onClick={() => (window.location.href = "/conversations")}
              type="button"
            >
              <IconMessageCircle2 className="h-5 w-5 mr-2" />
              Conversations
            </Button>
          </div>
        </div>
      </section>

      {/* Main grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Next steps */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">Next steps</p>
            <p className="text-xs text-muted-foreground">Do these in order — highest impact first.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nextSteps.map((s) => (
              <ActionCard
                key={s.title}
                title={s.title}
                description={s.description}
                cta={s.cta}
                href={s.href}
                icon={s.icon}
              />
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">Recent activity</p>
            <p className="text-xs text-muted-foreground">Jump back into the latest items.</p>
          </div>

          <div className="space-y-4">
            <RecentCard
              kind="Latest photo"
              thumbnailUrl={latestPhoto?.blobUrl}
              title={latestPhoto ? `Photo • ${shortId(latestPhoto._id?.toString?.() ?? String(latestPhoto._id))}` : "No photos yet"}
              subtitle={latestPhoto?.createdAt ? `Uploaded ${formatDate(latestPhoto.createdAt)}` : "Upload a photo to get started."}
              primaryCta={{
                label: "View",
                onClick: () => (window.location.href = "/photos"),
              }}
              secondaryCta={
                latestPhoto?.analysisId
                  ? {
                    label: "AI Review",
                    onClick: () => (window.location.href = `/ai-review/${latestPhoto.analysisId}`),
                    variant: "primary",
                    icon: <IconBrain className="h-4 w-4" />,
                  }
                  : undefined
              }
            />

            <RecentCard
              kind="Latest conversation"
              thumbnailUrl={resolveFirstThumb(latestConvo)}
              title={
                latestConvo
                  ? `Conversation • ${shortId(latestConvo._id?.toString?.() ?? String(latestConvo._id))}`
                  : "No conversations yet"
              }
              subtitle={
                latestConvo?.createdAt
                  ? `Uploaded ${formatDate(latestConvo.createdAt)}`
                  : "Upload a conversation to get started."
              }
              chips={
                latestConvo
                  ? [
                    `Thread: ${countAssetIds(latestConvo.threadScreenshotAssetIds)}`,
                    `Profile: ${countAssetIds(latestConvo.otherProfileAssetIds)}`,
                    latestConvo.contextInput?.trim() ? "Has context" : "No context",
                  ]
                  : []
              }
              primaryCta={{
                label: "View",
                onClick: () => (window.location.href = "/conversations"),
              }}
              secondaryCta={
                latestConvo?.analysisId
                  ? {
                    label: "AI Review",
                    onClick: () => (window.location.href = `/ai-review/${latestConvo.analysisId}`),
                    variant: "primary",
                    icon: <IconBrain className="h-4 w-4" />,
                  }
                  : undefined
              }
            />

            <RecentCard
              kind="Latest profile"
              thumbnailUrl={resolveFirstProfileThumb(latestProfile)}
              title={
                latestProfile
                  ? `Profile • ${shortId(latestProfile._id?.toString?.() ?? String(latestProfile._id))}`
                  : "No profiles yet"
              }
              subtitle={
                latestProfile?.createdAt
                  ? `Uploaded ${formatDate(latestProfile.createdAt)}`
                  : "Create a profile set to get started."
              }
              chips={
                latestProfile
                  ? [
                    `Photos: ${countAssetIds(latestProfile.myProfileAssetIds)}`,
                    latestProfile.contextInput?.trim() ? "Has context" : "No context",
                  ]
                  : []
              }
              primaryCta={{
                label: "View",
                onClick: () => (window.location.href = "/profiles"),
              }}
              secondaryCta={
                latestProfile?.analysisId
                  ? {
                    label: "AI Review",
                    onClick: () => (window.location.href = `/ai-review/${latestProfile.analysisId}`),
                    variant: "primary",
                    icon: <IconBrain className="h-4 w-4" />,
                  }
                  : undefined
              }
            />
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatTile
          label="Photos uploaded"
          value={`${photoCount}`}
          icon={<IconPhoto className="h-5 w-5" />}
        />
        <StatTile
          label="Conversations uploaded"
          value={`${convoCount}`}
          icon={<IconMessageCircle2 className="h-5 w-5" />}
        />
        <StatTile
          label="Profiles created"
          value={`${profileCount}`}
          icon={<IconUser className="h-5 w-5" />}
        />
        <StatTile
          label="Last upload"
          value={lastUploadLabel}
          icon={<IconTrendingUp className="h-5 w-5" />}
          valueClassName="text-sm font-semibold text-white"
        />
      </section>

      {/* One-screen CTA */}
      <section className="rounded-2xl border border-white/10 bg-muted/10 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">Want a clean “one-screen” AI plan?</p>
          <p className="text-xs text-muted-foreground">
            Open your latest AI review and implement one change today (photo swap or message rewrite).
          </p>
        </div>

        <Button
          className="primary-gradient text-white border-0 hover:opacity-95"
          onClick={() => {
            // pick most recent analysis between photo + convo
            const photoT = latestPhoto ? safeTime(latestPhoto.createdAt) : 0;
            const convoT = latestConvo ? safeTime(latestConvo.createdAt) : 0;

            window.location.href = photoT >= convoT
              ? latestPhoto?.analysisId
                ? `/ai-review/${latestPhoto.analysisId}`
                : "/ai-review"
              : latestConvo?.analysisId
                ? `/ai-review/${latestConvo.analysisId}`
                : "/ai-review";
          }}
          type="button"
        >
          <IconBrain className="h-5 w-5 mr-2" />
          Open AI Review
        </Button>
      </section>
    </main>
  );
}

/* ------------------------------ UI pieces ------------------------------ */

function StatTile({
  label,
  value,
  icon,
  valueClassName,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-muted/10 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 primary-gradient opacity-10 blur-3xl" />
      <div className="relative p-5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-white/60">{label}</p>
          <p className={cn("text-xl font-semibold text-white", valueClassName)}>{value}</p>
        </div>

        <div className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/80">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  cta,
  href,
  icon,
}: {
  title: string;
  description: string;
  cta: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-muted/10 p-5 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 primary-gradient opacity-10 blur-3xl" />

      <div className="relative space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/80">
            {icon}
          </div>

          <p className="text-sm font-semibold text-white">{title}</p>
        </div>

        <p className="text-xs text-white/70 leading-relaxed">{description}</p>

        <div className="pt-2">
          <Button
            className="bg-white/5 border border-white/10 text-white hover:bg-white/10"
            onClick={() => (window.location.href = href)}
            type="button"
          >
            {cta}
            <IconArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function RecentCard({
  kind,
  thumbnailUrl,
  title,
  subtitle,
  chips,
  primaryCta,
  secondaryCta,
}: {
  kind: string;
  thumbnailUrl?: string | null;
  title: string;
  subtitle: string;
  chips?: string[];
  primaryCta: { label: string; onClick: () => void };
  secondaryCta?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "ghost";
    icon?: React.ReactNode;
  };
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-muted/10 overflow-hidden">
      <div className="p-5 flex items-center gap-4">
        <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-white/10 bg-black shrink-0">
          {thumbnailUrl ? (
            <Image src={thumbnailUrl} alt="thumb" fill className="object-cover" sizes="80px" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-white/30 text-xs">—</div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-8 pointer-events-none">
            <div className="absolute inset-0 primary-gradient opacity-30 mask-[linear-gradient(to_top,black,transparent)]" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-white/60">{kind}</p>
          <p className="text-sm font-semibold text-white truncate">{title}</p>
          <p className="text-xs text-white/60 truncate">{subtitle}</p>

          {chips?.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {chips.map((c) => (
                <span
                  key={c}
                  className="text-[11px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/70"
                >
                  {c}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="bg-white/5 border border-white/10 text-white hover:bg-white/10"
            onClick={primaryCta.onClick}
            type="button"
          >
            {primaryCta.label}
          </Button>

          {secondaryCta ? (
            <Button
              className={cn(
                secondaryCta.variant === "primary"
                  ? "primary-gradient text-white border-0 hover:opacity-95"
                  : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
              )}
              onClick={secondaryCta.onClick}
              type="button"
            >
              {secondaryCta.icon ? <span className="mr-2 inline-flex">{secondaryCta.icon}</span> : null}
              {secondaryCta.label}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Helpers ------------------------------ */

function countAssetIds(list: any[] | undefined): number {
  if (!Array.isArray(list)) return 0;
  return list.length;
}

function resolveFirstThumb(convo: ConversationSnapshotLike | null): string | null {
  if (!convo) return null;

  const first = Array.isArray(convo.threadScreenshotAssetIds) ? convo.threadScreenshotAssetIds[0] : null;

  // could be populated doc: { blobUrl }, or raw ObjectId string
  if (!first) return null;
  if (typeof first === "object" && (first as any).blobUrl) return (first as any).blobUrl;

  return null;
}
