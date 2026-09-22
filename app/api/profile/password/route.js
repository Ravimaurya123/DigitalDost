import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    const body = await request.json();

    const currentPassword = body?.currentPassword || "";
    const newPassword = body?.newPassword || "";
    const confirmPassword = body?.confirmPassword || "";

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return NextResponse.json(
        {
          message: "Please fill all password fields.",
        },
        {
          status: 400,
        }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          message:
            "New password must be at least 6 characters long.",
        },
        {
          status: 400,
        }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          message: "New passwords do not match.",
        },
        {
          status: 400,
        }
      );
    }

    const user = await User.findById(currentUser.userId);

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          message: "Current password is incorrect.",
        },
        {
          status: 400,
        }
      );
    }

    const samePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (samePassword) {
      return NextResponse.json(
        {
          message:
            "New password must be different from your current password.",
        },
        {
          status: 400,
        }
      );
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      12
    );

    user.password = hashedPassword;

    await user.save();

    return NextResponse.json(
      {
        message: "Password changed successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to change password.",
      },
      {
        status: 500,
      }
    );
  }
}