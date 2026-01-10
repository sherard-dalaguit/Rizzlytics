import ConversationSnapshot from "@/database/conversation-snapshot.model";
import {NextResponse} from "next/server";
import dbConnect from "@/lib/mongoose";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }>}
): Promise<NextResponse> {
  const { id } =  await params;
  const body = await request.json();
  const { transcript } = body;

  await dbConnect()

  const conversationSnapshot = await ConversationSnapshot.findByIdAndUpdate(
    id,
    { $set: { transcript, "extraction.status": "succeeded" } },
    { new: true, runValidators: true },
  )

  if (!conversationSnapshot) {
    return NextResponse.json({ error: "ConversationSnapshot not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}