import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './forgotPassword.module.scss';
import backIcon from '../../assets/img/back-icon.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleForgotPassword = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');

        try {
            const response = await axios.post('http://localhost:8081/forgot-password', { email });
            setMessage(response.data.message);
            setEmail('');
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (error) {
            setError('Failed to send password reset email.');
        }
    };

    const handleBackClick = () => {
        navigate('/');
    };

    return (
        <div className={styles.forgotPasswordContainer}>
            <form onSubmit={handleForgotPassword} noValidate>
            <div className={styles.formHeader}>
                    <img 
                        src={backIcon}
                        alt='Back'
                        className={styles.backIcon}
                        onClick={handleBackClick}
                    />
                    <div className={styles.formHeadline}>Forgot Password</div>
                </div>
                <div>
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.infoContainer}>
                    {error && <p className={styles.error}>{error}</p>}
                    {message && <p className={styles.success}>{message}</p>}
                </div>
                <button type="submit">Send Reset Link</button>
            </form>
        </div>
    );
};

export default ForgotPassword;
