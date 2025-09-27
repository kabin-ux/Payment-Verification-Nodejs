import { Router } from "express";
import { submitPayment, getStudentPayments, getPaymentDetails } from "../controllers/paymentController.ts";
import { authenticate, requireStudent } from "../middleware/auth.ts";

const router = Router();

// All payment routes require authentication
router.use(authenticate);

// Student-only routes
router.post("/submit", requireStudent, submitPayment);
router.get("/my-payments", requireStudent, getStudentPayments);
router.get("/:paymentId", requireStudent, getPaymentDetails);

export default router;
