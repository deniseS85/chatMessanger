import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css';
import './index.scss';
import ChatHeader from './components/ChatHeader/chatHeader';
import ChatContainer from './components/ChatContainer/chatContainer';
import UserList from './components/UserList/userList';
import EmojiPickerComponent from './components/EmojiPicker/emojiPicker';
import closeUserList from './assets/img/closeUser-icon.png';
import openUserList from './assets/img/openUser-icon.png';

const App = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const [showOnlyProfilePics, setShowOnlyProfilePics] = useState(false);
    const [userToggled, setUserToggled] = useState(false);
    const [emojiToggled, setEmojiToggled] = useState(false);

    const toggleEmojiPicker = () => {
        setEmojiPickerVisible(open => !open);
        setEmojiToggled(prev => !prev);
    };

    const handleEmojiClick = (emojiObject) => {
        setSelectedEmoji(emojiObject);
    };

    const checkScreenWidth = useCallback(() => {
        const isSmallScreenUserPic = window.innerWidth <= 655;
        const isSmallScreenEmoji = window.innerWidth <= 811;
        if (!userToggled) {
            setShowOnlyProfilePics(isSmallScreenUserPic);
        }

        if (isSmallScreenEmoji) {
            setEmojiPickerVisible(false);
        } else if (emojiToggled) {
            setEmojiPickerVisible(true);
        }
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

   
    return (
        <div className={`app ${emojiPickerVisible ? 'emoji-visible' : ''}`}>
            <div className={`sidebar ${showOnlyProfilePics ? 'showOnlyProfilePics' : ''}`}>
                <UserList 
                    isHovered={isHovered} 
                    onUserClick={setSelectedUser}
                    showOnlyProfilePics={showOnlyProfilePics} 
                />
                <img 
                    className="toggleUserList"
                    alt="Close"
                    src={showOnlyProfilePics ? openUserList : closeUserList} 
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={toggleShowOnlyProfilePics}    
                />
            </div>
            <div className="main-content">
                <ChatHeader selectedUser={selectedUser} />
                <div className="chat-layout">
                    <div className="chat-container">
                        <ChatContainer 
                            toggleEmojiPicker={toggleEmojiPicker}
                            emojiPickerVisible={emojiPickerVisible}
                            selectedEmoji={selectedEmoji} 
                        />
                    </div>
                    <div className={`emoji-container ${emojiPickerVisible ? 'emoji-visible' : ''}`}>
                        <EmojiPickerComponent onEmojiClick={handleEmojiClick} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);