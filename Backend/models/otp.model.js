import mongoose, { Schema } from "mongoose";

const OtpSchema = new Schema(
  {
    purpose: {
      type: String,
      enum: ["signup", "login", "password_reset", "phone_verify"],
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    email: { type: String },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

OtpSchema.index({ email: 1, code: 1 });

export const Otp = mongoose.model("Otp", OtpSchema);
