const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Abrufen der ausstehenden Freundschaftsanfragen
router.get('/:userId', (req, res) => {
    const { userId } = req.params;
    const checkRequestsQuery = `
        SELECT * FROM Friends 
        WHERE UserId2 = ? AND (acceptState = "sent" OR acceptState = "pending")
    `;

    db.query(checkRequestsQuery, [userId], (err, results) => {
        if (err) {
            return res.json({ message: 'Database error', type: 'error' });
        }

        const sentRequests = results.filter(request => request.acceptState === 'sent');
        const pendingRequests = results.filter(request => request.acceptState === 'pending');

        return res.json({
            sentRequests,
            pendingRequests,
            type: 'success'
        });
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

// Freundschaftsanfrage nicht beantworten
router.post('/update-request-status', (req, res) => {
    const { requestId } = req.body;
    const updateStatusQuery = 'UPDATE Friends SET acceptState = "pending" WHERE FriendID = ? AND acceptState = "sent"';

    db.query(updateStatusQuery, [requestId], (err, results) => {
        if (err) {
            return res.json({ message: 'Database error', type: 'error' });
        }
        return res.json({ message: 'Status updated to pending', type: 'success' });
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