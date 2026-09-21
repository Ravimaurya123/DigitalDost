import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
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

    return Response.json({
      success: true,
      user: {
        id: user.userId,
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
        message: "Failed to get user.",
      },
      {
        status: 500,
      }
    );
  }
}