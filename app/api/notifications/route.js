import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const notifications = await Notification.find({
      userId: currentUser.userId,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId: currentUser.userId,
      isRead: false,
    });

    return NextResponse.json(
      {
        success: true,
        notifications,
        unreadCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notifications.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    const title =
      typeof body?.title === "string"
        ? body.title.trim()
        : "";

    const message =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    const type =
      typeof body?.type === "string"
        ? body.type.trim()
        : "system";

    const link =
      typeof body?.link === "string"
        ? body.link.trim()
        : "";

    if (!title) {
      return NextResponse.json(
        { message: "Notification title is required." },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { message: "Notification title is too long." },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { message: "Notification message is required." },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { message: "Notification message is too long." },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "task",
      "reminder",
      "ai",
      "document",
      "system",
    ];

    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        { message: "Invalid notification type." },
        { status: 400 }
      );
    }

    const notification = await Notification.create({
      userId: currentUser.userId,
      title,
      message,
      type,
      link,
      isRead: false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Notification created successfully.",
        notification,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create notification.",
      },
      { status: 500 }
    );
  }
}