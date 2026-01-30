import ConversationSnapshot, {ITranscriptMessage} from "@/database/conversation-snapshot.model";
import {NextResponse} from "next/server";
import dbConnect from "@/lib/mongoose";
import MediaAsset from "@/database/media-asset.model";
import Analysis from "@/database/analysis.model";
import { del } from '@vercel/blob';

type UpdatePayload = {
  transcript?: ITranscriptMessage[];
  otherProfileAnalyses?: string[];
  analysisId?: string;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }>}
): Promise<NextResponse> {
  const { id } =  await params;
  const body: UpdatePayload = await request.json();
  const { transcript, otherProfileAnalyses, analysisId } = body;

  if (!transcript && !otherProfileAnalyses && !analysisId) {
    return NextResponse.json(
      { error: "Must provide transcript, otherProfileAnalyses, or analysisId" },
      { status: 400 }
    )
  }

  await dbConnect()

  const $set: Record<string, unknown> = {};

  if (transcript) {
    $set.transcript = transcript;
    $set["extraction.status"] = "succeeded";
  }

  if (otherProfileAnalyses) {
    $set.otherProfileContext = otherProfileAnalyses;
  }

  if (analysisId) {
    $set.analysisId = analysisId;
  }

  const conversationSnapshot = await ConversationSnapshot.findByIdAndUpdate(
    id,
    { $set },
    { new: true, runValidators: true },
  )

  if (!conversationSnapshot) {
    return NextResponse.json(
      { error: "ConversationSnapshot not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await dbConnect();

  const conversationSnapshot = await ConversationSnapshot.findById(id);
  if (!conversationSnapshot) {
    return NextResponse.json({ error: "ConversationSnapshot not found" }, { status: 404 });
  }

  try {
    const threadIds = (conversationSnapshot.threadScreenshotAssetIds ?? []).map(String);
    const otherIds = (conversationSnapshot.otherProfileAssetIds ?? []).map(String);

    const allMediaIds = [...threadIds, ...otherIds].filter(Boolean);

    // load all media assets to delete blbos
    const mediaAssets = allMediaIds.length
      ? await MediaAsset.find({ _id: { $in: allMediaIds } })
      : [];

    // delete vercel blobs
    await Promise.allSettled(
      mediaAssets
        .filter((a => a.blobUrl))
        .map((a) => del(a.blobUrl))
    )

    // delete media assets from mongodb
    if (allMediaIds.length) {
      await MediaAsset.deleteMany({ _id: { $in: allMediaIds } });
    }
    console.log(`Deleted ${mediaAssets.length} MediaAssets and their blobs`);

    // delete related analysis
    const analysis = await Analysis.findById(conversationSnapshot.analysisId);
    if (!analysis) {
      return NextResponse.json({ error: "Related Analysis not found" }, { status: 404 });
    }

    await analysis.deleteOne();
    console.log("Deleted related Analysis");

    // delete mongodb conversationSnapshot
    await conversationSnapshot.deleteOne();
    console.log(`Deleted ConversationSnapshot with ID: ${id}`);

    return NextResponse.json({ success: true, data: conversationSnapshot }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete ConversationSnapshot" }, { status: 500 });
  }
}