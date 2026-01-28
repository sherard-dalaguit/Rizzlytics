import {NextResponse} from "next/server";
import dbConnect from "@/lib/mongoose";
import {PutBlobResult} from "@vercel/blob";
import MediaAsset from "@/database/media-asset.model";
import Profile from "@/database/profile.model";

export async function POST(request: Request): Promise<NextResponse> {
  await dbConnect();

  const body = await request.json();
  const { userId, profilePhotos, context } = body;

  if (!Array.isArray(profilePhotos) || profilePhotos.length === 0) {
    return NextResponse.json({ error: "At least one profile photo is required" }, { status: 400 });
  }

  const myProfileAssetIds = [];

  for (const blob of profilePhotos) {
    const mediaAsset = await MediaAsset.findOne({ blobPathname: blob.pathname });
    if (!mediaAsset) {
      return NextResponse.json({ error: "MediaAsset not found for profile photo" }, { status: 404 });
    }
    myProfileAssetIds.push(mediaAsset._id);
  }

  const profile = await Profile.create({
    userId,
    myProfileAssetIds,
    contextInput: context,
  });

  return NextResponse.json({ profile });
}

export async function GET(_request: Request): Promise<NextResponse> {
  await dbConnect()

  const profiles = await Profile.find().populate("myProfileAssetIds");

  return NextResponse.json({ profiles });
}