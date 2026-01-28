import dbConnect from "@/lib/mongoose";
import mongoose from "mongoose";
import User from "@/database/user.model";
import Account from "@/database/account.model";
import {NextResponse} from "next/server";

export async function POST(request: Request) {
  const { provider, providerAccountId, user } = await request.json();

  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, image } = user;

    let existingUser = await User.findOne({ email }).session(session);

    if (!existingUser) {
      [existingUser] = await User.create(
        [{ name, email, image }],
        { session }
      )
    } else {
      const updatedData: { name?: string; image?: string } = {};

      if (existingUser.name !== name) {
        updatedData.name = name;
      }
      if (existingUser.image !== image) {
        updatedData.image = image;
      }

      if (Object.keys(updatedData).length > 0) {
        await User.updateOne(
          { _id: existingUser._id },
          { $set: updatedData }
        ).session(session);
      }
    }

    const existingAccount = await Account.findOne({
      userId: existingUser._id,
      provider,
      providerAccountId
    }).session(session);

    if (!existingAccount) {
      await Account.create(
        [
          {
            userId: existingUser._id,
            name,
            image,
            provider,
            providerAccountId
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    await session.abortTransaction();
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}