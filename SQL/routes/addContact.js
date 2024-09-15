const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', (req, res) => {
    const { userId, name, phoneNumber } = req.body;

    const checkUserQuery = 'SELECT id FROM users WHERE username = ? AND phone_number = ?';
    
    db.query(checkUserQuery, [name, phoneNumber], (err, results) => {
        if (err) {
            return res.json({ message: 'Database error', type: 'error' });
        }

        if (results.length > 0) {
            const contactId = results[0].id;

            if (Number(userId) === Number(contactId)) {
                return res.json({ message: 'You cannot send a request to yourself', type: 'error' });
            }

            const checkRequestQuery = 'SELECT * FROM Friends WHERE (UserId1 = ? AND UserId2 = ?) OR (UserId1 = ? AND UserId2 = ?)';
            
            db.query(checkRequestQuery, [userId, contactId, contactId, userId], (err, requestResults) => {
                if (err) {
                    return res.json({ message: 'Error checking the request', type: 'error' });
                }

                if (requestResults.length > 0) {
                    const currentState = requestResults[0].acceptState;
                    if (currentState === 'pending' || currentState === 'sent') {
                        return res.json({ message: 'Request already sent and pending', type: 'error' });
                    } else if (currentState === 'accepted') {
                        return res.json({ message: 'You are already friends', type: 'error' });
                    } else if (currentState === 'rejected') {
                        return res.json({ message: 'Request was rejected. You can try again in 24 hours', type: 'error' });
                    }
                }

                const addRequestQuery = 'INSERT INTO Friends (UserId1, UserId2, acceptState) VALUES (?, ?, "sent")';
                db.query(addRequestQuery, [userId, contactId], (err) => {
                    if (err) {
                        return res.json({ message: 'Error sending the contact request', type: 'error' });
                    }
                    return res.json({ message: 'Contact request sent successfully', type: 'success' });
                });
            });
        } else {
            return res.json({ message: 'User not found', type: 'error' });
        }
    });
});

module.exports = router;
