import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import Analysis from "@/database/analysis.model";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  await dbConnect();

  const query: Record<string, unknown> = { userId: session.user.id };
  if (type) query.type = type;

  const analyses = await Analysis.find(query).sort({ createdAt: -1 }).lean();

  return NextResponse.json({ analyses });
}
