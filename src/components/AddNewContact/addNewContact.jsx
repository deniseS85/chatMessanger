import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from './addNewContact.module.scss';
import closeIcon from '../../assets/img/close-icon.png';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Cookies from "js-cookie";
import axios from 'axios';

function AddNewContact({ onAddContact, onClose, showAddContactForm }) {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const formRef = useRef(null);

    useEffect(() => {
        if (showAddContactForm) {
            setIsVisible(true);
        }
    }, [showAddContactForm]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = Cookies.get('userId');

        try {
            const response = await axios.post('http://localhost:8081/add-contact', { 
                userId, 
                name, 
                phoneNumber 
            });

            const { message, type } = response.data;

            if (type === 'success') {
                onAddContact(message, true, name);
                setName('');
                setPhoneNumber('');
                handleClose();
            } else {
                onAddContact(message, false);
                handleClose();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to send contact request. Please try again.';
            onAddContact(errorMessage, false);
            handleClose();
        }
    };

    const handleClose = useCallback(() => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
    }, [onClose]);

    const handleClickOutside = useCallback((e) => {
        if (formRef.current && !formRef.current.contains(e.target)) {
            handleClose();
        }
    }, [handleClose]);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    return (
        <div className={`${styles.overlay} ${isVisible ? styles.visible : ''}`}>
            <div className={`${styles.formContainer} ${isVisible ? styles.visible : ''}`} ref={formRef}>
                <div className={styles.formHeader}>
                    <div className={styles.formHeadline}>New Contact</div>
                    <img
                        src={closeIcon}
                        alt="Back"
                        className={styles.closeIcon}
                        onClick={handleClose}
                    />
                </div>
               
                <form onSubmit={handleSubmit}>
                    <label>
                        <span>Username:</span>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                        />
                    </label>
                    <label>
                        <span>Mobile Number:</span>
                        <PhoneInput
                            value={phoneNumber}
                            maxLength="22"
                            onChange={setPhoneNumber}
                            defaultCountry="DE"
                            international
                        />
                    </label>
                    <button type="submit">Add Contact</button>
                </form>
            </div>
        </div>
    );
}

export default AddNewContact;
