import runAIReview from "@/lib/server/analysis/runAIReview";
import {NextResponse} from "next/server";
import dbConnect from "@/lib/mongoose";
import Analysis, {IAnalysisDoc} from "@/database/analysis.model";
import Profile from "@/database/profile.model";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { type, contextInput } = body;

  if (!type) {
    return NextResponse.json(
      { error: 'Missing required "type" in request body.' },
      { status: 400 }
    );
  }

  if (!contextInput) {
    return NextResponse.json(
      { error: 'Missing required "contextInput" in request body.' },
      { status: 400 }
    );
  }

  await dbConnect();

  const profile = await Profile.findById(id).populate("myProfileAssetIds");
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const profilePhotoUrls = (profile.myProfileAssetIds as any[])
    .map((a) => a.blobUrl)
    .filter((u) => typeof u === "string" && u.length > 0)
    .slice(0, 9);

  const analysisResult = await runAIReview({type, profilePhotoUrls, contextInput});

  const userId = /* get this from auth session later */ undefined as any;

  const analysis: IAnalysisDoc = await Analysis.create({
    userId,
    type,
    status: "succeeded",
    profileId: id,
    result: analysisResult,
  })

  return NextResponse.json({ analysis });
}