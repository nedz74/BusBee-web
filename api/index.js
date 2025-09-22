const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8081'], // Next.js and Expo dev server
    credentials: true
}));
app.use(express.json());

// Import database connection
const { pool } = require('./database/connection');

// Import and setup auth routes
const { router: authRouter, setPool } = require('./routes/auth');
setPool(pool);

// Import and setup bus owner routes
const busOwnerRouter = require('./routes/bus-owner');

// Root API endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'BusBee API is running',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/users'
        }
    });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/bus-owner', busOwnerRouter);

// Example users endpoint (for testing)
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, phone_number, name, user_type, is_verified, created_at FROM users');
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Start server
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`API server running at http://localhost:${port}`);
});
