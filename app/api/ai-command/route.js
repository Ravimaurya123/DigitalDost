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
    // CURRENT DATE
    // ==========================================

    const currentDate = new Date().toISOString();

    // ==========================================
    // AI COMMAND PARSER
    // ==========================================

    const prompt = `
You are the command parser for DigitalDost.

Understand the user's natural language command.

Supported actions:

CREATE:
1. create_task
2. create_reminder
3. create_note

UPDATE:
4. update_task
5. update_reminder
6. update_note

DELETE:
7. delete_task
8. delete_reminder
9. delete_note

COMPLETE:
10. complete_task
11. complete_reminder

SEARCH:
12. search_tasks
13. search_reminders
14. search_notes

Return ONLY valid JSON.

==========================================
CREATE TASK
==========================================

{
  "action": "create_task",
  "title": "Complete DSA",
  "description": "",
  "priority": "Medium",
  "dueDate": null
}

==========================================
CREATE REMINDER
==========================================

{
  "action": "create_reminder",
  "title": "Study Java",
  "description": "",
  "reminderDate": "2026-09-22T10:00:00.000Z"
}

==========================================
CREATE NOTE
==========================================

{
  "action": "create_note",
  "title": "DigitalDost",
  "content": "Project information"
}

==========================================
UPDATE TASK
==========================================

{
  "action": "update_task",
  "search": "DSA",
  "title": null,
  "description": null,
  "priority": "High",
  "dueDate": null
}

==========================================
UPDATE REMINDER
==========================================

{
  "action": "update_reminder",
  "search": "Java",
  "title": null,
  "description": null,
  "reminderDate": "2026-09-22T10:00:00.000Z"
}

==========================================
UPDATE NOTE
==========================================

{
  "action": "update_note",
  "search": "DigitalDost",
  "title": null,
  "content": "Updated project information"
}

==========================================
DELETE
==========================================

For deleting a task:

{
  "action": "delete_task",
  "search": "DSA"
}

For deleting a reminder:

{
  "action": "delete_reminder",
  "search": "Java"
}

For deleting a note:

{
  "action": "delete_note",
  "search": "DigitalDost"
}

==========================================
COMPLETE
==========================================

For completing a task:

{
  "action": "complete_task",
  "search": "DSA"
}

For completing a reminder:

{
  "action": "complete_reminder",
  "search": "Java"
}

==========================================
SEARCH
==========================================

For tasks:

{
  "action": "search_tasks",
  "search": "DSA"
}

For reminders:

{
  "action": "search_reminders",
  "search": "Java"
}

For notes:

{
  "action": "search_notes",
  "search": "DigitalDost"
}

==========================================
IMPORTANT RULES
==========================================

- Use the user's exact intention.
- Keep search short and meaningful.
- Never invent database IDs.
- Search should use words from the user's command.
- Priority must be Low, Medium or High.
- If priority is not mentioned, use Medium.
- If no date is mentioned, use null.
- For dates use valid ISO date strings.
- "today" means today's date.
- "tomorrow" means tomorrow's date.
- "yesterday" means yesterday's date.
- If a reminder date has no time, use 9:00 AM.
- If a task date has no time, use 11:59 PM.
- Return ONLY JSON.
- No markdown.
- No explanation.

Current date and time:
${currentDate}

User command:
${command}
`;

    // ==========================================
    // ASK AI
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
    // DATABASE
    // ==========================================

    await connectDB();

    // ==========================================
    // CREATE TASK
    // ==========================================

    if (parsedCommand.action === "create_task") {
      if (!parsedCommand.title?.trim()) {
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

      let dueDate = null;

      if (parsedCommand.dueDate) {
        const date = new Date(
          parsedCommand.dueDate
        );

        if (!isNaN(date.getTime())) {
          dueDate = date;
        }
      }

      const priority = [
        "Low",
        "Medium",
        "High",
      ].includes(parsedCommand.priority)
        ? parsedCommand.priority
        : "Medium";

      const task = await Task.create({
        userId: user.userId,
        title: parsedCommand.title.trim(),
        description:
          parsedCommand.description?.trim() || "",
        priority,
        dueDate,
        completed: false,
      });

      return Response.json({
        success: true,
        message: `Task "${task.title}" created successfully.`,
        type: "task",
      });
    }

    // ==========================================
    // CREATE REMINDER
    // ==========================================

    if (
      parsedCommand.action ===
      "create_reminder"
    ) {
      if (!parsedCommand.title?.trim()) {
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

      const reminder =
        await Reminder.create({
          userId: user.userId,
          title: parsedCommand.title.trim(),
          description:
            parsedCommand.description?.trim() || "",
          reminderDate,
          completed: false,
        });

      return Response.json({
        success: true,
        message: `Reminder "${reminder.title}" created successfully.`,
        type: "reminder",
      });
    }

    // ==========================================
    // CREATE NOTE
    // ==========================================

    if (
      parsedCommand.action ===
      "create_note"
    ) {
      if (!parsedCommand.title?.trim()) {
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

      if (!parsedCommand.content?.trim()) {
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

      const note = await Note.create({
        userId: user.userId,
        title: parsedCommand.title.trim(),
        content:
          parsedCommand.content.trim(),
      });

      return Response.json({
        success: true,
        message: `Note "${note.title}" created successfully.`,
        type: "note",
      });
    }

    // ==========================================
    // FIND TASK
    // ==========================================

    if (
      parsedCommand.action ===
        "update_task" ||
      parsedCommand.action ===
        "delete_task" ||
      parsedCommand.action ===
        "complete_task"
    ) {
      if (!parsedCommand.search?.trim()) {
        return Response.json(
          {
            success: false,
            message:
              "Please specify which task.",
          },
          {
            status: 400,
          }
        );
      }

      const task = await Task.findOne({
        userId: user.userId,
        title: {
          $regex: parsedCommand.search.trim(),
          $options: "i",
        },
      }).sort({
        createdAt: -1,
      });

      if (!task) {
        return Response.json(
          {
            success: false,
            message:
              "Task not found.",
          },
          {
            status: 404,
          }
        );
      }

      // COMPLETE TASK

      if (
        parsedCommand.action ===
        "complete_task"
      ) {
        task.completed = true;

        await task.save();

        return Response.json({
          success: true,
          message: `Task "${task.title}" completed successfully.`,
          type: "task",
        });
      }

      // DELETE TASK

      if (
        parsedCommand.action ===
        "delete_task"
      ) {
        const title = task.title;

        await Task.deleteOne({
          _id: task._id,
        });

        return Response.json({
          success: true,
          message: `Task "${title}" deleted successfully.`,
          type: "task",
        });
      }

      // UPDATE TASK

      if (parsedCommand.title?.trim()) {
        task.title =
          parsedCommand.title.trim();
      }

      if (
        parsedCommand.description !== null &&
        parsedCommand.description !== undefined
      ) {
        task.description =
          parsedCommand.description.trim();
      }

      if (
        ["Low", "Medium", "High"].includes(
          parsedCommand.priority
        )
      ) {
        task.priority =
          parsedCommand.priority;
      }

      if (parsedCommand.dueDate) {
        const date = new Date(
          parsedCommand.dueDate
        );

        if (!isNaN(date.getTime())) {
          task.dueDate = date;
        }
      }

      await task.save();

      return Response.json({
        success: true,
        message: `Task "${task.title}" updated successfully.`,
        type: "task",
      });
    }

    // ==========================================
    // FIND REMINDER
    // ==========================================

    if (
      parsedCommand.action ===
        "update_reminder" ||
      parsedCommand.action ===
        "delete_reminder" ||
      parsedCommand.action ===
        "complete_reminder"
    ) {
      if (!parsedCommand.search?.trim()) {
        return Response.json(
          {
            success: false,
            message:
              "Please specify which reminder.",
          },
          {
            status: 400,
          }
        );
      }

      const reminder =
        await Reminder.findOne({
          userId: user.userId,
          title: {
            $regex:
              parsedCommand.search.trim(),
            $options: "i",
          },
        }).sort({
          createdAt: -1,
        });

      if (!reminder) {
        return Response.json(
          {
            success: false,
            message:
              "Reminder not found.",
          },
          {
            status: 404,
          }
        );
      }

      // COMPLETE REMINDER

      if (
        parsedCommand.action ===
        "complete_reminder"
      ) {
        reminder.completed = true;

        await reminder.save();

        return Response.json({
          success: true,
          message: `Reminder "${reminder.title}" completed successfully.`,
          type: "reminder",
        });
      }

      // DELETE REMINDER

      if (
        parsedCommand.action ===
        "delete_reminder"
      ) {
        const title = reminder.title;

        await Reminder.deleteOne({
          _id: reminder._id,
        });

        return Response.json({
          success: true,
          message: `Reminder "${title}" deleted successfully.`,
          type: "reminder",
        });
      }

      // UPDATE REMINDER

      if (parsedCommand.title?.trim()) {
        reminder.title =
          parsedCommand.title.trim();
      }

      if (
        parsedCommand.description !== null &&
        parsedCommand.description !== undefined
      ) {
        reminder.description =
          parsedCommand.description.trim();
      }

      if (parsedCommand.reminderDate) {
        const date = new Date(
          parsedCommand.reminderDate
        );

        if (!isNaN(date.getTime())) {
          reminder.reminderDate = date;
        }
      }

      await reminder.save();

      return Response.json({
        success: true,
        message: `Reminder "${reminder.title}" updated successfully.`,
        type: "reminder",
      });
    }

    // ==========================================
    // UPDATE / DELETE NOTE
    // ==========================================

    if (
      parsedCommand.action ===
        "update_note" ||
      parsedCommand.action ===
        "delete_note"
    ) {
      if (!parsedCommand.search?.trim()) {
        return Response.json(
          {
            success: false,
            message:
              "Please specify which note.",
          },
          {
            status: 400
          }
        );
      }

      const note = await Note.findOne({
        userId: user.userId,
        title: {
          $regex:
            parsedCommand.search.trim(),
          $options: "i",
        },
      }).sort({
        createdAt: -1,
      });

      if (!note) {
        return Response.json(
          {
            success: false,
            message: "Note not found.",
          },
          {
            status: 404,
          }
        );
      }

      // DELETE NOTE

      if (
        parsedCommand.action ===
        "delete_note"
      ) {
        const title = note.title;

        await Note.deleteOne({
          _id: note._id,
        });

        return Response.json({
          success: true,
          message: `Note "${title}" deleted successfully.`,
          type: "note",
        });
      }

      // UPDATE NOTE

      if (parsedCommand.title?.trim()) {
        note.title =
          parsedCommand.title.trim();
      }

      if (parsedCommand.content?.trim()) {
        note.content =
          parsedCommand.content.trim();
      }

      await note.save();

      return Response.json({
        success: true,
        message: `Note "${note.title}" updated successfully.`,
        type: "note",
      });
    }

    // ==========================================
    // SEARCH TASKS
    // ==========================================

    if (
      parsedCommand.action ===
      "search_tasks"
    ) {
      const search =
        parsedCommand.search?.trim() || "";

      const query = {
        userId: user.userId,
      };

      if (search) {
        query.title = {
          $regex: search,
          $options: "i",
        };
      }

      const tasks = await Task.find(query)
        .sort({
          createdAt: -1,
        })
        .limit(10)
        .lean();

      return Response.json({
        success: true,
        message:
          tasks.length > 0
            ? `Found ${tasks.length} task(s).`
            : "No tasks found.",
        type: "search",
        results: tasks,
      });
    }

    // ==========================================
    // SEARCH REMINDERS
    // ==========================================

    if (
      parsedCommand.action ===
      "search_reminders"
    ) {
      const search =
        parsedCommand.search?.trim() || "";

      const query = {
        userId: user.userId,
      };

      if (search) {
        query.title = {
          $regex: search,
          $options: "i",
        };
      }

      const reminders =
        await Reminder.find(query)
          .sort({
            reminderDate: 1,
          })
          .limit(10)
          .lean();

      return Response.json({
        success: true,
        message:
          reminders.length > 0
            ? `Found ${reminders.length} reminder(s).`
            : "No reminders found.",
        type: "search",
        results: reminders,
      });
    }

    // ==========================================
    // SEARCH NOTES
    // ==========================================

    if (
      parsedCommand.action ===
      "search_notes"
    ) {
      const search =
        parsedCommand.search?.trim() || "";

      const query = {
        userId: user.userId,
      };

      if (search) {
        query.$or = [
          {
            title: {
              $regex: search,
              $options: "i",
            },
          },
          {
            content: {
              $regex: search,
              $options: "i",
            },
          },
        ];
      }

      const notes = await Note.find(query)
        .sort({
          createdAt: -1,
        })
        .limit(10)
        .lean();

      return Response.json({
        success: true,
        message:
          notes.length > 0
            ? `Found ${notes.length} note(s).`
            : "No notes found.",
        type: "search",
        results: notes,
      });
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