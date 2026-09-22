import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReminderEmail({
  to,
  title,
  description,
  reminderDate,
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured.");
    }

    if (!to) {
      throw new Error("Recipient email is required.");
    }

    const formattedDate = new Date(reminderDate).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });

    const { data, error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "DigitalDost <onboarding@resend.dev>",

      to: [to],

      subject: `🔔 Reminder: ${title}`,

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 30px;
          background: #0f172a;
          color: #e2e8f0;
          border-radius: 16px;
        ">
          <h1 style="
            color: #22d3ee;
            margin-bottom: 20px;
          ">
            🔔 DigitalDost Reminder
          </h1>

          <h2 style="
            color: #ffffff;
            margin-bottom: 10px;
          ">
            ${escapeHtml(title)}
          </h2>

          ${
            description
              ? `
                <p style="
                  color: #cbd5e1;
                  line-height: 1.6;
                ">
                  ${escapeHtml(description)}
                </p>
              `
              : ""
          }

          <div style="
            margin-top: 20px;
            padding: 15px;
            background: #1e293b;
            border-radius: 10px;
          ">
            <strong>Reminder Time:</strong>
            <br />
            ${formattedDate}
          </div>

          <p style="
            margin-top: 25px;
            color: #94a3b8;
            font-size: 14px;
          ">
            This reminder was sent automatically by DigitalDost.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("RESEND ERROR:", error);
      throw new Error("Failed to send reminder email.");
    }

    return {
      success: true,
      id: data?.id || null,
    };
  } catch (error) {
    console.error("SEND REMINDER EMAIL ERROR:", error);
    throw error;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}