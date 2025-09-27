# Payment Verification System

A comprehensive backend system for manual payment verification of tuition fees, built with Node.js, Express, TypeScript, and MongoDB.

## Features

### For Students
- **Submit Payment**: Upload payment details including bank slip number, amount, date, and bank name
- **Track Status**: View payment history and current status (pending, verified, rejected)
- **Real-time Updates**: Get notified when payment status changes

### For Admins
- **Review Payments**: View all pending payments with student details
- **Verify/Reject**: Mark payments as verified or rejected with reasons
- **Audit Trail**: Complete logging system tracking all verification actions
- **Dashboard**: Summary statistics and payment overview

### System Features
- **Clear API Responses**: User-friendly error messages and success responses
- **Input Validation**: Comprehensive validation for all inputs
- **Security**: Authentication and authorization middleware
- **Logging**: Complete audit trail for all actions
- **Error Handling**: Robust error handling with clear messages

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Student Payment Management
- `POST /api/payments/submit` - Submit new payment
- `GET /api/payments/my-payments` - Get student's payment history
- `GET /api/payments/:paymentId` - Get specific payment details

### Admin Management
- `GET /api/admin/payments` - Get all payments (with filtering)
- `PUT /api/admin/payments/:paymentId/verify` - Verify a payment
- `PUT /api/admin/payments/:paymentId/reject` - Reject a payment
- `GET /api/admin/logs` - Get verification logs

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd payment-verification-nodejs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

### Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/payment-verification
PORT=3000
NODE_ENV=development
```

## API Usage Examples

### 1. Register a Student
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@university.edu",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "studentId": "STU001"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@university.edu",
    "password": "password123"
  }'
```

### 3. Submit Payment (Student)
```bash
curl -X POST http://localhost:3000/api/payments/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_ID:student" \
  -d '{
    "slipNumber": "SLP123456",
    "amount": 50000,
    "paymentDate": "2024-01-15",
    "bankName": "ABC Bank",
    "transactionReference": "TXN789",
    "notes": "Tuition fee payment"
  }'
```

### 4. Verify Payment (Admin)
```bash
curl -X PUT http://localhost:3000/api/admin/payments/PAYMENT_ID/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_ID:admin" \
  -d '{
    "notes": "Payment verified successfully"
  }'
```

## Project Structure

```
src/
├── config/
│   └── database.ts          # Database connection
├── controllers/
│   ├── adminController.ts   # Admin operations
│   ├── paymentController.ts # Payment operations
│   └── userController.ts    # User operations
├── middleware/
│   └── auth.ts             # Authentication middleware
├── models/
│   ├── logModel.ts         # Audit log model
│   ├── paymentModel.ts     # Payment model
│   └── userModel.ts        # User model
├── routes/
│   ├── adminRoutes.ts      # Admin routes
│   ├── authRoutes.ts       # Authentication routes
│   └── paymentRoutes.ts    # Payment routes
└── server.ts               # Main server file
```

## Database Schema

### Users Collection
- `email`: User email (unique)
- `password`: Hashed password
- `firstName`: First name
- `lastName`: Last name
- `studentId`: Student ID (unique)
- `role`: "student" or "admin"
- `isActive`: Account status

### Payments Collection
- `studentId`: Reference to User
- `slipNumber`: Bank slip number (unique)
- `amount`: Payment amount
- `paymentDate`: Date of payment
- `bankName`: Bank name
- `transactionReference`: Optional transaction reference
- `status`: "pending", "verified", or "rejected"
- `verifiedBy`: Reference to User (admin)
- `verifiedAt`: Verification timestamp
- `rejectionReason`: Reason for rejection
- `notes`: Additional notes

### Logs Collection
- `action`: Action performed
- `performedBy`: User who performed action
- `targetPayment`: Payment affected
- `details`: Action details
- `ipAddress`: IP address
- `userAgent`: User agent string

## Error Handling

The API provides clear, user-friendly error messages:

```json
{
  "success": false,
  "message": "Payment not found. Please check the payment ID and try again.",
  "data": null
}
```

## Security Features

- Password hashing with bcrypt
- Input validation and sanitization
- Role-based access control
- Request logging and audit trail
- CORS protection
- Rate limiting (can be added)

## Development

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
