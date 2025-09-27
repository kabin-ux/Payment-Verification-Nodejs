import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.ts";
import authRoutes from "./routes/authRoutes.ts";
import paymentRoutes from "./routes/paymentRoutes.ts";
import adminRoutes from "./routes/adminRoutes.ts";
import { ENV } from "./config/env-config.ts";

// Load environment variables
dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Payment Verification System is running!",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found. Please check the URL and try again.",
    data: null
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global error handler:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An unexpected error occurred. Please try again later.",
    data: null,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// Run server
app.listen(ENV.PORT, () => {
  console.log(`Server running on port ${ENV.PORT}`);
});

export default app;
