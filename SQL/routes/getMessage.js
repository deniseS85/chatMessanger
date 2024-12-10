const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
    const { userId, friendId } = req.query;

    const chatQuery = `
        SELECT chat_id FROM chats 
        WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `;    

    db.query(chatQuery, [userId, friendId, friendId, userId], (error, chatResults) => {
        if (error) {
            return res.status(500).json({ error: 'Fehler beim Abrufen der chat_id' });
        }

        if (chatResults.length === 0) {
            return res.status(404).json({ error: 'Chat nicht gefunden' });
        }

        const chat_id = chatResults[0].chat_id;

        const messageQuery = `
            SELECT * FROM messages 
            WHERE chat_id = ?
            ORDER BY timestamp DESC
        `;
        
        db.query(messageQuery, [chat_id], (error, messageResults) => {
            if (error) {
                return res.status(500).json({ error: 'Fehler beim Abrufen der Nachrichten' });
            }
            return res.status(200).json({ chat_id, messages: messageResults || [] });
        });
    });
});

module.exports = router;