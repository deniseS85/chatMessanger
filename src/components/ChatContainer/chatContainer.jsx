import React, { useEffect, useRef, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styles from './chatContainer.module.scss';
import ChatInput from '../ChatInput/chatInput';

function ChatContainer({ toggleEmojiPicker, emojiPickerVisible, selectedEmoji }) {
    const messagesContainerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([]);

    let messageCounter = useRef(0);

    /* const addMessage = (message) => {
        const newMessage = { text: message, type: 'send', id: Date.now() };
        setMessages(prevMessages => [newMessage, ...prevMessages]);
    }; */

    const addMessage = (messageText, type = 'send') => {
        const newMessage = { 
            text: messageText, 
            type, 
            id: `${Date.now()}-${messageCounter.current++}`
        };
        setMessages(prevMessages => [newMessage, ...prevMessages]);
    };

    useEffect(() => {
        scrollToBottom();
        adjustTriangleHeight();
    }, [messages]);

    useEffect(() => {
        const predefinedMessages = [
            { text: "Hallo, wie geht's?", type: 'receive' },
            { text: "Mir geht's gut, danke! Wie bei dir?", type: 'send' },
            { text: "Ich bin auch gut. Hast du die neuen Updates gesehen?", type: 'receive' },
            { text: "Ja, die neuen Features sind echt cool!", type: 'send' },
            { text: "Das dachte ich auch. Besonders das neue Design.", type: 'receive' },
            { text: "Absolut! Es sieht viel moderner aus.", type: 'send' },
            { text: "Hast du schon den neuen Report gelesen?", type: 'receive' },
            { text: "Noch nicht. Werde ich mir später anschauen.", type: 'send' },
            { text: "Sollte wirklich ein interessantes Thema sein.", type: 'receive' },
            { text: "Auf jeden Fall. Vielleicht können wir später darüber sprechen.", type: 'send' },
            { text: "Klingt nach einem Plan!", type: 'receive' },
            { text: "Ich freue mich darauf. Bis später!", type: 'send' },
            { text: "Bis später!", type: 'receive' },
            { text: "Hast du am Wochenende etwas vor?", type: 'send' },
            { text: "Noch nichts Konkretes. Vielleicht entspannen?", type: 'receive' },
            { text: "Das klingt gut. Ich werde wahrscheinlich auch nichts machen.", type: 'send' },
            { text: "Manchmal ist ein entspannendes Wochenende genau das Richtige.", type: 'receive' },
            { text: "Da stimme ich dir zu. Einfach mal abschalten.", type: 'send' },
            { text: "Genau! Ich hoffe, du hast ein schönes Wochenende. Und du hast viel erlebt und gemacht. Wie war das Wetter? Und hast du Freunde kennengelernt? Ich freue mich wieder von dir zu hören.", type: 'receive' },
            { text: "Danke, dir auch!", type: 'send' },
        ];

        // Füge die vordefinierten Nachrichten hinzu
        predefinedMessages.forEach(message => addMessage(message.text, message.type));
    }, []);

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
                    {messages.map((message, index) => {
                        const nodeRef = React.createRef();
                        const isFirstMessage = index === messages.length - 1;
            
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
                                <p ref={nodeRef} className={`${styles.message} ${styles[message.type]} ${isFirstMessage ? styles.firstMessage : ''}`}>
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
