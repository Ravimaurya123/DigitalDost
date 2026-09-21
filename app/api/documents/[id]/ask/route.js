import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Document from "@/models/Document";
import { askAI } from "@/lib/ai";
import { cleanString, isValidObjectId } from "@/lib/validation";

export async function POST(request, { params }) {
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

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid document ID.",
        },
        {
          status: 400,
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

    const question = cleanString(body?.question);

    if (!question) {
      return Response.json(
        {
          success: false,
          message: "Question is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (question.length > 2000) {
      return Response.json(
        {
          success: false,
          message:
            "Question must be less than 2000 characters.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    /*
      IMPORTANT:
      userId is included here.

      Therefore one user cannot access
      another user's document.
    */
    const document = await Document.findOne({
      _id: id,
      userId: user.userId,
    });

    if (!document) {
      return Response.json(
        {
          success: false,
          message: "Document not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (!document.text) {
      return Response.json(
        {
          success: false,
          message:
            "This document does not contain readable text.",
        },
        {
          status: 400,
        }
      );
    }

    const maxTextLength = 50000;

    const limitedText =
      document.text.slice(0, maxTextLength);

    const prompt = `
You are DigitalDost's Document Assistant.

Answer the user's question using ONLY the information
available in the provided document.

If the answer is not present in the document, clearly say:

"I couldn't find this information in the uploaded document."

Do not invent information.

Keep the answer clear, accurate and easy to understand.

DOCUMENT NAME:
${document.name}

DOCUMENT CONTENT:
${limitedText}

USER QUESTION:
${question}
`;

    const answer = await askAI(prompt);

    return Response.json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error(
      "ASK DOCUMENT AI ERROR:",
      error
    );

    if (
      error?.message
        ?.toLowerCase()
        .includes("quota")
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

    return Response.json(
      {
        success: false,
        message:
          "Failed to get AI answer.",
      },
      {
        status: 500,
      }
    );
  }
}