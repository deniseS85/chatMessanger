import React from 'react';
import EmojiPicker from 'emoji-picker-react';
import styles from './emojiPicker.module.scss';

function EmojiPickerComponent({ onEmojiClick }) {
    const handleEmojiClick = (event, emojiObject) => {
        onEmojiClick(event);
    };

    return (
        <div className={styles.emojiContainer}>
            <EmojiPicker
                onEmojiClick={handleEmojiClick}
            />
        </div>
    );
}

export default EmojiPickerComponent;
