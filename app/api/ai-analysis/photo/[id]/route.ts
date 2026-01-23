import dbConnect from "@/lib/mongoose";
import {NextResponse} from "next/server";
import runAIReview from "@/lib/server/analysis/runAIReview";
import Analysis, {IAnalysisDoc} from "@/database/analysis.model";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // 1) parse body safely
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid or empty JSON body." },
        { status: 400 }
      );
    }

    const { type, photoUrl } = body ?? {};
    if (!type || !photoUrl) {
      return NextResponse.json(
        { error: 'Missing required "type" or "photoUrl" in request body.' },
        { status: 400 }
      );
    }

    // 2) run AI (catch upstream failures)
    let analysisResult: any;
    try {
      analysisResult = await runAIReview({ type, photoUrl });
    } catch (err: any) {
      // Log full error on server for debugging
      console.error("runAIReview failed:", err);

      // This is the common case you showed earlier: OpenAI can't download blob URL
      return NextResponse.json(
        {
          error: "AI review failed (upstream).",
          detail: err?.message ?? String(err),
        },
        { status: 502 }
      );
    }

    // 3) db write
    await dbConnect();

    const userId = undefined as any; // TODO: replace with auth

    const analysis = await Analysis.create({
      userId,
      type,
      status: "succeeded",
      selfPhotoAssetId: id,
      result: analysisResult,
    });

    return NextResponse.json({ analysis });
  } catch (err: any) {
    console.error("POST /api/ai-analysis/photo/:id failed:", err);

    return NextResponse.json(
      {
        error: "Internal server error.",
        detail: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}