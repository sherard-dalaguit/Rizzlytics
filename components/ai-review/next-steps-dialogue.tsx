"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CopyButton from "@/components/ai-review/CopyButton";

function extractBestCopy(step: string) {
  // If it contains a quoted message, copy that — otherwise copy the whole step
  const match = step.match(/“([^”]+)”|"([^"]+)"/);
  return match?.[1] ?? match?.[2] ?? step;
}

export default function NextStepsDialog({
  nextSteps,
}: {
  nextSteps: string[];
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full">
          See all next steps
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3">
            <span>All next steps</span>
            <Badge variant="outline">{nextSteps.length}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
          {nextSteps.map((step, idx) => (
            <div
              key={idx}
              className="rounded-lg border bg-muted/20 p-4 space-y-3"
            >
              <p className="text-sm leading-relaxed">{step}</p>

              <div className="flex gap-2">
                <CopyButton value={extractBestCopy(step)} size="sm" variant="outline">
                  Copy message
                </CopyButton>

                <CopyButton value={step} size="sm" variant="ghost">
                  Copy full step
                </CopyButton>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
