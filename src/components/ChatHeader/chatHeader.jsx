import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios'; 
import styles from './chatHeader.module.scss';
import menuIcon from '../../assets/img/menu-icon.png';
import backIcon from '../../assets/img/send-message-icon.png';
import notificationIcon from '../../assets/img/notification.png';
import defaultProfilePic from '../../assets/img/default-profile-img.png';
import searchIcon from '../../assets/img/search-icon.png';
import closeIcon from '../../assets/img/close-icon.png';
import DropdownMenu from '../DropdownMenu/dropdownMenu';
import MyProfile from '../MyProfile/myProfile';
import FriendProfile from '../FriendProfile/friendProfile';
import NotificationsContainer from '../NotificationsContainer/notificationsContainer';
import FriendRequestNotification from '../FriendRequestNotification/friendRequestNotification';
import Avatar from 'react-nice-avatar';
import BASE_URL from '../../config_base_url';
import { io } from 'socket.io-client';
const socket = io(BASE_URL);

function ChatHeader({ users, isUserListOpen, selectedUser, onBackClick, onLogout, pendingRequestCount, pendingRequests, checkForRequests, fetchFriends, setNotification, setSelectedUser, setUsers, handleSelectMessagesStatus, handleSearchMessagesStatus, setHasSelectedMessages, isSearchOpen, setIsSearchOpen, isTyping, messages, setShowMessageFoundId, handleDeleteChatConfirmation }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isFriendProfileOpen, setIsFriendProfileOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const menuIconRef = useRef(null);
    const notificationRef = useRef(null);
    const notificationIconRef = useRef(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [userData, setUserData] = useState(null);
    const inputRef = useRef(null);
    const [searchValue, setSearchValue] = useState('');

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
        setIsSearchOpen(false);
        setHasSelectedMessages(false);
    }

    const closeProfile = () => {
        setIsProfileOpen(false);
    };

    const showFriendProfile = () => {
        setIsMenuOpen(false);
        setIsFriendProfileOpen(true);
        setIsSearchOpen(false);
        setHasSelectedMessages(false);
    };

    const closeFriendProfile = () => {
        setIsFriendProfileOpen(false);
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
        setIsSearchOpen(false);
        handleSelectMessagesStatus(false);
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
            if (messages && messages.length > 0) {
                setIsMenuOpen(false);
                handleSelectMessagesStatus(true);
                setIsSearchOpen(false);
            } else {
                setIsMenuOpen(false);
                handleSelectMessagesStatus(false);
                setNotification({
                    message: 'No messages to select.',
                    type: 'error',
                    isHtml: true,
                    onClose: () => {
                        setNotification(null);
                    }
                });
            }
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
    
    const deleteChatConfirmation = () => {
        if (selectedUser) {
            if (messages && messages.length > 0) {
                setIsMenuOpen(false);
                setHasSelectedMessages(false);
                setIsSearchOpen(false);
                handleDeleteChatConfirmation(false);
    
                setNotification({
                    message: `Do you really want to delete this chat with<br> <span style="color:#2BB8EE; font-weight:bold">${selectedUser.username}</span>?`,
                    type: 'error',
                    isHtml: true,
                    onConfirm: () => {
                        handleDeleteChatConfirmation(true);
                    },
                });
            } else {
                setIsMenuOpen(false);
                handleDeleteChatConfirmation(false);
                setNotification({
                    message: 'No messages to delete for this chat.',
                    type: 'error',
                    isHtml: true,
                    onClose: () => {
                        setNotification(null);
                    }
                });
            }
        } else {
            setIsMenuOpen(false);
            handleDeleteChatConfirmation(false);
            setNotification({
                message: 'Please open a chat first before deleting it.',
                type: 'error',
                isHtml: true,
                onClose: () => {
                    setNotification(null);
                }
            });
        }
    };   

    const handleSearchMessages = () => {
        if (selectedUser) {
            setIsMenuOpen(false);
            handleSearchMessagesStatus(true);
            setHasSelectedMessages(false);
        } else {
            setIsMenuOpen(false);
            handleSearchMessagesStatus(false);
            setNotification({
                message: 'Please open a chat first to search for messages.',
                type: 'error',
                isHtml: true,
                onClose: () => {
                    setNotification(null);
                }
            });
        }
    };

    useEffect(() => {
        if (isSearchOpen && inputRef.current) {
            const timeout = setTimeout(() => {
                inputRef.current.focus();
            }, 300); 
            return () => clearTimeout(timeout);
        }
    }, [isSearchOpen]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);
    };

    const handleCloseSearch = () => {
        handleSearchMessagesStatus(false);
        setSearchValue('');
    };

    useEffect(() => {
        handleCloseSearch();
    }, [selectedUser]);

    const getFormattedDate = (timestamp) => {
        const messageDate = new Date(timestamp);
        const now = new Date();
    
        const isToday = messageDate.getDate() === now.getDate() && messageDate.getMonth() === now.getMonth() && messageDate.getFullYear() === now.getFullYear();
        const dayDifference = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
        const isThisWeek = dayDifference <= now.getDay() && dayDifference > 0;
    
        return isToday
            ? messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : isThisWeek
            ? messageDate.toLocaleDateString('en-US', { weekday: 'short' })
            : messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const highlightSearch = (messageContent, searchValue) => {
        return messageContent
            .split(new RegExp(`(${searchValue})`, 'gi'))
            .map((part, index) =>
                part.toLowerCase() === searchValue.toLowerCase() ?
                    <span key={index} className={styles.highlight}>{part}</span> : part
            );
    };

    const showFoundMessage = (messageId) => {
        setShowMessageFoundId(null);  
        setTimeout(() => {
            setShowMessageFoundId(messageId);
        }, 0); 
        handleCloseSearch();
    };
    
    const handleRemoveContact = () => {
        if (selectedUser) {
            setIsMenuOpen(false);
            setHasSelectedMessages(false);
            setIsSearchOpen(false);
            const friendId = selectedUser.id;
            const userId = Cookies.get('userId');
            
            setNotification({
                message: `Do you really want to remove your contact with<br> <span style="color:#2BB8EE; font-weight:bold">${selectedUser.username}</span>?`,
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

    // zeigt Online/Offline-Status an
    const getOnlineIndicator = (onlineStatus) => {
        if (onlineStatus === 'online') {
            return <span className={styles.onlineIndicator}></span>;
        }
        return null;
    };

    // wenn Upload Profilbild vorhanden ist
    const renderUploadedProfilePic = (profilePic, username, onlineStatus) => {
        const isDefaultProfilePic = profilePic === defaultProfilePic;
    
        return (
            <div className={styles.profilePicWrapper}>
                <img
                    src={isDefaultProfilePic ? defaultProfilePic : `${BASE_URL}/uploads/${profilePic}`}
                    alt={username || 'User'}
                    className={styles.profilePic}
                />
                {getOnlineIndicator(onlineStatus)}
            </div>
        );
    };
    
    // wenn Avatar Profilbild vorhanden ist
    const renderAvatar = (avatarConfig, onlineStatus) => (
        <div className={styles.profilePicWrapper}>
            <Avatar {...JSON.parse(avatarConfig)} className={styles.profilePic} />
            {getOnlineIndicator(onlineStatus)}
        </div>
    );

    // wenn Profilbild in userData (eigenes Profil) vorhanden ist
    const renderLoginImg = (profileImg, onlineStatus) => {
        const isDefaultProfileImg = profileImg === defaultProfilePic;
    
        return (
            <div className={styles.profilePicWrapper}>
                <img
                    src={isDefaultProfileImg ? defaultProfilePic : `${BASE_URL}/uploads/${profileImg}`}
                    alt="Profile"
                    className={styles.profilePic}
                />
                {getOnlineIndicator(onlineStatus)}
            </div>
        );
    };

    // Profilbild wird gesetzt
    const getProfileImage = (user = selectedUser || userData) => {
        if (!user) {
            return (
                <div className={styles.profilePicWrapper}>
                    <img
                        src={defaultProfilePic}
                        alt="Default Profile"
                        className={styles.profilePic}
                    />
                </div>
            );
        }

        const foundUser = users.find(u => u.id === user.id);
        const onlineStatus = foundUser ? foundUser.online_status : user.online_status;
       
        // wenn Upload Profilbild (Freund)
        if (user.profilePic) {
            return renderUploadedProfilePic(user.profilePic, user.username, onlineStatus);
        }

        // wenn Avatar Profilbild (Freund)
        if (user.avatar_config) {
            return renderAvatar(user.avatar_config, onlineStatus);
        }

        // wenn Upload oder Avatar (eigenes Profil)
        if (user.profile_img) {
            return renderLoginImg(user.profile_img, onlineStatus);
        }

        // wenn kein Profilbild, setze defaultbild
        return (
            <div className={styles.profilePicWrapper}>
                <img
                    src={defaultProfilePic}
                    alt="Default Profile"
                    className={styles.profilePic}
                />
                {getOnlineIndicator(onlineStatus)}
            </div>
        );
    };

    return (
        <header className={`${styles.header} ${isSearchOpen ? styles.searchOpen : ''}`}>
            <div 
                className={`${styles.profileContainer} ${isSearchOpen ? styles.searchOpen : ''}`}
                onClick={() => {
                    if (!selectedUser) {
                        showProfile();
                    } else {
                        showFriendProfile();
                    }
                }}>
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
                <div className={`${styles.profileInfo} ${isSearchOpen ? styles.searchOpen : ''}`}>
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

            <div className={`${styles.searchContainer} ${isSearchOpen ? styles.visible : styles.hidden}`}>
                <img 
                    src={searchIcon} 
                    alt="Search" 
                    className={styles.searchIcon} 
                />
                <input 
                    ref={inputRef}
                    type="text" 
                    value={searchValue}
                    onChange={handleInputChange}
                    className={`${styles.searchInput} ${searchValue ? styles.searchResults : ''}`} 
                    placeholder="Search messages..." 
                />
                <img
                    src={closeIcon}
                    alt="Close"
                    className={styles.closeButton} 
                    onClick={handleCloseSearch} 
                />
                <div className={`${styles.searchResultsContainer} ${searchValue ? styles.visible : styles.hidden}`}>
                    {searchValue ? (
                        messages.filter(message => 
                            message.content.toLowerCase().includes(searchValue.toLowerCase())
                        ).length > 0 ? (
                            messages
                                .filter(message => 
                                    message.content.toLowerCase().includes(searchValue.toLowerCase())
                                )
                                .map(message => {
                                    const allUsers = [userData, ...users];
                                    const user = allUsers.find(user => user.id === message.sender_id);
                                    const userName = user?.username;
                                    const date = getFormattedDate(message.timestamp);
                                    const highlightedMessage = highlightSearch(message.content, searchValue);

                                    return (
                                        <div 
                                            key={message.message_id} 
                                            className={styles.searchResultItem}
                                            onClick={() => showFoundMessage(message.message_id)}
                                        >
                                            <div>
                                                {getProfileImage(user) || (
                                                    <img 
                                                        src={defaultProfilePic} 
                                                        alt="Default Profile" 
                                                        className={styles.profilePic} 
                                                    />
                                                )}
                                            </div>
                                            <div className={styles.resultContent}>
                                                <div className={styles.resultProfileInfo}>
                                                    <div>{userName}</div>
                                                    <div>{date}</div>
                                                </div>
                                                <div className={styles.resultMessage}>
                                                    <span>{highlightedMessage}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                        ) : (
                            <div className={styles.noResults}>No results found for "{searchValue}".</div>
                        )
                    ) : null}
                </div>
            </div>

            <div className={`${styles.menuContainer} ${isSearchOpen ? styles.searchOpen : ''}`}>
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
                onDeleteChat={deleteChatConfirmation}
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
            {isFriendProfileOpen && selectedUser && (
                <FriendProfile 
                    selectedUser={selectedUser}
                    isFriendProfileOpen={isFriendProfileOpen}
                    onClose={closeFriendProfile} 
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
