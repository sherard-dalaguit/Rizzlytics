import {NextResponse} from "next/server";
import dbConnect from "@/lib/mongoose";
import Profile from "@/database/profile.model";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { analysisId } = body;

  if (!analysisId) {
    return NextResponse.json(
      { error: 'Missing required "analysisId" in request body.' },
      { status: 400 }
    );
  }

  await dbConnect();

  const profile = await Profile.findByIdAndUpdate(
    id,
    { analysisId },
    { new: true, runValidators: true },
  )

  if (!profile) {
    return NextResponse.json(
      { error: "Profile not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ profile });
}