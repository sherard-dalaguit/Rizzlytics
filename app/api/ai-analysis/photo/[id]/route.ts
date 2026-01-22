import dbConnect from "@/lib/mongoose";
import {NextResponse} from "next/server";
import runAIReview from "@/lib/server/analysis/runAIReview";
import Analysis, {IAnalysisDoc} from "@/database/analysis.model";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { type, photoUrl } = body;

  if (!type || !photoUrl) {
    return NextResponse.json(
      { error: 'Missing required "type" or "photoUrl" in request body.' },
      { status: 400 }
    );
  }

  const analysisResult = await runAIReview({type, photoUrl})

  await dbConnect()

  const userId = /* get this from auth session later */ undefined as any;

  const analysis: IAnalysisDoc = await Analysis.create({
    userId,
    type,
    status: "succeeded",
    selfPhotoAssetId: id,
    result: analysisResult,
  })

  return NextResponse.json({ analysis });
}

export async function GET(_: Request, { params }: { params: Promise<{ mediaAssetId: string }> }): Promise<NextResponse> {
  const { mediaAssetId } = await params;

  await dbConnect()

  const analysis = await Analysis
    .findOne({ selfPhotoAssetId: mediaAssetId })
    .sort({ createdAt: -1 })
    .lean();

  if (!analysis) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  return NextResponse.json({ analysis });
}