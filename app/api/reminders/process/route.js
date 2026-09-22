import connectDB from "@/lib/mongodb";
import Reminder from "@/models/Reminder";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");

    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret) {
      return Response.json(
        {
          success: false,
          message: "CRON_SECRET is not configured.",
        },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${expectedSecret}`) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const now = new Date();

    const dueReminders = await Reminder.find({
      reminderDate: { $lte: now },
      completed: false,
      notified: false,
    }).sort({
      reminderDate: 1,
    });

    if (dueReminders.length === 0) {
      return Response.json({
        success: true,
        message: "No due reminders found.",
        reminders: [],
      });
    }

    const processedReminders = [];

    for (const reminder of dueReminders) {
      reminder.notified = true;

      await reminder.save();

      processedReminders.push({
        id: reminder._id,
        userId: reminder.userId,
        title: reminder.title,
        description: reminder.description,
        reminderDate: reminder.reminderDate,
        emailNotification: reminder.emailNotification,
        emailSent: reminder.emailSent,
      });
    }

    return Response.json({
      success: true,
      message: `${processedReminders.length} reminder(s) processed.`,
      reminders: processedReminders,
    });
  } catch (error) {
    console.error("CRON REMINDER ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to process reminders.",
      },
      { status: 500 }
    );
  }
}