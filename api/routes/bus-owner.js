const express = require('express');
const { pool } = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/bus-owner/details
// Save bus owner details (onboarding)
router.post('/details', authenticateToken, async (req, res) => {
    try {
        const { busOwnerName, busName, busNumber, rcBookNumber } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!busOwnerName || !busName || !busNumber || !rcBookNumber) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate bus number format (e.g., KA01AB1234)
        const busNumberRegex = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/;
        if (!busNumberRegex.test(busNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid bus number format. Use format like KA01AB1234'
            });
        }

        // Check if bus owner profile already exists
        const existingProfile = await pool.query(
            'SELECT id FROM bus_owner_profiles WHERE user_id = $1',
            [userId]
        );

        if (existingProfile.rows.length > 0) {
            // Update existing profile
            await pool.query(
                `UPDATE bus_owner_profiles 
                 SET bus_owner_name = $1, bus_name = $2, bus_number = $3, rc_book_number = $4, 
                     has_completed_onboarding = true, updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = $5`,
                [busOwnerName, busName, busNumber, rcBookNumber, userId]
            );
        } else {
            // Create new profile
            await pool.query(
                `INSERT INTO bus_owner_profiles 
                 (user_id, bus_owner_name, bus_name, bus_number, rc_book_number, has_completed_onboarding, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [userId, busOwnerName, busName, busNumber, rcBookNumber]
            );
        }

        res.json({
            success: true,
            message: 'Bus owner details saved successfully',
            data: {
                busOwnerName,
                busName,
                busNumber,
                rcBookNumber
            }
        });

    } catch (error) {
        console.error('Save bus owner details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save bus owner details. Please try again.'
        });
    }
});

// GET /api/bus-owner/details
// Get bus owner details
router.get('/details', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            'SELECT * FROM bus_owner_profiles WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({
                success: true,
                data: null,
                message: 'No bus owner details found'
            });
        }

        const profile = result.rows[0];
        res.json({
            success: true,
            data: {
                busOwnerName: profile.bus_owner_name,
                busName: profile.bus_name,
                busNumber: profile.bus_number,
                rcBookNumber: profile.rc_book_number,
                hasCompletedOnboarding: profile.has_completed_onboarding,
                createdAt: profile.created_at,
                updatedAt: profile.updated_at
            }
        });

    } catch (error) {
        console.error('Get bus owner details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get bus owner details. Please try again.'
        });
    }
});

// POST /api/bus-owner/mark-verification-modal-seen
// Mark that the user has seen the verification modal
router.post('/mark-verification-modal-seen', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Update the has_seen_verification_modal flag
        await pool.query(
            `UPDATE bus_owner_profiles 
             SET has_seen_verification_modal = true, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $1`,
            [userId]
        );

        res.json({
            success: true,
            message: 'Verification modal marked as seen'
        });

    } catch (error) {
        console.error('Mark verification modal seen error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark verification modal as seen. Please try again.'
        });
    }
});

module.exports = router;
