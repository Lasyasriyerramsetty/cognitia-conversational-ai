import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, maxlength: 4000 },
    answer: { type: String, required: true, maxlength: 32_000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Interaction =
  mongoose.models.Interaction ||
  mongoose.model("Interaction", interactionSchema);
