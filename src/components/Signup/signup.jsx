import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import styles from './signup.module.scss'; 
import backIcon from '../../assets/img/back-icon.png';
import clearIcon from '../../assets/img/clear-upload-icon.png';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import hidePassword from '../../assets/img/password-hide.png';
import visiblePassword from '../../assets/img/password-visible.png';
import uploadImage from '../../assets/img/upload-image-icon.png';
import Avatar from 'react-nice-avatar';
import AvatarSelector from '../AvatarSelector/avatarSelector';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        phoneNumber: '',
        profile_img: null,
        profile_img_preview: '',
        selectedAvatar: null,
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const uploadRef = useRef(null);

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

        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{4,}$/;
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

    const handleNextStep = () => {
        if (validateForm()) {
            setStep(2);
        }
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        setFormData((prev) => ({
            ...prev,
            profile_img: file,
            profile_img_preview: URL.createObjectURL(file),
            selectedAvatar: null,
        }));
    };

    const handleAvatarSelect = (config) => {
        setFormData((prev) => ({
            ...prev,
            selectedAvatar: config,
            profile_img_preview: '',
        }));
        setStep(2);
    };

    const handleSignup = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) return;

        const formDataToSend = new FormData();
        formDataToSend.append('username', formData.username);
        formDataToSend.append('password', formData.password);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('phoneNumber', formData.phoneNumber);
        if (formData.selectedAvatar) {
            formDataToSend.append('avatarConfig', JSON.stringify(formData.selectedAvatar));
        }
        if (formData.profile_img) {
            formDataToSend.append('profile_img', formData.profile_img);
        }

        try {
            await axios.post('http://localhost:8081/signup', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSuccess('Registration successful!');
            setFormData({ username: '', password: '', email: '', phoneNumber: '', profile_img: null, profile_img_preview: '', selectedAvatar: null });
            setStep(1);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (error) {
            if (error.response) {
                const message = error.response.data.message || 'Please try again.';
                setError(`${message}`);
                if (message === 'You are already registered!') {
                    setTimeout(() => {
                        navigate('/');
                    }, 3000);
                }
            } else {
                setError('Registration failed. Please try again.');
            }
        }
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

    const handleClearImage = (e) => {
        e.stopPropagation();
        setFormData(prev => ({
            ...prev,
            profile_img: null,
            profile_img_preview: '',
            selectedAvatar: null
        }));
    };

    const handleMouseOpacity = (opacity) => {
        if (uploadRef.current) {
            uploadRef.current.style.transition = 'opacity 0.3s ease';
            uploadRef.current.style.opacity = opacity;
        }
    };

    return (
        <div className={styles.signupContainer}>
            {step === 1 && ( 
                <form noValidate>
                    <div className={styles.formHeader}>
                        <img 
                            src={backIcon}
                            alt='Back'
                            className={styles.backIcon}
                            onClick={() =>  navigate('/')}
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
                                placeholder='Min. 4 character, 1 upper, 1 number'
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
                            placeholder='name@example.com'
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            autoComplete='email'
                        />
                    </div>
                    <div>
                        <label htmlFor="phone_number">Phone Number</label>
                        <PhoneInput
                            value={formData.phoneNumber}
                            maxLength="22"
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
                    
                    <button type="button" onClick={handleNextStep}>
                        Next
                    </button>
                </form>
            )}

            {step === 2 && (
                <div className={styles.uploadContainer}>
                    <div className={styles.formHeaderUpload}>
                        <img 
                            src={backIcon}
                            alt='Back'
                            className={styles.backIcon}
                            onClick={() => setStep(1)}
                        />
                        <div className={styles.formHeadline}>Upload Image</div>
                    </div>
                    <input 
                        type="file" 
                        onChange={handleImageUpload} 
                        accept="image/*" 
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                    />
                    <div className={styles.imageUploadWrapper}>
                        <div 
                            className={styles.imageUploadContainer} 
                            onClick={() => fileInputRef.current.click()}
                            ref={uploadRef}
                        >
                            {formData.selectedAvatar ? (
                                <Avatar style={{ width: '100%', height: '100%' }} {...formData.selectedAvatar} />
                            ) : formData.profile_img_preview ? (
                                <img src={formData.profile_img_preview} alt="Profile Preview" className={styles.profileImage} />
                            ) : (
                                <img src={uploadImage} alt="Upload Icon" className={styles.uploadImage} />
                            )}
                            {(formData.selectedAvatar || formData.profile_img_preview) && (
                                <img
                                    src={clearIcon}
                                    alt="Clear"
                                    className={styles.clearIcon}
                                    onClick={handleClearImage}
                                    onMouseEnter={() => handleMouseOpacity(0.5)}
                                    onMouseLeave={() => handleMouseOpacity(1)}
                                /> 
                            )}
                        </div>
                    </div>
                    <div className={styles.linkContainer}>
                        <Link 
                            to="#" 
                            className={styles.chooseAvatarLink}
                            onClick={(e) => {
                                e.preventDefault();
                                setStep(3);
                            }}
                        >
                            ... or choose an avatar
                        </Link>
                    </div>
                    
                    <div className={styles.buttonContainer}>
                        <button 
                            type="button" 
                            onClick={handleSignup} 
                            className={styles.submitButton}
                        >
                            Signup
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className={styles.avatarModal}>
                    <div className={styles.formHeaderUpload}>
                        <img 
                            src={backIcon}
                            alt='Back'
                            className={styles.backIcon}
                            onClick={() => setStep(2)}
                        />
                        <div className={styles.formHeadline}>Choose Avatar</div>
                    </div>
                    <AvatarSelector onSelect={handleAvatarSelect} />
                </div>  
            )}
        </div>
    );
};

export default Signup;