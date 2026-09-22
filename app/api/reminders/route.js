import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Reminder from "@/models/Reminder";
import {
  cleanString,
  validateRequiredString,
  safeDate,
} from "@/lib/validation";

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

    const titleValidation = validateRequiredString(
      body.title,
      "Title",
      200
    );

    if (!titleValidation.valid) {
      return Response.json(
        {
          success: false,
          message: titleValidation.message,
        },
        { status: 400 }
      );
    }

    const description = cleanString(body.description || "");

    if (description.length > 1000) {
      return Response.json(
        {
          success: false,
          message: "Description must be less than 1000 characters.",
        },
        { status: 400 }
      );
    }

    const reminderDate = safeDate(body.reminderDate);

    if (!reminderDate) {
      return Response.json(
        {
          success: false,
          message: "A valid reminder date is required.",
        },
        { status: 400 }
      );
    }

    // Prevent creating reminders with an invalid/expired date.
    if (reminderDate.getTime() <= Date.now()) {
      return Response.json(
        {
          success: false,
          message: "Reminder date must be in the future.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const reminder = await Reminder.create({
      userId: user.userId,
      title: titleValidation.value,
      description,
      reminderDate,
      completed: false,
      notified: false,
      emailSent: false,
      emailNotification:
        typeof body.emailNotification === "boolean"
          ? body.emailNotification
          : true,
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
    })
      .sort({
        reminderDate: 1,
      })
      .lean();

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