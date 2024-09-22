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
import { io } from 'socket.io-client';

const socket = io('http://localhost:8081');
/* import newMessageSound from '../../assets/audio/new-message.mp3'; */

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
    /* const [isUserInteracted, setIsUserInteracted] = useState(false); */
    

   /*  useEffect(() => {
        const handleUserInteraction = () => {
            console.log("User interaction detected!");
            setIsUserInteracted(true);
            document.removeEventListener('click', handleUserInteraction);
        };
        document.addEventListener('click', handleUserInteraction);
    
        return () => {
            document.removeEventListener('click', handleUserInteraction);
        };
    }, []);
    
    useEffect(() => {
        if (hasSentRequest && isUserInteracted) {
            const audio = new Audio(newMessageSound);
            audio.play().catch(error => {
                console.error('Error playing the notification sound:', error);
            });
        }
    }, [hasSentRequest, isUserInteracted]); */

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

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        if (window.innerWidth <= 428) {
            setIsUserListOpen(false);
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
        axios.get(`http://localhost:8081/check-friend-request/${userId}`)
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
        
        const handleFriendRequestReceived = (data) => {
            if (data && data.recipientId) {
                checkForRequests();
            }
        };
    
        socket.on('friendRequestReceived', handleFriendRequestReceived);
    
        return () => {
            socket.off('friendRequestReceived', handleFriendRequestReceived);
        };
    }, []);
    


    const handleCloseNotification = () => {
        setNotification('');
    };

    return (
        <div className={`${styles.app} ${emojiPickerVisible ? styles['emoji-visible'] : ''}`}>
            <div className={`${styles.sidebar} ${showOnlyProfilePics ? styles.showOnlyProfilePics : ''} ${isUserListOpen ? styles.expanded : ''}`}>
                <UserList 
                    isHovered={isHovered} 
                    onUserClick={handleUserSelect}
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
                    onLogout={onLogout}
                    isUserListOpen={isUserListOpen}
                    selectedUser={selectedUser} 
                    onBackClick={toggleUserList}
                    pendingRequestCount={pendingRequests.length + sentRequests.length}
                    pendingRequests={pendingRequests}
                    checkForRequests={checkForRequests}
                />
                <div className={styles['chat-layout']}>
                    <div className={styles['chat-container']}>
                        <ChatContainer 
                            toggleEmojiPicker={toggleEmojiPicker}
                            emojiPickerVisible={emojiPickerVisible}
                            selectedEmoji={selectedEmoji} 
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
            />
            {hasSentRequest && sentRequests.map(request => (
                <FriendRequestNotification 
                    key={request.FriendID} 
                    request={request}
                    onClose={() => {
                        setHasSentRequest(false);
                        checkForRequests();
                    }}
                />
            ))}
            
        </div>
    );
};

export default Chat;
