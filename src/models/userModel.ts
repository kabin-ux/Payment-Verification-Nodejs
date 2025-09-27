import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("User", UserSchema);
