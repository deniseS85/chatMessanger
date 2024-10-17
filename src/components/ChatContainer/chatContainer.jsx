import React, { useEffect, useRef, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styles from './chatContainer.module.scss';
import ChatInput from '../ChatInput/chatInput';
import welcomImage from '../../assets/img/welcome-image.png';
import Cookies from 'js-cookie';
import axios from 'axios';
import { io } from 'socket.io-client';
const socket = io('http://localhost:8081');

function ChatContainer({ toggleEmojiPicker, emojiPickerVisible, selectedEmoji, selectedUser }) {
    const messagesContainerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [inputHeightDiff, setInputHeightDiff] = useState(0);

    useEffect(() => {
        const userId = Cookies.get('userId');
        
        const messageListener = (data) => {
            const { sender_id, content } = data;
            const friendId = selectedUser ? selectedUser.id  : null;

            if (sender_id === friendId.toString()) {
                const newMessage = {
                    content,
                    sender_id,
                    type: 'receive'
                };

                setMessages(prevMessages => [newMessage, ...prevMessages]);
                console.log(`Nachricht empfangen von ${sender_id}: ${content}`);
            }
        };
    
        if (userId) {
            socket.emit('registerUser', userId);
            fetchMessages();
            
            socket.on('messageReceived', messageListener); 
    
            return () => {
                socket.off('messageReceived', messageListener);
            };
        }
    }, [selectedUser]);

    const addMessage = async (messageText) => {
        const userId = Cookies.get('userId');
        const friendId = selectedUser ? selectedUser.id : null;

        if (!friendId || !userId) { return; }

        const newMessage = { 
            content: messageText,
            type: 'send'
        };

        setMessages(prevMessages => [newMessage, ...prevMessages]);

        try {
            await axios.post('http://localhost:8081/sendMessage', {
                sender_id: userId, 
                recipient_id: friendId,
                content: messageText
            });

            socket.emit('sendMessage', { 
                sender_id: userId, 
                recipient_id: friendId, 
                content: messageText 
            });
            console.log(`Nachricht gesendet an ${friendId}: ${messageText}`);
        } catch (error) {
            console.error('Fehler beim Speichern der Nachricht:', error);
        }
    };

    const fetchMessages = async () => {
        const userId = Cookies.get('userId');
        const friendId = selectedUser ? selectedUser.id : null;

        if (friendId && userId) {
            try {
                const response = await axios.get('http://localhost:8081/getMessage', {
                    params: {
                        userId,
                        friendId
                    }
                });
                const messagesWithType = response.data.map(message => ({
                    ...message,
                    type: message.sender_id === Number(userId) ? 'send' : 'receive',
                }));

                setMessages(messagesWithType);
            } catch (error) {
                console.error('Fehler beim Abrufen der Nachrichten:', error);
            }
        }
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

    const handleInputHeightChange = (heightDifference) => {
        setInputHeightDiff(heightDifference);
    };

    const marginBottom = 50 + inputHeightDiff;

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.style.marginBottom = `${marginBottom}px`;
        }
    }, [marginBottom]);

    return (
        <div 
            className={`${styles.chatContainer} ${!emojiPickerVisible ? styles['emoji-hidden'] : ''}`} >
            <div ref={messagesContainerRef} className={styles.messageContainer}
                data-chat-id={selectedUser ? selectedUser.id : 'no-user'}
            >
                {selectedUser ? (
                    <TransitionGroup component={null}>
                        {messages.map((message, index) => {
                            const nodeRef = React.createRef();
                            const isFirstMessage = index === messages.length - 1;

                            return (
                                <CSSTransition
                                    key={`${message.message_id}-${index}`}
                                    nodeRef={nodeRef}
                                    timeout={500}
                                    classNames={{
                                        enter: styles.messageEnter,
                                        enterActive: styles.messageEnterActive,
                                        exit: styles.messageExit,
                                        exitActive: styles.messageExitActive,
                                    }}
                                >
                                    <p 
                                        ref={nodeRef} 
                                        className={`${styles.message} ${styles[message.type]} ${isFirstMessage ? styles.firstMessage : ''}`}                            
                                    >
                                        {message.content}
                                    </p>
                                </CSSTransition>
                            );
                        })}
                    </TransitionGroup>
                ) : (
                    <div className={styles.welcomeMessage}>
                        <img src={welcomImage} alt="Welcome Image" />
                        <p>Choose a <span style={{ color: '#2BB8EE', fontWeight: 'bold' }}>friend</span> to begin your conversation.</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {selectedUser && (
                <div className={styles.inputContainer}>
                    <ChatInput 
                        toggleEmojiPicker={toggleEmojiPicker}
                        selectedEmoji={selectedEmoji}
                        onSendMessage={addMessage}
                        emojiPickerVisible={emojiPickerVisible}
                        onHeightChange={handleInputHeightChange}
                    />
                </div>
            )}
        </div>
    );
}

export default ChatContainer;
