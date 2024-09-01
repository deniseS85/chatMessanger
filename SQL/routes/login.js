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
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length > 0) {
            const user = results[0];
            const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

            if (isPasswordCorrect) {
                res.json({ success: true, message: 'Login successful', user });
            } else {
                res.status(401).json({ success: false, message: 'Invalid password' });
            }
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    });
});

module.exports = router;
