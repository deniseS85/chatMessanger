import React from 'react';
import styles from './chatContainer.module.scss';
import ChatInput from '../ChatInput/chatInput';

function ChatContainer({ toggleEmojiPicker, emojiPickerVisible, selectedEmoji }) {
    return (
        <div className={`${styles.chatContainer} ${!emojiPickerVisible ? styles['emoji-hidden'] : ''}`}>
            <h1>ChatContainer</h1>
            <ChatInput 
                toggleEmojiPicker={toggleEmojiPicker}
                selectedEmoji={selectedEmoji}
            />
        </div>
    );
}

export default ChatContainer;
