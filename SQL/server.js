const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());


const loginRoute = require('./routes/login');
const signupRoute = require('./routes/signup');
const forgotRoute = require('./routes/forgot');
const resetRoute = require('./routes/reset');

app.use('/login', loginRoute);
app.use('/signup', signupRoute);
app.use('/forgot-password', forgotRoute);
app.use('/reset-password', resetRoute);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
