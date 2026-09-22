import crypto from "crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const token = body?.token?.trim();
    const password = body?.password || "";
    const confirmPassword = body?.confirmPassword || "";

    // Basic validation
    if (!token) {
      return NextResponse.json(
        { message: "Invalid or missing reset token." },
        { status: 400 }
      );
    }

    if (!password || !confirmPassword) {
      return NextResponse.json(
        { message: "Please enter both passwords." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match." },
        { status: 400 }
      );
    }

    // Hash the token received from email
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid and non-expired token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message:
            "This password reset link is invalid or has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password
    user.password = hashedPassword;

    // Clear reset token
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return NextResponse.json(
      {
        message:
          "Password reset successfully. You can now login with your new password.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}