import mongoose, { Schema } from "mongoose";

const PaymentSchema = new Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    slipNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01
    },
    paymentDate: {
      type: Date,
      required: true
    },
    bankName: {
      type: String,
      required: true,
      trim: true
    },
    transactionReference: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    verifiedAt: {
      type: Date
    },
    rejectionReason: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Index for better query performance
PaymentSchema.index({ studentId: 1, status: 1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Payment", PaymentSchema);
