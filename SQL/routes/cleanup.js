const db = require('../config/db');
const cron = require('node-cron');

async function deleteOldRejectedRequests() {
    const sql = 'DELETE FROM Friends WHERE acceptState = "rejected" AND requestDate < NOW() - INTERVAL 24 HOUR';
    try {
        db.query(sql, (err, results) => {
            if (err) {
                console.error('Error deleting old rejected requests:', err);
            } else {
                console.log('Old rejected requests deleted:', results.affectedRows);
            }
        });
    } catch (err) {
        console.error('Error deleting old rejected requests:', err);
    }
}

// Alle 24 Stunden ausführen um Mitternacht
cron.schedule('0 0 * * *', deleteOldRejectedRequests); 

module.exports = deleteOldRejectedRequests;
