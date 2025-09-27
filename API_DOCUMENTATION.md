# Payment Verification System - API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
The API uses a simple token-based authentication system. Include the token in the Authorization header:
```
Authorization: Bearer USER_ID:ROLE
```

## Response Format
All API responses follow this format:
```json
{
  "success": boolean,
  "message": string,
  "data": object | null
}
```

---

## Authentication Endpoints

### Register User
**POST** `/api/auth/register`

Register a new user (student or admin).

**Request Body:**
```json
{
  "email": "user@university.edu",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "studentId": "STU001",
  "role": "student" // optional, defaults to "student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully! You can now log in to submit payments.",
  "data": {
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "user@university.edu",
    "firstName": "John",
    "lastName": "Doe",
    "studentId": "STU001",
    "role": "student"
  }
}
```

### Login User
**POST** `/api/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "user@university.edu",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful! Welcome back.",
  "data": {
    "token": "64f8a1b2c3d4e5f6a7b8c9d0:student",
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "email": "user@university.edu",
      "firstName": "John",
      "lastName": "Doe",
      "studentId": "STU001",
      "role": "student"
    }
  }
}
```

### Get Profile
**GET** `/api/auth/profile`

Get current user's profile.

**Headers:**
```
Authorization: Bearer USER_ID:ROLE
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "user@university.edu",
    "firstName": "John",
    "lastName": "Doe",
    "studentId": "STU001",
    "role": "student",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Student Payment Endpoints

### Submit Payment
**POST** `/api/payments/submit`

Submit a new payment for verification.

**Headers:**
```
Authorization: Bearer USER_ID:student
Content-Type: application/json
```

**Request Body:**
```json
{
  "slipNumber": "SLP123456",
  "amount": 50000,
  "paymentDate": "2024-01-15",
  "bankName": "ABC Bank",
  "transactionReference": "TXN789", // optional
  "notes": "Tuition fee payment" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment submitted successfully! Your payment is now under review.",
  "data": {
    "paymentId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "slipNumber": "SLP123456",
    "amount": 50000,
    "status": "pending",
    "submittedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Student Payments
**GET** `/api/payments/my-payments`

Get student's payment history with pagination.

**Headers:**
```
Authorization: Bearer USER_ID:student
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, verified, rejected)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Payment history retrieved successfully",
  "data": {
    "payments": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "slipNumber": "SLP123456",
        "amount": 50000,
        "paymentDate": "2024-01-15T00:00:00.000Z",
        "bankName": "ABC Bank",
        "status": "pending",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalPayments": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### Get Payment Details
**GET** `/api/payments/:paymentId`

Get detailed information about a specific payment.

**Headers:**
```
Authorization: Bearer USER_ID:student
```

**Response:**
```json
{
  "success": true,
  "message": "Payment details retrieved successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "slipNumber": "SLP123456",
    "amount": 50000,
    "paymentDate": "2024-01-15T00:00:00.000Z",
    "bankName": "ABC Bank",
    "transactionReference": "TXN789",
    "status": "verified",
    "verifiedBy": {
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@university.edu"
    },
    "verifiedAt": "2024-01-15T11:00:00.000Z",
    "notes": "Payment verified successfully",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Admin Endpoints

### Get All Payments
**GET** `/api/admin/payments`

Get all payments with filtering and pagination.

**Headers:**
```
Authorization: Bearer ADMIN_ID:admin
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, verified, rejected, all)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Payments retrieved successfully",
  "data": {
    "payments": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "slipNumber": "SLP123456",
        "amount": 50000,
        "paymentDate": "2024-01-15T00:00:00.000Z",
        "bankName": "ABC Bank",
        "status": "pending",
        "studentId": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@university.edu",
          "studentId": "STU001"
        },
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalPayments": 1,
      "hasNext": false,
      "hasPrev": false
    },
    "summary": {
      "pending": 1,
      "verified": 0,
      "rejected": 0,
      "total": 1
    }
  }
}
```

### Verify Payment
**PUT** `/api/admin/payments/:paymentId/verify`

Mark a payment as verified.

**Headers:**
```
Authorization: Bearer ADMIN_ID:admin
Content-Type: application/json
```

**Request Body:**
```json
{
  "notes": "Payment verified successfully" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully! The student will be notified of this update.",
  "data": {
    "paymentId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "slipNumber": "SLP123456",
    "status": "verified",
    "verifiedAt": "2024-01-15T11:00:00.000Z",
    "verifiedBy": "64f8a1b2c3d4e5f6a7b8c9d0"
  }
}
```

### Reject Payment
**PUT** `/api/admin/payments/:paymentId/reject`

Mark a payment as rejected.

**Headers:**
```
Authorization: Bearer ADMIN_ID:admin
Content-Type: application/json
```

**Request Body:**
```json
{
  "rejectionReason": "Invalid slip number format",
  "notes": "Please resubmit with correct slip number" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment rejected successfully. The student will be notified with the reason for rejection.",
  "data": {
    "paymentId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "slipNumber": "SLP123456",
    "status": "rejected",
    "rejectionReason": "Invalid slip number format",
    "rejectedAt": "2024-01-15T11:00:00.000Z",
    "rejectedBy": "64f8a1b2c3d4e5f6a7b8c9d0"
  }
}
```

### Get Verification Logs
**GET** `/api/admin/logs`

Get audit logs of all verification actions.

**Headers:**
```
Authorization: Bearer ADMIN_ID:admin
```

**Query Parameters:**
- `action` (optional): Filter by action type
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "message": "Verification logs retrieved successfully",
  "data": {
    "logs": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "action": "payment_verified",
        "performedBy": {
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@university.edu",
          "role": "admin"
        },
        "targetPayment": {
          "slipNumber": "SLP123456",
          "amount": 50000,
          "status": "verified"
        },
        "details": "Payment verified by admin. Slip number: SLP123456",
        "ipAddress": "127.0.0.1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2024-01-15T11:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalLogs": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields. Please provide slip number, amount, payment date, and bank name.",
  "data": null
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. Please provide a valid authentication token.",
  "data": null
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required for this action.",
  "data": null
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Payment not found. Please check the payment ID and try again.",
  "data": null
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "A payment with this slip number already exists. Please check your slip number and try again.",
  "data": null
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "An error occurred while processing your request. Please try again later.",
  "data": null
}
```

---

## Quick Start Guide

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Seed the database:**
   ```bash
   npm run seed
   ```

3. **Test the API:**
   ```bash
   npm test
   ```

4. **Use the sample credentials:**
   - Admin: `admin@university.edu` / `admin123`
   - Student: `john.doe@university.edu` / `student123`

## Health Check

**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "success": true,
  "message": "Payment Verification System is running!",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```
