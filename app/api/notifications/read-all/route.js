import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const result = await Notification.updateMany(
      {
        userId: currentUser.userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "All notifications marked as read.",
        updatedCount: result.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("MARK ALL NOTIFICATIONS READ ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to mark notifications as read.",
      },
      { status: 500 }
    );
  }
}