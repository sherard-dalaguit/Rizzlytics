// /app/log-in/page.tsx
import LogIn from "@/components/log-in";

export default function LogInPage() {
  return (
    <main className="relative min-h-screen px-4">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* glow is now behind the hero/card area (not floating at the top) */}
        <div className="absolute left-1/2 top-[28%] h-136 w-176 -translate-x-1/2 -translate-y-1/2 rounded-full primary-gradient opacity-[0.10] blur-3xl" />
        <div className="absolute left-1/2 top-[34%] h-104 w-xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 opacity-[0.05] blur-3xl" />

        {/* subtle grid, dialed down */}
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.22)_1px,transparent_1px)] bg-size-[72px_72px]" />

        {/* vignette to keep edges dark and make glow feel ambient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.55)_55%,rgba(0,0,0,0.85)_100%)]" />
      </div>

      {/* Content */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center py-24">
        {/* Hero */}
        <div className="text-center">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full primary-gradient" />
            Rizzlytics • AI dating feedback
          </p>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Log in to your dashboard
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/60">
            Upload screenshots, get high-signal feedback, and walk away with a clear
            action plan.
          </p>
        </div>

        {/* Space between hero and card */}
        <div className="mt-12 w-full max-w-lg">
          <LogIn />
        </div>

        {/* Optional: less cramped “value props” (only 2, wider, more breathable) */}
        <div className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/60 backdrop-blur">
            <div className="text-white/85 font-medium">Photo + profile feedback</div>
            <div className="mt-1">What to fix, what to keep, what to upgrade.</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/60 backdrop-blur">
            <div className="text-white/85 font-medium">Conversation breakdown</div>
            <div className="mt-1">Stronger replies, better pacing, cleaner escalation.</div>
          </div>
        </div>

        <p className="mt-12 text-center text-xs text-white/40">
          Secure OAuth sign-in — no passwords stored.
        </p>
      </div>
    </main>
  );
}
