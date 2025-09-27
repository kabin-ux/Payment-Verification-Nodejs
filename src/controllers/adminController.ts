import { Request, Response } from "express";
import Payment from "../models/paymentModel.ts";
import Log from "../models/logModel.ts";
import { Types } from "mongoose";

// Get all pending payments for admin review
export const getPendingPayments = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status = "pending" } = req.query;

    const query: any = { status };
    if (status === "all") {
      delete query.status;
    }

    const payments = await Payment.find(query)
      .populate("studentId", "firstName lastName email studentId")
      .populate("verifiedBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .select("-__v");

    const total = await Payment.countDocuments(query);

    // Get summary statistics
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      message: "Payments retrieved successfully",
      data: {
        payments,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalPayments: total,
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
        },
        summary: {
          pending: statusCounts.pending || 0,
          verified: statusCounts.verified || 0,
          rejected: statusCounts.rejected || 0,
          total: total
        }
      }
    });

  } catch (error) {
    console.error("Error fetching pending payments:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching payments. Please try again later.",
      data: null
    });
  }
};

// Verify a payment
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { notes } = req.body;
    const adminId = req.user?.userId;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found. Please check the payment ID and try again.",
        data: null
      });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `This payment has already been ${payment.status}. Cannot change the status.`,
        data: null
      });
    }

    // Update payment status
    payment.status = "verified";
    payment.verifiedBy = new Types.ObjectId(adminId);
    payment.verifiedAt = new Date();
    if (notes) {
      payment.notes = notes;
    }

    await payment.save();

    // Log the action
    await Log.create({
      action: "payment_verified",
      performedBy: adminId,
      targetPayment: payment._id,
      details: `Payment verified by admin. Slip number: ${payment.slipNumber}`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent")
    });

    res.json({
      success: true,
      message: "Payment verified successfully! The student will be notified of this update.",
      data: {
        paymentId: payment._id,
        slipNumber: payment.slipNumber,
        status: payment.status,
        verifiedAt: payment.verifiedAt,
        verifiedBy: adminId
      }
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while verifying the payment. Please try again later.",
      data: null
    });
  }
};

// Reject a payment
export const rejectPayment = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { rejectionReason, notes } = req.body;
    const adminId = req.user?.userId;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required. Please provide a reason for rejecting this payment.",
        data: null
      });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found. Please check the payment ID and try again.",
        data: null
      });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `This payment has already been ${payment.status}. Cannot change the status.`,
        data: null
      });
    }

    // Update payment status
    payment.status = "rejected";
    payment.verifiedBy = new Types.ObjectId(adminId);
    payment.verifiedAt = new Date();
    payment.rejectionReason = rejectionReason;
    if (notes) {
      payment.notes = notes;
    }

    await payment.save();

    // Log the action
    await Log.create({
      action: "payment_rejected",
      performedBy: adminId,
      targetPayment: payment._id,
      details: `Payment rejected by admin. Reason: ${rejectionReason}. Slip number: ${payment.slipNumber}`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent")
    });

    res.json({
      success: true,
      message: "Payment rejected successfully. The student will be notified with the reason for rejection.",
      data: {
        paymentId: payment._id,
        slipNumber: payment.slipNumber,
        status: payment.status,
        rejectionReason: payment.rejectionReason,
        rejectedAt: payment.verifiedAt,
        rejectedBy: adminId
      }
    });

  } catch (error) {
    console.error("Error rejecting payment:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while rejecting the payment. Please try again later.",
      data: null
    });
  }
};

// Get verification logs
export const getVerificationLogs = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, action } = req.query;

    const query: any = {};
    if (action) {
      query.action = action;
    }

    const logs = await Log.find(query)
      .populate("performedBy", "firstName lastName email role")
      .populate("targetPayment", "slipNumber amount status")
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .select("-__v");

    const total = await Log.countDocuments(query);

    res.json({
      success: true,
      message: "Verification logs retrieved successfully",
      data: {
        logs,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalLogs: total,
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
        }
      }
    });

  } catch (error) {
    console.error("Error fetching verification logs:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching verification logs. Please try again later.",
      data: null
    });
  }
};
