import {NextResponse} from "next/server";
import analyzeThreadScreenshot from "@/lib/server/analysis/analyzeThreadScreenshot";

export async function POST(request: Request) {
  const body = await request.json();

  const response = await analyzeThreadScreenshot(body.threadBlob)

  return NextResponse.json({ analysis: response });
}