const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./config/db');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const loginRoute = require('./routes/login');
const signupRoute = require('./routes/signup');
const forgotRoute = require('./routes/forgot');
const resetRoute = require('./routes/reset');
const logoutRoute = require('./routes/logout');
const userRoute = require('./routes/users'); 
const editUser = require('./routes/editUser');
const addContact = require('./routes/addContact');
const checkFriendRequest = require('./routes/checkFriendRequest');

app.use('/login', loginRoute);
app.use('/signup', signupRoute);
app.use('/forgot-password', forgotRoute);
app.use('/reset-password', resetRoute);
app.use('/logout', logoutRoute);
app.use('/users', userRoute);
app.use('/edit-user', editUser);
app.use('/add-contact', addContact);
app.use('/check-friend-request', checkFriendRequest);

function deleteOldRejectedRequests() {
    const sql = 'DELETE FROM Friends WHERE acceptState = "rejected" AND requestDate < NOW() - INTERVAL 24 HOUR';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error deleting old rejected requests:', err);
        } else {
            console.log('Old rejected requests deleted:', results.affectedRows);
        }
    });
}

setInterval(deleteOldRejectedRequests, 24 * 60 * 60 * 1000);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
