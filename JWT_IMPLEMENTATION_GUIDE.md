# JWT Authentication Implementation Guide

## Overview

The Payment Verification System now uses JWT (JSON Web Tokens) for secure authentication instead of simple string tokens. This provides better security, token expiration handling, and industry-standard authentication practices.

## JWT Features

### 🔐 **Token Types**
- **Access Token**: Short-lived (7 days) for API access
- **Refresh Token**: Long-lived (30 days) for token renewal

### 🛡️ **Security Features**
- Token signature verification
- User validation on each request
- Role verification
- Token expiration handling
- Secure token generation

## API Changes

### Login Response Format

**Before (Simple Token):**
```json
{
  "success": true,
  "message": "Login successful! Welcome back.",
  "data": {
    "token": "user_id:role",
    "user": { ... }
  }
}
```

**After (JWT):**
```json
{
  "success": true,
  "message": "Login successful! Welcome back.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

### New Endpoint

**POST** `/api/auth/refresh`

Refresh an expired access token using a valid refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Access token refreshed successfully!",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Usage Examples

### 1. Login and Get Tokens

```javascript
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'student@university.edu',
    password: 'password123'
  })
});

const loginData = await loginResponse.json();
const accessToken = loginData.data.accessToken;
const refreshToken = loginData.data.refreshToken;
```

### 2. Use Access Token for API Calls

```javascript
const response = await fetch('http://localhost:3000/api/payments/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify(paymentData)
});
```

### 3. Refresh Expired Token

```javascript
const refreshResponse = await fetch('http://localhost:3000/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});

const refreshData = await refreshResponse.json();
const newAccessToken = refreshData.data.accessToken;
```

## Error Handling

### Token Expired
```json
{
  "success": false,
  "message": "Your session has expired. Please log in again.",
  "data": null
}
```

### Invalid Token
```json
{
  "success": false,
  "message": "Invalid authentication token. Please log in again.",
  "data": null
}
```

### Refresh Token Expired
```json
{
  "success": false,
  "message": "Refresh token has expired. Please log in again.",
  "data": null
}
```

## Environment Configuration

Add these environment variables to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRE=30d
```

## Testing

### Run Tests

```bash
# Test with fresh data (recommended)
npm run test:fresh

# Test with JWT-specific features
npm run test:jwt

# Test with existing data (may have conflicts)
npm test
```

### Test Scripts

1. **test-api-fresh.js**: Uses unique data for each test run
2. **test-jwt-api.js**: Comprehensive JWT feature testing
3. **test-api.js**: Basic API testing (updated for JWT)

## Migration from Simple Tokens

If you were using the old simple token format, update your code:

### Before
```javascript
const token = loginData.data.token; // "user_id:role"
```

### After
```javascript
const accessToken = loginData.data.accessToken; // JWT token
const refreshToken = loginData.data.refreshToken; // JWT refresh token
```

## Security Best Practices

1. **Store tokens securely**: Use httpOnly cookies or secure storage
2. **Handle token expiration**: Implement automatic refresh logic
3. **Use HTTPS**: Always use HTTPS in production
4. **Rotate secrets**: Change JWT secrets regularly
5. **Validate tokens**: Always verify tokens on the server side

## JWT Token Structure

### Access Token Payload
```json
{
  "userId": "user_id",
  "email": "user@example.com",
  "role": "student",
  "firstName": "John",
  "lastName": "Doe",
  "studentId": "STU001",
  "iat": 1640995200,
  "exp": 1641600000,
  "iss": "payment-verification-system",
  "aud": "payment-verification-users"
}
```

### Refresh Token Payload
```json
{
  "userId": "user_id",
  "type": "refresh",
  "iat": 1640995200,
  "exp": 1643587200,
  "iss": "payment-verification-system",
  "aud": "payment-verification-users"
}
```

## Troubleshooting

### Common Issues

1. **"Your session has expired"**: Access token expired, use refresh token
2. **"Invalid authentication token"**: Token is malformed or invalid
3. **"User not found"**: User was deleted or deactivated
4. **"User role has changed"**: User role was modified, re-login required

### Debug Tips

1. Check token expiration: `jwt.decode(token).exp`
2. Verify token signature: Use JWT debugger tools
3. Check user status in database
4. Validate token format and structure

## Performance Considerations

- JWT tokens are stateless (no database lookup for validation)
- Refresh tokens provide seamless user experience
- Token size is larger than simple tokens but still efficient
- Consider token blacklisting for immediate logout if needed

This JWT implementation provides enterprise-grade security while maintaining ease of use and clear error messages for developers.
