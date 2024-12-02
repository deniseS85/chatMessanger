import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './resetPassword.module.scss';
import hidePassword from '../../assets/img/password-hide.png';
import visiblePassword from '../../assets/img/password-visible.png';
import BASE_URL from '../../config_base_url';

const ResetPassword = () => {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{4,}$/;


    const handleResetPassword = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');

        if (!strongPasswordRegex.test(password)) {
            setError('Invalid password format.');
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}/reset-password`, { token, password });
            setMessage(response.data.message);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (error) {
            setError('Failed to reset password.');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={styles.resetPasswordContainer}>
            <form onSubmit={handleResetPassword}>
                <div className={styles.formHeadline}>Reset Password</div>
                <div>
                    <label htmlFor="password">New Password</label>
                    <div className={styles.passwordFieldContainer}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            placeholder='Min. 4 character, 1 upper, 1 number'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <img
                            src={showPassword ? visiblePassword : hidePassword}
                            alt={showPassword ? 'Hide password' : 'Show password'}
                            className={styles.eyeIcon}
                            onClick={togglePasswordVisibility}
                        />
                    </div>
                </div>
                <div className={styles.infoContainer}>
                    {error && <p className={styles.error}>{error}</p>}
                    {message && <p className={styles.success}>{message}</p>}
                </div>
                <button type="submit">Reset Password</button>
            </form>
        </div>
    );
};

export default ResetPassword;
