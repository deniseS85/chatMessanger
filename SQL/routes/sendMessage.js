const express = require('express');
const router = express.Router();
const db = require('../config/db');


router.post('/', (req, res) => {
    const { sender_id, recipient_id, content } = req.body;

    const chatQuery = `
        SELECT chat_id FROM chats 
        WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `;

    db.query(chatQuery, [sender_id, recipient_id, recipient_id, sender_id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Fehler beim Abrufen der chat_id' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Chat nicht gefunden' });
        }

        const chat_id = results[0].chat_id;
        const messageQuery = 'INSERT INTO messages (chat_id, sender_id, content) VALUES (?, ?, ?)';

        db.query(messageQuery, [chat_id, sender_id, content], (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Fehler beim Speichern der Nachricht' });
            }
            return res.status(201).json({ messageId: results.insertId, chat_id, sender_id, content });
        });
    });
});

module.exports = router;
