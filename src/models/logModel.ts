import mongoose, { Schema } from "mongoose";

const LogSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ["payment_submitted", "payment_verified", "payment_rejected", "payment_updated"]
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    targetPayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true
    },
    details: {
      type: String,
      required: true
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Log", LogSchema);
