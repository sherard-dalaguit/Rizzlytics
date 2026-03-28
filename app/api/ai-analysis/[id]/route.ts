import {NextResponse} from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import Analysis from "@/database/analysis.model";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await params;

  await dbConnect()

  const analysis = await Analysis.findById(id)
    .lean()
    .populate({
      path: "conversationId",
      select: "threadScreenshotAssetIds otherProfileAssetIds contextInput transcript"
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

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await dbConnect();

  const analysis = await Analysis.findOneAndDelete({ _id: id, userId: session.user.id });
  if (!analysis) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}