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
import NotificationsContainer from '../NotificationsContainer/notificationsContainer';
import FriendRequestNotification from '../FriendRequestNotification/friendRequestNotification';
import Avatar from 'react-nice-avatar';

function ChatHeader({ isUserListOpen, selectedUser, onBackClick, onLogout, pendingRequestCount, pendingRequests, checkForRequests }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const menuIconRef = useRef(null);
    const notificationRef = useRef(null);
    const notificationIconRef = useRef(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const userId = Cookies.get('userId');
            try {
                const response = await axios.get(`http://localhost:8081/users/${userId}`);
                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
    
        fetchUserData();
    }, []);

    console.log(userData)

    useEffect(() => {
        if (isUserListOpen) {
            setIsMenuOpen(false);
            setIsNotificationOpen(false);
        }
    }, [isUserListOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) && menuIconRef.current && !menuIconRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }

            if (notificationRef.current && !notificationRef.current.contains(event.target) && notificationIconRef.current && !notificationIconRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen, isNotificationOpen]);

    const toggleNotification = () => {
        setIsNotificationOpen((prevState) => {
            if (!prevState) {
                setIsMenuOpen(false);
            }
            return !prevState;
        });
    }

    const toggleMenu = () => {
        setIsMenuOpen((prevState) => {
            if (!prevState) {
                setIsNotificationOpen(false);
            }
            return !prevState;
        });
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

    const handleNotificationClick = (request) => {
        setSelectedRequest(request);
        setIsNotificationOpen(false);
    };

    const handleCloseNotification = () => {
        setSelectedRequest(null);
    };

    const getProfileImage = () => {
        if (selectedUser && selectedUser.profilePic) {
            return (
                <img src={selectedUser.profilePic} alt={`${selectedUser.name}'s profile picture`} className={styles.profilePic} />
            );
        }
    
        const avatarConfig = selectedUser ? userData?.avatar_config : userData?.avatar_config;
        const profileImg = userData?.profile_img;
    
        if (avatarConfig) {
            return (
                <Avatar {...JSON.parse(avatarConfig)} className={styles.profilePic} />
            );
        } else if (profileImg) {
            return (
                <img src={`http://localhost:8081/uploads/${profileImg}`} alt="Profile" className={styles.profilePic} />
            );
        }
    
        return (
            <img src={defaultProfilePic} alt="Default Profile" className={styles.profilePic} />
        );
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
                <div>
                    {getProfileImage() || (
                        <img src={defaultProfilePic} alt="Default Profile" className={styles.profilePic} />
                    )}
                </div>
                <div className={styles.profileInfo}>
                    <div>
                        {selectedUser ? (
                            selectedUser.name
                        ) : (
                            <>
                                Hi <span style={{ color: '#2BB8EE', fontWeight: 'bold' }}>{userData?.username}</span> 😊 !
                            </>
                        )}
                    </div>
                    <div>{selectedUser ? selectedUser.status : 'Please choose a friend you would like to write to.'}</div>
                </div>
            </div>
            <div className={styles.menuContainer}>
                <div 
                    className={styles.notificationContainer}
                    onClick={toggleNotification}
                    ref={notificationIconRef}
                >
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
                    ref={menuIconRef}
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
                    userData={userData} 
                />
            )}
            <NotificationsContainer
                isOpen={isNotificationOpen}
                notificationRef={notificationRef}
                pendingRequests={pendingRequests}
                onNotificationClick={handleNotificationClick}
            />
            {selectedRequest && (
                <FriendRequestNotification
                    request={selectedRequest}
                    onClose={handleCloseNotification}
                    checkForRequests={checkForRequests}
                />
            )}
        </header>
    );
}

export default ChatHeader;
