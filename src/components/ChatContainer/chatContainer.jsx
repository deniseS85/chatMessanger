import React, { useEffect, useRef, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styles from './chatContainer.module.scss';
import ChatInput from '../ChatInput/chatInput';

function ChatContainer({ toggleEmojiPicker, emojiPickerVisible, selectedEmoji }) {
    const messagesContainerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([]);

    const addMessage = (message) => {
        const newMessage = { text: message, type: 'send', id: Date.now() };
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
                <TransitionGroup component={null}>
                    {messages.map((message) => {
                        const nodeRef = React.createRef();
                        return (
                            <CSSTransition
                                key={message.id} 
                                nodeRef={nodeRef}
                                timeout={500}
                                classNames={{
                                    enter: styles.messageEnter,
                                    enterActive: styles.messageEnterActive,
                                    exit: styles.messageExit,
                                    exitActive: styles.messageExitActive,
                                }}
                            >
                                <p ref={nodeRef} className={`${styles.message} ${styles[message.type]}`}>
                                    {message.text}
                                </p>
                            </CSSTransition>
                        );
                    })}
                </TransitionGroup>
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
