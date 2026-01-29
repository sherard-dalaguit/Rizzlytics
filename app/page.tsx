import Link from "next/link";
import {
  IconPhoto,
  IconLayersSubtract,
  IconMessageCircle2,
  IconArrowRight,
  IconCheck,
  IconShieldLock,
  IconBolt,
  IconRefresh,
} from "@tabler/icons-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0d] text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 blur-[140px] opacity-90 mask-[radial-gradient(circle_at_50%_50%,transparent_0%,transparent_38%,black_62%,black_100%)]"
          style={{backgroundImage: `radial-gradient(75% 55% at 10% 18%, rgba(255,70,197,0.40) 0%, transparent 20%), radial-gradient(78% 58% at 90% 16%, rgba(209,179,255,0.40) 0%, transparent 20%), radial-gradient(85% 60% at 50% 92%, rgba(255,70,197,0.35) 0%, transparent 40%)`}}
        />

        <div
          className="absolute inset-0 blur-[140px] opacity-15 mask-[radial-gradient(circle_at_50%_50%,transparent_0%,transparent_38%,black_62%,black_100%)]"
          style={{backgroundImage: `linear-gradient(135deg, rgba(255,70,197,0.22) 0%, rgba(209,179,255,0.18) 0%, rgba(255,70,197,0.16) 0%)`}}
        />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 z-10 py-12">
        {/* Top nav (simple) */}
        <header className="flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold">
            <span className="primary-text-gradient">Rizzlytics</span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/ai-review"
              className="text-sm text-white/70 hover:text-white transition"
            >
              AI Review
            </Link>
            <Link
              href="/log-in"
              className="text-sm rounded-xl border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 transition"
            >
              Log in
            </Link>
          </nav>
        </header>

        {/* Hero */}
        <section className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              <IconBolt className="h-4 w-4" />
              AI-powered dating feedback for photos + messages
            </div>

            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
              Turn your{" "}
              <span className="primary-text-gradient">photos</span> and{" "}
              <span className="primary-text-gradient">texts</span> into matches.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed">
              Rizzlytics analyzes your dating profile photos and conversation threads
              and gives you a clear diagnosis + exact next steps—so you stop guessing
              and start improving what actually moves the needle.
            </p>

            {/* Primary CTA (one) */}
            <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-3">
              <Link
                href="/ai-review"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 primary-gradient text-white font-medium border-0 hover:opacity-95 transition"
              >
                Open AI Review
                <IconArrowRight className="h-5 w-5 ml-2" />
              </Link>

              <Link
                href="/photos"
                className="text-sm text-white/70 hover:text-white transition w-fit"
              >
                Or start with Photos →
              </Link>
            </div>

            {/* Proof / value bullets (quiet) */}
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
              <QuietBullet icon={<IconCheck className="h-4 w-4" />}>
                No fluff, actionable feedback
              </QuietBullet>
              <QuietBullet icon={<IconLayersSubtract className="h-4 w-4" />}>
                Photo-by-photo + set-level profile analysis
              </QuietBullet>
              <QuietBullet icon={<IconMessageCircle2 className="h-4 w-4" />}>
                Conversation rewrites + exact next reply
              </QuietBullet>
              <QuietBullet icon={<IconRefresh className="h-4 w-4" />}>
                Built for iteration (improve → re-run)
              </QuietBullet>
            </div>
          </div>

          {/* Right side: calm preview panel */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
              <div className="p-5 border-b border-white/10">
                <p className="text-sm font-semibold">What you get</p>
                <p className="text-xs text-white/60 mt-1">
                  A one-screen diagnosis + a short plan you can actually execute today.
                </p>
              </div>

              <div className="p-5 space-y-3">
                <MiniCard
                  title="Overall diagnosis"
                  subtitle="What’s working, what’s hurting, and what to change first."
                />
                <MiniCard
                  title="Attraction signals"
                  subtitle="Positive / negative / uncertain signals (with why)."
                />
                <MiniCard
                  title="Next steps"
                  subtitle="A prioritized list so you stop random changes."
                />
                <MiniCard
                  title="Suggested replies"
                  subtitle="Clean next messages (tone + intent) when you upload a thread."
                />
              </div>

              <div className="p-5 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <IconShieldLock className="h-4 w-4" />
                  You control what you upload. Delete anytime.
                </div>
                <Link
                  href="/ai-review"
                  className="text-xs text-white/70 hover:text-white transition"
                >
                  Explore →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Tools row */}
        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Three tools. One workflow.</p>
              <p className="text-xs text-white/60 mt-1">
                Start with a photo, build a profile set, then optimize messaging.
              </p>
            </div>
            <Link
              href="/ai-review"
              className="hidden sm:inline-flex text-sm text-white/70 hover:text-white transition"
            >
              Open tools →
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <ToolCard
              title="Photos"
              description="Analyze one photo: lighting, framing, expression, outfit, and vibe."
              icon={<IconPhoto className="h-5 w-5" />}
              href="/photos"
              cta="Go to Photos"
            />
            <ToolCard
              title="Profiles"
              description="Analyze a set together: variety, consistency, story, and what to replace."
              icon={<IconLayersSubtract className="h-5 w-5" />}
              href="/profiles"
              cta="Go to Profiles"
            />
            <ToolCard
              title="Conversations"
              description="Diagnose momentum + dynamics, then get specific next replies and moves."
              icon={<IconMessageCircle2 className="h-5 w-5" />}
              href="/conversations"
              cta="Go to Conversations"
            />
          </div>
        </section>

        {/* How it works + Principles */}
        <section className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold">How it works</p>
            <p className="text-xs text-white/60 mt-1">
              Keep it simple. One clean improvement per day compounds fast.
            </p>

            <div className="mt-5 space-y-3">
              <StepRow
                number="1"
                title="Upload"
                text="Add a photo, a profile set, or a conversation thread screenshot."
              />
              <StepRow
                number="2"
                title="Get a diagnosis"
                text="See what’s working, what’s hurting, and what to change first."
              />
              <StepRow
                number="3"
                title="Implement + re-run"
                text="Swap one photo or rewrite one message. Re-run to confirm signals are clean."
              />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold">Built for compounding</p>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li className="flex gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  Replace low-signal photos (dark / blurry / awkward crop).
                </li>
                <li className="flex gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  Fix momentum leaks in your openers and follow-ups.
                </li>
                <li className="flex gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  Keep a “best set” profile that tells a clear story.
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold">Your data stays yours</p>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                You control what you upload. If you don’t want something stored, don’t upload it.
                And if you do upload it, you can delete your items anytime from the app.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Ready to run your first review?</p>
                <p className="text-xs text-white/60 mt-1">
                  Start with Photos if you’re unsure what to upload.
                </p>
              </div>
              <Link
                href="/ai-review"
                className="inline-flex items-center justify-center rounded-2xl px-4 py-2 primary-gradient text-white font-medium hover:opacity-95 transition shrink-0"
              >
                Open
                <IconArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Rizzlytics. Built for iteration.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/ai-review" className="text-white/60 hover:text-white transition">
              AI Review
            </Link>
            <Link href="/photos" className="text-white/60 hover:text-white transition">
              Photos
            </Link>
            <Link href="/profiles" className="text-white/60 hover:text-white transition">
              Profiles
            </Link>
            <Link href="/conversations" className="text-white/60 hover:text-white transition">
              Conversations
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

/* ------------------------------ UI bits ------------------------------ */

function QuietBullet({
                       icon,
                       children,
                     }: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
      <span className="text-white/60">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

function MiniCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-white/60 mt-1 leading-relaxed">{subtitle}</p>
    </div>
  );
}

function ToolCard({
                    title,
                    description,
                    icon,
                    href,
                    cta,
                  }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="flex items-start justify-between gap-3">
        <div className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white/80">
          {icon}
        </div>
        <span className="text-[11px] text-white/45">Tool</span>
      </div>

      <p className="mt-4 text-base font-semibold">{title}</p>
      <p className="mt-2 text-sm text-white/70 leading-relaxed">{description}</p>

      <div className="mt-5">
        <Link
          href={href}
          className="inline-flex items-center text-sm text-white/70 hover:text-white transition"
        >
          {cta}
          <IconArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </div>
    </div>
  );
}

function StepRow({
                   number,
                   title,
                   text,
                 }: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="h-8 w-8 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-xs font-semibold text-white/80">
        {number}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm text-white/70 mt-1 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
