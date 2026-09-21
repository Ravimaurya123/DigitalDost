import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

import Task from "@/models/Task";
import Reminder from "@/models/Reminder";

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const plan = body.plan;

    if (!plan || typeof plan !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid plan.",
        },
        { status: 400 }
      );
    }

    const tasks = Array.isArray(plan.tasks) ? plan.tasks : [];
    const reminders = Array.isArray(plan.reminders)
      ? plan.reminders
      : [];

    if (tasks.length === 0 && reminders.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "There are no tasks or reminders to save.",
        },
        { status: 400 }
      );
    }

    if (tasks.length > 20 || reminders.length > 20) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many tasks or reminders.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // -----------------------------
    // CREATE TASKS
    // -----------------------------

    const validPriorities = ["Low", "Medium", "High"];

    const taskData = tasks
      .filter((task) => task?.title?.trim())
      .map((task) => ({
        userId: user.userId,
        title: task.title.trim().slice(0, 200),
        description: String(task.description || "")
          .trim()
          .slice(0, 1000),
        priority: validPriorities.includes(task.priority)
          ? task.priority
          : "Medium",
        completed: false,
      }));

    // -----------------------------
    // CREATE REMINDERS
    // -----------------------------

    const reminderData = reminders
      .filter((reminder) => reminder?.title?.trim())
      .map((reminder) => {
        let reminderDate = null;

        if (reminder.date) {
          const parsedDate = new Date(
            `${reminder.date}T${
              reminder.time || "09:00"
            }:00`
          );

          if (!Number.isNaN(parsedDate.getTime())) {
            reminderDate = parsedDate;
          }
        }

        return {
          userId: user.userId,
          title: reminder.title.trim().slice(0, 200),
          description: String(reminder.description || "")
            .trim()
            .slice(0, 1000),
          date: reminderDate,
          time: reminder.time || "",
          completed: false,
        };
      })
      .filter((reminder) => reminder.date);

    const [createdTasks, createdReminders] =
      await Promise.all([
        taskData.length > 0
          ? Task.insertMany(taskData)
          : [],

        reminderData.length > 0
          ? Reminder.insertMany(reminderData)
          : [],
      ]);

    return NextResponse.json({
      success: true,
      message: "AI plan added successfully.",
      created: {
        tasks: createdTasks.length,
        reminders: createdReminders.length,
      },
    });
  } catch (error) {
    console.error("SAVE AI PLAN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save AI plan.",
      },
      { status: 500 }
    );
  }
}