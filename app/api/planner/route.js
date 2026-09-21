import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { askAI } from "@/lib/ai";

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

    const input =
      typeof body.input === "string"
        ? body.input.trim()
        : "";

    if (!input) {
      return NextResponse.json(
        {
          success: false,
          message: "Please describe your plan.",
        },
        { status: 400 }
      );
    }

    if (input.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          message: "Plan description is too long.",
        },
        { status: 400 }
      );
    }

    const prompt = `
You are the AI Daily Planner for DigitalDost.

Convert the user's request into a practical daily plan.

USER REQUEST:
${input}

Return ONLY valid JSON.

Use exactly this structure:

{
  "title": "short plan title",
  "summary": "short summary",
  "tasks": [
    {
      "title": "task title",
      "description": "short description",
      "priority": "Low"
    }
  ],
  "reminders": [
    {
      "title": "reminder title",
      "description": "short description",
      "date": "YYYY-MM-DD",
      "time": "HH:mm"
    }
  ]
}

Rules:

1. priority must be exactly one of:
   Low, Medium, High

2. Create only useful tasks.

3. If the user does not provide a specific reminder time,
   do not invent an exact time.

4. If a date is clearly provided, use that date.

5. If no date is provided for a task, it can still be included.

6. Keep tasks concise.

7. Keep reminders empty when there is no clear reminder.

8. Do not include markdown.

9. Do not include explanations outside JSON.
`;

    const aiResponse = await askAI(prompt);

    let plan;

    try {
      const cleaned = aiResponse
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      plan = JSON.parse(cleaned);
    } catch (error) {
      console.error("PLANNER JSON ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message: "AI generated an invalid plan. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("AI PLANNER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message || "Unable to generate your daily plan.",
      },
      { status: 500 }
    );
  }
}