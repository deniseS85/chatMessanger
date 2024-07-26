import React, { useRef, useEffect, useState, useCallback } from 'react';
import styles from './chatInput.module.scss';
import sendMessage from '../../assets/img/send-message-icon.png';
import smileyIcon from '../../assets/img/smiley-icon.png';

function ChatInput({ toggleEmojiPicker, selectedEmoji, onSendMessage }) {
    const textAreaRef = useRef(null);
    const [textAreaHeight, setTextAreaHeight] = useState('auto');
    const [textValue, setTextValue] = useState('');
    const [placeholder, setPlaceholder] = useState(window.innerWidth < 450 ? 'Message...' : 'Type your message here...');

    // fokussiert das Inputfeld am Anfang und beim Auswählen eines Emojis
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.focus();
        }
    }, [textValue, selectedEmoji]);

    // passt die Höhe des Textfeldes automatisch auf den Inhalt an (useCallback verhindert immer neue Berechnungen)
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
        const textArea = textAreaRef.current;

        // ändert Placeholdertext nach Bildschirmbreite
        const handleResize = () => {
            setPlaceholder(window.innerWidth < 450 ? 'Message...' : 'Type your message here...');
            if (textValue === '') {
                textArea.style.height = '44px';
            } else {
                adjustHeight();
            }
        };

        // aktualisiert den Textvalue und passt Höhe des Textfeldes an
        const handleInput = (event) => {
            setTextValue(event.target.value);
            if (event.target.value === '') {
                textArea.style.height = '44px';
            } else {
                adjustHeight();
            }
        };

        if (textArea) {
            textArea.addEventListener('input', handleInput);
        }
        window.addEventListener('resize', handleResize);
        adjustHeight();

        return () => {
            if (textArea) {
                textArea.removeEventListener('input', handleInput);
            }
            window.removeEventListener('resize', handleResize);
        };
    }, [adjustHeight]);

    // zeigt ausgewählen Emoji im Textfelt, setzt Emoji mit Leerzeichen (useCallback, Funktion wird nur ausgeführt, wenn selectEmoji verwendet wird)
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

    // Emojis auswählen
    useEffect(() => {
        insertEmoji();
    }, [selectedEmoji, insertEmoji]);

    // Nachricht senden, überprüft ob Textfeld nicht leer ist, danach wird Textfeld zurückgesetzt
    const sendNewMessage = (e) => {
        e.preventDefault();

        const trimmedTextValue = textValue.trim();
        if (trimmedTextValue !== '') {
            onSendMessage(trimmedTextValue);
            setTextValue('');
            textAreaRef.current.style.height = 'auto';
            setTextAreaHeight('auto');
            if (textAreaRef.current) {
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
                onChange={(e) => setTextValue(e.target.value)}
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
                    style={ sendIconStyle }
                    onClick={sendNewMessage}
                />
            </div>
        </div>
    );
}

export default ChatInput;
