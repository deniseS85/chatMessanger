const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', (req, res) => {
    const { userId, name, phoneNumber } = req.body;

    // Überprüfe, ob der Benutzer mit dem angegebenen Namen und der Telefonnummer existiert
    const checkUserQuery = 'SELECT id FROM users WHERE username = ? AND phone_number = ?';
    
    db.query(checkUserQuery, [name, phoneNumber], (err, results) => {
        if (err) { 
            return res.status(500).json({ message: 'Database error', type: 'error' });
        }

        if (results.length > 0) {
            const contactId = results[0].id;

            // Überprüfe, ob es bereits eine Freundschaftsanfrage gibt oder die Freundschaft akzeptiert wurde
            const checkRequestQuery = 'SELECT * FROM Friends WHERE (UserId1 = ? AND UserId2 = ?) OR (UserId1 = ? AND UserId2 = ?)';
            
            db.query(checkRequestQuery, [userId, contactId, contactId, userId], (err, requestResults) => {
                if (err) {
                    return res.status(500).json({ message: 'Error checking the request', type: 'error' });
                }

                // Falls eine Anfrage oder Freundschaft existiert, prüfe den Status
                if (requestResults.length > 0) {
                    const currentState = requestResults[0].acceptState;
                    if (currentState === 'pending') {
                        return res.status(400).json({ message: 'Request already sent and pending', type: 'error' });
                    } else if (currentState === 'accepted') {
                        return res.status(400).json({ message: 'You are already friends', type: 'error' });
                    }
                }

                // Falls keine Anfrage existiert, eine neue Anfrage senden
                const addRequestQuery = 'INSERT INTO Friends (UserId1, UserId2, acceptState) VALUES (?, ?, "pending")';
                db.query(addRequestQuery, [userId, contactId], (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error sending the contact request', type: 'error' });
                    }
                    return res.status(200).json({ message: 'Contact request sent successfully', type: 'success' });
                });
            });
        } else {
            return res.status(404).json({ message: 'User not found', type: 'error' });
        }
    });
});

module.exports = router;
