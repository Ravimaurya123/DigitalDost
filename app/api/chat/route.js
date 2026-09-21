import { getCurrentUser } from "@/lib/auth";
import { askAI } from "@/lib/ai";
import { cleanString } from "@/lib/validation";

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized. Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const message = cleanString(body?.message);

    if (!message) {
      return Response.json(
        {
          success: false,
          message: "Message is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (message.length > 5000) {
      return Response.json(
        {
          success: false,
          message:
            "Message must be less than 5000 characters.",
        },
        {
          status: 400,
        }
      );
    }

    const reply = await askAI(message);

    return Response.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("CHAT API ERROR:", error);

    const message =
      error?.message || "";

    if (
      message.toLowerCase().includes("quota")
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Gemini API quota exceeded. Please try again later.",
        },
        {
          status: 429,
        }
      );
    }

    if (
      message.toLowerCase().includes("invalid") &&
      message.toLowerCase().includes("api")
    ) {
      return Response.json(
        {
          success: false,
          message:
            "AI service configuration is invalid.",
        },
        {
          status: 503,
        }
      );
    }

    return Response.json(
      {
        success: false,
        message:
          "AI service is temporarily unavailable.",
      },
      {
        status: 500,
      }
    );
  }
}