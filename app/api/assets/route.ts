import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import MediaAsset, {IMediaAssetDoc} from "@/database/media-asset.model";
import dbConnect from "@/lib/mongoose";
import {auth} from "@/auth";

export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData();

  const file = formData.get("file");
  const category = formData.get("category");
  const userId = formData.get("userId");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: 'Missing required "file" in form data.' },
      { status: 400 }
    );
  }

  if (!category || typeof category !== "string") {
    return NextResponse.json(
      { error: 'Missing required "category" in form data.' },
      { status: 400 }
    );
  }

  if (!userId || typeof userId !== "string") {
    return NextResponse.json(
      { error: 'Missing required "userId" in form data.' },
      { status: 400 }
    );
  }

  const blob = await put(file.name, file, {
    access: 'public',
    allowOverwrite: true,
  });

  await dbConnect()

  const mediaAsset: IMediaAssetDoc = await MediaAsset.create({
    userId,
    assetType: "image",
    category,
    storageProvider: "vercel_blob",
    blobUrl: blob.url,
    blobPathname: blob.pathname,
    status: "active",
  });

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