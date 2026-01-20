'use client';

import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {FileUpload} from "@/components/ui/file-upload";
import Image from "next/image";
import {useRef, useState} from "react";
import type {PutBlobResult} from "@vercel/blob";
import {IMediaAssetDoc} from "@/database/media-asset.model";
import {cn} from "@/lib/utils";
import {ITranscriptMessage} from "@/database/conversation-snapshot.model";
import analyzeThreadScreenshot from "@/lib/server/analysis/analyzeThreadScreenshot";
import analyzeOtherScreenshot from "@/lib/server/analysis/analyzeOtherScreenshot";
import {useRouter} from "next/navigation";

type UploadResponse = {
  blob: PutBlobResult;
  mediaAsset: IMediaAssetDoc;
}

const AnalysisForm = ({ type }: { type: string }) => {
  const router = useRouter();

  const [step, setStep] = useState(0);

  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const [threadFiles, setThreadFiles] = useState<File[]>([]);
  const [otherFiles, setOtherFiles] = useState<File[]>([]);
  const [contextInput, setContextInput] = useState<string>("");

  const [threadBlobs, setThreadBlobs] = useState<PutBlobResult[]>([]);
  const [otherBlobs, setOtherBlobs] = useState<PutBlobResult[]>([]);

  const isConversation = type === "conversation";

  const handleFileUpload = (files: File[]) => {
    setFiles(files);

    if (inputFileRef.current) {
      const dt = new DataTransfer();
      files.forEach((file) => dt.items.add(file));
      inputFileRef.current.files = dt.files;
    }

    console.log(files);
  };

  const getSelectedFiles = (): File[] => {
    const fromInput = inputFileRef.current?.files
      ? Array.from(inputFileRef.current.files)
      : [];
    return fromInput.length ? fromInput : files;
  }

  const uploadOne = async(file: File, category: string) => {
    const response = await fetch(
      `/api/assets?filename=${file.name}&category=${category}`,
      { method: 'POST', body: file }
    );

    if (!response.ok) throw new Error(`Failed to upload file: ${file.name}`);

    return (await response.json()) as UploadResponse;
  }

  const handleSubmitPhoto = async () => {
    const selected = getSelectedFiles();
    if (!selected.length) throw new Error("No file selected");

    const { blob, mediaAsset } = await uploadOne(selected[0], "self_photo");
    setBlob(blob);

    const analyzeResponse = await fetch(`/api/ai-analysis/photo/${mediaAsset._id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'photo',
        photoUrl: blob.url,
      }),
    });

    if (!analyzeResponse) {
      throw new Error('Failed to analyze photo');
    }

    const { analysis } = await analyzeResponse.json()

    router.push(`/ai-review/${analysis._id}`);
  }

  const handleSubmitThreadScreenshots = async() => {
    if (!threadFiles.length) throw new Error("No files selected");

    const uploads = await Promise.all(
      threadFiles.map((file) => uploadOne(file, "chat_screenshot"))
    );

    const blobs = uploads.map(u => u.blob);
    setThreadBlobs(blobs);
  }

  const handleSubmitOtherProfileScreenshots = async() => {
    if (!otherFiles.length) return;

    const uploads = await Promise.all(
      otherFiles.map((file) => uploadOne(file, "other_profile_photo"))
    );

    const blobs = uploads.map(u => u.blob);
    setOtherBlobs(blobs);
  }

  const handleSubmitConversationSnapshot = async() => {
    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        threadScreenshots: threadBlobs,
        otherProfileScreenshots: otherBlobs,
        context: contextInput,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create conversation snapshot: ${response.status} ${response.statusText}`);
    }
    const { conversationSnapshot } = await response.json();

    if (!conversationSnapshot) {
      throw new Error('Failed to create conversation snapshot');
    }

    const extracted: { speaker: ITranscriptMessage["speaker"]; text: string }[] = []

    for (const threadBlob of threadBlobs) {
      const messages = await analyzeThreadScreenshot(threadBlob);

      if (!messages?.length) {
        throw new Error(`Failed to analyze thread screenshot: ${threadBlob.pathname}`);
      }

      extracted.push(...messages.map(m => ({ speaker: m.speaker, text: m.text })));
    }

    if (!extracted.length) {
      throw new Error('Failed to extract transcript messages from screenshots');
    }

    const transcript: ITranscriptMessage[] = extracted.map((m, idx) => ({
      order: idx + 1,
      speaker: m.speaker,
      text: m.text,
    }))

    console.log(transcript);

    // once all messages are collected, edit conversationSnapshot transcript in MongoDB
    const res = await fetch(`/api/conversations/${conversationSnapshot._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    });

    if (!res.ok) {
      const errorPayload = await res.json().catch(() => null);
      throw new Error(
        errorPayload?.error ??
        `Failed to update conversation snapshot with transcript (status ${res.status})`
      );
    }

    let otherAnalyses: string = '';

    if (otherBlobs?.length) {
      for (const otherBlob of otherBlobs) {
        const otherAnalysis = await analyzeOtherScreenshot(otherBlob);

        if (!otherAnalysis) {
          throw new Error(`Failed to analyze other profile screenshot: ${otherBlob.pathname}`);
        }

        otherAnalyses += " " + otherAnalysis.trim();
      }

      const finalRes = await fetch(`/api/conversations/${conversationSnapshot._id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({otherProfileAnalyses: otherAnalyses}),
      })

      if (!finalRes.ok) {
        const errorPayload = await finalRes.json().catch(() => null);
        throw new Error(
          errorPayload?.error ??
          `Failed to update conversation snapshot with other profile analyses (status ${finalRes.status})`
        );
      }
    }

    const analyzeResponse = await fetch(`/api/ai-analysis/conversation/${conversationSnapshot._id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'conversation',
        transcript,
        contextInput,
        otherProfileContext: otherAnalyses,
      }),
    })

    if (!analyzeResponse) {
      throw new Error('Failed to analyze conversation snapshot');
    }

    const { analysis: conversationAnalysis } = await analyzeResponse.json()

    router.push(`/ai-review/${conversationAnalysis._id}`);
  }

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button className="primary-gradient text-white">
            {isConversation ? 'Analyze Conversations' : 'Analyze Photos'}
          </Button>
        </DialogTrigger>

        <DialogContent className={cn(
          "w-[90vw] h-[90vh] p-8 max-w-none max-h-none",
          type === 'photo' ? 'lg:w-[60vw] lg:h-[60vh]' : 'lg:w-[80vw] lg:h-[80vh]'
        )}>

          <DialogHeader>
            <DialogTitle>
              {!isConversation ? 'Upload Your Photo' : 'Upload Your Message Thread Screenshots'}
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[50vh] lg:max-h-[65vh]">
            {!isConversation && (
              <div className="flex flex-col items-center gap-4">
                <FileUpload onChange={handleFileUpload} type="photo" />
                <input ref={inputFileRef} type="file" className="hidden" />
                <Button
                  className="primary-gradient text-white px-12 py-6"
                  type="button"
                  onClick={handleSubmitPhoto}
                >
                  Upload
                </Button>

                {blob && (
                  <Image
                    key={blob.pathname}
                    src={blob.url}
                    alt="uploaded photo"
                    width={200}
                    height={200}
                    className="rounded-xl"
                  />
                )}
              </div>
            )}

            {isConversation && (
              <>
                {/* Step indicator (optional) */}
                <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <span className={step === 0 ? "font-semibold text-foreground" : ""}>1) Thread</span>
                  <span>•</span>
                  <span className={step === 1 ? "font-semibold text-foreground" : ""}>2) Other (optional)</span>
                  <span>•</span>
                  <span className={step === 2 ? "font-semibold text-foreground" : ""}>3) Context (optional)</span>
                </div>

                {/* STEP 0: message thread screenshots */}
                {step === 0 && (
                  <div className="flex flex-col items-center gap-4">
                    <FileUpload onChange={(f) => setThreadFiles(f)} type="conversation" />

                    <Button
                      type="button"
                      className="primary-gradient text-white px-12 py-6"
                      onClick={handleSubmitThreadScreenshots}
                    >
                      Upload Thread Screenshots
                    </Button>

                    {threadBlobs.length > 0 && (
                      <section className="mt-2 grid grid-cols-4 gap-4">
                        {threadBlobs.map((blob) => (
                          <Image
                            key={blob.pathname}
                            src={blob.url}
                            alt="uploaded thread screenshot"
                            width={150}
                            height={150}
                            className="rounded-xl"
                          />
                        ))}
                      </section>
                    )}
                  </div>
                )}

                {/* STEP 1: optional other profile screenshots */}
                {step === 1 && (
                  <div className="flex flex-col items-center gap-4">
                    <FileUpload onChange={(f) => setOtherFiles(f)} type="conversation" />

                    <Button
                      type="button"
                      className="primary-gradient text-white px-12 py-6"
                      onClick={handleSubmitOtherProfileScreenshots}
                    >
                      Upload Other Profile Screenshots
                    </Button>

                    {otherBlobs.length > 0 && (
                      <section className="mt-2 grid grid-cols-4 gap-4">
                        {otherBlobs.map((blob) => (
                          <Image
                            key={blob.pathname}
                            src={blob.url}
                            alt="uploaded other profile screenshot"
                            width={150}
                            height={150}
                            className="rounded-xl"
                          />
                        ))}
                      </section>
                    )}
                  </div>
                )}

                {/* STEP 2: optional context input */}
                {step === 2 && (
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium">Context (optional)</label>
                    <textarea
                      value={contextInput}
                      onChange={(e) => setContextInput(e.target.value)}
                      placeholder="e.g. What's your goal (get a reply, set a date), what happened so far, anything the AI should know?"
                      className="min-h-40 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />

                    <Button
                      type="button"
                      className="primary-gradient text-white px-12 py-6 self-center"
                      disabled={threadBlobs.length === 0}
                      onClick={handleSubmitConversationSnapshot}
                    >
                      Run Analysis
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {isConversation && (
            <DialogFooter className="mt-auto w-full flex items-end justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="relative inline-flex h-12 w-32 overflow-hidden rounded-lg p-px focus:outline-none disabled:opacity-50"
              >
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] pointer-events-none z-0"/>
                <span className="relative z-10 inline-flex h-full w-full items-center justify-center rounded-lg bg-slate-950 px-7 py-1 text-md font-medium text-white gap-2">
							Back
						</span>
              </button>

              <button
                onClick={() => setStep((s) => Math.min(2, s + 1))}
                disabled={step === 2}
                className="relative inline-flex h-12 w-32 overflow-hidden rounded-lg p-px focus:outline-none disabled:opacity-50"
              >
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] pointer-events-none z-0"/>
                <span className="relative z-10 inline-flex h-full w-full items-center justify-center rounded-lg bg-slate-950 px-7 py-1 text-md font-medium text-white gap-2">
							Next
						</span>
              </button>
            </DialogFooter>
          )}

        </DialogContent>
      </form>
    </Dialog>
  )
}

export default AnalysisForm;