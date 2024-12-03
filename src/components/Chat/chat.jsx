import React, { useState, useEffect, useCallback } from 'react';
import ChatHeader from '../ChatHeader/chatHeader';
import ChatContainer from '../ChatContainer/chatContainer';
import UserList from '../UserList/userList';
import EmojiPickerComponent from '../EmojiPicker/emojiPicker';
import AddNewContact from '../AddNewContact/addNewContact';
import Notification from '../Notification/notification';
import closeUserList from '../../assets/img/closeUser-icon.png';
import openUserList from '../../assets/img/openUser-icon.png';
import styles from './chat.module.scss';
import Cookies from "js-cookie";
import axios from 'axios';
import FriendRequestNotification from '../FriendRequestNotification/friendRequestNotification';
import newMessageSound from '../../assets/audio/new-message.mp3';
import BASE_URL from '../../config_base_url';
import { io } from 'socket.io-client';
const socket = io(BASE_URL);


const Chat = ({ onLogout }) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const [showOnlyProfilePics, setShowOnlyProfilePics] = useState(false);
    const [userToggled, setUserToggled] = useState(false);
    const [emojiToggled, setEmojiToggled] = useState(false);
    const [isUserListOpen, setIsUserListOpen] = useState(false);
    const [showAddContactForm, setShowAddContactForm] = useState(false);
    const [notification, setNotification] = useState('');
    const [hasSentRequest, setHasSentRequest] = useState(false);
    const [sentRequests, setSentRequests] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [hasSelectedMessages, setHasSelectedMessages] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingStatuses, setTypingStatuses] = useState({});
    
    const fetchFriends = async () => {
        const userId = Cookies.get('userId');
        try {
            const response = await axios.get(`${BASE_URL}/friends/${userId}`);
            setUsers(response.data);
        } catch (error) {
            console.error('Fehler beim Abrufen der Freunde:', error);
        }
    };

    useEffect(() => {
        fetchFriends(); 
    }, []);

    const toggleEmojiPicker = () => {
        setEmojiPickerVisible(prev => !prev);
        setEmojiToggled(prev => !prev);
    };

    const handleEmojiClick = (emojiObject) => {
        setSelectedEmoji(emojiObject);
    };

    const checkScreenWidth = useCallback(() => {
        if (window.innerWidth >= 428) {
            setIsUserListOpen(false);

            if (!userToggled) {
                setShowOnlyProfilePics(window.innerWidth <= 811);
            }
        } else {
            userToggled ? setShowOnlyProfilePics(true) : setUserToggled(false);
        }

        setEmojiPickerVisible(emojiToggled);

    }, [userToggled, emojiToggled]);

    useEffect(() => {
        checkScreenWidth();

        const handleResize = () => {
            checkScreenWidth();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [checkScreenWidth]);

    const toggleShowOnlyProfilePics = () => {
        setUserToggled(prev => !prev);
        setShowOnlyProfilePics(prev => !prev);
    };

    const toggleUserList = () => {
        if (window.innerWidth <= 428) {
            setIsUserListOpen(prev => !prev);
            setShowOnlyProfilePics(false); 
        }
    };

    const handleAddNewContact = (message, isSuccess, contactName, recipientId) => {
        if (isSuccess) {
            setNotification({
                message: `Request to <span style="color:#2BB8EE; font-weight:bold">${contactName}</span> successfully sent.`,
                type: 'success',
                isHtml: true 
            });

            socket.emit('sendFriendRequest', { recipientId });
        } else {
            setNotification({
                message: message,
                type: 'error',
                isHtml: false 
            });
        }
    };

    const toggleAddContactForm = () => {
        setShowAddContactForm(prev => !prev);
    };

    const checkForRequests = () => {
        const userId = Cookies.get('userId');
        axios.get(`${BASE_URL}/check-friend-request/${userId}`)
            .then(response => {
                if (response.data.type === 'success') {
                    const { sentRequests, pendingRequests } = response.data;
                    setSentRequests(sentRequests || []);
                    setPendingRequests(pendingRequests || []);
                    setHasSentRequest(sentRequests.length > 0);
                } else {
                    setHasSentRequest(false);
                    setSentRequests([]);
                    setPendingRequests([]);
                }
            })
            .catch(error => {
                console.error(error);
            });
    };

    useEffect(() => {
        const userId = Cookies.get('userId');
        
        if (userId) {
            checkForRequests(); 
            socket.emit('registerUser', userId);
        }       

        // Listener für eingehende Freundschaftsanfragen
        const handleFriendRequestReceived = (data) => {
            if (data && data.recipientId) {
                checkForRequests();
                const audio = new Audio(newMessageSound);
                audio.play().catch(error => {
                    console.error("Audio konnte nicht abgespielt werden:", error);
                });
            }
        };

        // Listener für die Antwort auf Freundschaftsanfragen
        const handleFriendRequestResponse = async (data) => {
            try {
                const response = await axios.get(`${BASE_URL}/users/${data.senderId}`);
                const senderName = response.data.username;
                const { status } = data;
        
                if (status === 'accepted') {
                    setNotification({
                        message: `<span style="color:#2BB8EE; font-weight:bold">${senderName}</span> has accepted your friend request!`,
                        type: 'success',
                        isHtml: true,
                    });
                    fetchFriends();
                } else if (status === 'rejected') {
                    setNotification({
                        message: `<span style="color:#2BB8EE; font-weight:bold">${senderName}</span> has rejected your friend request.`,
                        type: 'error',
                        isHtml: true,
                    });
                }
            } catch (error) {
                console.error('Fehler beim Abrufen des Benutzernamens:', error);
            }
        };

        // Listener für das Entfernen eines Freundes
        const handleFriendRemoved = (data) => {
            /* const { userId } = data; */
            fetchFriends();
        };

        socket.on('friendRequestReceived', handleFriendRequestReceived);
        socket.on('friendRequestResponse', handleFriendRequestResponse);
        socket.on('friendRemoved', handleFriendRemoved);
        
    
        return () => {
            socket.off('friendRequestReceived', handleFriendRequestReceived);
            socket.off('friendRequestResponse', handleFriendRequestResponse);
            socket.off('friendRemoved', handleFriendRemoved);
        };
    }, []);

    useEffect(() => {
        if (typingStatuses[selectedUser?.id] !== undefined) {
            setIsTyping(typingStatuses[selectedUser.id]);
        } else {
            setIsTyping(false); 
        }

        const handleTypingStatus = ({ status, userId, friendId }) => {
            setTypingStatuses(prev => ({
                ...prev,
                [userId]: status
            }));

            if (selectedUser && String(selectedUser.id) === String(userId)) {
                setIsTyping(status);
            }
        };
    
        socket.on('typing', handleTypingStatus);
    
        return () => {
            socket.off('typing', handleTypingStatus); 
        };
    }, [selectedUser, typingStatuses]);    

    const handleUserSelect = (user) => {
        setSelectedUser(user);

        if (user && typingStatuses[user.id] !== undefined) {
            setIsTyping(typingStatuses[user.id]);
        } else {
            setIsTyping(false);
        }
    
        if (window.innerWidth <= 428) {
            setIsUserListOpen(false);
        }
    };
    
    const handleCloseNotification = () => {
        setNotification('');
    };

    const handleSelectMessagesStatus = () => {
        setHasSelectedMessages((prevStatus) => !prevStatus);
    };

    const handleCloseEditMode = () => {
        setHasSelectedMessages(false);
    };

    return (
        <div className={`${styles.app} ${emojiPickerVisible ? styles['emoji-visible'] : ''}`}>
            <div className={`${styles.sidebar} ${showOnlyProfilePics ? styles.showOnlyProfilePics : ''} ${isUserListOpen ? styles.expanded : ''}`}>
                <UserList 
                    users={users}
                    isHovered={isHovered} 
                    onUserClick={handleUserSelect}
                    selectedUser={selectedUser}
                    showOnlyProfilePics={showOnlyProfilePics}
                    addNewContact={toggleAddContactForm}
                />
                <img 
                    className={styles.toggleUserList}
                    alt="Close"
                    src={showOnlyProfilePics ? openUserList : closeUserList} 
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={toggleShowOnlyProfilePics}    
                />
            </div>
            <div className={styles['main-content']}>
                <ChatHeader 
                    users={users}
                    onLogout={onLogout}
                    isUserListOpen={isUserListOpen}
                    selectedUser={selectedUser} 
                    onBackClick={toggleUserList}
                    pendingRequestCount={pendingRequests.length + sentRequests.length}
                    pendingRequests={pendingRequests}
                    checkForRequests={checkForRequests}
                    fetchFriends={fetchFriends}
                    setNotification={setNotification}
                    setSelectedUser={setSelectedUser}
                    setUsers={setUsers}
                    handleSelectMessagesStatus={handleSelectMessagesStatus}
                    isTyping={isTyping}
                />
                <div className={styles['chat-layout']}>
                    <div className={styles['chat-container']}>
                        <ChatContainer 
                            toggleEmojiPicker={toggleEmojiPicker}
                            emojiPickerVisible={emojiPickerVisible}
                            selectedEmoji={selectedEmoji}
                            selectedUser={selectedUser} 
                            hasSelectedMessages={hasSelectedMessages} 
                            setHasSelectedMessages={handleCloseEditMode}
                            setSelectedEmoji={setSelectedEmoji}
                        />
                    </div>
                    <div className={`${styles['emoji-container']} ${emojiPickerVisible ? styles['emoji-visible'] : ''}`}>
                        <EmojiPickerComponent onEmojiClick={handleEmojiClick} />
                    </div>
                </div>
            </div>
            {showAddContactForm && (
                <AddNewContact 
                    onAddContact={handleAddNewContact} 
                    onClose={toggleAddContactForm}
                    showAddContactForm={showAddContactForm}
                />
            )}
            <Notification 
                message={notification}
                onClose={handleCloseNotification}
                onConfirm={notification?.onConfirm}
            />
            {hasSentRequest && sentRequests.map(request => (
                <FriendRequestNotification 
                    key={request.FriendID} 
                    request={request}
                    onClose={() => {
                        setHasSentRequest(false);
                        checkForRequests();
                    }}
                    fetchFriends={fetchFriends}
                />
            ))}
        </div>
    );
};

export default Chat;
