import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './signup.module.scss'; 
import backIcon from '../../assets/img/back-icon.png';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import hidePassword from '../../assets/img/password-hide.png';
import visiblePassword from '../../assets/img/password-visible.png';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        phoneNumber: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        const { username, password, email, phoneNumber } = formData;

        if (!username || !password || !email || !phoneNumber) {
            setError('Please fill in all fields!');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Invalid email format.');
            return false;
        }

        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!strongPasswordRegex.test(password)) {
            setError('Invalid password format.');
            return false;
        }

        if (!phoneNumber) {
            setError('Invalid phone number format.');
            return false;
        }

        return true;
    };

    const handleSignup = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) return;

        try {
            await axios.post('http://localhost:8081/signup', formData);
            setSuccess('Registration successful!');
            setFormData({ username: '', password: '', email: '', phoneNumber: '' });
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            if (error.response) {
                const message = error.response.data.message || 'Please try again.';
                setError(`${message}`);
                if (message === 'You are already registered!') {
                    setTimeout(() => {
                        navigate('/');
                    }, 2000);
                }
            } else {
                setError('Registration failed. Please try again.');
            }
        }
    };

    const handleBackClick = () => {
        navigate('/');
    };

    const handleChange = (field, value) => {
        setFormData(prevState => ({
            ...prevState,
            [field]: value,
        }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={styles.signupContainer}>
            <form onSubmit={handleSignup} noValidate>
                <div className={styles.formHeader}>
                    <img 
                        src={backIcon}
                        alt='Back'
                        className={styles.backIcon}
                        onClick={handleBackClick}
                    />
                    <div className={styles.formHeadline}>Sign Up</div>
                </div>
                <div>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={formData.username}
                        onChange={(e) => handleChange('username', e.target.value)}
                        autoComplete='username'
                    />
                </div>
                <div className={styles.passwordContainer}>
                    <label htmlFor="password">Password</label>
                    <div className={styles.passwordFieldContainer}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            autoComplete='new-password'
                        />
                        <img
                            src={showPassword ? visiblePassword : hidePassword}
                            alt={showPassword ? 'Hide password' : 'Show password'}
                            className={styles.eyeIcon}
                            onClick={togglePasswordVisibility}
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        autoComplete='email'
                    />
                </div>
                <div>
                    <label htmlFor="phone_number">Phone Number</label>
                    <PhoneInput
                        value={formData.phoneNumber}
                        onChange={(value) => handleChange('phoneNumber', value)}
                        defaultCountry="DE"
                        international
                        className={styles.phoneNumberInput}
                    />
                </div>
                
                <div className={styles.errorContainer}>
                    {error && <p className={styles.error}>{error}</p>}
                    {success && <p className={styles.success}>{success}</p>}
                </div>
                
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Signup;
