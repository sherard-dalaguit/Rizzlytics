import { NextResponse } from "next/server";
import runQuickReplies from "@/lib/server/analysis/runQuickReplies";
import dbConnect from "@/lib/mongoose";
import Analysis from "@/database/analysis.model";
import { ITranscriptMessage } from "@/database/conversation-snapshot.model";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { userId, transcript, contextInput, otherProfileContext } = body as {
    userId: string;
    transcript: ITranscriptMessage[];
    contextInput?: string;
    otherProfileContext?: string;
  };

  if (!userId) {
    return NextResponse.json({ error: 'Missing required "userId".' }, { status: 400 });
  }

  if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
    return NextResponse.json({ error: 'Missing or empty "transcript".' }, { status: 400 });
  }

  const coachResult = await runQuickReplies({ transcript, contextInput, otherProfileContext });

  await dbConnect();

  const analysis = await Analysis.create({
    userId,
    type: "quick_replies",
    status: "succeeded",
    conversationId: id,
    result: coachResult,
  });

  return NextResponse.json({ analysis });
}
