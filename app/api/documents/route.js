import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Document from "@/models/Document";
import { extractText } from "unpdf";

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

    const formData = await request.formData();

    const file = formData.get("file");

    if (!file) {
      return Response.json(
        {
          success: false,
          message: "Please select a PDF file.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof file.type !== "string" ||
      file.type !== "application/pdf"
    ) {
      return Response.json(
        {
          success: false,
          message: "Only PDF files are allowed.",
        },
        {
          status: 400,
        }
      );
    }

    const maxSize =
      10 * 1024 * 1024;

    if (file.size <= 0) {
      return Response.json(
        {
          success: false,
          message: "The selected PDF is empty.",
        },
        {
          status: 400,
        }
      );
    }

    if (file.size > maxSize) {
      return Response.json(
        {
          success: false,
          message:
            "PDF size must be less than 10 MB.",
        },
        {
          status: 400,
        }
      );
    }

    const arrayBuffer =
      await file.arrayBuffer();

    const buffer =
      new Uint8Array(arrayBuffer);

    /*
      Basic PDF signature validation.
      A real PDF normally begins with %PDF-
    */
    const header =
      new TextDecoder().decode(
        buffer.slice(0, 5)
      );

    if (header !== "%PDF-") {
      return Response.json(
        {
          success: false,
          message:
            "Invalid PDF file.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await extractText(buffer);

    let extractedText = "";

    if (Array.isArray(result.text)) {
      extractedText =
        result.text.join("\n");
    } else {
      extractedText =
        result.text || "";
    }

    extractedText =
      extractedText.trim();

    if (!extractedText) {
      return Response.json(
        {
          success: false,
          message:
            "Could not extract text from this PDF. Please upload a text-based PDF.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      Prevent extremely large extracted
      text from being stored.
    */
    const maxTextLength =
      500000;

    if (
      extractedText.length >
      maxTextLength
    ) {
      extractedText =
        extractedText.slice(
          0,
          maxTextLength
        );
    }

    await connectDB();

    const document =
      await Document.create({
        userId: user.userId,
        name: file.name,
        text: extractedText,
        size: file.size,
        type: file.type,
      });

    return Response.json(
      {
        success: true,
        message:
          "PDF uploaded successfully.",
        document: {
          id: document._id,
          name: document.name,
          size: document.size,
          type: document.type,
          createdAt:
            document.createdAt,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "UPLOAD DOCUMENT ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Failed to upload PDF.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return Response.json(
        {
          success: false,
          message:
            "Unauthorized. Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    const documents =
      await Document.find({
        userId: user.userId,
      })
        .select("-text")
        .sort({
          createdAt: -1,
        })
        .lean();

    return Response.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error(
      "GET DOCUMENTS ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Failed to fetch documents.",
      },
      {
        status: 500,
      }
    );
  }
}