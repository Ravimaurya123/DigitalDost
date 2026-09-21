import connectDB from "@/lib/mongodb";
import Note from "@/models/Note";
import { getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";

// UPDATE NOTE
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
          message: "Invalid note ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const updateData = {};

    if (body.title !== undefined) {
      if (!body.title.trim()) {
        return Response.json(
          {
            success: false,
            message: "Note title is required",
          },
          { status: 400 }
        );
      }

      updateData.title = body.title.trim();
    }

    if (body.content !== undefined) {
      if (!body.content.trim()) {
        return Response.json(
          {
            success: false,
            message: "Note content is required",
          },
          { status: 400 }
        );
      }

      updateData.content = body.content.trim();
    }

    const note = await Note.findOneAndUpdate(
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

    if (!note) {
      return Response.json(
        {
          success: false,
          message: "Note not found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    console.error("UPDATE NOTE ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update note",
      },
      { status: 500 }
    );
  }
}

// DELETE NOTE
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
          message: "Invalid note ID",
        },
        { status: 400 }
      );
    }

    const note = await Note.findOneAndDelete({
      _id: id,
      userId: user.userId,
    });

    if (!note) {
      return Response.json(
        {
          success: false,
          message: "Note not found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("DELETE NOTE ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to delete note",
      },
      { status: 500 }
    );
  }
}