import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import { getCurrentUser } from "@/lib/auth";


// ===============================
// CREATE TASK
// ===============================

export async function POST(request) {
  try {
    await connectDB();

    // Check logged-in user
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

    const {
      title,
      description,
      priority,
      dueDate,
    } = body;

    // Check title
    if (!title || !title.trim()) {
      return Response.json(
        {
          success: false,
          message: "Task title is required",
        },
        { status: 400 }
      );
    }

    // Create task
    const task = await Task.create({
      userId: user.userId,
      title: title.trim(),
      description: description || "",
      priority: priority || "Medium",
      dueDate: dueDate || null,
    });

    return Response.json(
      {
        success: true,
        message: "Task created successfully",
        task,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("CREATE TASK ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to create task",
      },
      { status: 500 }
    );
  }
}


// ===============================
// GET TASKS
// ===============================

export async function GET() {
  try {
    await connectDB();

    // Check logged-in user
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

    // Get only current user's tasks
    const tasks = await Task.find({
      userId: user.userId,
    }).sort({
      createdAt: -1,
    });

    return Response.json({
      success: true,
      tasks,
    });

  } catch (error) {
    console.error("GET TASKS ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch tasks",
      },
      { status: 500 }
    );
  }
}