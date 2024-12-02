import React, { useEffect, useRef, useState } from 'react';
import styles from './chatContainer.module.scss';
import ChatInput from '../ChatInput/chatInput';
import welcomImage from '../../assets/img/welcome-image.png';
import sentIcon from '../../assets/img/sent-icon.png';
import deliveredIcon from '../../assets/img/delivered-icon.png';
import readIcon from '../../assets/img/read-icon.png';
import closeIcon from '../../assets/img/close-icon.png';
import deleteIcon from '../../assets/img/delete-messages.png';
import Cookies from 'js-cookie';
import axios from 'axios';
import { io } from 'socket.io-client';
const socket = io('http://localhost:8081');


function ChatContainer({ toggleEmojiPicker, emojiPickerVisible, selectedEmoji, selectedUser, hasSelectedMessages, setHasSelectedMessages }) {
    const messagesContainerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [inputHeightDiff, setInputHeightDiff] = useState(0);
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [isInitalAnimation, setInitialAnimation] = useState(true);
    const [groupedMessages, setGroupedMessages] = useState({});

    const fetchMessages = async () => {
        const userId = Cookies.get('userId');
        const friendId = selectedUser ? selectedUser.id : null;

        if (friendId && userId) {
            try {
                const response = await axios.get('http://localhost:8081/getMessage', {
                    params: { userId, friendId }
                });

                const messagesWithType = response.data.map(message => ({
                    ...message,
                    type: message.sender_id === Number(userId) ? 'send' : 'receive',
                    message_id: message.message_id, 
                    timestamp: message.timestamp,
                    status: message.status || 'sent'
                }));

                setMessages(messagesWithType);
            } catch (error) {
                console.error('Fehler beim Abrufen der Nachrichten:', error);
            }
        }
    };

    useEffect(() => {
        const userId = Cookies.get('userId');
        
        const messageListener = (data) => {
            const { sender_id, content, timestamp, status, message_id } = data;
            const friendId = selectedUser ? selectedUser.id  : null;

            if (friendId && sender_id === friendId.toString()) {
                const newMessage = {
                    content,
                    sender_id,
                    type: 'receive',
                    message_id: message_id,
                    timestamp: timestamp || new Date().toISOString(),
                    status: status || 'sent'
                };

                setMessages(prevMessages => [newMessage, ...prevMessages]);
                /* console.log(`Nachricht empfangen von ${sender_id}: ${content}`); */
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
            type: 'send',
            message_id: Date.now(),
            timestamp: new Date().toISOString(),
            status : 'sent'
        };

        setMessages(prevMessages => [newMessage, ...prevMessages]);
        setInitialAnimation(true);
        setHasSelectedMessages(false);

        try {
            const response = await axios.post('http://localhost:8081/sendMessage', {
                sender_id: userId, 
                recipient_id: friendId,
                content: messageText,
                timestamp: newMessage.timestamp,
                status: newMessage.status,
                message_id: newMessage.message_id
            });

            const messageId = response.data.messageId;

            socket.emit('sendMessage', { 
                sender_id: userId, 
                recipient_id: friendId, 
                content: messageText,
                timestamp: newMessage.timestamp,
                status: newMessage.status,
                message_id: messageId
            });
            
            /* console.log(`Nachricht gesendet an ${friendId}: ${messageText}`); */
            await fetchMessages();
        } catch (error) {
            console.error('Fehler beim Speichern der Nachricht:', error);
        }
    };

    useEffect(() => {
        adjustTriangleHeight();

        setTimeout(() => {
            scrollToBottom();
        }, 0); 
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

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
    
        if (diff < 60) return 'Now';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        const groupMessagesByDate = messages => {
            return messages.reduce((groups, message) => {
                const messageDate = new Date(message.timestamp).toLocaleDateString('de-DE');
                if (!groups[messageDate]) {
                    groups[messageDate] = [];
                }
                groups[messageDate].push(message);
                return groups;
            }, {});
        };
    
        setGroupedMessages(groupMessagesByDate(messages));
    }, [messages]);

    useEffect(() => {
        if (!hasSelectedMessages && selectedMessages.length > 0) {
            setSelectedMessages([]);
        }
    }, [hasSelectedMessages]); 

    const handleSelectMessage = (messageId, isChecked) => {
        setSelectedMessages(prevState => {
            if (isChecked) {
                if(!prevState.includes(messageId)) {
                    return [...prevState, messageId];
                }
                return prevState;
            } else {
                return prevState.filter(id => id !== messageId);
            }
        });
    };

    useEffect(() => {
        const deleteMessengerSocket = ({ messageIds }) => {
            const groupedMessagesCopy = { ...groupedMessages };

            messageIds.forEach(messageId => {
                const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
                if (messageElement) {
                    createDustEffect(messageElement);
                }
            });

            Object.entries(groupedMessagesCopy).forEach(([date, messagesForDate]) => {
                const remainingMessagesForDate = messagesForDate.filter(
                    message => !messageIds.includes(message.message_id)
                );
    
                if (remainingMessagesForDate.length === 0) {
                    const dateElement = document.querySelector(`[data-date="${date}"]`);
                    if (dateElement) {
                        createDustEffect(dateElement);
                    } 
                }
            });

            setTimeout(() => {
                setGroupedMessages(prevGroupedMessages => {
                    const updatedGroupedMessages = { ...prevGroupedMessages };
                    messageIds.forEach(messageId => {
                        Object.keys(updatedGroupedMessages).forEach(date => {
                            updatedGroupedMessages[date] = updatedGroupedMessages[date].filter(
                                message => message.message_id !== messageId
                            );
                            if (updatedGroupedMessages[date].length === 0) {
                                delete updatedGroupedMessages[date];
                            }
                        });
                    });
                    return updatedGroupedMessages;
                });
            }, 2000); 
        };
    
        socket.on('messagesDeleted', deleteMessengerSocket);
    
        return () => {
            socket.off('messagesDeleted', deleteMessengerSocket);
        };
    }, [groupedMessages]);
    
    
    const handleDeleteMessages = async () => {
        if (selectedMessages.length === 0) return;
        const userId = Cookies.get('userId');
        const friendId = selectedUser ? selectedUser.id : null;
    
        try {
            const response = await axios.post('http://localhost:8081/deleteMessages', {
                messageIds: selectedMessages,
            });
    
            if (response.data.success) {
                socket.emit('deleteMessages', { messageIds: selectedMessages, userId, friendId });

                selectedMessages.forEach(messageId => {
                    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
                    if (messageElement) {
                      createDustEffect(messageElement);
                    }
                });

                Object.entries(groupedMessages).forEach(([date, messagesForDate]) => {
                    const remainingMessagesForDate = messagesForDate.filter(
                        message => !selectedMessages.includes(message.message_id)
                    );

                    if (remainingMessagesForDate.length === 0) {
                        const dateElement = document.querySelector(`[data-date="${date}"]`);
                        if (dateElement) {
                            createDustEffect(dateElement);
                        }
                    }
                });
                setSelectedMessages([]);
                setHasSelectedMessages(false);
            } 
        } catch (error) {
            console.error('Fehler beim Löschen der Nachrichten:', error);
        }
    };

    const createDustEffect = (element) => {
        const isDateElement = element.hasAttribute("data-date");
        const rect = element.getBoundingClientRect();
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = `${rect.left}px`;
        container.style.top = `${rect.top}px`;
        container.style.width = `${rect.width}px`;
        container.style.height = `${rect.height}px`;
        container.style.borderRadius = "25px";
        container.style.overflow = "hidden";
        container.style.pointerEvents = "none";
        document.body.appendChild(container);

        const animationPromises = [];

        const particleAnimation = (particle) => {
            return new Promise(resolve => {
                const animation = particle.animate(
                    [
                        { transform: "translate(0, 0) scale(1)", opacity: 1 },
                        { transform: `translate(${(Math.random() - 0.5) * 200}px, ${(Math.random() - 0.5) * 200}px) scale(0.5)`, opacity: 0 },
                    ],
                    {
                        duration: 2000,
                        delay: 40,
                        easing: "ease-out",
                        fill: "forwards",
                    }
                );
    
                animation.onfinish = () => {
                    particle.remove();
                    resolve();
                };
            });
        };
    
        for (let i = 0; i < 500; i++) {
            const particle = document.createElement("div");
            particle.style.position = "absolute";
            particle.style.width = "2px";
            particle.style.height = "2px";
            particle.style.background = isDateElement ? "#a9a9a966" : "#7F76FF";
            particle.style.borderRadius = "50%";
            particle.style.left = `${Math.random() * rect.width}px`;
            particle.style.top = `${Math.random() * rect.height}px`;
            container.appendChild(particle);

            animationPromises.push(particleAnimation(particle));
        }
        setTimeout(() => {
            container.style.overflow = "visible";
        }, 100); 

        Promise.all(animationPromises).then(() => {
            container.remove(); 
        });

        element.style.setProperty('opacity', '0', 'important');
        element.style.transition = "height 2s ease, margin 2s ease, padding 2s ease"; 
        element.style.height = "0";
        element.style.margin = "0";
        element.style.padding = "0";

        setTimeout(() => {
            fetchMessages(); 
        }, 2000); 
    };

    useEffect(() => {
        if (isInitalAnimation) {
            setHasSelectedMessages(false);
        }
    }, [isInitalAnimation]);
    
    useEffect(() => {
        if (hasSelectedMessages) {
            setInitialAnimation(false);
        }
    }, [hasSelectedMessages]); 

    useEffect(() => {
        if (selectedUser) {
            setInitialAnimation(true); 
        }
    }, [selectedUser]);

    return (
        <div className={`${styles.chatContainer} ${!emojiPickerVisible ? styles['emoji-hidden'] : ''}`} >
            <div ref={messagesContainerRef} className={styles.messageContainer} data-chat-id={selectedUser ? selectedUser.id : 'no-user'}>
    
                {selectedUser ? (
                    Object.entries(groupedMessages).map(([date, messagesForDate]) => {
                        const sortedMessagesForDate = messagesForDate.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
                        return (
                            <div key={date} className={styles.messageByDate}>
                                <div className={styles.dateSeparator}
                                    data-date={date}
                                >
                                    {date}
                                </div>
                                {sortedMessagesForDate.map((message) => {
                                    const time = formatTime(message.timestamp);
                                    const isSendMessage = message.type === 'send';
    
                                    return (
                                        <div
                                            key={message.message_id}
                                            data-message-id={message.message_id}
                                            className={`${styles.message}
                                                        ${styles[message.type]}
                                                        ${hasSelectedMessages && isSendMessage ? styles.selectMessageOption : ''}
                                                        ${selectedMessages.includes(message.message_id) && isSendMessage ? styles.selectedContainer : ''}
                                                        ${isSendMessage ? styles.sendPadding : ''}
                                                        ${selectedMessages.includes(message.message_id) ? styles.selected : ''}
                                                        ${!hasSelectedMessages && !isInitalAnimation ? styles.hideSelectMessageOption : ''}
                                                        ${!hasSelectedMessages && isInitalAnimation ? styles.messageEnter : ''}`}
                                            onClick={() => hasSelectedMessages && handleSelectMessage(message.message_id, !selectedMessages.includes(message.message_id))}
                                        >
                                            {hasSelectedMessages && isSendMessage && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMessages.includes(message.message_id)}
                                                    onChange={(e) => handleSelectMessage(message.message_id, e.target.checked)}
                                                    className={styles.checkbox}
                                                />
                                            )}
    
                                            <span>{message.content}</span>
                                            <span className={`${styles.messageTime} ${isSendMessage ? styles.sendMessageTime : ''}`}>
                                                {time}
                                            </span>
                                            {isSendMessage && message.status === 'sent' && (
                                                <img className={styles.sentIcon} src={sentIcon} alt="Sent" />
                                            )}
                                            {isSendMessage && message.status === 'delivered' && (
                                                <img className={styles.deliveredIcon} src={deliveredIcon} alt="Delivered" />
                                            )}
                                            {isSendMessage && message.status === 'read' && (
                                                <img className={styles.readIcon} src={readIcon} alt="Read" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })
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
                    {hasSelectedMessages ? (
                        <div className={styles.editMessagesContainer}>
                            <img src={closeIcon}
                                alt="Close"
                                onClick={setHasSelectedMessages}
                                className={styles.closeIcon}
                            />
                            <div className={styles.countMessage}>
                                {selectedMessages.length === 1 ? '1 Message selected' : `${selectedMessages.length} Messages selected`}
                            </div>
                            <img src={deleteIcon}
                                alt="Delete"
                                className={`${styles.deleteIcon} ${selectedMessages.length === 0 ? styles.disabled : ''}`}
                                onClick={handleDeleteMessages}
                            />
                        </div>
                    ) : (
                        <ChatInput
                            toggleEmojiPicker={toggleEmojiPicker}
                            selectedEmoji={selectedEmoji}
                            onSendMessage={addMessage}
                            emojiPickerVisible={emojiPickerVisible}
                            onHeightChange={handleInputHeightChange}
                            selectedUser={selectedUser}
                        />
                    )}
                </div>
            )}
        </div>
    ); 
}

export default ChatContainer;
