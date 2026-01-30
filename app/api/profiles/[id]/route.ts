import {NextResponse} from "next/server";
import dbConnect from "@/lib/mongoose";
import Profile from "@/database/profile.model";
import MediaAsset from "@/database/media-asset.model";
import { del } from '@vercel/blob';
import Analysis from "@/database/analysis.model";

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

  const profile = await Profile.findByIdAndUpdate(
    id,
    { analysisId },
    { new: true, runValidators: true },
  )

  if (!profile) {
    return NextResponse.json(
      { error: "Profile not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ profile });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const {id} = await params;

  await dbConnect();

  const profile = await Profile.findById(id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  try {
    const myProfileIds = (profile.myProfileAssetIds ?? []).map(String);

    // load all media assets to delete blobs
    const mediaAssets = myProfileIds.length
      ? await MediaAsset.find({ _id: { $in: myProfileIds } })
      : [];

    // delete vercel blobs
    await Promise.allSettled(
      mediaAssets.map((a) => del(a.blobUrl))
    );

    // delete media assets from mongodb
    if (myProfileIds.length) {
      await MediaAsset.deleteMany({ _id: { $in: myProfileIds } });
    }
    console.log(`Deleted ${mediaAssets.length} MediaAssets and their blobs`);

    // delete related analysis
    const analysis = await Analysis.findById(profile.analysisId);
    if (!analysis) {
      return NextResponse.json({ error: "Related Analysis not found" }, { status: 404 });
    }

    await analysis.deleteOne();
    console.log("Deleted related Analysis")

    // delete mongodb profile
    await profile.deleteOne();
    console.log(`Deleted Profile with ID: ${id}`);

    return NextResponse.json({ success: true, data: profile }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting profile and related data" }, { status: 500 });
  }
}