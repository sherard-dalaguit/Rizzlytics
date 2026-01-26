import {NextResponse} from "next/server";
import dbConnect from "@/lib/mongoose";
import Analysis from "@/database/analysis.model";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await params;

  await dbConnect()

  const analysis = await Analysis.findById(id)
    .lean()
    .populate({
      path: "conversationId",
      select: "threadScreenshotAssetIds otherProfileAssetIds contextInput"
    })
    .populate({
      path: "profileId",
      select: "myProfileAssetIds contextInput"
    })
  if (!analysis) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  return NextResponse.json({ analysis });
}