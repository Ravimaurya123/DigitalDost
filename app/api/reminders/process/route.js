import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Reminder from "@/models/Reminder";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { sendReminderEmail } from "@/lib/email";

export async function GET(request) {
  try {
    // -----------------------------
    // 1. Check Cron Secret
    // -----------------------------
    const authHeader = request.headers.get("authorization");

    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (
      !process.env.CRON_SECRET ||
      authHeader !== expectedAuth
    ) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // -----------------------------
    // 2. Connect Database
    // -----------------------------
    await connectDB();

    const now = new Date();

    // -----------------------------
    // 3. Find Due Reminders
    // -----------------------------
    const reminders = await Reminder.find({
      reminderDate: { $lte: now },
      completed: false,
      notified: false,
    }).sort({
      reminderDate: 1,
    });

    let processed = 0;
    let emailed = 0;
    let notificationsCreated = 0;
    let failed = 0;

    // -----------------------------
    // 4. Process Each Reminder
    // -----------------------------
    for (const reminder of reminders) {
      try {
        // Find reminder owner
        const user = await User.findById(reminder.userId);

        if (!user) {
          console.error(
            `User not found for reminder: ${reminder._id}`
          );

          reminder.notified = true;
          await reminder.save();

          processed++;
          continue;
        }

        // -----------------------------
        // 5. Send Email
        // -----------------------------
        if (
          reminder.emailNotification !== false &&
          !reminder.emailSent
        ) {
          await sendReminderEmail({
            to: user.email,
            title: reminder.title,
            description: reminder.description || "",
            reminderDate: reminder.reminderDate,
          });

          reminder.emailSent = true;

          emailed++;
        }

        // -----------------------------
        // 6. Create In-App Notification
        // -----------------------------
        await Notification.create({
          userId: reminder.userId,
          title: "Reminder Due 🔔",
          message: reminder.description
            ? `${reminder.title} — ${reminder.description}`
            : reminder.title,
          type: "reminder",
          link: "/reminders",
        });

        notificationsCreated++;

        // -----------------------------
        // 7. Mark Reminder Processed
        // -----------------------------
        reminder.notified = true;

        await reminder.save();

        processed++;
      } catch (error) {
        failed++;

        console.error(
          `Reminder processing failed for ${reminder._id}:`,
          error
        );

        // Do not mark notified=true on failure.
        // Cron can retry on the next run.
      }
    }

    // -----------------------------
    // 8. Response
    // -----------------------------
    return NextResponse.json(
      {
        success: true,
        message: "Reminder processing completed.",
        found: reminders.length,
        processed,
        emailed,
        notificationsCreated,
        failed,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "REMINDER PROCESS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to process reminders.",
      },
      { status: 500 }
    );
  }
}