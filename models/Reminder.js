import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    reminderDate: {
      type: Date,
      required: true,
      index: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    // Server-side reminder status
    notified: {
      type: Boolean,
      default: false,
    },

    // Email notification
    emailSent: {
      type: Boolean,
      default: false,
    },

    // Whether email notification is enabled
    emailNotification: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Reminder =
  mongoose.models.Reminder ||
  mongoose.model("Reminder", reminderSchema);

export default Reminder;