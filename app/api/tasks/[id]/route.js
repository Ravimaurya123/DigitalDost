import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import { getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";

// UPDATE TASK
export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid task ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const updateData = {};

    if (typeof body.completed === "boolean") {
      updateData.completed = body.completed;
    }

    if (body.title !== undefined) {
      updateData.title = body.title.trim();
    }

    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    if (body.priority !== undefined) {
      updateData.priority = body.priority;
    }

    if (body.dueDate !== undefined) {
      updateData.dueDate = body.dueDate || null;
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: id,
        userId: user.userId,
      },
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!task) {
      return Response.json(
        {
          success: false,
          message: "Task not found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update task",
      },
      { status: 500 }
    );
  }
}

// DELETE TASK
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid task ID",
        },
        { status: 400 }
      );
    }

    const task = await Task.findOneAndDelete({
      _id: id,
      userId: user.userId,
    });

    if (!task) {
      return Response.json(
        {
          success: false,
          message: "Task not found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to delete task",
      },
      { status: 500 }
    );
  }
}