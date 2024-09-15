import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios'; 
import styles from './chatHeader.module.scss';
import menuIcon from '../../assets/img/menu-icon.png';
import backIcon from '../../assets/img/send-message-icon.png';
import notificationIcon from '../../assets/img/notification.png';
import defaultProfilePic from '../../assets/img/default-profile-img.png';
import DropdownMenu from '../DropdownMenu/dropdownMenu';
import MyProfile from '../MyProfile/myProfile';

function ChatHeader({ isUserListOpen, selectedUser, onBackClick, onLogout, pendingRequestCount }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const iconRef = useRef(null);

    useEffect(() => {
        if (isUserListOpen) {
            setIsMenuOpen(false);
        }
    }, [isUserListOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) && iconRef.current && !iconRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const toggleMenu = () => {
        setIsMenuOpen(prevState => !prevState);
    };

    const showProfile = () => {
        setIsMenuOpen(false);
        setIsProfileOpen(true);
    }

    const closeProfile = () => {
        setIsProfileOpen(false);
    };

    const handleLogout = async () => {
        setIsMenuOpen(false);
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
        setIsMenuOpen(false);
        console.log('Nachrichten auswählen');
        // Nachrichten auswählen Logik hier
    };

    const handleDeleteChat = () => {
        setIsMenuOpen(false);
        console.log('Chat löschen');
        // Chat löschen Logik hier
    };

    const handleSearchMessages = () => {
        setIsMenuOpen(false);
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
            <div className={styles.menuContainer}>
                <div className={styles.notificationContainer}>
                <img
                    className={styles.notificationIcon}
                    src={notificationIcon}
                    alt="Notification"
                />
                {pendingRequestCount > 0 && (
                    <div className={styles.newMessage}>
                        {pendingRequestCount}
                    </div>
                )}
                </div>
                <img
                    ref={iconRef}
                    className={styles.menuIcon} 
                    src={menuIcon} 
                    alt="Menü" 
                    onClick={toggleMenu} 
            />
            </div>
            <DropdownMenu
                isOpen={isMenuOpen}
                onMyProfile={showProfile}
                onLogout={handleLogout}
                onSelectMessages={handleSelectMessages}
                onDeleteChat={handleDeleteChat}
                onSearchMessages={handleSearchMessages}
                menuRef={menuRef} 
            />
            {isProfileOpen && (
                <MyProfile 
                    onClose={closeProfile} 
                    isProfileOpen={isProfileOpen}
                />
            )}
        </header>
    );
}

export default ChatHeader;
