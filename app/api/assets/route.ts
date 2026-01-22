import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import MediaAsset, {IMediaAssetDoc} from "@/database/media-asset.model";
import dbConnect from "@/lib/mongoose";

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);

  const filename = searchParams.get('filename');
  const category = searchParams.get('category');

  if (!filename) {
    return NextResponse.json(
      { error: 'Missing required "filename" query parameter.' },
      { status: 400 }
    );
  }

  if (!category) {
    return NextResponse.json(
      { error: 'Missing required "category" query parameter.' },
      { status: 400 }
    );
  }

  if (!request.body) {
    return NextResponse.json(
      { error: 'Request body is required for file upload.' },
      { status: 400 }
    );
  }

  const blob = await put(filename, request.body, {
    access: 'public',
    allowOverwrite: true,
  });

  await dbConnect()

  const userId = /* get this from auth session later */ undefined as any;

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
  await dbConnect();

  const mediaAssets = await MediaAsset
    .find({ category: "self_photo" })
    .sort({ createdAt: -1 });

  if (!mediaAssets) {
    return NextResponse.json({ error: "No media assets found" }, { status: 404 });
  }

  return NextResponse.json({ mediaAssets });
}