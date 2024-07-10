import React, { useRef, useEffect, useState } from 'react';
import styles from './chatInput.module.scss';
import sendMessage from '../../assets/img/send-message-icon.png';
import smileyIcon from '../../assets/img/smiley-icon.png';

function ChatInput({ toggleEmojiPicker, selectedEmoji }) {
    const textAreaRef = useRef(null);
    const [textAreaHeight, setTextAreaHeight] = useState('auto');
    const [textValue, setTextValue] = useState('');

    useEffect(() => {
        const textArea = textAreaRef.current;

        const adjustHeight = () => {
            textArea.style.height = 'auto';
            const newHeight = textArea.scrollHeight + 'px';
            setTextAreaHeight(newHeight);
            textArea.style.height = newHeight;
        };

        const handleResize = () => {
            adjustHeight();
        };

        textArea.addEventListener('input', () => {
            adjustHeight();
            setTextValue(textArea.value);
        });
        adjustHeight();
        window.addEventListener('resize', handleResize);

        return () => {
            textArea.removeEventListener('input', adjustHeight);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        insertEmoji();
    }, [selectedEmoji]);

    const insertEmoji = () => {
        if (selectedEmoji) {
            if (selectedEmoji) {
                const needsLeadingSpace = textValue.trim().length === 0 || textValue.trim().endsWith(' ');
                const hasTrailingSpace = textValue.endsWith(' ');

                setTextValue(prevValue => {
                    if (needsLeadingSpace) {
                        return prevValue + selectedEmoji.emoji + ' ';
                    } else if (hasTrailingSpace) {
                        return prevValue + selectedEmoji.emoji + ' ';
                    } else {
                        return prevValue + ' ' + selectedEmoji.emoji + ' ';
                    }
                });
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
                placeholder="Type your message here..."
                rows="1"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
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
                />
            </div>
        </div>
    );
}

export default ChatInput;
