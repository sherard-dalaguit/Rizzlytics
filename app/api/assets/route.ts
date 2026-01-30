import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import MediaAsset, {IMediaAssetDoc} from "@/database/media-asset.model";
import dbConnect from "@/lib/mongoose";
import {auth} from "@/auth";

function safeExt(filename: string) {
  const ext = filename.split(".").pop();
  return ext && ext.length <= 8 ? ext : "bin";
}

export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData();
  const file = formData.get("file");
  const category = formData.get("category");
  const userId = formData.get("userId");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Missing required "file".' }, { status: 400 });
  }
  if (!category || typeof category !== "string") {
    return NextResponse.json({ error: 'Missing required "category".' }, { status: 400 });
  }
  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: 'Missing required "userId".' }, { status: 400 });
  }

  await dbConnect();

  // create the DB record first so we can use _id as a stable unique key
  const mediaAsset: IMediaAssetDoc = await MediaAsset.create({
    userId,
    assetType: "image",
    category,
    storageProvider: "vercel_blob",
    status: "active",
  });

  const ext = safeExt(file.name);

  // unique pathname: userId + mediaAssetId + random suffix
  const uniqueSuffix = crypto.randomUUID();
  const pathname = `users/${userId}/media/${mediaAsset._id.toString()}-${uniqueSuffix}.${ext}`;

  const blob = await put(pathname, file, {
    access: "public",
    allowOverwrite: false,
    contentType: file.type || undefined,
  });

  // update the record with blob info
  mediaAsset.blobUrl = blob.url;
  mediaAsset.blobPathname = blob.pathname;
  await mediaAsset.save();

  return NextResponse.json({ blob, mediaAsset });
}

export async function GET(_: Request): Promise<NextResponse> {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const mediaAssets = await MediaAsset
    .find({ userId: user.id, category: "self_photo" })
    .sort({ createdAt: -1 });

  if (!mediaAssets) {
    return NextResponse.json({ error: "No media assets found" }, { status: 404 });
  }

  return NextResponse.json({ mediaAssets });
}