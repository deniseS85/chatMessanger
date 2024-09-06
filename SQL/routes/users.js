const express = require('express');
const router = express.Router();
const db = require('../config/db');

const getUserById = (userId, callback) => {
    const userQuery = 'SELECT * FROM users WHERE id = ?';
    const statusQuery = 'SELECT online_status, last_login FROM user_status WHERE user_id = ?';

    db.query(userQuery, [userId], (err, userResults) => {
        if (err) {
            return callback(err, null);
        }
        if (userResults.length > 0) {
            const user = userResults[0];

            db.query(statusQuery, [userId], (err, statusResults) => {
                if (err) {
                    return callback(err, null);
                }

                if (statusResults.length > 0) {
                    const status = statusResults[0];
                    const now = new Date();
                    const lastLogin = new Date(status.last_login);
                    const timeDiff = Math.floor((now - lastLogin) / (1000 * 60));

                    if (status.online_status === 'online') {
                        user.online_status = 'online';
                    } else {
                        if (timeDiff < 1) {
                            user.online_status = 'last online just now';
                        } else if (timeDiff === 1) {
                                user.online_status = 'last online 1 minute ago';
                        } else if (timeDiff < 60) {
                            user.online_status = `last online ${timeDiff} minutes ago`;
                        } else {
                            const hours = lastLogin.getHours().toString().padStart(2, '0');
                            const minutes = lastLogin.getMinutes().toString().padStart(2, '0');
                            user.online_status = `last online at ${hours}:${minutes}`;
                        }
                    }
                } else {
                    user.online_status = 'Unbekannt';
                }


                return callback(null, user);
            });
        } else {
            return callback(null, null);
        }
    });
};

router.get('/:userId', (req, res) => {
    const userId = req.params.userId;
    getUserById(userId, (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Server error' });
        }
        if (user) {
            return res.json(user);
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    });
});

module.exports = router;
