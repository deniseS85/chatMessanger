const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
require('./routes/cleanup');

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

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
