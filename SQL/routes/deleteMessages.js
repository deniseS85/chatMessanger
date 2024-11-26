const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', (req, res) => {
    const { messageIds } = req.body;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
        return res.status(400).json({ success: false, error: 'Invalid message IDs' });
    }

    const query = 'DELETE FROM messages WHERE message_id IN (?)';

    db.query(query, [messageIds], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.status(200).json({ success: true, message: 'Messages deleted successfully' });
    });
});

module.exports = router;