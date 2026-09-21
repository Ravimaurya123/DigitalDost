import mongoose from "mongoose";

const aiCommandSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    command: {
      type: String,
      required: true,
      trim: true,
    },

    action: {
      type: String,
      default: "unknown",
      trim: true,
    },

    status: {
      type: String,
      enum: ["success", "failed", "cancelled"],
      default: "success",
    },

    response: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const AICommand =
  mongoose.models.AICommand ||
  mongoose.model("AICommand", aiCommandSchema);

export default AICommand;