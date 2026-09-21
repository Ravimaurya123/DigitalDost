import mongoose from "mongoose";

const userSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    theme: {
      type: String,
      enum: ["dark", "light"],
      default: "dark",
    },

    notifications: {
      type: Boolean,
      default: true,
    },

    emailNotifications: {
      type: Boolean,
      default: false,
    },

    aiAssistant: {
      type: Boolean,
      default: true,
    },

    timeFormat: {
      type: String,
      enum: ["12", "24"],
      default: "12",
    },
  },
  {
    timestamps: true,
  }
);

const UserSettings =
  mongoose.models.UserSettings ||
  mongoose.model(
    "UserSettings",
    userSettingsSchema
  );

export default UserSettings;