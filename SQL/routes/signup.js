const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const router = express.Router();

const checkUserAlreadyExist = (email, phoneNumber) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM users WHERE email = ? OR phone_number = ?`;
        db.query(query, [email, phoneNumber], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results.length > 0);
        });
    });
};

router.post('/', async (req, res) => {
    const { username, password, email, phoneNumber } = req.body;

    try {
        const userExists = await checkUserAlreadyExist(email, phoneNumber);
        if (userExists) {
            return res.status(400).json({ message: 'You are already registered!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (username, password_hash, email, phone_number) VALUES (?, ?, ?, ?)";
        db.query(sql, [username, hashedPassword, email, phoneNumber], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(400).json({ message: 'Error registering user' });
            }

            const userId = result.insertId;
            const insertStatusSql = "INSERT INTO user_status (user_id, online_status, last_login) VALUES (?, 'offline', CURRENT_TIMESTAMP)";
            db.query(insertStatusSql, [userId], (err) => {
                if (err) {
                    console.error('Error inserting user status:', err);
                    return res.status(500).json({ message: 'Error inserting user status' });
                }
                res.json({ success: true, message: 'User registered successfully' });
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error checking user existence' });
    }
});

module.exports = router;
