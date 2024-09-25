const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', (req, res) => {
    const { userId, friendId } = req.body;


    const deleteFriendQuery = 'DELETE FROM Friends WHERE (UserId1 = ? AND UserId2 = ?) OR (UserId1 = ? AND UserId2 = ?)';

    db.query(deleteFriendQuery, [userId, friendId, friendId, userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', type: 'error' });
        }

        if (result.affectedRows > 0) {
            return res.json({ message: 'Friend removed successfully', type: 'success' });
        } else {
            return res.json({ message: 'Friend not found', type: 'error' });
        }
    });
});

module.exports = router;
