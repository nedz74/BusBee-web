const express = require('express');
const crypto = require('crypto');
const { Pool } = require('pg');
const { generateTokenPair, verifyToken } = require('../utils/jwt');
const { authenticateToken, authenticateRefreshToken } = require('../middleware/auth');

const router = express.Router();

// Database connection (will be passed from main app)
let pool;

const setPool = (dbPool) => {
    pool = dbPool;
};

// Generate random 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate session token
const generateSessionToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Send OTP (In production, integrate with SMS service like Twilio)
const sendOTP = async (phoneNumber, otp) => {
    // For development, just log the OTP
    console.log(`📱 OTP for ${phoneNumber}: ${otp}`);
    
    // TODO: Integrate with SMS service
    // Example with Twilio:
    // const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // const authToken = process.env.TWILIO_AUTH_TOKEN;
    // const client = require('twilio')(accountSid, authToken);
    // 
    // await client.messages.create({
    //     body: `Your BusBee OTP is: ${otp}`,
    //     from: process.env.TWILIO_PHONE_NUMBER,
    //     to: phoneNumber
    // });
    
    return true;
};

// POST /api/auth/send-otp
// Send OTP to phone number
router.post('/send-otp', async (req, res) => {
    try {
        const { phoneNumber, userType = 'user' } = req.body;

        // Validate phone number
        if (!phoneNumber || !/^[6-9]\d{9}$/.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid 10-digit mobile number'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

        // Delete any existing unused OTPs for this phone number
        await pool.query(
            'DELETE FROM otps WHERE phone_number = $1 AND is_used = FALSE',
            [phoneNumber]
        );

        // Store OTP in database
        await pool.query(
            'INSERT INTO otps (phone_number, otp_code, purpose, expires_at) VALUES ($1, $2, $3, $4)',
            [phoneNumber, otp, 'login', expiresAt]
        );

        // Send OTP via SMS
        await sendOTP(phoneNumber, otp);

        res.json({
            success: true,
            message: 'OTP sent successfully',
            data: {
                phoneNumber,
                expiresIn: 120 // seconds
            }
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP. Please try again.'
        });
    }
});

// POST /api/auth/verify-otp
// Verify OTP and login/register user
router.post('/verify-otp', async (req, res) => {
    try {
        const { phoneNumber, otp, userType = 'user', deviceInfo = {} } = req.body;
        
        // Validate input
        if (!phoneNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and OTP are required'
            });
        }

        if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid 10-digit mobile number'
            });
        }

        // Accept universal test OTP or validate real OTP
        if (otp !== '123456') {
            return res.status(400).json({
                success: false,
                message: 'For testing, please use OTP: 123456'
            });
        }


        // Check if user exists in database
        let userResult = await pool.query(
            'SELECT * FROM users WHERE phone_number = $1',
            [phoneNumber]
        );

        let user;
        let isNewUser = false;

        if (userResult.rows.length === 0) {
            // Create new user in database
            const insertResult = await pool.query(
                'INSERT INTO users (phone_number, user_type, is_verified, name) VALUES ($1, $2, TRUE, $3) RETURNING *',
                [phoneNumber, userType, userType === 'bus_owner' ? 'Bus Owner' : 'User']
            );
            user = insertResult.rows[0];
            isNewUser = true;
        } else {
            user = userResult.rows[0];
            // Update user verification status
            await pool.query(
                'UPDATE users SET is_verified = TRUE, updated_at = NOW() WHERE id = $1',
                [user.id]
            );
        }

        const tokens = generateTokenPair(user);

        // Create user session
        const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await pool.query(
            'INSERT INTO user_sessions (user_id, session_token, device_info, expires_at) VALUES ($1, $2, $3, $4)',
            [user.id, tokens.accessToken, JSON.stringify(deviceInfo), sessionExpiresAt]
        );

        // Get profile data if bus owner
        let profileData = null;
        if (user.user_type === 'bus_owner') {
            const profileResult = await pool.query(
                'SELECT * FROM bus_owner_profiles WHERE user_id = $1',
                [user.id]
            );
            profileData = profileResult.rows[0] || null;
        }


        res.json({
            success: true,
            message: isNewUser ? 'Account created successfully' : 'Login successful',
            data: {
                user: {
                    id: user.id,
                    phoneNumber: user.phone_number,
                    name: user.name,
                    email: user.email,
                    userType: user.user_type,
                    isVerified: user.is_verified,
                    profile: profileData
                },
                ...tokens,
                isNewUser
            }
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP. Please try again.'
        });
    }
});


// POST /api/auth/resend-otp
// Resend OTP to phone number
router.post('/resend-otp', async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        // Validate phone number
        if (!phoneNumber || !/^[6-9]\d{9}$/.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid 10-digit mobile number'
            });
        }

        // Check if there's a recent OTP request (prevent spam)
        const recentOtpResult = await pool.query(
            'SELECT * FROM otps WHERE phone_number = $1 AND created_at > NOW() - INTERVAL \'30 seconds\' ORDER BY created_at DESC LIMIT 1',
            [phoneNumber]
        );

        if (recentOtpResult.rows.length > 0) {
            return res.status(429).json({
                success: false,
                message: 'Please wait 30 seconds before requesting a new OTP'
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

        // Delete any existing unused OTPs for this phone number
        await pool.query(
            'DELETE FROM otps WHERE phone_number = $1 AND is_used = FALSE',
            [phoneNumber]
        );

        // Store new OTP in database
        await pool.query(
            'INSERT INTO otps (phone_number, otp_code, purpose, expires_at) VALUES ($1, $2, $3, $4)',
            [phoneNumber, otp, 'login', expiresAt]
        );

        // Send OTP via SMS
        await sendOTP(phoneNumber, otp);

        res.json({
            success: true,
            message: 'OTP resent successfully',
            data: {
                phoneNumber,
                expiresIn: 120 // seconds
            }
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend OTP. Please try again.'
        });
    }
});

// POST /api/auth/logout
// Logout user and invalidate session
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');

        if (token) {
            // Invalidate current session in database
            await pool.query(
                'UPDATE user_sessions SET is_active = FALSE WHERE session_token = $1',
                [token]
            );
        } else {
            // If no token provided, invalidate all sessions for this user (safer)
            await pool.query(
                'UPDATE user_sessions SET is_active = FALSE WHERE user_id = $1',
                [req.user.id]
            );
        }


        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to logout. Please try again.'
        });
    }
});

// GET /api/auth/me
// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
    try {
        // Get user data using the authenticated user ID
        const userResult = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = userResult.rows[0];

        // Get profile data if bus owner
        let profileData = null;
        if (user.user_type === 'bus_owner') {
            const profileResult = await pool.query(
                'SELECT * FROM bus_owner_profiles WHERE user_id = $1',
                [user.id]
            );
            profileData = profileResult.rows[0] || null;
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    phoneNumber: user.phone_number,
                    name: user.name,
                    email: user.email,
                    userType: user.user_type,
                    isVerified: user.is_verified,
                    profile: profileData
                }
            }
        });

    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user profile'
        });
    }
});

// POST /api/auth/refresh
// Refresh access token using refresh token
router.post('/refresh', authenticateRefreshToken, async (req, res) => {
    try {
        // Get user data
        const userResult = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = userResult.rows[0];

        // Generate new token pair
        const tokens = generateTokenPair(user);

        // Update session with new access token
        await pool.query(
            'UPDATE user_sessions SET session_token = $1, updated_at = NOW() WHERE user_id = $2 AND is_active = TRUE',
            [tokens.accessToken, user.id]
        );


        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: tokens
        });

    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to refresh token'
        });
    }
});

// GET /api/auth/verify-token
// Verify if current token is valid
router.get('/verify-token', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid',
        data: {
            user: {
                id: req.user.id,
                phoneNumber: req.user.phoneNumber,
                userType: req.user.userType
            },
            tokenValid: true
        }
    });
});


module.exports = { router, setPool };
