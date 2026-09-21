import connectDB from "@/lib/mongodb";
import Note from "@/models/Note";
import { getCurrentUser } from "@/lib/auth";

// CREATE NOTE
export async function POST(request) {
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

    const body = await request.json();

    const { title, content } = body;

    if (!title || !title.trim()) {
      return Response.json(
        {
          success: false,
          message: "Note title is required",
        },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return Response.json(
        {
          success: false,
          message: "Note content is required",
        },
        { status: 400 }
      );
    }

    const note = await Note.create({
      userId: user.userId,
      title: title.trim(),
      content: content.trim(),
    });

    return Response.json(
      {
        success: true,
        message: "Note created successfully",
        note,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE NOTE ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to create note",
      },
      { status: 500 }
    );
  }
}

// GET NOTES
export async function GET() {
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

    const notes = await Note.find({
      userId: user.userId,
    }).sort({
      createdAt: -1,
    });

    return Response.json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error("GET NOTES ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch notes",
      },
      { status: 500 }
    );
  }
}