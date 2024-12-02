import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import BASE_URL from '../../config_base_url';
import { io } from 'socket.io-client';
const socket = io(BASE_URL);

function ChatHeader({ users, isUserListOpen, selectedUser, onBackClick, onLogout, pendingRequestCount, pendingRequests, checkForRequests, fetchFriends, setNotification, setSelectedUser, setUsers, handleSelectMessagesStatus, isTyping }) {
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
                const response = await axios.get(`${BASE_URL}/users/${userId}`);
                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
    
        fetchUserData();
    }, []);

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

    const fetchOfflineStatus = useCallback(async (userId) => {
        try {
            const response = await axios.get(`${BASE_URL}/users/${userId}`);
            const onlineStatus = response.data.online_status;
            
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === userId ? { ...user, online_status: onlineStatus } : user
                )
            );
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }, [setUsers]);

    const handleStatusChanged = useCallback((data) => {
        setUsers(prevUsers => {
            return prevUsers.map(user => 
                user.id === Number(data.userId) ? { ...user, online_status: data.status } : user
            );
        });
    }, [setUsers]);
    

    useEffect(() => {
        const interval = setInterval(() => {
            users.forEach(user => {
                fetchOfflineStatus(user.id);
            });
        }, 60000);
    
        return () => clearInterval(interval);
    }, [users, fetchOfflineStatus]);


    useEffect(() => {
        socket.on('userStatusChanged', handleStatusChanged);

        return () => {
            socket.off('userStatusChanged', handleStatusChanged);
        };
    }, [handleStatusChanged]);

    const handleLogout = async () => {
        setIsMenuOpen(false);
        const userId = Cookies.get('userId');
       
        if (userId) {
            socket.emit('userStatusChanged', { userId, status: 'offline' });
        }
    
        try {
            await axios.post(`${BASE_URL}/logout`, { userId });
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
        if (selectedUser) {
            setIsMenuOpen(false);
            handleSelectMessagesStatus(true);
        } else {
            setIsMenuOpen(false);
            handleSelectMessagesStatus(false);
            setNotification({
                message: 'Please open a chat first to select messages.',
                type: 'error',
                isHtml: true,
                onClose: () => {
                    setNotification(null);
                }
            });
        }
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

    const handleRemoveContact = () => {
        if (selectedUser) {
            setIsMenuOpen(false);
            const friendId = selectedUser.id;
            const userId = Cookies.get('userId');
            
            setNotification({
                message: `Do you really want to delete your contact with<br> <span style="color:#2BB8EE; font-weight:bold">${selectedUser.username}</span>?`,
                type: 'error',
                isHtml: true,
                onConfirm: () => {
                    axios.post(`${BASE_URL}/removeFriend`, { userId, friendId })
                        .then(response => {
                            if (response.data.type === 'success') {
                                setNotification({
                                    message: `<span style="color:#2BB8EE; font-weight:bold">${selectedUser.username}</span> successfully removed.`,
                                    type: 'success',
                                    isHtml: true,
                                    onClose: () => {
                                        setNotification(null);
                                    }
                                });
                                socket.emit('removeFriend', { userId, friendId });
                                setSelectedUser(null);
                                fetchFriends();
                            }
                        })
                        .catch(error => {
                            console.error('Error removing friend:', error);
                        });
                }
            });
        } else {
            setIsMenuOpen(false);
            setNotification({
                message: 'Please select your friend first to remove them from your contacts.',
                type: 'error',
                isHtml: true,
                onClose: () => {
                    setNotification(null);
                }
            });
        }
    };

    const handleNotificationClick = (request) => {
        setSelectedRequest(request);
        setIsNotificationOpen(false);
    };

    const handleCloseNotification = () => {
        setSelectedRequest(null);
    };

    const getProfileImage = () => {
        const user = users.find(user => user.id === selectedUser?.id);
        const onlineStatus = user ? user.online_status : selectedUser?.online_status;
        
        if (selectedUser && selectedUser.profilePic) {
            return (
                <div className={styles.profilePicWrapper}>
                    <img
                        src={`${BASE_URL}/uploads/${selectedUser.profilePic}`}
                        alt={`${selectedUser.username}`}
                        className={styles.profilePic}
                    />    
                    {onlineStatus === 'online' && (
                        <span className={styles.onlineIndicator}></span>
                )}
                </div> 
                );
        }
    
        const avatarConfig = selectedUser ? selectedUser?.avatar_config : userData?.avatar_config;
        const profileImg = userData?.profile_img;
    
        if (avatarConfig) {
            return (
                <div className={styles.profilePicWrapper}>
                    <Avatar {...JSON.parse(avatarConfig)} className={styles.profilePic} />
                    {onlineStatus === 'online' && (
                        <span className={styles.onlineIndicator}></span>
                    )}
                </div>
            );
        } else if (profileImg) {
            return (
                <div className={styles.profilePicWrapper}>
                    <img src={`${BASE_URL}/uploads/${profileImg}`} alt="Profile" className={styles.profilePic} />
                    {onlineStatus === 'online' && (
                        <span className={styles.onlineIndicator}></span>
                    )}
                   
                </div>
            );
        }
    
        return (
            <div className={styles.profilePicWrapper}>
                <img src={defaultProfilePic} alt="Default Profile" className={styles.profilePic} />
                {onlineStatus === 'online' && (
                    <span className={styles.onlineIndicator}></span>
                )}
            </div>
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
                            selectedUser.username
                        ) : (
                            <>
                                Hi <span style={{ color: '#2BB8EE', fontWeight: 'bold' }}>{userData?.username}</span> 😊 !
                            </>
                        )}
                        
                    </div>
                    <div>
                        {isTyping && selectedUser
                            ? "typing..." 
                            : (selectedUser 
                                ? users.find(user => user.id === selectedUser.id)?.online_status 
                                : '')}
                    </div>
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
                onRemoveContact={handleRemoveContact}
                onSearchMessages={handleSearchMessages}
                menuRef={menuRef}
            />
            {isProfileOpen && (
                <MyProfile 
                    onClose={closeProfile} 
                    isProfileOpen={isProfileOpen}
                    updateUserData={setUserData}
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
                    fetchFriends={fetchFriends}
                />
            )}
        </header>
    );
}

export default ChatHeader;
