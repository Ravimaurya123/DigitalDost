import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    cookieStore.set("digitaldost_token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return Response.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Logout failed",
      },
      { status: 500 }
    );
  }
}