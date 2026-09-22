import { Resend } from "resend";

export async function GET() {
  try {
    if (!process.env.RESEND_API_KEY) {
      return Response.json(
        {
          success: false,
          message: "RESEND_API_KEY is missing.",
        },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "onboarding@resend.dev",

      to: ["ravikantsingh08032007@gmail.com"],

      subject: "DigitalDost Email Test ✅",

      html: `
        <div style="font-family: Arial, sans-serif;">
          <h1>DigitalDost Email Test 🚀</h1>

          <p>
            Congratulations! Your Resend email integration
            is working correctly.
          </p>

          <p>
            You can now receive reminder emails from DigitalDost.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("RESEND TEST ERROR:", error);

      return Response.json(
        {
          success: false,
          message: error.message || "Failed to send email.",
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: "Test email sent successfully.",
      emailId: data?.id || null,
    });
  } catch (error) {
    console.error("TEST EMAIL ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to send test email.",
      },
      { status: 500 }
    );
  }
}