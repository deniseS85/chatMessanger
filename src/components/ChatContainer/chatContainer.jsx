import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './chatContainer.module.scss';
import clsx from 'clsx';
import DatePicker from 'react-datepicker';
import { format } from "date-fns"; 
import ChatInput from '../ChatInput/chatInput';
import useChatDeletedListener from '../../hooks/useChatDeletedListener';
import welcomImage from '../../assets/img/welcome-image.png';
import sentIcon from '../../assets/img/sent-icon.png';
import deliveredIcon from '../../assets/img/delivered-icon.png';
import readIcon from '../../assets/img/read-icon.png';
import closeIcon from '../../assets/img/close-icon.png';
import deleteIcon from '../../assets/img/delete-messages.png';
import calenderIcon from '../../assets/img/calender.png';
import Cookies from 'js-cookie';
import axios from 'axios';
import BASE_URL from '../../config_base_url';
import { io } from 'socket.io-client';
const socket = io(BASE_URL);


function ChatContainer({ toggleEmojiPicker, emojiPickerVisible, selectedEmoji, selectedUser, setNotification, hasSelectedMessages, setHasSelectedMessages, setSelectedEmoji, isSearchOpen, messages, setMessages, showMessageFoundId, handleSearchMessagesStatus, setIsCalendarVisible, isCalendarVisible, deleteConfirmed, users, chatId, fetchMessages }) {
    const messagesContainerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [inputHeightDiff, setInputHeightDiff] = useState(0);
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [isInitalAnimation, setInitialAnimation] = useState(true);
    const [groupedMessages, setGroupedMessages] = useState({});
    const messageRefs = useRef({});
    const dateRefs = useRef({});
    const [messageHighlight, setMessageHighlight] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [displayDate, setDisplayDate] = useState(new Date());
  
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
    }, [selectedUser, setMessages, fetchMessages]);

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
            const response = await axios.post(`${BASE_URL}/sendMessage`, {
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
    }, [hasSelectedMessages, selectedMessages.length]); 

    const handleSelectMessage = useCallback((messageId, isChecked) => {
        setSelectedMessages(prevState => {
            if (isChecked) {
                if (!prevState.includes(messageId)) {
                    return [...prevState, messageId];
                }
                return prevState;
            } else {
                return prevState.filter(id => id !== messageId);
            }
        });
    }, []);

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
    }, [groupedMessages, createDustEffect]);
    
    
    const handleDeleteMessages = async () => {
        if (selectedMessages.length === 0) return;
        const userId = Cookies.get('userId');
        const friendId = selectedUser ? selectedUser.id : null;
    
        try {
            const response = await axios.post(`${BASE_URL}/deleteMessages`, {
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

    useEffect(() => {
        const element = messageRefs.current[showMessageFoundId];

        if (showMessageFoundId && element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            setMessageHighlight(showMessageFoundId);

            setTimeout(() => {
                setMessageHighlight(null);
            }, 2100);
        }
    }, [showMessageFoundId]); 

    const toggleCalendar = () => {
        setIsCalendarVisible((prevState) => !prevState);
    };

    useEffect(() => {
        if (isCalendarVisible) {
            setDisplayDate(new Date());
        }
    }, [isCalendarVisible]);

    const handleDateChange = (date) => {
        setSelectedDate(date); 
        setIsCalendarVisible(false);
        scrollToDate(date);
    };
    
    useEffect(() => {
        if (selectedDate) {
            scrollToDate(selectedDate);
        }
    }, [selectedDate]);

    const activeDates = Object.keys(groupedMessages).map((date) => {
        const [day, month, year] = date.split('.');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    });

    const scrollToDate = (targetDate) => {
        const formattedDate = format(targetDate, "d.M.yyyy");
        const targetElement = dateRefs.current[formattedDate];
        const parentElement = targetElement.parentElement;
        const firstMessageElement = parentElement.children[1];
        
        if (targetElement && firstMessageElement) {
            handleSearchMessagesStatus(false);
            targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
            const firstMessageId = parseInt(firstMessageElement.dataset.messageId, 10);
            setMessageHighlight(firstMessageId);

            setTimeout(() => {
                setMessageHighlight(null);
            }, 2100);
        }
    };

    const handleMessageClick = useCallback((messageId) => {
        if (hasSelectedMessages) {
            handleSelectMessage(messageId, !selectedMessages.includes(messageId));
        }
    }, [hasSelectedMessages, selectedMessages, handleSelectMessage]);

    const sortedMessages = useMemo(() => {
        if (!groupedMessages) return [];
        return Object.entries(groupedMessages).map(([date, messagesForDate]) => {
            return {
                date,
                messages: messagesForDate.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
            };
        });
    }, [groupedMessages]);
    
    useEffect(() => {
        if (deleteConfirmed) {
            deleteChatConfirmation();
        }
    }, [deleteConfirmed]);
    

    const deleteChatConfirmation = async () => {
        const friendId = selectedUser ? selectedUser.id : null; 
        const userId = Cookies.get('userId');

        if (chatId) {
            try {
                const response = await axios.post(`${BASE_URL}/deleteChat`, { chatId });
                
                if (response.data.success) {
                    socket.emit('deleteChat', { chatId, friendId, userId, status: 'deleted' }); 
                    fetchMessages();
                }
            } catch (error) {
                    console.error('Error deleting chat:', error);
            } 
        }
    };

    useChatDeletedListener(socket, chatId, users, setNotification, fetchMessages);

    useEffect(() => {
        if (chatId) {
            const savedNotification = sessionStorage.getItem('pendingChatDeletedNotification');
            if (savedNotification) {
                const notificationData = JSON.parse(savedNotification);
    
                if (notificationData.chatId === chatId) {
                    setNotification({
                        message: notificationData.message,
                        type: notificationData.type,
                        isHtml: notificationData.isHtml
                    });
                    sessionStorage.removeItem('pendingChatDeletedNotification');
                }
            }
        }
    }, [chatId]);  

    return (
        <div className={`${styles.chatContainer} ${!emojiPickerVisible ? styles['emoji-hidden'] : ''}`} >
            <div ref={messagesContainerRef} className={styles.messageContainer} data-chat-id={selectedUser ? chatId : null}>
                {selectedUser ? (
                    sortedMessages.map(({ date, messages }) => (
                        <div key={date} className={styles.messageByDate}>
                            <div className={styles.dateSeparator} data-date={date} ref={(el) => { dateRefs.current[date] = el; }}>
                                {date}
                            </div>
                            {messages.map((message) => {
                                const time = formatTime(message.timestamp);
                                const isSendMessage = message.type === 'send';

                                return (
                                    <div key={message.message_id} 
                                        data-message-id={message.message_id}
                                        className={`${styles.messageWrapper} 
                                            ${isSendMessage ? styles.send : styles.receive}
                                            ${messageHighlight === message.message_id ? styles.highlight : ''}
                                            ${hasSelectedMessages && isSendMessage ? styles.hoverMessage : ''}`}
                                            onClick={() => handleMessageClick(message.message_id)}
                                        >
                                        <div
                                            data-message-id={message.message_id}
                                            ref={(el) => { messageRefs.current[message.message_id] = el; }}
                                            className={clsx(
                                                styles.message,
                                                styles[message.type],
                                                hasSelectedMessages && isSendMessage && styles.selectMessageOption,
                                                selectedMessages.includes(message.message_id) && isSendMessage && styles.selectedContainer,
                                                isSendMessage && styles.sendPadding,
                                                selectedMessages.includes(message.message_id) && styles.selected,
                                                !hasSelectedMessages && !isInitalAnimation && styles.hideSelectMessageOption,
                                                !hasSelectedMessages && isInitalAnimation && styles.messageEnter,
                                                hasSelectedMessages && isSendMessage && styles.hoverMessage
                                            )}
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
                                    </div>
                                );
                            })}
                        </div>
                    ))
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
                    ) : isSearchOpen ? (
                        <div className={styles.searchMessagesContainer}>
                            <img src={calenderIcon}
                                alt="Calender"
                                className={styles.calenderIcon}
                                onClick={toggleCalendar}
                            />
                            <div>Select a date</div>
                            <div className={`${styles.datePickerWrapper} ${isCalendarVisible ? styles.visible : ''}`}>
                                <DatePicker
                                    selected={displayDate}
                                    onChange={handleDateChange}
                                    inline
                                    dayClassName={(date) => {
                                        const formattedDate = format(date, "yyyy-MM-dd");
                                        return activeDates.includes(formattedDate) ? `day-${formattedDate}` : 'react-datepicker__day--disabled';
                                    }}
                                    filterDate={(date) => {
                                        const formattedDate = format(date, "yyyy-MM-dd");
                                        return activeDates.includes(formattedDate);
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <ChatInput
                            toggleEmojiPicker={toggleEmojiPicker}
                            selectedEmoji={selectedEmoji}
                            onSendMessage={addMessage}
                            emojiPickerVisible={emojiPickerVisible}
                            onHeightChange={handleInputHeightChange}
                            selectedUser={selectedUser}
                            setSelectedEmoji={setSelectedEmoji}
                        />
                    )}
                </div>
            )}
        </div>
    ); 
}

export default ChatContainer;
