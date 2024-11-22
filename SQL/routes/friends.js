const express = require('express');
const router = express.Router();
const db = require('../config/db');

const getUserStatus = (userId, callback) => {
    const statusQuery = 'SELECT online_status, last_login FROM user_status WHERE user_id = ?';

    db.query(statusQuery, [userId], (err, statusResults) => {
        if (err) {
            return callback(err, null);
        }

        if (statusResults.length > 0) {
            const status = statusResults[0];
            const now = new Date();
            const lastLogin = new Date(status.last_login);
            const timeDiff = Math.floor((now - lastLogin) / (1000 * 60));
            let onlineStatus;

            if (status.online_status === 'online') {
                onlineStatus = 'online';
            } else {
                if (timeDiff < 1) {
                    onlineStatus = 'last online just now';
                } else if (timeDiff === 1) {
                    onlineStatus = 'last online 1 minute ago';
                } else if (timeDiff < 60) {
                    onlineStatus = `last online ${timeDiff} minutes ago`;
                } else {
                    const lastLoginDate = lastLogin.toDateString();
                    const todayDate = now.toDateString();
                    const yesterday = new Date(now);
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayDate = yesterday.toDateString();
                    const hours = lastLogin.getHours().toString().padStart(2, '0');
                    const minutes = lastLogin.getMinutes().toString().padStart(2, '0');

                    if (lastLoginDate === todayDate) {
                        onlineStatus = `last online today at ${hours}:${minutes}`;
                    } else if (lastLoginDate === yesterdayDate) {
                        onlineStatus = `last online yesterday at ${hours}:${minutes}`;
                    } else {
                        onlineStatus = `last online ${new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(lastLogin)}`;
                    }
                }
            }
            return callback(null, onlineStatus);
        } else {
            return callback(null, 'Unbekannt');
        }
    });
};

router.get('/:userId', (req, res) => {
    const { userId } = req.params;

    const friendsQuery = `
        SELECT u.id, u.username, u.profile_img AS profilePic, u.avatar_config
        FROM Friends f
        JOIN Users u ON (f.UserId1 = u.id OR f.UserId2 = u.id)
        WHERE 
            (f.UserId1 = ? OR f.UserId2 = ?) 
            AND f.acceptState = 'accepted'
            AND u.id != ? 
    `;

    db.query(friendsQuery, [userId, userId, userId], (error, results) => {
        if (error) {
            console.error('Fehler beim Abrufen der Freunde:', error);
            return res.json({ error: 'Internal Server Error' });
        }

        const friendsWithStatusPromises = results.map(friend => {
            return new Promise((resolve, reject) => {
                getUserStatus(friend.id, (err, onlineStatus) => {
                    if (err) return reject(err);
                    friend.online_status = onlineStatus;
                    resolve(friend);
                });
            });
        });

        Promise.all(friendsWithStatusPromises)
            .then(friendsWithStatus => {
                res.json(friendsWithStatus);
            })
            .catch(err => {
                console.error('Fehler beim Abrufen des Online-Status:', err);
                res.json({ error: 'Internal Server Error' });
            });
    });
});

module.exports = router;
