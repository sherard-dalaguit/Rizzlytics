import {NextResponse} from "next/server";
import dbConnect from "@/lib/mongoose";
import {PutBlobResult} from "@vercel/blob";
import MediaAsset from "@/database/media-asset.model";
import Profile from "@/database/profile.model";

type CreateProfilePayload = {
  profilePhotos: PutBlobResult[];
  context?: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  await dbConnect()

  const body = (await request.json()) as CreateProfilePayload;
  const profilePhotos = body.profilePhotos ?? [];
  const context = body.context ?? "";

  if (!Array.isArray(profilePhotos) || profilePhotos.length === 0) {
    return NextResponse.json({ error: "At least one profile photo is required" }, { status: 400 });
  }

  // we get passed the blobs (profilePhotos)
  // we have to find their related mediaassets in the database so we can collect their ids
  const myProfileAssetIds = [];

  for (const blob of profilePhotos) {
    const mediaAsset = await MediaAsset.findOne({ blobPathname: blob.pathname });
    if (!mediaAsset) {
      return NextResponse.json({ error: "MediaAsset not found for profile photo" }, { status: 404 });
    }
    myProfileAssetIds.push(mediaAsset._id);
  }

  // now that we have the media asset ids for the profile photos,
  // we store their ids in a new Profile document
  const userId = /* get this from auth session later */ undefined as any;

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