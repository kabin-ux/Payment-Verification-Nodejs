import { Router } from "express";
import { 
  getPendingPayments, 
  verifyPayment, 
  rejectPayment, 
  getVerificationLogs 
} from "../controllers/adminController.ts";
import { authenticate, requireAdmin } from "../middleware/auth.ts";

const router = Router();

// All admin routes require authentication and admin privileges
router.use(authenticate);
router.use(requireAdmin);

// Admin-only routes
router.get("/payments", getPendingPayments);
router.put("/payments/:paymentId/verify", verifyPayment);
router.put("/payments/:paymentId/reject", rejectPayment);
router.get("/logs", getVerificationLogs);

export default router;
