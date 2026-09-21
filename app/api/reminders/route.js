import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Reminder from "@/models/Reminder";

export async function POST(request) {
  try {
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

    const { title, description, reminderDate } = body;

    if (!title || !reminderDate) {
      return Response.json(
        {
          success: false,
          message: "Title and reminder date are required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const reminder = await Reminder.create({
      userId: user.userId,
      title,
      description: description || "",
      reminderDate,
    });

    return Response.json(
      {
        success: true,
        message: "Reminder created successfully",
        reminder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE REMINDER ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to create reminder",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
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

    await connectDB();

    const reminders = await Reminder.find({
      userId: user.userId,
    }).sort({
      reminderDate: 1,
    });

    return Response.json({
      success: true,
      reminders,
    });
  } catch (error) {
    console.error("GET REMINDERS ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch reminders",
      },
      { status: 500 }
    );
  }
}