import { getCurrentUser } from "@/lib/auth";
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

    const { message } = body;

    if (!message || !message.trim()) {
      return Response.json(
        {
          success: false,
          message: "Message is required",
        },
        { status: 400 }
      );
    }

    const reply = await askAI(message.trim());

    return Response.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("CHAT API ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to get AI response",
      },
      { status: 500 }
    );
  }
}