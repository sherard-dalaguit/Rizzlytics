import {NextResponse} from "next/server";
import runAIReview from "@/lib/server/analysis/runAIReview";
import dbConnect from "@/lib/mongoose";
import Analysis, {IAnalysisDoc} from "@/database/analysis.model";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { type, transcript, contextInput, otherProfileContext } = body;

  if (!type) {
    return NextResponse.json(
      { error: 'Missing required "type" in request body.' },
      { status: 400 }
    );
  }

  if (!transcript) {
    return NextResponse.json(
      { error: 'Missing required "transcript" in request body.' },
      { status: 400 }
    );
  }

  if (!contextInput) {
    return NextResponse.json(
      { error: 'Missing required "contextInput" in request body.' },
      { status: 400 }
    );
  }

  if (!otherProfileContext) {
    return NextResponse.json(
      { error: 'Missing required "otherProfileContext" in request body.' },
      { status: 400 }
    );
  }

  const analysisResult = await runAIReview({type, transcript, contextInput, otherProfileContext});

  await dbConnect();

  const userId = /* get this from auth session later */ undefined as any;

  const analysis: IAnalysisDoc = await Analysis.create({
    userId,
    type,
    status: "succeeded",
    conversationId: id,
    result: analysisResult,
  })

  return NextResponse.json({ analysis });
}