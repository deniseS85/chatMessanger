const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const router = express.Router();

router.post('/', async (req, res) => {
    const { token, password } = req.body;

    const query = `SELECT email FROM users WHERE reset_token = ? AND reset_token_expires_at > NOW()`;

    db.query(query, [token], async (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.json({ message: 'Invalid or expired token' });
        }

        const email = results[0].email;
        const hashedPassword = await bcrypt.hash(password, 10);

        const updateQuery = `UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE email = ?`;

        db.query(updateQuery, [hashedPassword, email], (err) => {
            if (err) {
                console.error('Database update error:', err);
                return res.json({ message: 'Failed to update password' });
            }

            res.json({ message: 'Password has been successfully reset.' });
        });
    });
});

module.exports = router;
