import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios'; 
import styles from './chatHeader.module.scss';
import menuIcon from '../../assets/img/menu-icon.png';
import backIcon from '../../assets/img/send-message-icon.png';
import defaultProfilePic from '../../assets/img/default-profile-img.png';
import DropdownMenu from '../DropdownMenu/dropdownMenu';

function ChatHeader({ isUserListOpen, selectedUser, onBackClick, onLogout }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate(); 

    useEffect(() => {
        if (isUserListOpen) {
            setIsMenuOpen(false);
        }
    }, [isUserListOpen]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = async () => {
        const userId = Cookies.get('userId');
        
        try {
            await axios.post('http://localhost:8081/logout', { userId });
            Cookies.remove('authToken');
            Cookies.remove('username');
            Cookies.remove('userId');
            onLogout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const handleSelectMessages = () => {
        console.log('Nachrichten auswählen');
        // Nachrichten auswählen Logik hier
    };

    const handleDeleteChat = () => {
        console.log('Chat löschen');
        // Chat löschen Logik hier
    };

    const handleSearchMessages = () => {
        console.log('Nachricht suchen');
        // Nachricht suchen Logik hier
    };

    return (
        <header className={styles.header}>
            <div className={styles.profileContainer}>
                <img 
                    src={backIcon}
                    alt='Back'
                    className={styles.backIcon}
                    onClick={onBackClick}
                />
                <img 
                    src={selectedUser ? (selectedUser.profilePic || defaultProfilePic) : ''}
                    alt={selectedUser ? `${selectedUser.name}'s profile picture` : ''}
                    className={selectedUser ? styles.profilePic : ''}
                />
                <div className={styles.profileInfo}>
                    <div>{selectedUser ? selectedUser.name : ''}</div>
                    <div>{selectedUser ? selectedUser.status : ''}</div>
                </div>
            </div>
            <img 
                className={styles.menuIcon} 
                src={menuIcon} 
                alt="Menü" 
                onClick={toggleMenu} 
            />
            <DropdownMenu
                isOpen={isMenuOpen}
                onLogout={handleLogout}
                onSelectMessages={handleSelectMessages}
                onDeleteChat={handleDeleteChat}
                onSearchMessages={handleSearchMessages}
            />
        </header>
    );
}

export default ChatHeader;
