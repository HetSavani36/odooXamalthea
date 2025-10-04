import mongoose, { Schema } from "mongoose";

const companySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
    },
    currency: {
      code: { type: String, required: true }, 
      name: { type: String, required: true }, 
      symbol: { type: String, required: true },
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export const Company = mongoose.model("Company", companySchema);
