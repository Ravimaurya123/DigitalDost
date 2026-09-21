import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import AICommand from "@/models/AICommand";

export async function GET() {
  try {
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

    await connectDB();

    const commands = await AICommand.find({
      userId: user.userId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(100)
      .lean();

    return Response.json({
      success: true,
      commands,
    });
  } catch (error) {
    console.error("GET AI HISTORY ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch AI command history.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE() {
  try {
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

    await connectDB();

    await AICommand.deleteMany({
      userId: user.userId,
    });

    return Response.json({
      success: true,
      message: "AI command history cleared successfully.",
    });
  } catch (error) {
    console.error("DELETE AI HISTORY ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to clear AI command history.",
      },
      {
        status: 500,
      }
    );
  }
}