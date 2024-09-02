import React, { useState, useEffect, useCallback } from 'react';
import ChatHeader from '../ChatHeader/chatHeader';
import ChatContainer from '../ChatContainer/chatContainer';
import UserList from '../UserList/userList';
import EmojiPickerComponent from '../EmojiPicker/emojiPicker';
import AddNewContact from '../AddNewContact/addNewContact';
import closeUserList from '../../assets/img/closeUser-icon.png';
import openUserList from '../../assets/img/openUser-icon.png';
import styles from './chat.module.scss'

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

    const handleAddNewContact = (contact) => {
        console.log('Neuer Kontakt hinzugefügt:', contact);
    };

    const toggleAddContactForm = () => {
        setShowAddContactForm(prev => !prev);
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
                <ChatHeader onLogout={onLogout}
                    selectedUser={selectedUser} 
                    onBackClick={toggleUserList}
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
        </div>
    );
};

export default Chat;
