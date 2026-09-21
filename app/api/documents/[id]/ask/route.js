import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Document from "@/models/Document";
import { askAI } from "@/lib/ai";
import mongoose from "mongoose";

export async function POST(request, { params }) {
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid document ID.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const question = body.question?.trim();

    if (!question) {
      return Response.json(
        {
          success: false,
          message: "Question is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

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
        { status: 404 }
      );
    }

    const documentText = document.text;

    if (!documentText) {
      return Response.json(
        {
          success: false,
          message: "This document does not contain readable text.",
        },
        { status: 400 }
      );
    }

    /*
      Limit extremely large PDF text
      to avoid sending an unnecessarily huge prompt.
    */
    const maxTextLength = 50000;

    const limitedText = documentText.slice(
      0,
      maxTextLength
    );

    const prompt = `
You are DigitalDost's Document Assistant.

Answer the user's question using ONLY the information available in the provided document.

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
    console.error("ASK DOCUMENT AI ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to get AI answer.",
      },
      { status: 500 }
    );
  }
}