import { NextRequest, NextResponse } from "next/server";
import User from "@/models/UserModel";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/dbConfig/db";

connectDB();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();

    const { email, password } = reqBody;

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 400 }
      );
    }

    const verifyPassword = await bcryptjs.compare(password, user.password);
    if (!verifyPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }
    console.log(user);

    const tokenData = {
      id: user._id,
      email: user.email,
      username: user.username,
    };

    const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
      expiresIn: "1d",
    });

    const response = NextResponse.json({
      message: "Login successful",
      success: true,
    });
    response.cookies.set("token", token, {
      httpOnly: true,
    });
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
