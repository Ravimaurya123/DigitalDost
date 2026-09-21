import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    text: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      default: 0,
    },

    type: {
      type: String,
      default: "application/pdf",
    },
  },
  {
    timestamps: true,
  }
);

const Document =
  mongoose.models.Document ||
  mongoose.model("Document", documentSchema);

export default Document;