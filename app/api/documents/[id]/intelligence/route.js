import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Document from "@/models/Document";
import { askAI } from "@/lib/ai";
import { isValidObjectId } from "@/lib/validation";

export async function POST(request, { params }) {
  try {
    // ==========================================
    // AUTH
    // ==========================================

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login first.",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // PARAMS
    // ==========================================

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid document ID.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // BODY
    // ==========================================

    const body = await request.json();

    const action = body?.action
      ?.trim()
      ?.toLowerCase();

    const allowedActions = [
      "summarize",
      "keypoints",
      "mcqs",
      "notes",
    ];

    if (!allowedActions.includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid document AI action.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // DATABASE
    // ==========================================

    await connectDB();

    const document = await Document.findOne({
      _id: id,
      userId: user.userId,
    }).lean();

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found.",
        },
        { status: 404 }
      );
    }

    // ==========================================
    // DOCUMENT TEXT
    // ==========================================

    if (!document.text?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No readable text was found in this PDF.",
        },
        { status: 400 }
      );
    }

    // Limit text sent to Gemini
    const documentText = document.text.slice(
      0,
      50000
    );

    // ==========================================
    // PROMPT
    // ==========================================

    let prompt = "";

    // ==========================================
    // SUMMARIZE
    // ==========================================

    if (action === "summarize") {
      prompt = `
You are DigitalDost Document AI.

Read the document below and create a clear summary.

Rules:
- Use ONLY information from the document.
- Do not invent facts.
- Keep the language simple.
- Cover the important concepts.
- Use headings and bullet points where useful.
- Do not mention that you are an AI.

DOCUMENT:

${documentText}
`;
    }

    // ==========================================
    // KEY POINTS
    // ==========================================

    if (action === "keypoints") {
      prompt = `
You are DigitalDost Document AI.

Extract the most important key points from this document.

Rules:
- Use ONLY information present in the document.
- Do not invent information.
- Give around 8 to 15 important points when possible.
- Keep each point short and clear.
- Focus on important concepts, facts, definitions and conclusions.
- Use numbered or bullet points.

DOCUMENT:

${documentText}
`;
    }

    // ==========================================
    // NOTES
    // ==========================================

    if (action === "notes") {
      prompt = `
You are DigitalDost Document AI.

Convert this document into useful study notes.

Rules:
- Use ONLY information from the document.
- Do not invent facts.
- Organize using clear headings.
- Use bullet points.
- Include important definitions and concepts.
- Make the notes easy to revise.
- Keep the language simple.

DOCUMENT:

${documentText}
`;
    }

    // ==========================================
    // MCQS
    // ==========================================

    if (action === "mcqs") {
      prompt = `
You are DigitalDost Document AI.

Generate exactly 10 multiple-choice questions
from the document below.

Return ONLY valid JSON.

Use exactly this structure:

{
  "mcqs": [
    {
      "question": "Question here",
      "options": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      "answer": "A",
      "explanation": "Short explanation"
    }
  ]
}

Rules:
- Questions must come ONLY from the document.
- Do not invent facts.
- Generate exactly 10 questions.
- Every question must have exactly 4 options.
- Only one option should be correct.
- answer must be A, B, C or D.
- Give a short explanation.
- Do not add markdown.
- Do not wrap JSON inside backticks.

DOCUMENT:

${documentText}
`;
    }

    // ==========================================
    // GEMINI
    // ==========================================

    let aiResponse;

    try {
      aiResponse = await askAI(prompt);
    } catch (error) {
      console.error(
        "DOCUMENT INTELLIGENCE GEMINI ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            error?.message ||
            "Gemini AI could not process the document.",
        },
        { status: 500 }
      );
    }

    if (!aiResponse) {
      return NextResponse.json(
        {
          success: false,
          message: "AI returned an empty response.",
        },
        { status: 500 }
      );
    }

    // ==========================================
    // MCQ JSON
    // ==========================================

    if (action === "mcqs") {
      try {
        const cleaned = aiResponse
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();

        const parsed = JSON.parse(cleaned);

        if (
          !parsed?.mcqs ||
          !Array.isArray(parsed.mcqs)
        ) {
          throw new Error(
            "Invalid MCQ response format."
          );
        }

        return NextResponse.json({
          success: true,
          action,
          result: parsed.mcqs,
        });
      } catch (error) {
        console.error(
          "MCQ PARSE ERROR:",
          error
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "AI generated an invalid MCQ response. Please try again.",
          },
          { status: 500 }
        );
      }
    }

    // ==========================================
    // NORMAL RESPONSE
    // ==========================================

    return NextResponse.json({
      success: true,
      action,
      result: aiResponse.trim(),
    });
  } catch (error) {
    console.error(
      "DOCUMENT INTELLIGENCE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while processing the document.",
      },
      { status: 500 }
    );
  }
}