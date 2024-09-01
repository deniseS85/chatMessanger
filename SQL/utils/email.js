const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'my.messages.contact@gmail.com',
        pass: 'dpmx badl axfd goex'
    }
});

const sendPasswordResetEmail = (to, username, token) => {
    const resetLink = `http://localhost:3000/reset-password/${token}`; 

    const mailOptions = {
        from: '"Chat Messenger" <my.messages.contact@gmail.com>',
        to: to,
        subject: 'Password Reset Request',
        html: `
            <html>
                <body>
                    <h2>Password Reset</h2>
                    <p>Hey ${username}! 😊</p>
                    <p>You requested to reset your password. Don’t worry, we are here to help!</p>
                    <p>Just click the following link to proceed and reset your password:</p>
                    <p><a href="${resetLink}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #7F76FF; border-radius: 4px; text-decoration: none;">Reset Password</a></p>
                    <p>Please note that this link is only valid for 30 minutes.</p>
                    <p>If you have any issues or questions, feel free to reach out. We’re here to help!</p>
                    <p>See you soon! 🌟</p>
                </body>
            </html>
        `
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Email sending error:', err);
            return;
        }
        console.log('Email sent:', info.response);
    });
};

module.exports = { sendPasswordResetEmail };
