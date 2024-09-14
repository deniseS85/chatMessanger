const express = require('express');
const crypto = require('crypto');
const db = require('../config/db');
const { sendPasswordResetEmail } = require('../utils/email');

const router = express.Router();

router.post('/', async (req, res) => {
    const { email } = req.body;
    const query = "SELECT username FROM users WHERE email = ?";

    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.json({ message: 'User not found' });
        }

        const username = results[0].username; 
        const token = crypto.randomBytes(20).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000);

        const updateQuery = `UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE email = ?`;

        db.query(updateQuery, [token, expiresAt, email], (err) => {
            if (err) {
                console.error('Database update error:', err);
                return res.json({ message: 'Failed to update user with reset token' });
            }

            sendPasswordResetEmail(email, username, token);

            res.json({ message: 'Reset link sent to your email.' });
        });
    });
});

module.exports = router;
