"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { IconBrandGoogleFilled, IconBrandGithub } from "@tabler/icons-react";

export default function LogIn() {
  const handleSignIn = async (provider: "github" | "google") => {
    await signIn(provider, { redirectTo: "/dashboard" });
  };

  return (
    <div className="mt-10">
      {/* container card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        {/* ambient gradient glow */}
        <div className="pointer-events-none absolute inset-0 primary-gradient opacity-[0.10]" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full primary-gradient blur-3xl opacity-[0.18]" />

        <div className="relative flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button
            type="button"
            onClick={() => handleSignIn("github")}
            className="
              group relative flex h-12 flex-1 items-center justify-center gap-2 rounded-xl
              border border-white/10 bg-white/5 text-white
              hover:bg-white/10 active:scale-[0.99]
              transition
            "
          >
            {/* hover gradient sheen */}
            <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="absolute inset-0 rounded-xl primary-gradient opacity-[0.35]" />
              <span className="absolute inset-0 rounded-xl mask-[linear-gradient(to_bottom,black,transparent)] primary-gradient opacity-[0.35]" />
            </span>

            <IconBrandGithub className="relative h-5 w-5 opacity-90" />
            <span className="relative text-sm font-medium tracking-tight">
              Continue with GitHub
            </span>
          </Button>

          <Button
            type="button"
            onClick={() => handleSignIn("google")}
            className="
              group relative flex h-12 flex-1 items-center justify-center gap-2 rounded-xl
              border border-white/10 bg-white/5 text-white
              hover:bg-white/10 active:scale-[0.99]
              transition
            "
          >
            <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="absolute inset-0 rounded-xl primary-gradient opacity-[0.35]" />
              <span className="absolute inset-0 rounded-xl mask-[linear-gradient(to_bottom,black,transparent)] primary-gradient opacity-[0.35]" />
            </span>

            <IconBrandGoogleFilled className="relative h-5 w-5 opacity-90" />
            <span className="relative text-sm font-medium tracking-tight">
              Continue with Google
            </span>
          </Button>
        </div>

        <p className="relative mt-3 text-xs text-white/60">
          By continuing, you agree to our{" "}
          <span className="text-white/75">Terms</span> and{" "}
          <span className="text-white/75">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}