"use client";

import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  value: string;
  children?: React.ReactNode;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  className?: string;
};

export default function CopyButton({
  value,
  children = "Copy",
  size = "sm",
  variant = "outline",
  className,
}: Props) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 900);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = value;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);

      setCopied(true);
      window.setTimeout(() => setCopied(false), 900);
    }
  };

  return (
    <Button onClick={onCopy} size={size} variant={variant} className={className}>
      {copied ? "Copied" : children}
    </Button>
  );
}
