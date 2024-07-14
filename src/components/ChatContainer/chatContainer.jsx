import React, { useEffect, useRef, useState } from 'react';
import styles from './chatContainer.module.scss';
import ChatInput from '../ChatInput/chatInput';

function ChatContainer({ toggleEmojiPicker, emojiPickerVisible, selectedEmoji }) {
    const messagesContainerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([]);

    const addMessage = (message) => {
        const newMessage = { text: message, type: 'send' };
        setMessages(prevMessages => [newMessage, ...prevMessages]);
    };

    useEffect(() => {
        scrollToBottom();
        adjustTriangleHeight();
    }, [messages]);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    const adjustTriangleHeight = () => {
        const messageElements = document.querySelectorAll(`.${styles.message}`);
    
        messageElements.forEach(messageElement => {
            const height = messageElement.getBoundingClientRect().height;
            const computedStyle = window.getComputedStyle(messageElement);
            const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize);
            const lines = Math.floor(height / lineHeight);
        
            if (lines === 1) {
                messageElement.style.setProperty('--triangle-height', '20px');
            } else {
                messageElement.style.setProperty('--triangle-height', '25px');
            }
        });
    };

    return (
        <div className={`${styles.chatContainer} ${!emojiPickerVisible ? styles['emoji-hidden'] : ''}`}>
            <div ref={messagesContainerRef} className={styles.messageContainer}>
                {messages.map((message, index) => (
                    <p key={index} className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </p>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputContainer}>
                <ChatInput 
                    toggleEmojiPicker={toggleEmojiPicker}
                    selectedEmoji={selectedEmoji}
                    onSendMessage={addMessage}
                />
            </div>
        </div>
    );
}

export default ChatContainer;
