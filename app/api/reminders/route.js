
import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Reminder from "@/models/Reminder";
import {
  cleanString,
  validateRequiredString,
  safeDate,
} from "@/lib/validation";

// datetime-local values are interpreted as Indian Standard Time (IST).
function parseReminderDate(value) {
  if (typeof value !== "string") {
    return safeDate(value);
  }

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/
  );

  // Preserve support for other date formats handled by safeDate.
  if (!match) {
    return safeDate(value);
  }

  const [, y, mo, d, h, mi, s = "0"] = match;

  const year = Number(y);
  const month = Number(mo);
  const day = Number(d);
  const hour = Number(h);
  const minute = Number(mi);
  const second = Number(s);

  // Validate the date and time components before conversion.
  const localAsUTC = new Date(
    Date.UTC(year, month - 1, day, hour, minute, second)
  );

  if (
    localAsUTC.getUTCFullYear() !== year ||
    localAsUTC.getUTCMonth() !== month - 1 ||
    localAsUTC.getUTCDate() !== day ||
    localAsUTC.getUTCHours() !== hour ||
    localAsUTC.getUTCMinutes() !== minute ||
    localAsUTC.getUTCSeconds() !== second
  ) {
    return null;
  }

  // IST = UTC + 5 hours 30 minutes.
  // Convert the selected Indian local time into its UTC timestamp.
  return new Date(
    localAsUTC.getTime() - 330 * 60 * 1000
  );
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        { success: false, message: "Unauthorized" },
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

    const reminderDate = parseReminderDate(body.reminderDate);

    if (!reminderDate || Number.isNaN(reminderDate.getTime())) {
      return Response.json(
        {
          success: false,
          message: "A valid reminder date and time is required.",
        },
        { status: 400 }
      );
    }

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
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const reminders = await Reminder.find({
      userId: user.userId,
    })
      .sort({ reminderDate: 1 })
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
