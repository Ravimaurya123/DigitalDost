import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { Resend } from "resend";

export async function POST(request) {
  try {
    const body = await request.json();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return Response.json(
        {
          success: false,
          message: "Email is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email });

    // Don't reveal whether an account exists.
    if (!user) {
      return Response.json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Store hashed token in database
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Token valid for 15 minutes
    const expiry = new Date(
      Date.now() + 15 * 60 * 1000
    );

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expiry;

    await user.save();

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3001";

    const resetUrl =
      `${baseUrl}/reset-password?token=${rawToken}`;

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is missing.");

      return Response.json(
        {
          success: false,
          message: "Email service is not configured.",
        },
        { status: 500 }
      );
    }

    const resend = new Resend(
      process.env.RESEND_API_KEY
    );

    const { error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "onboarding@resend.dev",

      to: [user.email],

      subject: "Reset your DigitalDost password 🔐",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          background: #0f172a;
          color: #e2e8f0;
          border-radius: 16px;
        ">

          <h1 style="color:#22d3ee;">
            DigitalDost
          </h1>

          <h2 style="color:white;">
            Password Reset
          </h2>

          <p style="line-height:1.6;">
            We received a request to reset your DigitalDost
            account password.
          </p>

          <a
            href="${resetUrl}"
            style="
              display:inline-block;
              margin-top:20px;
              padding:12px 20px;
              background:#06b6d4;
              color:#0f172a;
              text-decoration:none;
              border-radius:10px;
              font-weight:bold;
            "
          >
            Reset Password
          </a>

          <p style="
            margin-top:25px;
            color:#94a3b8;
            font-size:14px;
          ">
            This link will expire in 15 minutes.
          </p>

          <p style="
            color:#64748b;
            font-size:13px;
          ">
            If you did not request a password reset,
            you can safely ignore this email.
          </p>

        </div>
      `,
    });

    if (error) {
      console.error("RESEND RESET EMAIL ERROR:", error);

      return Response.json(
        {
          success: false,
          message: "Failed to send reset email.",
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}