import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();

    const name = body?.name?.trim();
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password;

    if (!name || !email || !password) {
      return Response.json(
        {
          success: false,
          message: "All fields are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (name.length < 2) {
      return Response.json(
        {
          success: false,
          message: "Name must contain at least 2 characters.",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 6) {
      return Response.json(
        {
          success: false,
          message: "Password must contain at least 6 characters.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return Response.json(
        {
          success: false,
          message: "Email already registered.",
        },
        {
          status: 409,
        }
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return Response.json(
      {
        success: true,
        message: "Registration successful.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Registration failed.",
      },
      {
        status: 500,
      }
    );
  }
}