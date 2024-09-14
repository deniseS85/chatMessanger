const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', 'uploads');

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

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

router.post('/', upload.single('profile_img'), async (req, res) => {
    const { username, password, email, phoneNumber, avatarConfig } = req.body;
    const profile_img = req.file ? req.file.filename : null;

    try {
        const userExists = await checkUserAlreadyExist(email, phoneNumber);
        if (userExists) {
            return res.json({ message: 'You are already registered!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (username, password_hash, email, phone_number, profile_img, avatar_config) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(sql, [username, hashedPassword, email, phoneNumber, profile_img, avatarConfig || null], (err, result) => {
            if (err) {
                console.error(err);
                return res.json({ message: 'Error registering user' });
            }

            const userId = result.insertId;
            const insertStatusSql = "INSERT INTO user_status (user_id, online_status, last_login) VALUES (?, 'offline', CURRENT_TIMESTAMP)";
            db.query(insertStatusSql, [userId], (err) => {
                if (err) {
                    console.error('Error inserting user status:', err);
                    return res.json({ message: 'Error inserting user status' });
                }
                res.json({ success: true, message: 'User registered successfully' });
            });
        });
    } catch (err) {
        console.error(err);
        res.json({ message: 'Error checking user existence' });
    }
});

module.exports = router;
