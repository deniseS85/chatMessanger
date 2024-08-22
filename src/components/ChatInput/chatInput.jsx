import React, { useRef, useEffect, useState, useCallback } from 'react';
import styles from './chatInput.module.scss';
import sendMessage from '../../assets/img/send-message-icon.png';
import smileyIcon from '../../assets/img/smiley-icon.png';

function ChatInput({ toggleEmojiPicker, selectedEmoji, onSendMessage, emojiPickerVisible, onHeightChange }) {
    const textAreaRef = useRef(null);
    const [textAreaHeight, setTextAreaHeight] = useState(window.innerWidth <= 428 ? '35px' : '44px');
    const [textValue, setTextValue] = useState('');
    const [placeholder, setPlaceholder] = useState(getPlaceholder());

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

    // Fokussiert das Inputfeld am Anfang und beim Auswählen eines Emojis
    useEffect(() => {
        if (textAreaRef.current && window.innerWidth > 811) {
            textAreaRef.current.focus();
        }
    }, [textValue, selectedEmoji]);

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
                if (textValue.trim() === '') {
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
    }, [textValue, onHeightChange]);
    

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
    }, [adjustHeight, textValue]);

    // Zeigt ausgewählten Emoji im Textfeld an
    const insertEmoji = useCallback(() => {
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
    }, [selectedEmoji]);

    useEffect(() => {
        insertEmoji();
    }, [selectedEmoji, insertEmoji]);

    // Nachricht senden, überprüft ob Textfeld nicht leer ist
    const sendNewMessage = (e) => {
        e.preventDefault();
    
        const trimmedTextValue = textValue.trim();
    
        if (!trimmedTextValue) return;
    
        onSendMessage(trimmedTextValue);
        setTextValue('');
    
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
    const isSendDisabled = textValue.trim() === '';
    const sendIconStyle = {
        bottom: buttonStyle,
        opacity: isSendDisabled ? '0.5' : '1',
        cursor: isSendDisabled ? 'default' : 'pointer',
    };

    return (
        <div className={styles.inputContainer}>
            <textarea 
                ref={textAreaRef}
                className={styles.chatInput}
                placeholder={placeholder}
                rows="1"
                value={textValue}
                onChange={(e) => {
                    setTextValue(e.target.value);
                    adjustHeight();
                }}
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
