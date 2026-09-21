import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

import Task from "@/models/Task";
import Reminder from "@/models/Reminder";
import Note from "@/models/Note";
import AICommand from "@/models/AICommand";

import { askAI } from "@/lib/ai";
import jwt from "jsonwebtoken";

/*
==================================================
DATE HELPER
==================================================
*/

function getDateFromText(dateText) {
  if (!dateText) return null;

  const now = new Date();
  const text = dateText.toLowerCase().trim();

  function applyTime(date) {
    const timeMatch = text.match(
      /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i
    );

    if (timeMatch) {
      let hour = Number(timeMatch[1]);
      const minute = Number(timeMatch[2] || 0);
      const meridiem = timeMatch[3].toLowerCase();

      if (meridiem === "pm" && hour !== 12) {
        hour += 12;
      }

      if (meridiem === "am" && hour === 12) {
        hour = 0;
      }

      date.setHours(hour, minute, 0, 0);
    }

    return date;
  }

  /*
  Day after tomorrow
  */

  if (text.includes("day after tomorrow")) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 2
    );

    return applyTime(date);
  }

  /*
  Tomorrow
  */

  if (text.includes("tomorrow")) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    return applyTime(date);
  }

  /*
  Today
  */

  if (text.includes("today")) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    return applyTime(date);
  }

  /*
  Direct JavaScript date
  */

  const parsedDate = new Date(dateText);

  if (!isNaN(parsedDate.getTime())) {
    return parsedDate;
  }

  return null;
}

/*
==================================================
REGEX HELPER
==================================================
*/

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/*
==================================================
AI HISTORY HELPER
==================================================
*/

async function saveAIHistory({
  userId,
  command,
  action,
  status = "success",
  response = "",
}) {
  try {
    await AICommand.create({
      userId,
      command,
      action,
      status,
      response,
    });
  } catch (error) {
    console.error("AI HISTORY SAVE ERROR:", error);
  }
}

/*
==================================================
CREATE DELETE CONFIRMATION TOKEN
==================================================
*/

function createDeleteConfirmationToken({
  userId,
  action,
  itemId,
}) {
  return jwt.sign(
    {
      type: "delete_confirmation",
      userId: String(userId),
      action,
      itemId: String(itemId),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "5m",
    }
  );
}

/*
==================================================
VERIFY DELETE CONFIRMATION TOKEN
==================================================
*/

function verifyDeleteConfirmationToken(token) {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (
      decoded.type !== "delete_confirmation" ||
      !decoded.userId ||
      !decoded.action ||
      !decoded.itemId
    ) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error(
      "DELETE CONFIRMATION TOKEN ERROR:",
      error
    );

    return null;
  }
}

/*
==================================================
DELETE EXACT ITEM
==================================================
*/

async function deleteExactItem({
  userId,
  action,
  itemId,
}) {
  let deletedItem = null;

  if (action === "delete_task") {
    deletedItem = await Task.findOneAndDelete({
      _id: itemId,
      userId,
    });
  }

  if (action === "delete_reminder") {
    deletedItem = await Reminder.findOneAndDelete({
      _id: itemId,
      userId,
    });
  }

  if (action === "delete_note") {
    deletedItem = await Note.findOneAndDelete({
      _id: itemId,
      userId,
    });
  }

  return deletedItem;
}

/*
==================================================
POST
==================================================
*/

export async function POST(request) {
  let command = "";

  try {
    /*
    ==========================================
    AUTHENTICATION
    ==========================================
    */

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

    /*
    ==========================================
    REQUEST BODY
    ==========================================
    */

    const body = await request.json();

    command = body.command?.trim();

    const confirmed = body.confirmed === true;

    const confirmationToken =
      body.confirmationToken?.trim();

    /*
    ==========================================
    EXACT DELETE CONFIRMATION
    ==========================================
    */

    if (confirmed && confirmationToken) {
      await connectDB();

      const decoded =
        verifyDeleteConfirmationToken(
          confirmationToken
        );

      if (!decoded) {
        return Response.json(
          {
            success: false,
            message:
              "This delete confirmation has expired or is invalid. Please try the delete command again.",
          },
          {
            status: 400,
          }
        );
      }

      /*
      Make sure token belongs to logged-in user
      */

      if (
        String(decoded.userId) !==
        String(user.userId)
      ) {
        return Response.json(
          {
            success: false,
            message:
              "Invalid delete confirmation.",
          },
          {
            status: 403,
          }
        );
      }

      /*
      Only allow delete actions
      */

      const allowedActions = [
        "delete_task",
        "delete_reminder",
        "delete_note",
      ];

      if (
        !allowedActions.includes(decoded.action)
      ) {
        return Response.json(
          {
            success: false,
            message:
              "Invalid delete confirmation action.",
          },
          {
            status: 400,
          }
        );
      }

      /*
      Delete exact identified item
      */

      const deletedItem =
        await deleteExactItem({
          userId: user.userId,
          action: decoded.action,
          itemId: decoded.itemId,
        });

      if (!deletedItem) {
        return Response.json(
          {
            success: false,
            message:
              "The item no longer exists or could not be deleted.",
          },
          {
            status: 404,
          }
        );
      }

      let itemName = "Item";

      if (deletedItem.title) {
        itemName = deletedItem.title;
      }

      const message =
        `${decoded.action.replace(
          "delete_",
          ""
        )} "${itemName}" deleted successfully.`;

      await saveAIHistory({
        userId: user.userId,
        command:
          command ||
          `Confirmed ${decoded.action}`,
        action: decoded.action,
        status: "success",
        response: message,
      });

      return Response.json({
        success: true,
        message,
        results: [
          {
            success: true,
            action: decoded.action,
            message,
          },
        ],
      });
    }

    /*
    ==========================================
    NORMAL COMMAND VALIDATION
    ==========================================
    */

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

    /*
    ==========================================
    DATABASE
    ==========================================
    */

    await connectDB();

    /*
    ==========================================
    AI COMMAND PROMPT
    ==========================================
    */

    const prompt = `
You are DigitalDost AI Command Parser.

Convert the user's natural language command into JSON.

A single user command may contain ONE OR MULTIPLE actions.

Supported actions:

create_task
create_reminder
create_note
update_task
update_reminder
update_note
delete_task
delete_reminder
delete_note
complete_task
complete_reminder
search_tasks
search_reminders
search_notes

IMPORTANT:

Always return an object containing an "actions" array.

Example:

{
  "actions": [
    {
      "action": "create_task",
      "title": "Study Java",
      "description": "",
      "content": "",
      "date": "tomorrow",
      "priority": "Medium",
      "search": ""
    },
    {
      "action": "create_reminder",
      "title": "Study Java",
      "description": "",
      "content": "",
      "date": "tomorrow 7 PM",
      "priority": "Medium",
      "search": ""
    }
  ]
}

Rules:

1. The "actions" array can contain one or multiple actions.

2. For tasks use:
   - title
   - description
   - date
   - priority

3. For reminders use:
   - title
   - description
   - date

4. For notes use:
   - title
   - content

5. Priority must be:
   Low
   Medium
   High

6. If task priority is not mentioned, use Medium.

7. Understand natural language dates:
   - today
   - tomorrow
   - day after tomorrow

8. Understand times:
   - 5 PM
   - 10 AM
   - 6:30 PM
   - tomorrow 7 PM
   - today 10 AM

9. For search commands use:
   - search

10. For update commands:
   - title means the existing item's title.

11. For complete commands:
   - title means the existing item's title.

12. For delete commands:
   - title means the existing item's title.

13. Do not create IDs.

14. Do not add explanations outside JSON.

15. If the user asks for multiple actions, create a separate object inside the actions array for each action.

16. Preserve the user's requested title, description, note content and search text as accurately as possible.

17. Do not merge multiple requested actions into one action.

18. Return ONLY valid JSON.

User command:

${command}
`;

    /*
    ==========================================
    ASK GEMINI
    ==========================================
    */

    let aiResponse;

    try {
      aiResponse = await askAI(prompt);
    } catch (error) {
      console.error(
        "AI COMMAND GEMINI ERROR:",
        error
      );

      const message =
        error?.message ||
        "Gemini AI is currently unavailable.";

      await saveAIHistory({
        userId: user.userId,
        command,
        action: "ai_error",
        status: "failed",
        response: message,
      });

      const isQuotaError =
        error?.status === 429 ||
        message
          .toLowerCase()
          .includes("quota") ||
        message
          .toLowerCase()
          .includes("rate limit") ||
        message
          .toLowerCase()
          .includes("resource_exhausted");

      return Response.json(
        {
          success: false,
          message: isQuotaError
            ? "Gemini API quota has been exceeded. Please try again after the quota resets."
            : message,
        },
        {
          status: isQuotaError ? 429 : 500,
        }
      );
    }

    /*
    ==========================================
    PARSE AI RESPONSE
    ==========================================
    */

    let parsed;

    try {
      if (
        !aiResponse ||
        typeof aiResponse !== "string"
      ) {
        throw new Error(
          "Empty AI response."
        );
      }

      const cleanedResponse =
        aiResponse
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();

      parsed = JSON.parse(
        cleanedResponse
      );
    } catch (error) {
      console.error(
        "AI PARSE ERROR:",
        error
      );

      console.error(
        "AI RESPONSE:",
        aiResponse
      );

      await saveAIHistory({
        userId: user.userId,
        command,
        action: "parse_error",
        status: "failed",
        response:
          "Could not understand the AI response.",
      });

      return Response.json(
        {
          success: false,
          message:
            "Could not understand the command.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    ==========================================
    ACTIONS ARRAY
    ==========================================
    */

    let actions = [];

    /*
    New format
    */

    if (
      Array.isArray(parsed.actions)
    ) {
      actions = parsed.actions;
    }

    /*
    Backward compatibility
    */

    else if (parsed.action) {
      actions = [parsed];
    }

    if (actions.length === 0) {
      await saveAIHistory({
        userId: user.userId,
        command,
        action: "unknown",
        status: "failed",
        response:
          "AI could not identify any command.",
      });

      return Response.json(
        {
          success: false,
          message:
            "AI could not identify the command.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    ==========================================
    RESULTS
    ==========================================
    */

    const results = [];

    /*
    ==========================================
    PROCESS EVERY ACTION
    ==========================================
    */

    for (const item of actions) {
      const action = item.action?.trim();

      if (!action) {
        results.push({
          success: false,
          action: "unknown",
          message: "Invalid action.",
        });

        continue;
      }

      /*
      ========================================
      CREATE TASK
      ========================================
      */

      if (action === "create_task") {
        if (!item.title) {
          results.push({
            success: false,
            action,
            message:
              "Task title is required.",
          });

          continue;
        }

        const dueDate =
          getDateFromText(item.date);

        const task =
          await Task.create({
            userId: user.userId,
            title: item.title,
            description:
              item.description || "",
            priority:
              [
                "Low",
                "Medium",
                "High",
              ].includes(
                item.priority
              )
                ? item.priority
                : "Medium",
            dueDate,
          });

        results.push({
          success: true,
          action,
          message:
            `Task "${task.title}" created successfully.`,
          task,
        });

        continue;
      }

      /*
      ========================================
      CREATE REMINDER
      ========================================
      */

      if (
        action ===
        "create_reminder"
      ) {
        if (!item.title) {
          results.push({
            success: false,
            action,
            message:
              "Reminder title is required.",
          });

          continue;
        }

        const reminderDate =
          getDateFromText(
            item.date
          );

        if (!reminderDate) {
          results.push({
            success: false,
            action,
            message:
              "Please provide a valid reminder date/time.",
          });

          continue;
        }

        const reminder =
          await Reminder.create({
            userId: user.userId,
            title: item.title,
            description:
              item.description || "",
            reminderDate,
          });

        results.push({
          success: true,
          action,
          message:
            `Reminder "${reminder.title}" created successfully.`,
          reminder,
        });

        continue;
      }

      /*
      ========================================
      CREATE NOTE
      ========================================
      */

      if (action === "create_note") {
        if (!item.title) {
          results.push({
            success: false,
            action,
            message:
              "Note title is required.",
          });

          continue;
        }

        const note =
          await Note.create({
            userId: user.userId,
            title: item.title,
            content:
              item.content || "",
          });

        results.push({
          success: true,
          action,
          message:
            `Note "${note.title}" created successfully.`,
          note,
        });

        continue;
      }

      /*
      ========================================
      SEARCH TASKS
      ========================================
      */

      if (
        action ===
        "search_tasks"
      ) {
        const search =
          item.search?.trim();

        if (!search) {
          results.push({
            success: false,
            action,
            message:
              "Please provide something to search.",
          });

          continue;
        }

        const safeSearch =
          escapeRegex(search);

        const tasks =
          await Task.find({
            userId: user.userId,
            title: {
              $regex: safeSearch,
              $options: "i",
            },
          })
            .sort({
              createdAt: -1,
            })
            .limit(20)
            .lean();

        results.push({
          success: true,
          action,
          message:
            `Found ${tasks.length} task(s).`,
          results: tasks,
          resultType: "tasks",
        });

        continue;
      }

      /*
      ========================================
      SEARCH REMINDERS
      ========================================
      */

      if (
        action ===
        "search_reminders"
      ) {
        const search =
          item.search?.trim();

        if (!search) {
          results.push({
            success: false,
            action,
            message:
              "Please provide something to search.",
          });

          continue;
        }

        const safeSearch =
          escapeRegex(search);

        const reminders =
          await Reminder.find({
            userId: user.userId,
            title: {
              $regex: safeSearch,
              $options: "i",
            },
          })
            .sort({
              createdAt: -1,
            })
            .limit(20)
            .lean();

        results.push({
          success: true,
          action,
          message:
            `Found ${reminders.length} reminder(s).`,
          results: reminders,
          resultType:
            "reminders",
        });

        continue;
      }

      /*
      ========================================
      SEARCH NOTES
      ========================================
      */

      if (
        action ===
        "search_notes"
      ) {
        const search =
          item.search?.trim();

        if (!search) {
          results.push({
            success: false,
            action,
            message:
              "Please provide something to search.",
          });

          continue;
        }

        const safeSearch =
          escapeRegex(search);

        const notes =
          await Note.find({
            userId: user.userId,
            $or: [
              {
                title: {
                  $regex:
                    safeSearch,
                  $options: "i",
                },
              },
              {
                content: {
                  $regex:
                    safeSearch,
                  $options: "i",
                },
              },
            ],
          })
            .sort({
              createdAt: -1,
            })
            .limit(20)
            .lean();

        results.push({
          success: true,
          action,
          message:
            `Found ${notes.length} note(s).`,
          results: notes,
          resultType: "notes",
        });

        continue;
      }

      /*
      ========================================
      COMPLETE TASK
      ========================================
      */

      if (
        action ===
        "complete_task"
      ) {
        if (!item.title) {
          results.push({
            success: false,
            action,
            message:
              "Task title is required.",
          });

          continue;
        }

        const safeTitle =
          escapeRegex(item.title);

        const task =
          await Task.findOneAndUpdate(
            {
              userId: user.userId,
              title: {
                $regex:
                  `^${safeTitle}$`,
                $options: "i",
              },
            },
            {
              completed: true,
            },
            {
              new: true,
            }
          );

        if (!task) {
          results.push({
            success: false,
            action,
            message:
              `Task "${item.title}" not found.`,
          });

          continue;
        }

        results.push({
          success: true,
          action,
          message:
            `Task "${task.title}" marked as completed.`,
          task,
        });

        continue;
      }

      /*
      ========================================
      COMPLETE REMINDER
      ========================================
      */

      if (
        action ===
        "complete_reminder"
      ) {
        if (!item.title) {
          results.push({
            success: false,
            action,
            message:
              "Reminder title is required.",
          });

          continue;
        }

        const safeTitle =
          escapeRegex(item.title);

        const reminder =
          await Reminder.findOneAndUpdate(
            {
              userId: user.userId,
              title: {
                $regex:
                  `^${safeTitle}$`,
                $options: "i",
              },
            },
            {
              completed: true,
            },
            {
              new: true,
            }
          );

        if (!reminder) {
          results.push({
            success: false,
            action,
            message:
              `Reminder "${item.title}" not found.`,
          });

          continue;
        }

        results.push({
          success: true,
          action,
          message:
            `Reminder "${reminder.title}" marked as completed.`,
          reminder,
        });

        continue;
      }

      /*
      ========================================
      UPDATE TASK
      ========================================
      */

      if (
        action ===
        "update_task"
      ) {
        if (!item.title) {
          results.push({
            success: false,
            action,
            message:
              "Task title is required.",
          });

          continue;
        }

        const updateData = {};

        if (item.description) {
          updateData.description =
            item.description;
        }

        if (
          [
            "Low",
            "Medium",
            "High",
          ].includes(
            item.priority
          )
        ) {
          updateData.priority =
            item.priority;
        }

        if (item.date) {
          const dueDate =
            getDateFromText(
              item.date
            );

          if (dueDate) {
            updateData.dueDate =
              dueDate;
          }
        }

        const safeTitle =
          escapeRegex(item.title);

        const task =
          await Task.findOneAndUpdate(
            {
              userId: user.userId,
              title: {
                $regex:
                  `^${safeTitle}$`,
                $options: "i",
              },
            },
            updateData,
            {
              new: true,
            }
          );

        if (!task) {
          results.push({
            success: false,
            action,
            message:
              `Task "${item.title}" not found.`,
          });

          continue;
        }

        results.push({
          success: true,
          action,
          message:
            `Task "${task.title}" updated successfully.`,
          task,
        });

        continue;
      }

      /*
      ========================================
      UPDATE REMINDER
      ========================================
      */

      if (
        action ===
        "update_reminder"
      ) {
        if (!item.title) {
          results.push({
            success: false,
            action,
            message:
              "Reminder title is required.",
          });

          continue;
        }

        const updateData = {};

        if (item.description) {
          updateData.description =
            item.description;
        }

        if (item.date) {
          const reminderDate =
            getDateFromText(
              item.date
            );

          if (reminderDate) {
            updateData.reminderDate =
              reminderDate;
          }
        }

        const safeTitle =
          escapeRegex(item.title);

        const reminder =
          await Reminder.findOneAndUpdate(
            {
              userId: user.userId,
              title: {
                $regex:
                  `^${safeTitle}$`,
                $options: "i",
              },
            },
            updateData,
            {
              new: true,
            }
          );

        if (!reminder) {
          results.push({
            success: false,
            action,
            message:
              `Reminder "${item.title}" not found.`,
          });

          continue;
        }

        results.push({
          success: true,
          action,
          message:
            `Reminder "${reminder.title}" updated successfully.`,
          reminder,
        });

        continue;
      }

      /*
      ========================================
      UPDATE NOTE
      ========================================
      */

      if (
        action ===
        "update_note"
      ) {
        if (!item.title) {
          results.push({
            success: false,
            action,
            message:
              "Note title is required.",
          });

          continue;
        }

        const updateData = {};

        if (item.content) {
          updateData.content =
            item.content;
        }

        const safeTitle =
          escapeRegex(item.title);

        const note =
          await Note.findOneAndUpdate(
            {
              userId: user.userId,
              title: {
                $regex:
                  `^${safeTitle}$`,
                $options: "i",
              },
            },
            updateData,
            {
              new: true,
            }
          );

        if (!note) {
          results.push({
            success: false,
            action,
            message:
              `Note "${item.title}" not found.`,
          });

          continue;
        }

        results.push({
          success: true,
          action,
          message:
            `Note "${note.title}" updated successfully.`,
          note,
        });

        continue;
      }

      /*
      ========================================
      DELETE TASK
      ========================================
      */

      if (
        action ===
        "delete_task"
      ) {
        if (!item.title) {
          results.push({
            success: false,
            action,
            message:
              "Task title is required.",
          });

          continue;
        }

        /*
        Find exact task first
        */

        const safeTitle =
          escapeRegex(item.title);

        const task =
          await Task.findOne({
            userId: user.userId,
            title: {
              $regex:
                `^${safeTitle}$`,
              $options: "i",
            },
          });

        if (!task) {
          results.push({
            success: false,
            action,
            message:
              `Task "${item.title}" not found.`,
          });

          continue;
        }

        /*
        Confirmation required
        */

        const token =
          createDeleteConfirmationToken({
            userId: user.userId,
            action,
            itemId: task._id,
          });

        results.push({
          success: true,
          action,
          requiresConfirmation: true,
          confirmationType:
            "delete_task",
          confirmationMessage:
            `Are you sure you want to delete task "${task.title}"?`,
          confirmationToken: token,
          itemId: task._id,
          itemTitle: task.title,
        });

        continue;
      }

      /*
      ========================================
      DELETE REMINDER
      ========================================
      */

      if (
        action ===
        "delete_reminder"
      ) {
        if (!item.title) {
          results.push({
            success: false,
            action,
            message:
              "Reminder title is required.",
          });

          continue;
        }

        const safeTitle =
          escapeRegex(item.title);

        const reminder =
          await Reminder.findOne({
            userId: user.userId,
            title: {
              $regex:
                `^${safeTitle}$`,
              $options: "i",
            },
          });

        if (!reminder) {
          results.push({
            success: false,
            action,
            message:
              `Reminder "${item.title}" not found.`,
          });

          continue;
        }

        const token =
          createDeleteConfirmationToken({
            userId: user.userId,
            action,
            itemId: reminder._id,
          });

        results.push({
          success: true,
          action,
          requiresConfirmation: true,
          confirmationType:
            "delete_reminder",
          confirmationMessage:
            `Are you sure you want to delete reminder "${reminder.title}"?`,
          confirmationToken: token,
          itemId: reminder._id,
          itemTitle: reminder.title,
        });

        continue;
      }

      /*
      ========================================
      DELETE NOTE
      ========================================
      */

      if (
        action ===
        "delete_note"
      ) {
        if (!item.title) {
          results.push({
            success: false,
            action,
            message:
              "Note title is required.",
          });

          continue;
        }

        const safeTitle =
          escapeRegex(item.title);

        const note =
          await Note.findOne({
            userId: user.userId,
            title: {
              $regex:
                `^${safeTitle}$`,
              $options: "i",
            },
          });

        if (!note) {
          results.push({
            success: false,
            action,
            message:
              `Note "${item.title}" not found.`,
          });

          continue;
        }

        const token =
          createDeleteConfirmationToken({
            userId: user.userId,
            action,
            itemId: note._id,
          });

        results.push({
          success: true,
          action,
          requiresConfirmation: true,
          confirmationType:
            "delete_note",
          confirmationMessage:
            `Are you sure you want to delete note "${note.title}"?`,
          confirmationToken: token,
          itemId: note._id,
          itemTitle: note.title,
        });

        continue;
      }

      /*
      ========================================
      UNSUPPORTED ACTION
      ========================================
      */

      results.push({
        success: false,
        action,
        message:
          `Action "${action}" is not supported yet.`,
      });
    }

    /*
    ==========================================
    SAVE AI HISTORY
    ==========================================
    */

    const confirmationResults =
      results.filter(
        (result) =>
          result.requiresConfirmation
      );

    const successfulResults =
      results.filter(
        (result) =>
          result.success &&
          !result.requiresConfirmation
      );

    const failedResults =
      results.filter(
        (result) =>
          !result.success
      );

    /*
    If delete confirmation is waiting,
    don't mark the command as completed.
    */

    if (
      confirmationResults.length > 0
    ) {
      return Response.json({
        success: true,
        requiresConfirmation: true,
        message:
          confirmationResults
            .map(
              (result) =>
                result.confirmationMessage
            )
            .join(" "),
        results,
      });
    }

    /*
    Save history
    */

    await saveAIHistory({
      userId: user.userId,
      command,
      action: actions
        .map(
          (item) =>
            item.action
        )
        .join(","),
      status:
        failedResults.length === 0
          ? "success"
          : successfulResults.length >
            0
          ? "success"
          : "failed",
      response: results
        .map(
          (result) =>
            result.message
        )
        .filter(Boolean)
        .join(" "),
    });

    /*
    ==========================================
    FINAL RESPONSE
    ==========================================
    */

    return Response.json({
      success:
        successfulResults.length >
        0,
      message:
        successfulResults.length >
        0
          ? results
              .map(
                (result) =>
                  result.message
              )
              .filter(Boolean)
              .join(" ")
          : "No action was completed.",
      results,
    });
  } catch (error) {
    console.error(
      "AI COMMAND ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Failed to execute AI command.",
      },
      {
        status: 500,
      }
    );
  }
}