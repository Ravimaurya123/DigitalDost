import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function getCurrentUser() {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing.");
      return null;
    }

    const cookieStore = await cookies();

    const token =
      cookieStore.get("digitaldost_token")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded?.userId) {
      return null;
    }

    return {
      userId: decoded.userId,
      name: decoded.name || "",
      email: decoded.email || "",
    };
  } catch (error) {
    console.error(
      "AUTH ERROR:",
      error.message
    );

    return null;
  }
}