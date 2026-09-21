import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore =
      await cookies();

    cookieStore.set(
      "digitaldost_token",
      "",
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        expires: new Date(0),
        path: "/",
      }
    );

    return Response.json({
      success: true,
      message:
        "Logged out successfully.",
    });
  } catch (error) {
    console.error(
      "LOGOUT ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Failed to logout.",
      },
      {
        status: 500,
      }
    );
  }
}