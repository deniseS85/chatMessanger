import React, { useRef, useEffect, useState, useCallback } from 'react';
import styles from './chatInput.module.scss';
import sendMessage from '../../assets/img/send-message-icon.png';
import smileyIcon from '../../assets/img/smiley-icon.png';

function ChatInput({ toggleEmojiPicker, selectedEmoji, onSendMessage }) {
    const textAreaRef = useRef(null);
    const [textAreaHeight, setTextAreaHeight] = useState('auto');
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
        if (textAreaRef.current) {
            textAreaRef.current.focus();
        }
    }, [textValue, selectedEmoji]);

    // Passt die Höhe des Textfeldes automatisch auf den Inhalt an
    const adjustHeight = useCallback(() => {
        const textArea = textAreaRef.current;
        if (textArea) {
            textArea.style.height = 'auto';
            const newHeight = textArea.scrollHeight + 'px';
            setTextAreaHeight(newHeight);
            textArea.style.height = newHeight;
        }
    }, []);

    useEffect(() => {
        const handleResize = () => {
            // Verwende requestAnimationFrame, um Änderungen am Layout zu minimieren
            window.requestAnimationFrame(() => {
                const textArea = textAreaRef.current;
                if (textArea) {
                    const textAreaWidth = textArea.clientWidth;
                    setPlaceholder(window.innerWidth < 450 || textAreaWidth <= 290 ? 'Message...' : 'Type your message here...');
                }
                adjustHeight();
            });
        };

        // Initialer Aufruf zur Setzung des richtigen Placeholders
        handleResize();

        // Event-Listener für die Fenstergröße hinzufügen
        window.addEventListener('resize', handleResize);

        // ResizeObserver für das Textarea hinzufügen
        const resizeObserver = new ResizeObserver(() => {
            window.requestAnimationFrame(handleResize);
        });
        if (textAreaRef.current) {
            resizeObserver.observe(textAreaRef.current);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            if (textAreaRef.current) {
                resizeObserver.unobserve(textAreaRef.current);
            }
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

            if (textAreaRef.current) {
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
        if (trimmedTextValue !== '') {
            onSendMessage(trimmedTextValue);
            setTextValue('');
            if (textAreaRef.current) {
                textAreaRef.current.style.height = 'auto';
                setTextAreaHeight('auto');
                textAreaRef.current.focus();
            }
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
                    onClick={toggleEmojiPicker}
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
