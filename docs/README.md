# 🌐 BusBee Web - Backend API Server

Backend API server and web interface for the BusBee mobile application.

## 🏗️ Architecture

```
busbee-web/
├── api/               # Express.js API Server
│   ├── routes/        # API endpoints
│   ├── middleware/    # Authentication middleware
│   ├── utils/         # JWT utilities
│   ├── database/      # Database schema
│   └── package.json   # API dependencies
├── src/               # Next.js Web Interface
│   └── app/           # Minimal status page
├── docs/              # Documentation
│   ├── SETUP.md       # Complete setup guide
│   └── API.md         # API documentation
└── package.json       # Web dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v12+)

### Setup
1. **Install API dependencies:**
   ```bash
   cd api
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

3. **Initialize database:**
   ```bash
   npm run setup
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## 📚 Documentation

- **[Complete Setup Guide](./SETUP.md)** - Detailed development setup instructions
- **[API Documentation](./API.md)** - Complete API reference with examples

## 🔐 Features

- **JWT Authentication** - Secure token-based auth
- **Phone Number + OTP** - SMS-based login flow
- **User Management** - Role-based access (user/bus_owner)
- **Session Persistence** - Automatic token refresh
- **PostgreSQL Integration** - Robust data storage
- **Production Ready** - Clean, optimized codebase

## 🛠️ Tech Stack

- **Backend:** Express.js + PostgreSQL
- **Authentication:** JWT tokens
- **Frontend:** Next.js (minimal status page)
- **Database:** PostgreSQL with proper schema

## 🔧 Development

### API Server Commands
```bash
# Development with auto-reload
npm run dev

# Production mode
npm start

# Database setup
npm run setup
```

### Web Interface Commands
```bash
# Development server (from root directory)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🧪 Testing

Test the API endpoints:
```bash
# Health check
curl http://localhost:3001/

# Send OTP
curl -X POST http://localhost:3001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9876543210"}'

# Verify OTP (use 123456 for testing)
curl -X POST http://localhost:3001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9876543210", "otp": "123456", "userType": "user"}'
```

## 🚀 Deployment

For production deployment:
1. Set production environment variables
2. Use a production PostgreSQL database
3. Enable HTTPS
4. Configure proper CORS origins
5. Set up monitoring and logging

---

**Part of the BusBee Smart Bus Management System** 🚌
