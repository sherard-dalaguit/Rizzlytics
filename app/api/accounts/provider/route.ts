import Account from "@/database/account.model";
import {NextResponse} from "next/server";

export async function POST(request: Request) {
  const { providerAccountId } = await request.json();

  const account = await Account.findOne({ providerAccountId });
  if (!account) {
    return NextResponse.json({ success: false, message: "Account not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: account }, { status: 200 });
}