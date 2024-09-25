import React, { useState, useEffect } from 'react';
import styles from './dropdownMenu.module.scss';
import profileIcon from '../../assets/img/my-profile-icon.png';
import messageIcon from '../../assets/img/select-message-icon.png';
import searchIcon from '../../assets/img/search-message-icon.png';
import deleteIcon from '../../assets/img/delete-chat-icon.png';
import logoutIcon from '../../assets/img/logout-icon.png';
import removeContactIcon from '../../assets/img/delete-user.png';

const DropdownMenu = ({ isOpen, onMyProfile, onLogout, onSelectMessages, onDeleteChat, onRemoveContact, onSearchMessages, menuRef }) => {
    const [maxHeight, setMaxHeight] = useState('0px');

    useEffect(() => {
        if (menuRef.current) {
            setMaxHeight(isOpen ? `${menuRef.current.scrollHeight}px` : '0px');
        }
    }, [isOpen, menuRef]);
    
    return (
        <div 
            ref={menuRef}
            className={`${styles.dropdownMenu} ${isOpen ? styles.open : ''}`}
            style={{ maxHeight }}
        >
            <ul>
                <li onClick={onMyProfile}>
                    <img src={profileIcon} alt="Profile" className={styles.icon} />
                    My Profile
                </li>
                <li onClick={onSelectMessages}>
                    <img src={messageIcon} alt="Select Message" className={styles.icon} />
                    Select Message
                </li>
                <li onClick={onSearchMessages}>
                    <img src={searchIcon} alt="Search Message" className={styles.icon} />
                    Search Message
                </li>
                <li onClick={onDeleteChat}>
                    <img src={deleteIcon} alt="Delete Chat" className={styles.icon} />
                    Delete Chat
                </li>
                <li onClick={onRemoveContact}>
                    <img src={removeContactIcon} alt="Remove Contact" className={styles.icon} />
                    Remove Contact
                </li>
                <li onClick={onLogout}>
                    <img src={logoutIcon} alt="Logout" className={styles.icon} />
                    Logout
                </li>
            </ul>
        </div>
    );
};

export default DropdownMenu;
