# 🔌 BusBee API Documentation

REST API server for the BusBee mobile application with JWT authentication.

## 🚀 Server Information

- **Base URL:** `http://localhost:3001` (development)
- **Authentication:** JWT Bearer tokens
- **Database:** PostgreSQL
- **Framework:** Express.js

## 📋 API Endpoints

### 🔐 Authentication Endpoints

#### Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "phoneNumber": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "phoneNumber": "9876543210",
    "otpSent": true
  }
}
```

#### Verify OTP & Login
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "9876543210",
  "otp": "123456",
  "userType": "user",
  "deviceInfo": {}
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "phoneNumber": "9876543210",
      "name": null,
      "email": null,
      "userType": "user",
      "isVerified": true,
      "profile": null
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": "7d",
    "isNewUser": false
  }
}
```

#### Resend OTP
```http
POST /api/auth/resend-otp
Content-Type: application/json

{
  "phoneNumber": "9876543210"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get User Profile (Protected)
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "phoneNumber": "9876543210",
      "name": null,
      "email": null,
      "userType": "user",
      "isVerified": true,
      "profile": null
    }
  }
}
```

#### Logout (Protected)
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

#### Verify Token (Protected)
```http
GET /api/auth/verify-token
Authorization: Bearer <access_token>
```

### 👥 User Endpoints

#### List Users (Protected)
```http
GET /users
Authorization: Bearer <access_token>
```

### 🏥 Health Check

#### Server Status
```http
GET /
```

**Response:**
```json
{
  "message": "BusBee API Server is running!",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

## 🔑 Authentication

### JWT Token Structure

**Access Token Payload:**
```json
{
  "id": 1,
  "phoneNumber": "9876543210",
  "userType": "user",
  "iat": 1640995200,
  "exp": 1641600000
}
```

**Token Usage:**
```http
Authorization: Bearer <access_token>
```

### User Types
- `user` - Regular app users
- `bus_owner` - Bus operators/administrators

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## ⚠️ Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `INVALID_OTP` | 400 | OTP is invalid or expired |
| `AUTH_FAILED` | 401 | Authentication failed |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `TOKEN_INVALID` | 401 | JWT token is invalid |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `SERVER_ERROR` | 500 | Internal server error |

## 🧪 Testing

### Development OTP
For testing purposes, you can use:
- **Test OTP:** `123456`
- **Phone Number:** Any valid 10-digit Indian mobile number (starting with 6-9)

### Example Test Flow
```bash
# 1. Send OTP
curl -X POST http://localhost:3001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9876543210"}'

# 2. Verify OTP (use 123456 for testing)
curl -X POST http://localhost:3001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9876543210", "otp": "123456", "userType": "user"}'

# 3. Use returned access token for protected endpoints
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <your_access_token>"
```

## 🔒 Security Features

- **JWT Authentication** with access and refresh tokens
- **Phone Number Validation** (Indian mobile numbers)
- **OTP Expiration** (configurable timeout)
- **Session Management** with database storage
- **Input Validation** and sanitization
- **CORS Configuration** for cross-origin requests
- **Rate Limiting** (can be added for production)

## 🗄️ Database Schema

### Key Tables
- `users` - User accounts and profiles
- `otps` - OTP codes and expiration
- `user_sessions` - Active user sessions with JWT tokens
- `bus_owner_profiles` - Extended profiles for bus owners

See [`database/schema.sql`](./database/schema.sql) for complete schema.

## 🚀 Deployment

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=busbee_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# Server
PORT=3001
NODE_ENV=production
```

### Production Considerations
- Use strong JWT secrets
- Enable HTTPS
- Configure proper CORS origins
- Set up database connection pooling
- Implement rate limiting
- Add request logging
- Set up monitoring and alerts

---

**API Version:** 1.0.0  
**Last Updated:** January 2024