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
                            const lastLoginDate = lastLogin.toDateString();
                            const todayDate = now.toDateString();
                            const yesterday = new Date(now);
                            yesterday.setDate(yesterday.getDate() - 1);
                            const yesterdayDate = yesterday.toDateString();

                            const hours = lastLogin.getHours().toString().padStart(2, '0');
                            const minutes = lastLogin.getMinutes().toString().padStart(2, '0');

                            if (lastLoginDate === todayDate) {
                                user.online_status = `last online today at ${hours}:${minutes}`;
                            } else if (lastLoginDate === yesterdayDate) {
                                user.online_status = `last online yesterday at ${hours}:${minutes}`;
                            } else {
                                user.online_status = `last online ${new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(lastLogin)}`;
                            }
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
            return res.json({ message: 'Server error' });
        }
        if (user) {
            return res.json(user);
        } else {
            return res.json({ message: 'User not found' });
        }
    });
});

module.exports = router;
