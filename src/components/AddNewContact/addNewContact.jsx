import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from './addNewContact.module.scss';

function AddNewContact({ onAddContact, onClose }) {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const formRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddContact({ name, phoneNumber });
        setName('');
        setPhoneNumber('');
        onClose();
    };

    const handleClickOutside = useCallback((e) => {
        if (formRef.current && !formRef.current.contains(e.target)) {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    return (
        <div className={styles.overlay}>
            <div className={styles.formContainer} ref={formRef}>
                <div className={styles.formHeader}>
                    <div className={styles.formHeadline}>Neuer Kontakt</div>
                    <button className={styles.closeButton} onClick={onClose}>X</button>
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