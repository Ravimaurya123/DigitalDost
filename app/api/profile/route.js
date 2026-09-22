import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
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

    const user = await User.findById(currentUser.userId).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );

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

    return NextResponse.json(
      {
        user,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("PROFILE GET ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to load profile.",
      },
      {
        status: 500,
      }
    );
  }
}

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

    const name =
      typeof body?.name === "string"
        ? body.name.trim()
        : "";

    const profileImage =
      typeof body?.profileImage === "string"
        ? body.profileImage.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        {
          message: "Name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        {
          message: "Name must contain at least 2 characters.",
        },
        {
          status: 400,
        }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          message: "Name must be less than 100 characters.",
        },
        {
          status: 400,
        }
      );
    }

    if (profileImage.length > 500) {
      return NextResponse.json(
        {
          message: "Profile image URL is too long.",
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

    user.name = name;
    user.profileImage = profileImage;

    await user.save();

    return NextResponse.json(
      {
        message: "Profile updated successfully.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to update profile.",
      },
      {
        status: 500,
      }
    );
  }
}