import { Request, Response, NextFunction } from "express";
import User from "../models/userModel.js";
import { verifyAccessToken, extractTokenFromHeader, JWTPayload } from "../utils/jwt.js";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// JWT authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please provide an authentication token.",
        data: null
      });
    }

    // Extract token from Authorization header
    const token = extractTokenFromHeader(authHeader);
    
    // Verify JWT token
    const decoded = verifyAccessToken(token);
    
    // Check if user still exists and is active
    const user = await User.findById(decoded.userId).select("-password");
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or account is inactive. Please contact support.",
        data: null
      });
    }

    // Verify user role hasn't changed
    if (user.role !== decoded.role) {
      return res.status(401).json({
        success: false,
        message: "User role has changed. Please log in again.",
        data: null
      });
    }

    // Attach user info to request
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      studentId: user.studentId
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        return res.status(401).json({
          success: false,
          message: "Your session has expired. Please log in again.",
          data: null
        });
      }
      
      if (error.message.includes('Invalid') || error.message.includes('invalid')) {
        return res.status(401).json({
          success: false,
          message: "Invalid authentication token. Please log in again.",
          data: null
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: "An error occurred during authentication. Please try again later.",
      data: null
    });
  }
};

// Admin-only middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required for this action.",
      data: null
    });
  }
  next();
};

// Student-only middleware
export const requireStudent = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "student") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Student privileges required for this action.",
      data: null
    });
  }
  next();
};
