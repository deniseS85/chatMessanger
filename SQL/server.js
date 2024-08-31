const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chatMessenger"
});

const checkUserAlreadyExist = (email, phoneNumber) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM users 
            WHERE email = ? OR phone_number = ?
        `;
        db.query(query, [email, phoneNumber], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results.length > 0);
        });
    });
};

app.post('/signup', async (req, res) => {
    const { username, password, email, phoneNumber } = req.body;

    try {
        const userExists = await checkUserAlreadyExist(email, phoneNumber);
        if (userExists) {
            return res.status(400).json({ message: 'You are already registered!' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (username, password_hash, email, phone_number) VALUES (?, ?, ?, ?)";
        db.query(sql, [username, hashedPassword, email, phoneNumber], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error registering user' });
            }
            res.json({ success: true, message: 'User registered successfully' });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error checking user existence' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const query = "SELECT * FROM users WHERE username = ?";
    
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        
        if (results.length > 0) {
            const user = results[0];
            const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
            
            if (isPasswordCorrect) {
                res.json({ success: true, message: 'Login successful', user });
            } else {
                res.status(401).json({ success: false, message: 'Invalid password' });
            }
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    });
});

app.listen(8081, () => {
    console.log('Database connected!');
})
