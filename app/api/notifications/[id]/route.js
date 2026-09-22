import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getCurrentUser } from "@/lib/auth";
import { isValidObjectId } from "@/lib/validation";

export async function PATCH(request, { params }) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid notification ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const body = await request.json();

    const notification = await Notification.findOne({
      _id: id,
      userId: currentUser.userId,
    });

    if (!notification) {
      return NextResponse.json(
        { message: "Notification not found." },
        { status: 404 }
      );
    }

    if (body?.isRead !== undefined) {
      if (typeof body.isRead !== "boolean") {
        return NextResponse.json(
          { message: "isRead must be true or false." },
          { status: 400 }
        );
      }

      notification.isRead = body.isRead;
    }

    await notification.save();

    return NextResponse.json(
      {
        success: true,
        message: notification.isRead
          ? "Notification marked as read."
          : "Notification marked as unread.",
        notification,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE NOTIFICATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update notification.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid notification ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: currentUser.userId,
    });

    if (!notification) {
      return NextResponse.json(
        { message: "Notification not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Notification deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete notification.",
      },
      { status: 500 }
    );
  }
}