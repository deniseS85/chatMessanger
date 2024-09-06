const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

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

app.use('/login', loginRoute);
app.use('/signup', signupRoute);
app.use('/forgot-password', forgotRoute);
app.use('/reset-password', resetRoute);
app.use('/logout', logoutRoute);
app.use('/users', userRoute);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
