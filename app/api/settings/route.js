import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import UserSettings from "@/models/UserSettings";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized. Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    let settings = await UserSettings.findOne({
      userId: user.userId,
    }).lean();

    if (!settings) {
      settings = await UserSettings.create({
        userId: user.userId,
      });

      settings = settings.toObject();
    }

    return Response.json({
      success: true,
      settings: {
        theme: settings.theme,
        notifications: settings.notifications,
        emailNotifications:
          settings.emailNotifications,
        aiAssistant: settings.aiAssistant,
        timeFormat: settings.timeFormat,
      },
    });
  } catch (error) {
    console.error(
      "GET SETTINGS ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Failed to load settings.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized. Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const allowedThemes = [
      "dark",
      "light",
    ];

    const allowedTimeFormats = [
      "12",
      "24",
    ];

    if (
      body.theme !== undefined &&
      !allowedThemes.includes(body.theme)
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid theme.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      body.timeFormat !== undefined &&
      !allowedTimeFormats.includes(
        body.timeFormat
      )
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid time format.",
        },
        {
          status: 400,
        }
      );
    }

    const update = {};

    if (body.theme !== undefined) {
      update.theme = body.theme;
    }

    if (
      body.notifications !== undefined &&
      typeof body.notifications === "boolean"
    ) {
      update.notifications =
        body.notifications;
    }

    if (
      body.emailNotifications !== undefined &&
      typeof body.emailNotifications === "boolean"
    ) {
      update.emailNotifications =
        body.emailNotifications;
    }

    if (
      body.aiAssistant !== undefined &&
      typeof body.aiAssistant === "boolean"
    ) {
      update.aiAssistant =
        body.aiAssistant;
    }

    if (body.timeFormat !== undefined) {
      update.timeFormat =
        body.timeFormat;
    }

    await connectDB();

    const settings =
      await UserSettings.findOneAndUpdate(
        {
          userId: user.userId,
        },
        {
          $set: update,
          $setOnInsert: {
            userId: user.userId,
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      ).lean();

    return Response.json({
      success: true,
      message: "Settings saved successfully.",
      settings: {
        theme: settings.theme,
        notifications:
          settings.notifications,
        emailNotifications:
          settings.emailNotifications,
        aiAssistant:
          settings.aiAssistant,
        timeFormat:
          settings.timeFormat,
      },
    });
  } catch (error) {
    console.error(
      "UPDATE SETTINGS ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Failed to save settings.",
      },
      {
        status: 500,
      }
    );
  }
}