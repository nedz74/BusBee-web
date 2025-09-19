const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // 7 days
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d'; // 30 days

// Generate a secure JWT secret if not provided
if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET not found in environment variables. Using generated secret.');
    console.warn('Add JWT_SECRET to your .env file for production.');
}

/**
 * Generate JWT access token
 * @param {Object} payload - User data to include in token
 * @returns {string} JWT token
 */
const generateAccessToken = (payload) => {
    try {
        const token = jwt.sign(
            {
                id: payload.id,
                phoneNumber: payload.phoneNumber,
                userType: payload.userType,
                type: 'access'
            },
            JWT_SECRET,
            {
                expiresIn: JWT_EXPIRES_IN,
                issuer: 'busbee-api',
                audience: 'busbee-app'
            }
        );
        return token;
    } catch (error) {
        console.error('Error generating access token:', error);
        throw new Error('Failed to generate access token');
    }
};

/**
 * Generate JWT refresh token
 * @param {Object} payload - User data to include in token
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (payload) => {
    try {
        const token = jwt.sign(
            {
                id: payload.id,
                phoneNumber: payload.phoneNumber,
                type: 'refresh'
            },
            JWT_SECRET,
            {
                expiresIn: REFRESH_TOKEN_EXPIRES_IN,
                issuer: 'busbee-api',
                audience: 'busbee-app'
            }
        );
        return token;
    } catch (error) {
        console.error('Error generating refresh token:', error);
        throw new Error('Failed to generate refresh token');
    }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'busbee-api',
            audience: 'busbee-app'
        });
        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        } else {
            throw new Error('Token verification failed');
        }
    }
};

/**
 * Decode JWT token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
    try {
        return jwt.decode(token, { complete: true });
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

/**
 * Generate token pair (access + refresh)
 * @param {Object} user - User object
 * @returns {Object} Object containing access and refresh tokens
 */
const generateTokenPair = (user) => {
    const payload = {
        id: user.id,
        phoneNumber: user.phone_number,
        userType: user.user_type
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: JWT_EXPIRES_IN
    };
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Extracted token or null
 */
const extractTokenFromHeader = (authHeader) => {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }
    
    return parts[1];
};

/**
 * Check if token is expired
 * @param {Object} decoded - Decoded JWT payload
 * @returns {boolean} True if token is expired
 */
const isTokenExpired = (decoded) => {
    if (!decoded.exp) return false;
    return Date.now() >= decoded.exp * 1000;
};

/**
 * Get token expiration date
 * @param {string} token - JWT token
 * @returns {Date|null} Expiration date or null
 */
const getTokenExpiration = (token) => {
    try {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.payload.exp) return null;
        return new Date(decoded.payload.exp * 1000);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    decodeToken,
    generateTokenPair,
    extractTokenFromHeader,
    isTokenExpired,
    getTokenExpiration,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN
};
