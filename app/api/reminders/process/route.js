import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Reminder from "@/models/Reminder";
import User from "@/models/User";
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
    let failed = 0;

    // -----------------------------
    // 4. Process Each Reminder
    // -----------------------------
    for (const reminder of reminders) {
      try {
        // Find the reminder owner
        const user = await User.findById(reminder.userId);

        if (!user) {
          console.error(
            `User not found for reminder: ${reminder._id}`
          );

          // No user means email cannot be sent.
          // Mark as notified so it doesn't retry forever.
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

          // Only mark email sent AFTER successful email
          reminder.emailSent = true;

          emailed++;
        }

        // -----------------------------
        // 6. Mark Notification Complete
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

        // IMPORTANT:
        // Do NOT set notified=true when email fails.
        // Cron can retry it on the next run.
      }
    }

    // -----------------------------
    // 7. Response
    // -----------------------------
    return NextResponse.json(
      {
        success: true,
        message: "Reminder processing completed.",
        found: reminders.length,
        processed,
        emailed,
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