import {PutBlobResult} from "@vercel/blob";
import {NextResponse} from "next/server";
import MediaAsset from "@/database/media-asset.model";
import dbConnect from "@/lib/mongoose";
import ConversationSnapshot from "@/database/conversation-snapshot.model";
import {auth} from "@/auth";

export async function POST(request: Request): Promise<NextResponse> {
  await dbConnect();

  const body = await request.json()
  const { userId, threadScreenshots, otherProfileScreenshots, context } = body;

  if (!Array.isArray(threadScreenshots) || threadScreenshots.length === 0) {
    return NextResponse.json({ error: "At least one thread screenshot is required" }, { status: 400 });
  }

  // we get passed the blobs (threadScreenshots & otherProfileScreenshots)
  // we have to find their related mediaassets in the database so we can collect their ids
  const threadScreenshotAssetIds = [];

  for (const blob of threadScreenshots) {
    const mediaAsset = await MediaAsset.findOne({ blobPathname: blob.pathname });
    if (!mediaAsset) {
      return NextResponse.json({ error: "MediaAsset not found for thread screenshot" }, { status: 404 });
    }
    threadScreenshotAssetIds.push(mediaAsset._id);
  }

  const otherProfileAssetIds = [];

  for (const blob of otherProfileScreenshots) {
    const mediaAsset = await MediaAsset.findOne({ blobPathname: blob.pathname });
    if (!mediaAsset) {
      return NextResponse.json({ error: "MediaAsset not found for other profile screenshot" }, { status: 404 });
    }
    otherProfileAssetIds.push(mediaAsset._id);
  }

  // now that we have the media asset ids for the screenshots,
  // we store their ids in a new ConversationSnapshot document
  const conversationSnapshot = await ConversationSnapshot.create({
    userId,
    threadScreenshotAssetIds,
    otherProfileAssetIds,
    contextInput: context,
    transcript: [],
    extraction: { status: "queued" },
  });

  return NextResponse.json({ conversationSnapshot });
}

export async function GET(_: Request): Promise<NextResponse> {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const conversationSnapshots = await ConversationSnapshot
    .find({ userId: user.id })
    .sort({ createdAt: -1 })
    .populate({
      path: "threadScreenshotAssetIds",
      select: "blobUrl createdAt",
      options: { sort: { createdAt: 1 } },
    })
    .populate({
      path: "otherProfileAssetIds",
      select: "blobUrl createdAt",
      options: { sort: { createdAt: 1 } },
    })
    .lean();

  return NextResponse.json({ conversationSnapshots });
}