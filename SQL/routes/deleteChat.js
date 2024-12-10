const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', (req, res) => {
    const { chatId } = req.body;

    if (!chatId) {
        return res.status(400).json({ success: false, error: 'Invalid chat ID' });
    }

    const query = 'DELETE FROM messages WHERE chat_id = ?';

    db.query(query, [chatId], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }

        res.status(200).json({ success: true, message: 'Chat deleted successfully' });
    });
});

module.exports = router;