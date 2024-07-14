import React from 'react';
import EmojiPicker from 'emoji-picker-react';
import styles from './emojiPicker.module.scss';

function EmojiPickerComponent({ onEmojiClick }) {
    const handleEmojiClick = (event, emojiObject) => {
        console.log(emojiObject)
        onEmojiClick(event);
    };

    return (
        <div className={styles.emojiContainer}>
            <EmojiPicker
                className={styles.emojiComponent} 
                previewConfig={{ showPreview : false }} 
                emojiStyle='apple' 
                suggestedEmojisMode='recent' 
                searchDisabled
                lazyLoadEmojis='true'
                onEmojiClick={handleEmojiClick}
            />
        </div>
    );
}

export default EmojiPickerComponent;
