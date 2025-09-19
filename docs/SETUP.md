# 🚀 BusBee Development Setup Guide

This guide will help you set up the complete BusBee development environment on your local machine.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)
- **Expo CLI** - Install globally: `npm install -g @expo/cli`
- **Android Studio** (for Android development) or **Xcode** (for iOS development)

## 🏗️ Project Structure

```
BusBee/
├── BB_Admin/          # React Native Mobile App (Expo)
└── busbee-web/        # Backend API + Web Interface
    └── api/           # Express.js API Server
```

## 🔧 Setup Instructions

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

### Step 2: Backend Setup (busbee-web)

#### 2.1 Install Backend Dependencies

```bash
cd busbee-web/api
npm install
```

#### 2.2 Database Setup

1. **Create PostgreSQL Database:**
   ```bash
   # Connect to PostgreSQL (adjust connection details as needed)
   psql -U postgres
   
   # Create database
   CREATE DATABASE busbee_db;
   
   # Exit PostgreSQL
   \q
   ```

2. **Configure Environment Variables:**
   ```bash
   # Copy environment template
   cp env.example .env
   
   # Edit .env file with your database credentials
   nano .env
   ```

   Update the `.env` file:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=busbee_db
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   JWT_EXPIRES_IN=7d
   REFRESH_TOKEN_EXPIRES_IN=30d
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   ```

3. **Initialize Database Schema:**
   ```bash
   npm run setup
   ```

#### 2.3 Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The API server will be available at: `http://localhost:3001`

### Step 3: Mobile App Setup (BB_Admin)

#### 3.1 Install Mobile App Dependencies

```bash
cd ../BB_Admin
npm install
```

#### 3.2 Configure Mobile App Environment

1. **Find Your Computer's IP Address:**
   
   **Windows:**
   ```cmd
   ipconfig
   ```
   Look for your IPv4 Address (usually something like `192.168.1.xxx`)
   
   **macOS/Linux:**
   ```bash
   ifconfig
   ```
   Look for your local network IP address

2. **Update API Configuration:**
   
   Edit `BB_Admin/src/config/environment.ts`:
   ```typescript
   const environments = {
     development: {
       apiBaseUrl: 'http://YOUR_IP_ADDRESS:3001', // Replace with your IP
       apiTimeout: 10000,
     },
     // ... rest of the config
   };
   ```
   
   **Example:** If your IP is `192.168.1.100`, use `http://192.168.1.100:3001`

#### 3.3 Android Network Configuration (Android Only)

For Android development, you need to allow HTTP traffic to your local backend:

**✅ Already Configured:** The network security config is set up in the project to allow HTTP connections for development.

**⚠️ Important:** The current configuration allows HTTP to ANY domain for development ease. This is:
- ✅ **Safe for development** - Only affects your local development build
- ❌ **NOT for production** - Must be changed before production release

**Files involved:**
- `android/app/src/main/res/xml/network_security_config.xml` - Allows HTTP traffic
- `app.json` - References the network config

```json
{
  "expo": {
    "android": {
      "networkSecurityConfig": "network_security_config"
    }
  }
}
```

#### 3.4 Start Mobile App

```bash
# Start Expo development server
npx expo start

# Or with cache cleared
npx expo start --clear
```

### Step 4: Testing the Setup

#### 4.1 Test Backend API

1. **Health Check:**
   ```bash
   curl http://localhost:3001/
   ```
   Should return: `{"message": "BusBee API Server is running!"}`

2. **Test OTP Sending:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/send-otp \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber": "9876543210"}'
   ```

#### 4.2 Test Mobile App

1. **Scan QR Code:** Use Expo Go app on your phone to scan the QR code
2. **Test Login:** Try logging in with any 10-digit phone number
3. **Use Test OTP:** Enter `123456` as OTP for testing

## 🔍 Troubleshooting

### Common Issues & Solutions

#### 1. "Network request failed" in Mobile App

**Problem:** Mobile app can't connect to backend API

**Solutions:**
- ✅ Ensure both devices are on the same WiFi network
- ✅ Use your computer's IP address (not `localhost` or `127.0.0.1`)
- ✅ Check Windows Firewall/antivirus isn't blocking port 3001
- ✅ Verify backend server is running on `http://YOUR_IP:3001`

#### 2. Database Connection Errors

**Problem:** Backend can't connect to PostgreSQL

**Solutions:**
- ✅ Verify PostgreSQL is running: `pg_ctl status`
- ✅ Check database credentials in `.env` file
- ✅ Ensure database `busbee_db` exists
- ✅ Test connection: `psql -U postgres -d busbee_db`

#### 3. "Port 3001 already in use"

**Problem:** Another process is using port 3001

**Solutions:**
- ✅ Kill existing process: `npx kill-port 3001`
- ✅ Or change port in `.env`: `PORT=3002`
- ✅ Update mobile app config to match new port

#### 4. Expo/React Native Issues

**Problem:** Mobile app won't start or has errors

**Solutions:**
- ✅ Clear cache: `npx expo start --clear`
- ✅ Reset Metro bundler: `npx expo r -c`
- ✅ Reinstall dependencies: `rm -rf node_modules && npm install`
- ✅ Check Node.js version compatibility

### 5. JWT Token Issues

**Problem:** Authentication errors or token validation failures

**Solutions:**
- ✅ Ensure `JWT_SECRET` is set in `.env`
- ✅ Use a long, random JWT secret (32+ characters)
- ✅ Restart backend server after changing JWT_SECRET
- ✅ Clear app storage if tokens are corrupted

## 📱 Development Workflow

### Daily Development Setup

1. **Start Backend:**
   ```bash
   cd busbee-web/api
   npm run dev
   ```

2. **Start Mobile App:**
   ```bash
   cd BB_Admin
   npx expo start
   ```

3. **Open in IDE:** Use VS Code or your preferred editor

### Testing Authentication Flow

1. **Send OTP:** Enter any 10-digit Indian phone number
2. **Verify OTP:** Use `123456` for testing (bypasses real OTP)
3. **Dashboard Access:** Should redirect to appropriate dashboard
4. **Session Persistence:** Close and reopen app - should stay logged in

## 🌐 Network Configuration

### For Team Development

If working with team members on different networks:

1. **Use ngrok for external access:**
   ```bash
   # Install ngrok
   npm install -g ngrok
   
   # Expose local API server
   ngrok http 3001
   ```

2. **Update mobile app config with ngrok URL:**
   ```typescript
   apiBaseUrl: 'https://your-ngrok-url.ngrok.io'
   ```

## 🚀 Production Deployment Notes

When ready for production:

1. **Environment Variables:** Set production values for all environment variables
2. **Database:** Use production PostgreSQL instance
3. **API URL:** Update mobile app to use production API URL
4. **JWT Secret:** Use a secure, production JWT secret
5. **HTTPS:** Enable HTTPS for production API
6. **Build Mobile App:** Use `expo build` for production builds

## 📞 Support

If you encounter issues not covered in this guide:

1. Check the console logs for detailed error messages
2. Verify all prerequisites are correctly installed
3. Ensure network connectivity between mobile app and API server
4. Review environment variable configuration

## 🎯 Quick Start Checklist

- [ ] Node.js and npm installed
- [ ] PostgreSQL installed and running
- [ ] Repository cloned
- [ ] Backend dependencies installed (`cd busbee-web/api && npm install`)
- [ ] Database created and schema initialized (`npm run setup`)
- [ ] Environment variables configured (`.env` file)
- [ ] Mobile app dependencies installed (`cd BB_Admin && npm install`)
- [ ] IP address updated in mobile app config
- [ ] Backend server running (`npm run dev`)
- [ ] Mobile app running (`npx expo start`)
- [ ] Test login with phone number and OTP `123456`

---

**Happy coding! 🎉**

For any questions or issues, please reach out to the development team.
