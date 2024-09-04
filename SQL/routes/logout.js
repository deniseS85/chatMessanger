const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.post('/', (req, res) => {
    const { userId } = req.body;
    
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    const updateStatusQuery = `UPDATE user_status SET online_status = 'offline', last_login = CURRENT_TIMESTAMP WHERE user_id = ?`;
    
    db.query(updateStatusQuery, [userId], (err) => {
        if (err) {
            console.error('Failed to update status:', err);
            return res.status(500).json({ success: false, message: 'Failed to update status' });
        }
        res.json({ success: true, message: 'Logout successful' });
    });
});

module.exports = router;
