import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import styles from './login.module.scss';
import hidePassword from '../../assets/img/password-hide.png';
import visiblePassword from '../../assets/img/password-visible.png';

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Please enter username & password!');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8081/login', { 
                username, 
                password 
            });
            onLoginSuccess(response.data); 
        } catch (error) {
            if (error.response && error.response.status === 404) {
            setError('You are not yet registered!');
            setTimeout(() => {
                navigate('/signup');
            }, 2000);
            } else {
                setError('Login failed. Please try again.');
            }
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={styles.loginContainer}>
            <form onSubmit={handleLogin}>
                <div className={styles.formHeadline}>Login</div>
                <div>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete='username'
                    />
                </div>
                <div className={styles.passwordContainer}>
                    <label htmlFor="password">Password</label>
                    <div className={styles.passwordFieldContainer}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                        <img
                            src={showPassword ? visiblePassword : hidePassword}
                            alt={showPassword ? 'Hide password' : 'Show password'}
                            className={styles.eyeIcon}
                            onClick={togglePasswordVisibility}
                        />
                    </div>
                </div>
                <div className={styles.forget}>
                    <label className={styles.checkboxContainer}>
                        <input type="checkbox" id="remember" />
                        <span className={styles.checkmark}></span>
                        Remember Me
                    </label>
                    <a href="#forget">Forgot Password?</a>
                </div>
                
                <div className={styles.errorContainer}>
                    {error && <p className={styles.error}>{error}</p>}
                </div>
                
                <button type="submit">Einloggen</button>
                
                <div className={styles.register}>
                    <p>Don't have an account?</p>
                    <Link to="/signup">Register</Link>
                </div>
            </form>
        </div>
    );
};

export default Login;
