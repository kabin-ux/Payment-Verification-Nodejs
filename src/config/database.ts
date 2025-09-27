import mongoose from "mongoose";
import { ENV } from "./env-config";

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = ENV.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(mongoURI);

    console.log(`Database Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
