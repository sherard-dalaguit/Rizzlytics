'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { useRef, useState } from "react";
import type { PutBlobResult } from "@vercel/blob";
import { IMediaAssetDoc } from "@/database/media-asset.model";
import { cn } from "@/lib/utils";
import { ITranscriptMessage } from "@/database/conversation-snapshot.model";
import analyzeThreadScreenshot from "@/lib/server/analysis/analyzeThreadScreenshot";
import { mergeTranscript } from "@/lib/deduplicateTranscript";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ReorderableFileGrid from "@/components/ReorderableFileGrid";

type UploadResponse = {
  blob: PutBlobResult;
  mediaAsset: IMediaAssetDoc;
};

const ReplyCoachForm = () => {
  const router = useRouter();
  const session = useSession();
  const user = session.data?.user;
  if (!user) router.push('/log-in');

  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyTitle, setBusyTitle] = useState("");
  const [busyDetail, setBusyDetail] = useState("");

  const [threadFiles, setThreadFiles] = useState<File[]>([]);
  const [threadBlobs, setThreadBlobs] = useState<PutBlobResult[]>([]);
  const [contextInput, setContextInput] = useState("");

  const maxStep = 1;
  const goNext = () => setStep((s) => Math.min(maxStep, s + 1));
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const startBusy = (title: string, detail?: string) => {
    setBusyTitle(title);
    setBusyDetail(detail ?? "");
    setBusy(true);
  };

  const stopBusy = () => {
    setBusy(false);
    setBusyTitle("");
    setBusyDetail("");
  };

  const uploadOne = async (file: File, category: string): Promise<UploadResponse> => {
    const userId = user!.id;
    if (!userId) throw new Error("User not authenticated");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('userId', userId);

    const response = await fetch('/api/assets', { method: 'POST', body: formData });
    if (!response.ok) throw new Error(`Failed to upload file: ${file.name}`);
    return (await response.json()) as UploadResponse;
  };

  const handleUploadThreadScreenshots = async () => {
    if (!threadFiles.length) throw new Error("No files selected");
    const uploads = await Promise.all(
      threadFiles.map((file) => uploadOne(file, "chat_screenshot"))
    );
    const blobs = uploads.map((u) => u.blob);
    setThreadBlobs(blobs);
    return blobs;
  };

  const handleRun = async () => {
    try {
      startBusy("Getting reply options", "Uploading screenshots…");

      let blobs = threadBlobs;
      if (!blobs.length) {
        blobs = await handleUploadThreadScreenshots();
      }

      setBusyDetail("Creating conversation snapshot…");

      const snapResponse = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user!.id,
          threadScreenshots: blobs,
          otherProfileScreenshots: [],
          context: contextInput,
        }),
      });
      if (!snapResponse.ok) throw new Error('Failed to create conversation snapshot');
      const { conversationSnapshot } = await snapResponse.json();

      setBusyDetail("Extracting messages from screenshots…");

      let extracted: { speaker: ITranscriptMessage["speaker"]; text: string }[] = [];
      for (const blob of blobs) {
        const messages = await analyzeThreadScreenshot(blob);
        if (!messages?.length) throw new Error(`Failed to extract messages from screenshot`);
        extracted = mergeTranscript(extracted, messages.map((m) => ({ speaker: m.speaker, text: m.text })));
      }
      if (!extracted.length) throw new Error('No messages extracted from screenshots');

      const transcript: ITranscriptMessage[] = extracted.map((m, idx) => ({
        order: idx + 1,
        speaker: m.speaker,
        text: m.text,
      }));

      const transcriptRes = await fetch(`/api/conversations/${conversationSnapshot._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      if (!transcriptRes.ok) throw new Error('Failed to save transcript');

      setBusyDetail("Generating reply options…");

      const analyzeRes = await fetch(`/api/ai-analysis/reply-coach/${conversationSnapshot._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user!.id,
          transcript,
          contextInput,
        }),
      });
      if (!analyzeRes.ok) throw new Error('Failed to generate reply options');
      const { analysis } = await analyzeRes.json();

      await fetch(`/api/conversations/${conversationSnapshot._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: analysis._id }),
      });

      router.push(`/ai-review/${analysis._id}`);
    } catch (err) {
      console.error(err);
    } finally {
      stopBusy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => {
      if (busy) return;
      setOpen(next);
    }}>
      <DialogTrigger asChild>
        <Button
          className="primary-gradient text-white"
          onClick={() => {
            setStep(0);
            setThreadFiles([]);
            setThreadBlobs([]);
            setContextInput("");
            setOpen(true);
          }}
        >
          Get reply options
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[94vw] h-[86vh] lg:w-[80vw] lg:h-[80vh] max-w-none max-h-none p-0 overflow-hidden flex flex-col min-h-0">
        {/* Header */}
        <div className="relative border-b border-white/10 bg-white/3 px-6 py-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_240px_at_20%_0%,rgba(255,70,197,0.12),transparent_60%),radial-gradient(700px_240px_at_80%_0%,rgba(209,179,255,0.10),transparent_60%)]" />
          <div className="relative">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl font-semibold text-white">
                Reply Coach
              </DialogTitle>
              <p className="text-sm text-zinc-400">
                Screenshot your active conversation. Get 4–6 reply options in seconds.
              </p>
            </DialogHeader>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          {/* Left rail */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-white/10 bg-white/2 p-6">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Steps</p>
              <div className="mt-3 space-y-2">
                {[
                  { idx: 0, label: "Screenshots" },
                  { idx: 1, label: "Context (optional)" },
                ].map((s) => (
                  <div
                    key={s.idx}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-3 py-3",
                      step === s.idx ? "border-white/15 bg-white/5" : "border-white/10 bg-white/2"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                          step === s.idx ? "bg-white/10 text-white" : "bg-white/6 text-zinc-300"
                        )}
                      >
                        {s.idx + 1}
                      </span>
                      <span className="text-sm text-zinc-200">{s.label}</span>
                    </div>
                    <span className="text-xs text-zinc-500">
                      {step > s.idx ? "Done" : step === s.idx ? "Now" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
              <p className="text-sm font-semibold text-white">Tips</p>
              <ul className="mt-2 space-y-2 text-sm text-zinc-400">
                <li>• Upload screenshots in order (top → bottom).</li>
                <li>• Include both sides of the conversation.</li>
                <li>• Add context if you want a specific outcome (e.g. &ldquo;set a date&rdquo;).</li>
              </ul>
            </div>
          </div>

          {/* Main panel */}
          <div className="lg:col-span-8 p-6">
            <div className="h-full rounded-2xl border border-white/10 bg-white/3 p-5 flex flex-col min-h-0 relative">
              {busy && (
                <div className="absolute inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                  <div className="relative w-[92%] max-w-lg rounded-2xl border border-white/10 bg-white/6 p-6 shadow-2xl">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-lg font-semibold text-white">{busyTitle || "Working…"}</p>
                        <p className="mt-1 text-sm text-zinc-300">{busyDetail || "Please don't close this window."}</p>
                        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
                          <div className="h-full w-1/3 animate-[loading_1.1s_ease-in-out_infinite] rounded-full primary-gradient" />
                        </div>
                        <p className="mt-3 text-xs text-zinc-500">Usually done in ~30–60 seconds.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto pr-1">
                {/* Step 0: Upload screenshots */}
                {step === 0 && (
                  <div className="rounded-2xl border border-white/10 bg-white/2 p-5">
                    <p className="text-sm font-semibold text-white">Thread screenshots</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Upload your conversation screenshots in order.
                    </p>

                    <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 hover:bg-black/25 transition-colors">
                      <FileUpload onChange={(f) => { setThreadFiles(f); setThreadBlobs([]); }} type="conversation" />
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <Button
                        type="button"
                        className="primary-gradient text-white px-6"
                        onClick={handleUploadThreadScreenshots}
                        disabled={threadFiles.length === 0}
                      >
                        Upload Screenshots
                      </Button>
                      <span className="text-sm text-zinc-500">
                        {threadBlobs.length > 0 ? `${threadBlobs.length} uploaded ✓` : "None uploaded"}
                      </span>
                    </div>

                    {threadFiles.length > 0 && (
                      <div className="mt-5">
                        <p className="text-xs tracking-wide text-zinc-500 mb-2">
                          Reorder before upload | Images won&apos;t load until re-ordered
                        </p>
                        <ReorderableFileGrid files={threadFiles} setFiles={setThreadFiles} />
                      </div>
                    )}
                  </div>
                )}

                {/* Step 1: Context */}
                {step === 1 && (
                  <div className="rounded-2xl border border-white/10 bg-white/2 p-5">
                    <p className="text-sm font-semibold text-white">Context (optional)</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      What are you trying to do? Give the coach a goal.
                    </p>

                    <textarea
                      value={contextInput}
                      onChange={(e) => setContextInput(e.target.value)}
                      placeholder="e.g. I want to set a date this week, her last reply was short…"
                      className="mt-4 min-h-36 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-white/15"
                    />

                    <div className="mt-4">
                      <Button
                        type="button"
                        className="primary-gradient text-white px-6"
                        disabled={threadBlobs.length === 0}
                        onClick={handleRun}
                      >
                        Get reply options
                      </Button>
                      {threadBlobs.length === 0 && (
                        <p className="mt-2 text-xs text-zinc-500">Go back and upload screenshots first.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer nav */}
              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 0}
                  className="rounded-xl border border-white/10 bg-white/3 px-5 py-2.5 text-sm text-white hover:bg-white/5 disabled:opacity-40"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={step === maxStep}
                  className="rounded-xl border border-white/10 bg-white/3 px-5 py-2.5 text-sm text-white hover:bg-white/5 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReplyCoachForm;
