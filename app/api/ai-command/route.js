import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

import Task from "@/models/Task";
import Reminder from "@/models/Reminder";
import Note from "@/models/Note";

import { askAI } from "@/lib/ai";

export async function POST(request) {
  try {
    // ==========================================
    // CHECK LOGIN
    // ==========================================

    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // ==========================================
    // GET COMMAND
    // ==========================================

    const body = await request.json();

    const command = body.command?.trim();

    if (!command) {
      return Response.json(
        {
          success: false,
          message: "Command is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // CURRENT DATE & TIME
    // ==========================================

    const now = new Date();

    const currentDate = now.toISOString();

    // ==========================================
    // AI COMMAND PARSER
    // ==========================================

    const prompt = `
You are the command parser for DigitalDost.

Your job is to understand the user's natural language command.

Supported actions:

1. create_task
2. create_reminder
3. create_note

Return ONLY valid JSON.

==========================================
CREATE TASK
==========================================

Example:

{
  "action": "create_task",
  "title": "Complete DSA",
  "description": "",
  "priority": "Medium",
  "dueDate": "2026-09-21T23:59:00.000Z"
}

==========================================
CREATE REMINDER
==========================================

Example:

{
  "action": "create_reminder",
  "title": "Study Java",
  "description": "",
  "reminderDate": "2026-09-22T10:00:00.000Z"
}

==========================================
CREATE NOTE
==========================================

Example:

{
  "action": "create_note",
  "title": "DigitalDost Project",
  "content": "Project idea and features"
}

==========================================
IMPORTANT RULES
==========================================

TASK:

- "add a task", "create a task", "make a task" => create_task
- If user mentions today, tomorrow or a specific date, calculate dueDate.
- If no date is mentioned, set dueDate to null.
- Priority must be one of:
  Low
  Medium
  High
- If priority is not mentioned, use Medium.

REMINDER:

- "remind me", "set reminder", "create reminder" => create_reminder
- If user gives a date and/or time, calculate reminderDate.
- If user says "tomorrow", use tomorrow's date.
- If user says "today", use today's date.
- If user gives a time such as 10 AM, 6 PM or 18:30, use that time.
- If no exact time is given but a reminder date is given, use 9:00 AM.
- reminderDate MUST be a valid ISO date string.

NOTE:

- "create a note", "write a note", "save a note" => create_note
- Put the actual information in content.

DATE RULES:

Current date and time:
${currentDate}

Use the current date above to understand:
- today
- tomorrow
- yesterday
- specific dates

Do not invent dates.

Return ONLY JSON.

No markdown.
No explanation.
No extra text.

User command:
${command}
`;

    // ==========================================
    // ASK GEMINI
    // ==========================================

    const aiResponse = await askAI(prompt);

    // ==========================================
    // PARSE AI RESPONSE
    // ==========================================

    let parsedCommand;

    try {
      let cleanedResponse = aiResponse.trim();

      if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse
          .replace(/^```json/i, "")
          .replace(/^```/i, "")
          .replace(/```$/i, "")
          .trim();
      }

      parsedCommand = JSON.parse(cleanedResponse);
    } catch (error) {
      console.error(
        "AI COMMAND JSON ERROR:",
        error
      );

      console.error(
        "AI RESPONSE:",
        aiResponse
      );

      return Response.json(
        {
          success: false,
          message:
            "I could not understand that command.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // CONNECT DATABASE
    // ==========================================

    await connectDB();

    // ==========================================
    // CREATE TASK
    // ==========================================

    if (parsedCommand.action === "create_task") {
      if (
        !parsedCommand.title ||
        !parsedCommand.title.trim()
      ) {
        return Response.json(
          {
            success: false,
            message: "Task title is required.",
          },
          {
            status: 400,
          }
        );
      }

      // ------------------------------
      // PRIORITY
      // ------------------------------

      let priority = "Medium";

      if (
        ["Low", "Medium", "High"].includes(
          parsedCommand.priority
        )
      ) {
        priority = parsedCommand.priority;
      }

      // ------------------------------
      // DUE DATE
      // ------------------------------

      let dueDate = null;

      if (parsedCommand.dueDate) {
        const parsedDate = new Date(
          parsedCommand.dueDate
        );

        if (!isNaN(parsedDate.getTime())) {
          dueDate = parsedDate;
        }
      }

      // ------------------------------
      // CREATE TASK
      // ------------------------------

      const task = await Task.create({
        userId: user.userId,

        title: parsedCommand.title.trim(),

        description:
          parsedCommand.description?.trim() || "",

        priority,

        dueDate,

        completed: false,
      });

      return Response.json(
        {
          success: true,

          message: `Task "${task.title}" created successfully.`,

          type: "task",

          task: {
            id: task._id,
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate,
            completed: task.completed,
          },
        },
        {
          status: 201,
        }
      );
    }

    // ==========================================
    // CREATE REMINDER
    // ==========================================

    if (
      parsedCommand.action ===
      "create_reminder"
    ) {
      if (
        !parsedCommand.title ||
        !parsedCommand.title.trim()
      ) {
        return Response.json(
          {
            success: false,
            message:
              "Reminder title is required.",
          },
          {
            status: 400,
          }
        );
      }

      if (!parsedCommand.reminderDate) {
        return Response.json(
          {
            success: false,
            message:
              "Reminder date and time are required.",
          },
          {
            status: 400,
          }
        );
      }

      // ------------------------------
      // PARSE REMINDER DATE
      // ------------------------------

      const reminderDate = new Date(
        parsedCommand.reminderDate
      );

      if (isNaN(reminderDate.getTime())) {
        return Response.json(
          {
            success: false,
            message:
              "Invalid reminder date.",
          },
          {
            status: 400,
          }
        );
      }

      // ------------------------------
      // CREATE REMINDER
      // ------------------------------

      const reminder =
        await Reminder.create({
          userId: user.userId,

          title: parsedCommand.title.trim(),

          description:
            parsedCommand.description?.trim() || "",

          reminderDate,

          completed: false,
        });

      return Response.json(
        {
          success: true,

          message: `Reminder "${reminder.title}" created successfully.`,

          type: "reminder",

          reminder: {
            id: reminder._id,
            title: reminder.title,
            description:
              reminder.description,
            reminderDate:
              reminder.reminderDate,
            completed:
              reminder.completed,
          },
        },
        {
          status: 201,
        }
      );
    }

    // ==========================================
    // CREATE NOTE
    // ==========================================

    if (
      parsedCommand.action ===
      "create_note"
    ) {
      if (
        !parsedCommand.title ||
        !parsedCommand.title.trim()
      ) {
        return Response.json(
          {
            success: false,
            message: "Note title is required.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        !parsedCommand.content ||
        !parsedCommand.content.trim()
      ) {
        return Response.json(
          {
            success: false,
            message: "Note content is required.",
          },
          {
            status: 400,
          }
        );
      }

      // ------------------------------
      // CREATE NOTE
      // ------------------------------

      const note = await Note.create({
        userId: user.userId,

        title: parsedCommand.title.trim(),

        content:
          parsedCommand.content.trim(),
      });

      return Response.json(
        {
          success: true,

          message: `Note "${note.title}" created successfully.`,

          type: "note",

          note: {
            id: note._id,
            title: note.title,
            content: note.content,
          },
        },
        {
          status: 201,
        }
      );
    }

    // ==========================================
    // UNKNOWN ACTION
    // ==========================================

    return Response.json(
      {
        success: false,

        message:
          "This command is not supported yet.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "AI COMMAND API ERROR:",
      error
    );

    return Response.json(
      {
        success: false,

        message:
          "Failed to process AI command.",
      },
      {
        status: 500,
      }
    );
  }
}