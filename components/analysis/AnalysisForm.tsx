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
import {useSession} from "next-auth/react";

type UploadResponse = {
  blob: PutBlobResult;
  mediaAsset: IMediaAssetDoc;
}

const AnalysisForm = ({ type }: { type: string }) => {
  const router = useRouter();

  const session = useSession();
  const user = session.data?.user;
  if (!user) {
    router.push('/log-in')
  }

  const [step, setStep] = useState(0);

  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const [threadFiles, setThreadFiles] = useState<File[]>([]);
  const [otherFiles, setOtherFiles] = useState<File[]>([]);
  const [contextInput, setContextInput] = useState<string>("");

  const [threadBlobs, setThreadBlobs] = useState<PutBlobResult[]>([]);
  const [otherBlobs, setOtherBlobs] = useState<PutBlobResult[]>([]);

  const [profileFiles, setProfileFiles] = useState<File[]>([]);
  const [profileBlobs, setProfileBlobs] = useState<PutBlobResult[]>([]);

  const isPhoto = type === "photo";
  const isConversation = type === "conversation";
  const isProfile = type === "profile";

  const maxStep = isConversation ? 2 : isProfile ? 1 : 0;

  const goNext = () => setStep((s) => Math.min(maxStep, s + 1));
  const goBack = () => setStep((s) => Math.max(0, s - 1));

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
    const userId = user!.id;
    if (!userId) throw new Error("User not authenticated");

    const formData = new FormData();

    formData.append('file', file);
    formData.append('category', category);
    formData.append('userId', userId);

    const response = await fetch(`/api/assets`, {
      method: 'POST',
      body: formData
    });

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
        userId: user!.id,
        type: 'photo',
        photoUrl: blob.url,
      }),
    });

    if (!analyzeResponse.ok) {
      throw new Error(`Failed to analyze photo: ${analyzeResponse.status} ${analyzeResponse.statusText}`);
    }

    const { analysis } = await analyzeResponse.json();

    if (!analysis) {
      throw new Error('Failed to analyze photo');
    }

    const addAnalysisResponse = await fetch(`/api/assets/${mediaAsset._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisId: analysis._id }),
    })

    if (!addAnalysisResponse.ok) {
      throw new Error('Failed to link analysis to media asset');
    }

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
        userId: user!.id,
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
        userId: user!.id,
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

    const addAnalysisResponse = await fetch(`/api/conversations/${conversationSnapshot._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisId: conversationAnalysis._id }),
    })

    if (!addAnalysisResponse) {
      throw new Error('Failed to link analysis to conversation snapshot');
    }

    router.push(`/ai-review/${conversationAnalysis._id}`);
  }

  const handleSubmitProfilePhotos = async () => {
    if (!profileFiles.length) throw new Error("No files selected");

    const uploads = await Promise.all(
      profileFiles.map((file) => uploadOne(file, "my_profile_photo"))
    );

    const blobs = uploads.map(u => u.blob);
    setProfileBlobs(blobs);
  };

  const handleRunProfile = async () => {
    if (!profileBlobs.length) throw new Error("No profile photos uploaded");

    const response = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user!.id,
        profilePhotos: profileBlobs,
        context: contextInput,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create profile analysis: ${response.status} ${response.statusText}`);
    }

    const { profile } = await response.json();

    if (!profile) {
      throw new Error('Failed to create profile analysis');
    }

    const analyzeResponse = await fetch(`/api/ai-analysis/profile/${profile._id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user!.id,
        type: 'profile',
        contextInput,
      }),
    })

    if (!analyzeResponse.ok) {
      throw new Error(`Failed to analyze profile: ${analyzeResponse.status} ${analyzeResponse.statusText}`);
    }

    const { analysis: profileAnalysis } = await analyzeResponse.json()

    const addAnalysisResponse = await fetch(`/api/profiles/${profile._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisId: profileAnalysis._id }),
    })

    if (!addAnalysisResponse) {
      throw new Error('Failed to link analysis to profile');
    }

    router.push(`/ai-review/${profileAnalysis._id}`);
  };


  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button className="primary-gradient text-white" onClick={() => setStep(0)}>
            {isConversation ? "Analyze Conversations" : isPhoto ? "Analyze Photos" : "Analyze Profile"}
          </Button>
        </DialogTrigger>

        <DialogContent
          className={cn(
            "w-[94vw] h-[92vh] max-w-none max-h-none p-0 overflow-hidden flex flex-col min-h-0",
            type === "photo" ? "lg:w-[74vw] lg:h-[74vh]" : "lg:w-[88vw] lg:h-[86vh]"
          )}
        >
          {/* Header */}
          <div className="relative border-b border-white/10 bg-white/[0.03] px-6 py-5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_240px_at_20%_0%,rgba(255,70,197,0.12),transparent_60%),radial-gradient(700px_240px_at_80%_0%,rgba(209,179,255,0.10),transparent_60%)]" />
            <div className="relative">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-xl font-semibold text-white">
                  {isConversation
                    ? "Upload Conversation Thread"
                    : isPhoto
                      ? "Upload Photo"
                      : "Upload Profile Photos"}
                </DialogTitle>

                <p className="text-sm text-zinc-400">
                  {isPhoto
                    ? "Upload one image. You’ll get specific, actionable fixes (lighting, framing, expression, vibe)."
                    : isProfile
                      ? "Upload your full set. The AI evaluates the story, variety, consistency, and strongest ordering."
                      : "Upload thread screenshots in order. Add optional context for higher-signal messaging advice."}
                </p>
              </DialogHeader>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
            {/* Left rail (only for conversation/profile) */}
            {(isConversation || isProfile) ? (
              <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-white/10 bg-white/[0.02] p-6">
                {/* Stepper */}
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Steps</p>

                  {isConversation && (
                    <div className="mt-3 space-y-2">
                      {[
                        { idx: 0, label: "Thread screenshots" },
                        { idx: 1, label: "Other profile (optional)" },
                        { idx: 2, label: "Context (optional)" },
                      ].map((s) => (
                        <div
                          key={s.idx}
                          className={cn(
                            "flex items-center justify-between rounded-xl border px-3 py-3",
                            step === s.idx ? "border-white/15 bg-white/[0.05]" : "border-white/10 bg-white/[0.02]"
                          )}
                        >
                          <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                              step === s.idx ? "bg-white/10 text-white" : "bg-white/[0.06] text-zinc-300"
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
                  )}

                  {isProfile && (
                    <div className="mt-3 space-y-2">
                      {[
                        { idx: 0, label: "Profile photos" },
                        { idx: 1, label: "Context (optional)" },
                      ].map((s) => (
                        <div
                          key={s.idx}
                          className={cn(
                            "flex items-center justify-between rounded-xl border px-3 py-3",
                            step === s.idx ? "border-white/15 bg-white/[0.05]" : "border-white/10 bg-white/[0.02]"
                          )}
                        >
                          <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                              step === s.idx ? "bg-white/10 text-white" : "bg-white/[0.06] text-zinc-300"
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
                  )}
                </div>

                {/* Tips */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold text-white">Tips</p>
                  <ul className="mt-2 space-y-2 text-sm text-zinc-400">
                    {isProfile && (
                      <>
                        <li>• Ideal: 4–6 photos for strongest signal.</li>
                        <li>• Include at least 1 full-body + 1 social shot.</li>
                        <li>• Avoid duplicate poses/outfits.</li>
                      </>
                    )}
                    {isConversation && (
                      <>
                        <li>• Upload screenshots in order (top → bottom).</li>
                        <li>• Include both sides (don’t crop out replies).</li>
                        <li>• Add context if you want “get a date” vs “get a reply” advice.</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            ) : null}

            {/* Main panel */}
            <div className={cn((isConversation || isProfile) ? "lg:col-span-8" : "lg:col-span-12", "p-6")}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto pr-1">
                  {/* ===================== */}
                  {/* PHOTO */}
                  {/* ===================== */}
                  {isPhoto && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Dropzone */}
                      <div className="lg:col-span-5">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                          <p className="text-sm font-semibold text-white">Select a photo</p>
                          <p className="mt-1 text-sm text-zinc-400">
                            Drag & drop or click to upload. Best results with clear, natural lighting.
                          </p>

                          <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 hover:bg-black/25 transition-colors">
                            <FileUpload onChange={handleFileUpload} type="photo" />
                            <input ref={inputFileRef} type="file" className="hidden" />
                          </div>

                          <div className="mt-4 flex items-center gap-3">
                            <Button
                              className="primary-gradient text-white px-6"
                              type="button"
                              onClick={handleSubmitPhoto}
                            >
                              Upload & Analyze
                            </Button>

                            <span className="text-sm text-zinc-500">
                            {blob ? "Ready ✅" : "No file selected"}
                          </span>
                          </div>
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="lg:col-span-7">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-sm font-semibold text-white">Preview</p>

                          <div className="mt-3 relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-center">
                            {blob ? (
                              <Image
                                key={blob.pathname}
                                src={blob.url}
                                alt="uploaded photo"
                                fill
                                className="object-contain"
                              />
                            ) : (
                              <div className="text-sm text-zinc-500 px-6 text-center">
                                Upload a photo to preview it here.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ===================== */}
                  {/* CONVERSATION */}
                  {/* ===================== */}
                  {isConversation && (
                    <>
                      {step === 0 && (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                          <p className="text-sm font-semibold text-white">Thread screenshots</p>
                          <p className="mt-1 text-sm text-zinc-400">
                            Upload the main message thread screenshots (in order).
                          </p>

                          <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 hover:bg-black/25 transition-colors">
                            <FileUpload onChange={(f) => setThreadFiles(f)} type="conversation" />
                          </div>

                          <div className="mt-4 flex items-center gap-3">
                            <Button
                              type="button"
                              className="primary-gradient text-white px-6"
                              onClick={handleSubmitThreadScreenshots}
                            >
                              Upload Thread
                            </Button>

                            <span className="text-sm text-zinc-500">
                            {threadBlobs.length > 0 ? `${threadBlobs.length} uploaded` : "None uploaded"}
                          </span>
                          </div>

                          {threadBlobs.length > 0 && (
                            <section className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                              {threadBlobs.map((b) => (
                                <div
                                  key={b.pathname}
                                  className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]"
                                >
                                  <Image
                                    src={b.url}
                                    alt="uploaded thread screenshot"
                                    width={220}
                                    height={220}
                                    className="w-full object-contain"
                                  />
                                </div>
                              ))}
                            </section>
                          )}
                        </div>
                      )}

                      {step === 1 && (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                          <p className="text-sm font-semibold text-white">Other profile (optional)</p>
                          <p className="mt-1 text-sm text-zinc-400">
                            Upload screenshots of their profile to improve context.
                          </p>

                          <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 hover:bg-black/25 transition-colors">
                            <FileUpload onChange={(f) => setOtherFiles(f)} type="conversation" />
                          </div>

                          <div className="mt-4 flex items-center gap-3">
                            <Button
                              type="button"
                              className="primary-gradient text-white px-6"
                              onClick={handleSubmitOtherProfileScreenshots}
                            >
                              Upload Profile Screens
                            </Button>

                            <span className="text-sm text-zinc-500">
                            {otherBlobs.length > 0 ? `${otherBlobs.length} uploaded` : "None uploaded"}
                          </span>
                          </div>

                          {otherBlobs.length > 0 && (
                            <section className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                              {otherBlobs.map((b) => (
                                <div
                                  key={b.pathname}
                                  className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]"
                                >
                                  <Image
                                    src={b.url}
                                    alt="uploaded other profile screenshot"
                                    width={220}
                                    height={220}
                                    className="w-full object-contain"
                                  />
                                </div>
                              ))}
                            </section>
                          )}
                        </div>
                      )}

                      {step === 2 && (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                          <p className="text-sm font-semibold text-white">Context (optional)</p>
                          <p className="mt-1 text-sm text-zinc-400">
                            Add your goal so the AI gives the right next move.
                          </p>

                          <textarea
                            value={contextInput}
                            onChange={(e) => setContextInput(e.target.value)}
                            placeholder="e.g. I want to set a date this week, but her replies slowed down…"
                            className="mt-4 min-h-36 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-white/15"
                          />

                          <div className="mt-4">
                            <Button
                              type="button"
                              className="primary-gradient text-white px-6"
                              disabled={threadBlobs.length === 0}
                              onClick={handleSubmitConversationSnapshot}
                            >
                              Run Analysis
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* ===================== */}
                  {/* PROFILE */}
                  {/* ===================== */}
                  {isProfile && (
                    <>
                      {step === 0 && (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                          <p className="text-sm font-semibold text-white">Profile photo set</p>
                          <p className="mt-1 text-sm text-zinc-400">
                            Upload the photos you want analyzed as a set.
                          </p>

                          <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 hover:bg-black/25 transition-colors">
                            <FileUpload onChange={(f) => setProfileFiles(f)} type="profile" />
                          </div>

                          <div className="mt-4 flex items-center gap-3">
                            <Button
                              type="button"
                              className="primary-gradient text-white px-6"
                              onClick={handleSubmitProfilePhotos}
                            >
                              Upload Photos
                            </Button>

                            <span className="text-sm text-zinc-500">
                            {profileBlobs.length > 0 ? `${profileBlobs.length} uploaded` : "None uploaded"}
                          </span>
                          </div>

                          {profileBlobs.length > 0 && (
                            <section className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                              {profileBlobs.map((b) => (
                                <div
                                  key={b.pathname}
                                  className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]"
                                >
                                  <Image
                                    src={b.url}
                                    alt="uploaded profile photo"
                                    width={220}
                                    height={220}
                                    className="w-full object-contain"
                                  />
                                </div>
                              ))}
                            </section>
                          )}
                        </div>
                      )}

                      {step === 1 && (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                          <p className="text-sm font-semibold text-white">Context (optional)</p>
                          <p className="mt-1 text-sm text-zinc-400">
                            What vibe are you going for, and who are you trying to attract?
                          </p>

                          <textarea
                            value={contextInput}
                            onChange={(e) => setContextInput(e.target.value)}
                            placeholder="e.g. clean boy / gym + travel vibe, targeting cute feminine girls…"
                            className="mt-4 min-h-36 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-white/15"
                          />

                          <div className="mt-4">
                            <Button
                              type="button"
                              className="primary-gradient text-white px-6"
                              disabled={profileBlobs.length === 0}
                              onClick={handleRunProfile}
                            >
                              Run Profile Analysis
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Footer actions for step flows */}
                {(isConversation || isProfile) && (
                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
                    <button
                      type="button"
                      onClick={goBack}
                      disabled={step === 0}
                      className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm text-white hover:bg-white/[0.05] disabled:opacity-40"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={goNext}
                      disabled={step === maxStep}
                      className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm text-white hover:bg-white/[0.05] disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );

}

export default AnalysisForm;