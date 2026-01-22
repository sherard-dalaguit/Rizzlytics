import dbConnect from "@/lib/mongoose";
import { del } from '@vercel/blob';
import MediaAsset from "@/database/media-asset.model";
import {NextResponse} from "next/server";

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
    if (mediaAsset.blobUrl) {
      await del(mediaAsset.blobUrl);
    }

    await mediaAsset.deleteOne();

    return NextResponse.json({ success: true, data: mediaAsset }, { status: 200 });
  } catch (error) {
    console.error("Error deleting MediaAsset:", error);
    return NextResponse.json({ success: false, error: "Failed to delete MediaAsset" }, { status: 500 });
  }
}