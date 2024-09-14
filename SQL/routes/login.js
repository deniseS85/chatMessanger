const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const router = express.Router();

router.post('/', async (req, res) => {
    const { username, password } = req.body;
    const query = "SELECT * FROM users WHERE username = ?";

    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.json({ message: 'Database error' });
        }

        if (results.length > 0) {
            const user = results[0];
            const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

            if (isPasswordCorrect) {
                const updateStatusQuery = `UPDATE user_status SET online_status = 'online', last_login = CURRENT_TIMESTAMP WHERE user_id = ?`;

                db.query(updateStatusQuery, [user.id], (err) => {
                    if (err) {
                        console.error('Failed to update status:', err);
                        return res.json({ success: false, message: 'Failed to update status' });
                    }

                    res.json({ success: true, message: 'Login successful', user });
                });
            } else {
                res.json({ success: false, message: 'Invalid password' });
            }
        } else {
            res.json({ success: false, message: 'User not found' });
        }
    });
});

module.exports = router;
