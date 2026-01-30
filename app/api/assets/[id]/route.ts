import dbConnect from "@/lib/mongoose";
import { del } from '@vercel/blob';
import MediaAsset from "@/database/media-asset.model";
import {NextResponse} from "next/server";
import Analysis from "@/database/analysis.model";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await params;

  await dbConnect()

  const mediaAsset = await MediaAsset.findById(id);
  if (!mediaAsset) {
    return NextResponse.json({ error: "MediaAsset not found" }, { status: 404 });
  }

  return NextResponse.json({ mediaAsset });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { analysisId } = body;

  if (!analysisId) {
    return NextResponse.json(
      { error: 'Missing required "analysisId" in request body.' },
      { status: 400 }
    );
  }

  await dbConnect();

  const mediaAsset = await MediaAsset.findByIdAndUpdate(
    id,
    { analysisId },
    { new: true, runValidators: true },
  )

  if (!mediaAsset) {
    return NextResponse.json(
      { error: "MediaAsset not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ mediaAsset });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await dbConnect();

  const mediaAsset = await MediaAsset.findById(id);
  if (!mediaAsset) {
    return NextResponse.json({ error: "MediaAsset not found" }, { status: 404 });
  }

  try {
    // delete vercel blob
    if (mediaAsset.blobUrl) {
      await del(mediaAsset.blobUrl);
      console.log(`Deleted blob at URL: ${mediaAsset.blobUrl}`);
    }

    if (mediaAsset.category === "self_photo") {
      const analysis = await Analysis.findById(mediaAsset.analysisId);
      if (!analysis) {
        return NextResponse.json({ error: "Associated Analysis not found" }, { status: 404 });
      }

      // delete related analysis (for single photos)
      await analysis.deleteOne();
      console.log(`Deleted Analysis with ID: ${mediaAsset.analysisId}`);
    }

    // delete mongodb media asset
    await mediaAsset.deleteOne();
    console.log(`Deleted MediaAsset with ID: ${id}`);

    return NextResponse.json({ success: true, data: mediaAsset }, { status: 200 });
  } catch (error) {
    console.error("Error deleting MediaAsset:", error);
    return NextResponse.json({ success: false, error: "Failed to delete MediaAsset" }, { status: 500 });
  }
}