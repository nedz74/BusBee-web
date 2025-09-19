const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */
const authenticateToken = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required',
                code: 'NO_TOKEN'
            });
        }

        // Verify token
        const decoded = verifyToken(token);

        // Check if it's an access token
        if (decoded.type !== 'access') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token type',
                code: 'INVALID_TOKEN_TYPE'
            });
        }

        // Attach user info to request
        req.user = {
            id: decoded.id,
            phoneNumber: decoded.phoneNumber,
            userType: decoded.userType
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error.message);

        let errorCode = 'AUTH_FAILED';
        let statusCode = 401;

        if (error.message.includes('expired')) {
            errorCode = 'TOKEN_EXPIRED';
        } else if (error.message.includes('invalid')) {
            errorCode = 'INVALID_TOKEN';
        }

        return res.status(statusCode).json({
            success: false,
            message: error.message,
            code: errorCode
        });
    }
};

/**
 * Role-based authorization middleware
 * Checks if user has required role/user type
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                    code: 'NO_AUTH'
                });
            }

            const userRole = req.user.userType;
            const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

            if (!rolesArray.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions',
                    code: 'INSUFFICIENT_PERMISSIONS',
                    required: rolesArray,
                    current: userRole
                });
            }

            next();
        } catch (error) {
            console.error('Authorization error:', error);
            return res.status(500).json({
                success: false,
                message: 'Authorization check failed',
                code: 'AUTH_CHECK_FAILED'
            });
        }
    };
};

/**
 * Optional authentication middleware
 * Attaches user info if token is valid, but doesn't require authentication
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (token) {
            try {
                const decoded = verifyToken(token);
                
                if (decoded.type === 'access') {
                    req.user = {
                        id: decoded.id,
                        phoneNumber: decoded.phoneNumber,
                        userType: decoded.userType
                    };
                }
            } catch (error) {
                // Token is invalid but we don't fail the request
            }
        }

        next();
    } catch (error) {
        console.error('Optional auth error:', error);
        next(); // Continue without authentication
    }
};

/**
 * Refresh token middleware
 * Specifically for refresh token endpoints
 */
const authenticateRefreshToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required',
                code: 'NO_REFRESH_TOKEN'
            });
        }

        const decoded = verifyToken(token);

        // Check if it's a refresh token
        if (decoded.type !== 'refresh') {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
                code: 'INVALID_REFRESH_TOKEN'
            });
        }

        req.user = {
            id: decoded.id,
            phoneNumber: decoded.phoneNumber
        };

        next();
    } catch (error) {
        console.error('Refresh token authentication error:', error.message);

        return res.status(401).json({
            success: false,
            message: error.message,
            code: 'REFRESH_TOKEN_INVALID'
        });
    }
};

module.exports = {
    authenticateToken,
    requireRole,
    optionalAuth,
    authenticateRefreshToken
};
