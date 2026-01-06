import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";

export async function GET() {
  try {
    await dbConnect();

    return NextResponse.json({
      status: "ok",
      db: "connected"
    })
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Health check failed"
    }, { status: 500 })
  }
}