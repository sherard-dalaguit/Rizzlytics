import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalize(input: string): string {
  if (!input) return input;

  return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}

export function toPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function splitIntoSentences(text: string): string[] {
  if (!text) return [];

  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map(s => s.trim())
    .filter(Boolean);
}

export function pickHeadlineAndBullets(summary: string) {
  const sentences = splitIntoSentences(summary);
  const headline = sentences[0] ?? summary ?? "";
  const bullets = sentences.slice(1, 5); // keep it tight
  return { headline, bullets };
}

export function outcomeVariant(outcome: string) {
  const o = (outcome || "").toLowerCase();
  if (o.includes("strong") || o.includes("good") || o.includes("high")) return "default";
  if (o.includes("mixed") || o.includes("medium")) return "secondary";
  if (o.includes("weak") || o.includes("low") || o.includes("bad")) return "destructive";
  return "outline";
}