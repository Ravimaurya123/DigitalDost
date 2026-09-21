import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

import Task from "@/models/Task";
import Reminder from "@/models/Reminder";
import Note from "@/models/Note";
import Document from "@/models/Document";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const userId = user.userId;

    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      totalReminders,
      upcomingReminders,
      totalNotes,
      totalDocuments,
    ] = await Promise.all([
      Task.countDocuments({ userId }),

      Task.countDocuments({
        userId,
        completed: true,
      }),

      Task.countDocuments({
        userId,
        completed: false,
      }),

      Reminder.countDocuments({
        userId,
      }),

      Reminder.countDocuments({
        userId,
        date: {
          $gte: new Date(),
        },
      }),

      Note.countDocuments({
        userId,
      }),

      Document.countDocuments({
        userId,
      }),
    ]);

    const completionPercentage =
      totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    return NextResponse.json({
      success: true,
      analytics: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionPercentage,
        totalReminders,
        upcomingReminders,
        totalNotes,
        totalDocuments,
      },
    });
  } catch (error) {
    console.error("ANALYTICS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load analytics.",
      },
      { status: 500 }
    );
  }
}