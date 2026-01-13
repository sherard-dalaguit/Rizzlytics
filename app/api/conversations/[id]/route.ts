import ConversationSnapshot, {ITranscriptMessage} from "@/database/conversation-snapshot.model";
import {NextResponse} from "next/server";
import dbConnect from "@/lib/mongoose";

type UpdatePayload = {
  transcript?: ITranscriptMessage[];
  otherProfileAnalyses?: string[];
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }>}
): Promise<NextResponse> {
  const { id } =  await params;
  const body: UpdatePayload = await request.json();
  const { transcript, otherProfileAnalyses } = body;

  if (!transcript && !otherProfileAnalyses) {
    return NextResponse.json(
      { error: "Must provide transcript or otherProfileAnalyses" },
      { status: 400 }
    )
  }

  await dbConnect()

  const $set: Record<string, unknown> = {};

  if (transcript) {
    $set.transcript = transcript;
    $set["extraction.status"] = "succeeded";
  }

  if (otherProfileAnalyses) {
    $set.otherProfileContext = otherProfileAnalyses;
  }

  const conversationSnapshot = await ConversationSnapshot.findByIdAndUpdate(
    id,
    { $set },
    { new: true, runValidators: true },
  )

  if (!conversationSnapshot) {
    return NextResponse.json(
      { error: "ConversationSnapshot not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}