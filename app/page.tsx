import Link from "next/link";
import Image from "next/image";
import React from "react";
import {
  IconArrowRight,
  IconBolt,
  IconCamera,
  IconCheck,
  IconChartDots3,
  IconMessageCircle2,
  IconPhoto,
  IconShieldLock,
  IconSparkles,
  IconStack2,
  IconWand,
} from "@tabler/icons-react";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07070b] text-white">
      <BackgroundGlow />

      <div className="relative z-10">
        <SiteHeader />

        <section className="mx-auto max-w-7xl px-6 pt-10 pb-24">
          <HeroSection />
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20">
          <ProofStrip />
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 pb-24">
          <ProductSuiteSection />
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24">
          <HowItWorksSection />
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24">
          <DetailedValueSection />
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24">
          <FinalCta />
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}

function BackgroundGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute left-[-10%] top-[-6%] h-[34rem] w-[34rem] rounded-full blur-3xl opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(255,55,180,0.30) 0%, rgba(255,55,180,0.10) 38%, transparent 72%)",
        }}
      />
      <div
        className="absolute right-[-10%] top-[2%] h-[30rem] w-[30rem] rounded-full blur-3xl opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(177,115,255,0.28) 0%, rgba(177,115,255,0.10) 38%, transparent 72%)",
        }}
      />
      <div
        className="absolute bottom-[-18%] left-[15%] h-[28rem] w-[28rem] rounded-full blur-3xl opacity-10"
        style={{
          background:
            "radial-gradient(circle, rgba(255,90,205,0.22) 0%, rgba(255,90,205,0.08) 38%, transparent 72%)",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_35%)]" />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.png" alt="Rizzlytics logo" width={38} height={38} />
        <span className="text-xl font-semibold tracking-tight primary-text-gradient">
          Rizzlytics
        </span>
      </Link>

      <nav className="hidden items-center gap-8 md:flex">
        <Link href="#features" className="text-sm text-white/65 transition hover:text-white">
          Features
        </Link>
        <Link href="#how-it-works" className="text-sm text-white/65 transition hover:text-white">
          How it works
        </Link>
        <Link href="/ai-review" className="text-sm text-white/65 transition hover:text-white">
          AI Review
        </Link>
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/log-in"
          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80 transition hover:bg-white/[0.08] hover:text-white"
        >
          Log in
        </Link>
        <Link
          href="/photos"
          className="hidden rounded-xl px-4 py-2 text-sm font-medium text-white primary-gradient transition hover:opacity-95 md:inline-flex"
        >
          Get started
        </Link>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <div className="grid items-center gap-14 lg:grid-cols-[1.04fr_0.96fr]">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white/70 backdrop-blur">
          <IconBolt className="h-3.5 w-3.5" />
          AI dating feedback for photos, profiles, and texting
        </div>

        <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[0.96] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
          Improve your{" "}
          <span className="primary-text-gradient">photos</span>,{" "}
          <span className="primary-text-gradient">profile</span>, and{" "}
          <span className="primary-text-gradient">texts</span> with clear next steps.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68 sm:text-xl">
          Rizzlytics shows what’s working, what’s hurting your results, and what
          to change first — from single-photo reads to full profile sets, end-of-convo
          reviews, and live mid-convo reply help.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/photos"
            className="inline-flex items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-medium text-white primary-gradient transition hover:opacity-95"
          >
            Start with photos
            <IconArrowRight className="ml-2 h-4 w-4" />
          </Link>

          <Link
            href="/ai-review"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.08] hover:text-white"
          >
            Run AI analysis
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <SoftPill>Single photo analysis</SoftPill>
          <SoftPill>Set-level profile review</SoftPill>
          <SoftPill>End-of-convo breakdowns</SoftPill>
          <SoftPill>Mid-convo texting help</SoftPill>
        </div>
      </div>

      <HeroMockup />
    </div>
  );
}

function HeroMockup() {
  return (
    <div className="relative">
      <div className="absolute inset-0 scale-[0.98] rounded-[2rem] bg-gradient-to-b from-fuchsia-500/20 via-transparent to-violet-400/10 blur-2xl" />

      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d0d13]/95 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_30px_80px_rgba(0,0,0,0.45)]">
        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">AI Review</p>
              <p className="mt-1 text-xs text-white/50">
                Diagnosis, signals, and what to change first
              </p>
            </div>

            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-300">
              Ready to iterate
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <PreviewStat
              label="Photo set score"
              value="7.8 / 10"
              sub="Strong baseline, but one weak photo dragging consistency"
            />
            <PreviewStat
              label="Conversation momentum"
              value="Medium"
              sub="Interest is there, but opener + follow-up need tightening"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">Top issue to fix</p>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  Replace the darkest mirror selfie. It weakens your set and makes
                  the overall profile feel less intentional.
                </p>
              </div>

              <span className="rounded-full bg-fuchsia-500/15 px-2 py-1 text-[11px] text-fuchsia-300">
                High impact
              </span>
            </div>
          </div>

          <div className="grid gap-3">
            <SignalRow
              label="Attraction signals"
              description="Clean style, strong facial aesthetics, solid physique cues"
              tone="good"
            />
            <SignalRow
              label="Low-signal elements"
              description="Inconsistent story across photos, one awkward crop, weak opener"
              tone="warn"
            />
            <SignalRow
              label="Suggested next move"
              description="Swap one photo today, then re-run analysis before changing anything else"
              tone="neutral"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">
              Quick reply suggestion
            </p>
            <p className="mt-3 text-sm leading-6 text-white/80">
              “you seem like someone I’d rather meet than keep texting”
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-white/40">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/58">{sub}</p>
    </div>
  );
}

function SignalRow({
  label,
  description,
  tone,
}: {
  label: string;
  description: string;
  tone: "good" | "warn" | "neutral";
}) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/15"
      : tone === "warn"
        ? "bg-amber-400/10 text-amber-300 border-amber-400/15"
        : "bg-white/[0.05] text-white/75 border-white/10";

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className={`inline-flex min-h-[40px] items-center rounded-full border px-3 py-2 text-[11px] leading-[1.1] ${toneClass}`}>
        {label}
      </div>
      <p className="text-sm leading-6 text-white/65">{description}</p>
    </div>
  );
}

function SoftPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/68">
      {children}
    </div>
  );
}

function ProofStrip() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-6">
      <div className="grid gap-4 md:grid-cols-3">
        <ProofItem
          icon={<IconSparkles className="h-5 w-5" />}
          title="Real diagnosis, not generic advice"
          text="See what’s attractive, what’s low-signal, and why — instead of random tips with no prioritization."
        />
        <ProofItem
          icon={<IconChartDots3 className="h-5 w-5" />}
          title="Specific next steps"
          text="Get one clean action to implement first, whether that’s swapping a photo or tightening a reply."
        />
        <ProofItem
          icon={<IconShieldLock className="h-5 w-5" />}
          title="Private by default"
          text="Your uploads stay in your control. Analyze what you want, delete what you want."
        />
      </div>
    </div>
  );
}

function ProofItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/8 bg-black/10 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/80">
        {icon}
      </div>

      <div>
        <p className="text-base font-medium text-white">{title}</p>
        <p className="mt-2 text-sm leading-6 text-white/60">{text}</p>
      </div>
    </div>
  );
}

function ProductSuiteSection() {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="max-w-md">
        <p className="text-xs uppercase tracking-[0.22em] text-white/40">
          Product suite
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Four ways to improve the parts that actually matter
        </h2>
        <p className="mt-4 text-base leading-7 text-white/62">
          Rizzlytics is not just one generic analyzer. It’s split into four focused
          tools so the advice matches the situation you’re in.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SuiteCard
          icon={<IconCamera className="h-5 w-5" />}
          title="Photos"
          subtitle="Single-photo analysis"
          description="Read one photo for first-impression signal: lighting, expression, framing, outfit, vibe, and what might be limiting conversion."
          href="/photos"
        />
        <SuiteCard
          icon={<IconStack2 className="h-5 w-5" />}
          title="Profiles"
          subtitle="Set-of-photos analysis"
          description="Analyze your profile as a whole: consistency, story, variety, ordering, and which photo should be replaced first."
          href="/profiles"
        />
        <SuiteCard
          icon={<IconMessageCircle2 className="h-5 w-5" />}
          title="Conversations"
          subtitle="End-of-convo review"
          description="Upload a full thread to diagnose momentum, missed opportunities, weak turns, and what your next move should have been."
          href="/conversations"
        />
        <SuiteCard
          icon={<IconWand className="h-5 w-5" />}
          title="Quick Replies"
          subtitle="Mid-convo texting help"
          description="Get sharper reply suggestions while the conversation is still happening, with better tone, intent, and calibration."
          href="/quick-replies"
        />
      </div>
    </div>
  );
}

function SuiteCard({
  icon,
  title,
  subtitle,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.045]"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/80">
        {icon}
      </div>

      <div className="mt-5">
        <p className="text-lg font-medium text-white">{title}</p>
        <p className="mt-1 text-sm text-fuchsia-300/90">{subtitle}</p>
      </div>

      <p className="mt-4 text-sm leading-6 text-white/60">{description}</p>

      <div className="mt-5 inline-flex items-center text-sm text-white/75 transition group-hover:text-white">
        Open
        <IconArrowRight className="ml-2 h-4 w-4" />
      </div>
    </Link>
  );
}

function HowItWorksSection() {
  return (
    <div
      id="how-it-works"
      className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 lg:grid-cols-[0.9fr_1.1fr]"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-white/40">
          How it works
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          One focused loop. Better signal over time.
        </h2>
        <p className="mt-4 text-base leading-7 text-white/62">
          The product is designed around compounding improvements — not random
          overhauls. Fix one high-impact issue, then re-run.
        </p>
      </div>

      <div className="grid gap-4">
        <StepCard
          number="01"
          title="Upload the right input"
          text="A single photo, a full profile set, a finished conversation, or your current texting context."
        />
        <StepCard
          number="02"
          title="Get diagnosis + signals"
          text="See what’s working, what’s hurting, and which things are positive, negative, or mixed."
        />
        <StepCard
          number="03"
          title="Implement one next step"
          text="Replace one weak photo, tighten one opener, or send one cleaner reply instead of changing everything."
        />
        <StepCard
          number="04"
          title="Iterate with less guesswork"
          text="Re-run analysis after the change so your improvements are grounded in cleaner feedback."
        />
      </div>
    </div>
  );
}

function StepCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-4 md:p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-xs font-semibold text-white/75">
          {number}
        </div>
        <div>
          <p className="text-base font-medium text-white">{title}</p>
          <p className="mt-2 text-sm leading-6 text-white/60">{text}</p>
        </div>
      </div>
    </div>
  );
}

function DetailedValueSection() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-7">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/80">
          <IconPhoto className="h-5 w-5" />
        </div>

        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white">
          Closer to how the app actually thinks
        </h3>

        <p className="mt-4 text-sm leading-7 text-white/62">
          The analysis is not just “good” or “bad.” It breaks things down into
          diagnosis, attraction signals, low-signal elements, and concrete next
          steps. That makes the output feel more useful — and more believable.
        </p>

        <div className="mt-6 grid gap-3">
          <BulletLine>Overall diagnosis with the dominant read</BulletLine>
          <BulletLine>Positive, negative, and mixed signals</BulletLine>
          <BulletLine>High-impact next steps in priority order</BulletLine>
          <BulletLine>Reply help that sounds natural, not cheesy</BulletLine>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-7">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/80">
          <IconShieldLock className="h-5 w-5" />
        </div>

        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white">
          Private tool, not social media
        </h3>

        <p className="mt-4 text-sm leading-7 text-white/62">
          This kind of product should feel private and practical. You’re not posting
          for attention — you’re using a tool to get better outcomes. That framing
          matters a lot for trust.
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/15 p-4">
          <p className="text-sm font-medium text-white">What that means in practice</p>

          <div className="mt-4 grid gap-3">
            <MiniCheck>Focused workflows instead of one messy all-in-one prompt</MiniCheck>
            <MiniCheck>Clear control over what you upload and keep</MiniCheck>
            <MiniCheck>Advice that helps you iterate, not obsess</MiniCheck>
          </div>
        </div>
      </div>
    </div>
  );
}

function BulletLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/8 bg-black/10 px-4 py-3">
      <div className="mt-1 h-2 w-2 rounded-full bg-fuchsia-400" />
      <p className="text-sm leading-6 text-white/68">{children}</p>
    </div>
  );
}

function MiniCheck({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm text-white/70">
      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
        <IconCheck className="h-3.5 w-3.5 text-white/80" />
      </div>
      <span>{children}</span>
    </div>
  );
}

function FinalCta() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 md:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,59,186,0.18),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(174,110,255,0.14),transparent_28%)]" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Ready to start?
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Start with one photo, then improve from there.
          </h2>
          <p className="mt-4 text-base leading-7 text-white/62">
            The easiest entry point is Photos. From there, you can build a stronger
            profile set, review finished convos, or get help mid-conversation.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/photos"
            className="inline-flex items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-medium text-white primary-gradient transition hover:opacity-95"
          >
            Start with Photos
            <IconArrowRight className="ml-2 h-4 w-4" />
          </Link>

          <Link
            href="/quick-replies"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.08] hover:text-white"
          >
            Open Quick Replies
          </Link>
        </div>
      </div>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="mx-auto max-w-7xl px-6 pb-10">
      <div className="flex flex-col gap-5 border-t border-white/10 pt-6 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Rizzlytics. Built for iteration.</p>

        <div className="flex flex-wrap items-center gap-5">
          <Link href="/photos" className="transition hover:text-white/75">
            Photos
          </Link>
          <Link href="/profiles" className="transition hover:text-white/75">
            Profiles
          </Link>
          <Link href="/conversations" className="transition hover:text-white/75">
            Conversations
          </Link>
          <Link href="/quick-replies" className="transition hover:text-white/75">
            Quick Replies
          </Link>
        </div>
      </div>
    </footer>
  );
}