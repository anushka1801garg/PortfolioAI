import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    timestamp: { type: String, default: "" },
  },
  { _id: false }
);

const chatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Chat",
      trim: true,
    },
    activeLink: {
      type: String,
      default: "",
    },
    portfolioData: {
      type: Object,
      default: null,
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

chatSessionSchema.index({ user: 1, sessionId: 1 }, { unique: true });
chatSessionSchema.index({ user: 1, updatedAt: -1 });

export default mongoose.model("ChatSession", chatSessionSchema);
