import { Request, Response } from "express";
import Payment from "../models/paymentModel.ts";
import User from "../models/userModel.ts";
import Log from "../models/logModel.ts";

// Submit a new payment
export const submitPayment = async (req: Request, res: Response) => {
  try {
    const { slipNumber, amount, paymentDate, bankName, transactionReference, notes } = req.body;
    const studentId = req.user?.userId;

    // Validate required fields
    if (!slipNumber || !amount || !paymentDate || !bankName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields. Please provide slip number, amount, payment date, and bank name.",
        data: null
      });
    }

    // Check if slip number already exists
    const existingPayment = await Payment.findOne({ slipNumber: slipNumber.toUpperCase() });
    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: "A payment with this slip number already exists. Please check your slip number and try again.",
        data: null
      });
    }

    // Create new payment
    const payment = new Payment({
      studentId,
      slipNumber: slipNumber.toUpperCase(),
      amount: parseFloat(amount),
      paymentDate: new Date(paymentDate),
      bankName,
      transactionReference,
      notes,
      status: "pending"
    });

    await payment.save();

    // Log the action
    await Log.create({
      action: "payment_submitted",
      performedBy: studentId,
      targetPayment: payment._id,
      details: `Payment submitted with slip number: ${slipNumber}`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent")
    });

    res.status(201).json({
      success: true,
      message: "Payment submitted successfully! Your payment is now under review.",
      data: {
        paymentId: payment._id,
        slipNumber: payment.slipNumber,
        amount: payment.amount,
        status: payment.status,
        submittedAt: payment.createdAt
      }
    });

  } catch (error) {
    console.error("Error submitting payment:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while submitting your payment. Please try again later.",
      data: null
    });
  }
};

// Get student's payment history
export const getStudentPayments = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = { studentId };
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .select("-__v");

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      message: "Payment history retrieved successfully",
      data: {
        payments,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalPayments: total,
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
        }
      }
    });

  } catch (error) {
    console.error("Error fetching student payments:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching your payment history. Please try again later.",
      data: null
    });
  }
};

// Get single payment details
export const getPaymentDetails = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const studentId = req.user?.userId;

    const payment = await Payment.findOne({ _id: paymentId, studentId })
      .populate("verifiedBy", "firstName lastName email")
      .select("-__v");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found or you don't have permission to view this payment.",
        data: null
      });
    }

    res.json({
      success: true,
      message: "Payment details retrieved successfully",
      data: payment
    });

  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching payment details. Please try again later.",
      data: null
    });
  }
};
