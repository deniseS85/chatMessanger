import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from './addNewContact.module.scss';

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

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddContact({ name, phoneNumber });
        setName('');
        setPhoneNumber('');
        handleClose();
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
                    <div className={styles.formHeadline}>Neuer Kontakt</div>
                    <button className={styles.closeButton} onClick={handleClose}>X</button>
                </div>
               
                <form onSubmit={handleSubmit}>
                    <label>
                        <span>Vorname:</span>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                        />
                    </label>
                    <label>
                        <span>Handynummer:</span>
                        <input 
                            type="text" 
                            value={phoneNumber} 
                            onChange={(e) => setPhoneNumber(e.target.value)} 
                            required 
                        />
                    </label>
                    <button type="submit">Hinzufügen</button>
                </form>
            </div>
        </div>
    );
}

export default AddNewContact;
