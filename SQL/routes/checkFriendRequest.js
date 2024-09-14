const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Abrufen der ausstehenden Freundschaftsanfragen
router.get('/:userId', (req, res) => {
    const { userId } = req.params;
    const checkPendingRequestsQuery = 'SELECT * FROM Friends WHERE UserId2 = ? AND acceptState = "pending"';

    db.query(checkPendingRequestsQuery, [userId], (err, results) => {
        if (err) {
            return res.json({ message: 'Database error', type: 'error' });
        }

        return res.json({ requests: results || [], type: 'success' });
    });
});

// Abrufen der Benutzerinformationen für eine bestimmte Benutzer-ID
router.get('/users/:userId', (req, res) => {
    const { userId } = req.params;
    const query = 'SELECT username, profile_img, avatar_config FROM Users WHERE id = ?';

    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.json({ message: 'Database error', type: 'error' });
        }

        if (results.length > 0) {
            return res.json({ data: results[0], type: 'success' });
        } else {
            return res.json({ message: 'User not found', type: 'error' });
        }
    });
});

// Freundschaftsanfrage akzeptieren
router.post('/accept', (req, res) => {
    const { requestId } = req.body;
    const acceptRequestQuery = 'UPDATE Friends SET acceptState = "accepted" WHERE FriendID = ?';

    db.query(acceptRequestQuery, [requestId], (err, results) => {
        if (err) {
            return res.json({ message: 'Database error', type: 'error' });
        }

        return res.json({ message: 'Friend request accepted', type: 'success' });
    });
});

// Freundschaftsanfrage ablehnen
router.post('/reject', (req, res) => {
    const { requestId } = req.body;
    const rejectRequestQuery = 'UPDATE Friends SET acceptState = "rejected" WHERE FriendID = ?';

    db.query(rejectRequestQuery, [requestId], (err, results) => {
        if (err) {
            return res.json({ message: 'Database error', type: 'error' });
        }

        return res.json({ message: 'Friend request rejected', type: 'success' });
    });
});

module.exports = router;