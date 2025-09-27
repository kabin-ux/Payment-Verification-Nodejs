import { Router } from "express";
import { register, login, getProfile, updateProfile, refreshToken } from "../controllers/userController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);

// Protected routes
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);

export default router;
