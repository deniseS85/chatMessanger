const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Endpoint zum Abrufen der Freunde eines Benutzers
router.get('/:userId', (req, res) => {
    const { userId } = req.params;

    const friendsQuery = `
        SELECT u.id, u.username, u.profile_img AS profilePic, u.avatar_config, us.online_status
        FROM Friends f
        JOIN Users u ON (f.UserId1 = u.id OR f.UserId2 = u.id)
        JOIN user_status us ON u.id = us.user_id
        WHERE 
            (f.UserId1 = ? OR f.UserId2 = ?) 
            AND f.acceptState = 'accepted'
            AND u.id != ? 
    `;

    db.query(friendsQuery, [userId, userId, userId], (error, results) => {
        if (error) {
            console.error('Fehler beim Abrufen der Freunde:', error);
            return res.json({ error: 'Internal Server Error' });
        }
        res.json(results);
    });
});

module.exports = router;
