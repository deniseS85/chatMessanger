import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css';
import './index.scss';
import ChatHeader from './components/ChatHeader/chatHeader';
import ChatContainer from './components/ChatContainer/chatContainer';
import UserList from './components/UserList/userList';
import EmojiPickerComponent from './components/EmojiPicker/emojiPicker';

const App = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState(null);

    const toggleEmojiPicker = () => {
        setEmojiPickerVisible(prev => !prev);
    };

    const handleEmojiClick = (emojiObject) => {
        setSelectedEmoji(emojiObject);
    };
   
    return (
        <div className={`app ${emojiPickerVisible ? 'emoji-visible' : ''}`}>
            <div className="sidebar">
                <UserList onUserClick={setSelectedUser} />
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