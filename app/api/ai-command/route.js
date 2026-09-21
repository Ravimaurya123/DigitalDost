import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import { askAI } from "@/lib/ai";

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

    const command = body.command?.trim();

    if (!command) {
      return Response.json(
        {
          success: false,
          message: "Command is required.",
        },
        { status: 400 }
      );
    }

    const prompt = `
You are the command parser for DigitalDost.

The user wants to manage their personal tasks.

Analyze the user's command and return ONLY valid JSON.

Supported action:
- create_task

JSON format:

{
  "action": "create_task",
  "title": "task title",
  "description": "task description"
}

If the command is not related to creating a task, return:

{
  "action": "unknown"
}

Do not use markdown.
Do not add explanations.

User command:
${command}
`;

    const aiResponse = await askAI(prompt);

    let parsedResponse;

    try {
      const cleanedResponse = aiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsedResponse = JSON.parse(cleanedResponse);
    } catch (error) {
      console.error(
        "AI COMMAND JSON ERROR:",
        error
      );

      return Response.json(
        {
          success: false,
          message: "Could not understand the command.",
        },
        { status: 400 }
      );
    }

    if (
      parsedResponse.action !== "create_task"
    ) {
      return Response.json({
        success: false,
        message:
          "Currently I can create tasks from your commands.",
      });
    }

    if (!parsedResponse.title?.trim()) {
      return Response.json(
        {
          success: false,
          message: "Task title is missing.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const task = await Task.create({
      userId: user.userId,
      title: parsedResponse.title.trim(),
      description:
        parsedResponse.description?.trim() || "",
      completed: false,
    });

    return Response.json({
      success: true,
      message: "Task created successfully.",
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
      },
    });
  } catch (error) {
    console.error(
      "AI COMMAND ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Failed to process AI command.",
      },
      { status: 500 }
    );
  }
}