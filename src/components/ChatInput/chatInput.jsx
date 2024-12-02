import React, { useRef, useEffect, useState, useCallback } from 'react';
import styles from './chatInput.module.scss';
import sendMessage from '../../assets/img/send-message-icon.png';
import smileyIcon from '../../assets/img/smiley-icon.png';
import Cookies from 'js-cookie';
import BASE_URL from '../../config_base_url';
import { io } from 'socket.io-client';
const socket = io(BASE_URL);

const emojiMap = {
    ':-)': '🙂',
    ':)': '😊',
    ':D': '😄',
    ':>': '😆',
    ':(': '😞',
    '>:(': '😠',
    ':P': '😜',
    ':-P': '😜',
    ';)': '😉',
    ':-|': '😐',
    ':|': '😐',
    ':o': '😮',
    ':O': '😮',
    '8-)': '😎',
    '8)': '😎',
    'D:': '😧',
    ':((': '😢',
    ":'(": '😢',
    'xD': '😆',
    ':*)': '😘',
    ':*': '💋',
    '<3': '❤️',
    '</3': '💔',
};

function ChatInput({ toggleEmojiPicker, selectedEmoji, onSendMessage, emojiPickerVisible, onHeightChange, selectedUser }) {
    const textAreaRef = useRef(null);
    const [textAreaHeight, setTextAreaHeight] = useState(window.innerWidth <= 428 ? '35px' : '44px');
   /*  const [textValue, setTextValue] = useState(''); */
    const [textValues, setTextValues] = useState({});
    const [placeholder, setPlaceholder] = useState(getPlaceholder());
    const [typingStatus, setTypingStatus] = useState(false);

    const sendTypingStatus = useCallback((status) => {
        const userId = Cookies.get('userId');
        const friendId = selectedUser ? selectedUser.id : null;
    
        if (friendId) {
            socket.emit('typing', { status, userId, friendId });
        }
    }, [selectedUser]);
    
        
    function getPlaceholder() {
        const textArea = textAreaRef.current;
        if (textArea) {
            const textAreaWidth = textArea.clientWidth;
            return window.innerWidth < 450 || textAreaWidth <= 290
                ? 'Message...'
                : 'Type your message here...';
        }
        return window.innerWidth < 450 ? 'Message...' : 'Type your message here...';
    }

    const replaceShortcutsWithEmojis = (text) => {
        let newText = text;
        Object.keys(emojiMap).forEach(shortcut => {
            const emoji = emojiMap[shortcut];
            const escapedShortcut = shortcut.replace(/[.*+?^=!:${}()|[\]/\\]/g, "\\$&");
            const regex = new RegExp(escapedShortcut, 'g');
            newText = newText.replace(regex, emoji);
        });
        return newText;
    };

    useEffect(() => {
        if (textAreaRef.current && selectedUser?.id && window.innerWidth > 811) {
            textAreaRef.current.focus();
        }
    }, [selectedUser?.id]);

    // Passt die Höhe des Textfeldes automatisch auf den Inhalt an
    const adjustHeight = useCallback(() => {
        const textArea = textAreaRef.current;
    
        if (textArea) {
            textArea.style.height = 'auto';
    
            // Berechne die neue Höhe und maximale Höhe
            const scrollHeight = textArea.scrollHeight;
            const maxHeight = window.innerWidth <= 428 ? 370 : 548;
            const newHeight = Math.min(scrollHeight, maxHeight) + 'px';
    
            // Berechne die Differenz zur Initialhöhe
            const initialHeight = window.innerWidth <= 428 ? 35 : 44;
            const heightDifference = Math.min(scrollHeight, maxHeight) - initialHeight;
            onHeightChange(heightDifference);
    
            if (window.innerWidth <= 428) {
                if (textValues[selectedUser.id]?.trim() === '') {
                /* if (textValue.trim() === '') { */
                    textArea.style.height = '35px';
                    setTextAreaHeight('35px');
                } else {
                    textArea.style.height = newHeight;
                    setTextAreaHeight(newHeight);
                }
            } else {
                textArea.style.height = newHeight;
                setTextAreaHeight(newHeight);
            }
        }
    }, [textValues, onHeightChange, selectedUser?.id]);
    

    useEffect(() => {
        const handleResize = () => {
            window.requestAnimationFrame(() => {
                const textArea = textAreaRef.current;
                if (textArea) {
                    const textAreaWidth = textArea.clientWidth;
                    setPlaceholder(window.innerWidth < 450 || textAreaWidth <= 290 ? 'Message...' : 'Type your message here...');
                }
                adjustHeight();
            });
        };

        handleResize();

        const handleResizeObserver = () => {
            const textArea = textAreaRef.current;
            if (textArea) {
                const resizeObserver = new ResizeObserver(() => {
                    window.requestAnimationFrame(handleResize);
                });
                resizeObserver.observe(textArea);
                return () => {
                    resizeObserver.unobserve(textArea);
                };
            }
        };

        const cleanupResizeObserver = handleResizeObserver();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cleanupResizeObserver();
        };
    }, [adjustHeight]);

    // Zeigt ausgewählten Emoji im Textfeld an
    /* const insertEmoji = useCallback(() => {
        if (selectedEmoji) {
            setTextValue(prevValue => {
                const needsLeadingSpace = prevValue.trim().length === 0 || prevValue.trim().endsWith(' ');
                const hasTrailingSpace = prevValue.endsWith(' ');

                if (needsLeadingSpace || hasTrailingSpace) {
                    return prevValue + selectedEmoji.emoji + ' ';
                } else {
                    return prevValue + ' ' + selectedEmoji.emoji + ' ';
                }
            });

            if (textAreaRef.current && window.innerWidth > 811) {
                textAreaRef.current.focus();
            }
        } 
    }, [selectedEmoji]);   */
    const insertEmoji = useCallback(() => {
        if (selectedEmoji) {
            const inputId = textAreaRef.current.getAttribute('data-input-id');

            setTextValues(prevValues => {
                const currentText = prevValues[inputId] || '';
                const needsLeadingSpace = currentText.trim().length === 0 || currentText.trim().endsWith(' ');
                const hasTrailingSpace = currentText.endsWith(' ');
    
                // Füge Emoji zum Text des aktuellen Benutzers hinzu
                const newText = (needsLeadingSpace || hasTrailingSpace)
                    ? currentText + selectedEmoji.emoji + ' '
                    : currentText + ' ' + selectedEmoji.emoji + ' ';
    
                return {
                    ...prevValues,
                    [inputId]: newText,
                };
            });
    
            if (textAreaRef.current && window.innerWidth > 811) {
                textAreaRef.current.focus();
            }
        }
    }, [selectedEmoji]);    

    useEffect(() => {
        insertEmoji();
    }, [selectedEmoji, insertEmoji]);

    /* useEffect(() => {
        if (textValue.trim().length > 0) {
            setTypingStatus(true);
        } else {
            setTypingStatus(false);
        }
    }, [textValue]); */
    useEffect(() => {
        if (textValues[selectedUser.id]?.trim().length > 0) {
            setTypingStatus(true);
        } else {
            setTypingStatus(false);
        }
    }, [textValues, selectedUser.id]);

    useEffect(() => {
        sendTypingStatus(typingStatus); 
    }, [typingStatus, sendTypingStatus]);

    // Nachricht senden, überprüft ob Textfeld nicht leer ist
    const sendNewMessage = (e) => {
        e.preventDefault();
    
       /*  const trimmedTextValue = textValue.trim(); */
       const trimmedTextValue = textValues[selectedUser.id]?.trim();
       const inputId = textAreaRef.current.getAttribute('data-input-id');
    
        if (!trimmedTextValue) return;
    
        onSendMessage(trimmedTextValue);
        /* setTextValue('');   */
        setTextValues(prevValues => ({
            ...prevValues,
            [inputId]: '',
        }));
        sendTypingStatus(false)     

        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';

            if (window.innerWidth > 811) {
                textAreaRef.current.focus();
            }
        }
        hideEmojiPickerByText();
    };

    const hideEmojiPickerByText = () => {
        if (window.innerWidth <= 811 && emojiPickerVisible) {
            toggleEmojiPicker();

            setTimeout(() => {
                if (textAreaRef.current) {
                    textAreaRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                        inline: 'nearest'
                    });
                }
            }, 300);
        }
    };

    const buttonStyle = parseInt(textAreaHeight) > 67 ? '10px' : 'auto';
   /*  const isSendDisabled = textValue.trim() === ''; */
   const isSendDisabled = textValues[selectedUser.id]?.trim() === '';
    const sendIconStyle = {
        bottom: buttonStyle,
        opacity: isSendDisabled ? '0.5' : '1',
        cursor: isSendDisabled ? 'default' : 'pointer',
    };

    const handleTextChange = (e) => {
        const newText = replaceShortcutsWithEmojis(e.target.value);
        const inputId = e.target.getAttribute('data-input-id');
        /* setTextValue(newText); */
        setTextValues(prevValues => {
            return {
                ...prevValues,
                [inputId]: newText, 
            };
        });

        console.log(e.target.value);
        adjustHeight();
        sendTypingStatus(newText.trim().length > 0);
    };
    
    return (
        <div className={styles.inputContainer}>
            <textarea 
                data-input-id={selectedUser?.id}
                ref={textAreaRef}
                className={styles.chatInput}
                placeholder={placeholder}
                rows="1"
              /*   value={textValue} */
                value={textValues[selectedUser.id] || ''} 
                onChange={handleTextChange}
                onClick={hideEmojiPickerByText}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendNewMessage(e);
                    }
                }}
            />
            <div className={styles.inputButton}>
                <img 
                    className={styles.smileyIcon}
                    src={smileyIcon} 
                    alt="Smiley"
                    style={{ bottom: buttonStyle }}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleEmojiPicker();
                    }}
                />
                <img
                    className={styles.sendIcon}
                    src={sendMessage}
                    alt="Send"
                    style={sendIconStyle}
                    onClick={sendNewMessage}
                />
            </div>
        </div>
    );
}

export default ChatInput;
