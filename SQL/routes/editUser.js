const express = require('express');
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const uploadPath = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
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

const deleteOldImage = (oldProfileImg) => {
    if (oldProfileImg) {
        const oldImagePath = path.join(uploadPath, oldProfileImg);
        if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
        }
    }
};

router.put('/:userId', upload.single('profile_img'), async (req, res) => {
    const userId = req.params.userId;
    const { username, email, phone_number, avatarConfig, deleteProfileImg } = req.body;
    const newProfileImg = req.file ? req.file.filename : null;

    try {
        const query = "SELECT profile_img FROM users WHERE id = ?";
        db.query(query, [userId], async (err, results) => {
            if (err) {
                console.error('Database query error', err);
                return res.status(500).json({ message: 'Database error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            const oldProfileImg = results[0].profile_img;

            let updateFields = [];
            let updateValues = [];

            if (username) {
                updateFields.push("username = ?");
                updateValues.push(username);
            }
            if (email) {
                updateFields.push("email = ?");
                updateValues.push(email);
            }
            if (phone_number) {
                updateFields.push("phone_number = ?");
                updateValues.push(phone_number);
            }

            if (deleteProfileImg === 'true') {
                updateFields.push("profile_img = ?");
                updateValues.push(null);
                updateFields.push("avatar_config = ?");
                updateValues.push(null);
                // Lösche das alte Bild
                deleteOldImage(oldProfileImg);
            } else if (newProfileImg) {
                updateFields.push("profile_img = ?");
                updateValues.push(newProfileImg);
                updateFields.push("avatar_config = ?");
                updateValues.push(null);
                // Lösche das alte Bild
                deleteOldImage(oldProfileImg);
            } else if (avatarConfig) {
                updateFields.push("avatar_config = ?");
                updateValues.push(avatarConfig);
                updateFields.push("profile_img = ?");
                updateValues.push(null);
                // Lösche das alte Bild
                deleteOldImage(oldProfileImg);
            } 

            updateValues.push(userId);
            const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;

            db.query(sql, updateValues, (err, result) => {
                if (err) {
                    console.error('Failed to update user:', err);
                    return res.status(500).json({ message: 'Failed to update user' });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'User not found' });
                }

                res.json({ success: true, message: 'Update user successful' });
            });
        });
    } catch (err) {
        console.error('Fehler:', err);
        res.status(500).json({ message: 'Failed to update user' });
    }
});

module.exports = router;
