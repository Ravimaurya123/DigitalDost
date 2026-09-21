import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const authUser = await getCurrentUser();

    if (!authUser) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    const user = await User.findById(
      authUser.userId
    ).select("name email");

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(
      "GET CURRENT USER ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Failed to get current user.",
      },
      {
        status: 500,
      }
    );
  }
}