const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', (req, res) => {
    const { userId, name, phoneNumber } = req.body;

    const checkUserQuery = 'SELECT id FROM users WHERE username = ? AND phone_number = ?';
    db.query(checkUserQuery, [name, phoneNumber], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error', type: 'error' });
        }

        if (results.length > 0) {
            const contactId = results[0].id;
            const checkRequestQuery = 'SELECT * FROM Friends WHERE UserId1 = ? AND UserId2 = ?';
            db.query(checkRequestQuery, [userId, contactId], (err, requestResults) => {
                if (err) {
                    return res.status(500).json({ message: 'Error checking the request', type: 'error' });
                }

                if (requestResults.length === 0) {
                    const addRequestQuery = 'INSERT INTO Friends (UserId1, UserId2, acceptState) VALUES (?, ?, "pending")';
                    db.query(addRequestQuery, [userId, contactId], (err) => {
                        if (err) {
                            return res.status(500).json({ message: 'Error sending the contact request', type: 'error' });
                        }

                        return res.status(200).json({ message: 'Send contact request', type: 'success' });
                    });
                } else {
                    return res.status(400).json({ message: 'Request already sent', type: 'error' });
                }
            });
        } else {
            return res.status(404).json({ message: 'User not found', type: 'error' });
        }
    });
});

router.post('/contact-request/accept', (req, res) => {
    const { requestId } = req.body;

    const updateRequestQuery = 'UPDATE Friends SET acceptState = "accepted" WHERE FriendID = ?';
    db.query(updateRequestQuery, [requestId], (err, result) => {
        if (err) {
            console.error('Fehler beim Akzeptieren der Anfrage:', err);
            return res.status(500).json({ message: 'Fehler beim Akzeptieren der Anfrage' });
        }

        return res.status(200).json({ message: 'Anfrage akzeptiert' });
    });
});

router.post('/contact-request/decline', (req, res) => {
    const { requestId } = req.body;

    const updateRequestQuery = 'UPDATE Friends SET acceptState = "rejected" WHERE FriendID = ?';
    db.query(updateRequestQuery, [requestId], (err, result) => {
        if (err) {
            console.error('Fehler beim Ablehnen der Anfrage:', err);
            return res.status(500).json({ message: 'Fehler beim Ablehnen der Anfrage' });
        }

        return res.status(200).json({ message: 'Anfrage abgelehnt' });
    });
});


module.exports = router;
