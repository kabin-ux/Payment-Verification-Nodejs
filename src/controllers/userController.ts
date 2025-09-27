import { Request, Response } from "express";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateTokenPair, generateAccessToken, verifyRefreshToken, JWTPayload } from "../utils/jwt.js";

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, studentId, role = "student" } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Missing necessary fields. Please provide first name, last name, email, password, and student ID.",
        data: null
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { studentId }] 
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Please use a different set of credentials as the user already exists with this email or student ID.",
        data: null
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      studentId,
      role
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully! You can now log in to submit payments.",
      data: {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        studentId: user.studentId,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while registering. Please try again later.",
      data: null
    });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
        data: null
      });
    }

    // Find user
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please check your email and password.",
        data: null
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please check your email and password.",
        data: null
      });
    }

    // Generate JWT tokens
    const tokenPayload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      studentId: user.studentId
    };

    const tokens = generateTokenPair(tokenPayload);

    res.json({
      success: true,
      message: "Login successful! Welcome back.",
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          studentId: user.studentId,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while logging in. Please try again later.",
      data: null
    });
  }
};

// Get user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId).select("-password -__v");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please log in again.",
        data: null
      });
    }

    res.json({
      success: true,
      message: "Profile retrieved successfully",
      data: user
    });

  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching your profile. Please try again later.",
      data: null
    });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { firstName, lastName, email } = req.body;

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please log in again.",
        data: null
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully!",
      data: user
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating your profile. Please try again later.",
      data: null
    });
  }
};

// Refresh access token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required.",
        data: null
      });
    }

    // Verify refresh token
    const { userId } = verifyRefreshToken(refreshToken);

    // Get user details
    const user = await User.findById(userId).select("-password");
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or account is inactive. Please log in again.",
        data: null
      });
    }

    // Generate new access token
    const tokenPayload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      studentId: user.studentId
    };

    const newAccessToken = generateAccessToken(tokenPayload);

    res.json({
      success: true,
      message: "Access token refreshed successfully!",
      data: {
        accessToken: newAccessToken
      }
    });

  } catch (error) {
    console.error("Error refreshing token:", error);
    
    if (error instanceof Error && error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        message: "Refresh token has expired. Please log in again.",
        data: null
      });
    }

    res.status(500).json({
      success: false,
      message: "An error occurred while refreshing the token. Please try again later.",
      data: null
    });
  }
};
