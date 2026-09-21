import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Reminder from "@/models/Reminder";
import mongoose from "mongoose";

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { success: false, message: "Invalid reminder ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    await connectDB();

    const reminder = await Reminder.findOneAndUpdate(
      {
        _id: id,
        userId: user.userId,
      },
      {
        completed: body.completed,
      },
      {
        new: true,
      }
    );

    if (!reminder) {
      return Response.json(
        { success: false, message: "Reminder not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Reminder updated successfully",
      reminder,
    });
  } catch (error) {
    console.error("UPDATE REMINDER ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update reminder",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { success: false, message: "Invalid reminder ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const reminder = await Reminder.findOneAndDelete({
      _id: id,
      userId: user.userId,
    });

    if (!reminder) {
      return Response.json(
        { success: false, message: "Reminder not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Reminder deleted successfully",
    });
  } catch (error) {
    console.error("DELETE REMINDER ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to delete reminder",
      },
      { status: 500 }
    );
  }
}