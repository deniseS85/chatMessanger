import React, { useEffect, useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import styles from './emojiPicker.module.scss';

function EmojiPickerComponent({ onEmojiClick }) {
    const handleEmojiClick = (event, emojiObject) => {
        onEmojiClick(event);
    };

    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 811);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 811);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            const categoryNav = containerRef.current.querySelector('.epr-category-nav');
            if (categoryNav) {
                if (isSmallScreen) {
                    categoryNav.style.padding = '8px 5px 2px 5px';
                } else {
                    categoryNav.style.padding = ''; 
                }
            }
        }
    }, [isSmallScreen]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            const observer = new MutationObserver(() => {
                const emojis = container.querySelectorAll('.epr-emoji');
                emojis.forEach((emoji) => {
                    emoji.addEventListener('mouseover', () => {
                        emoji.style.backgroundColor = '#2BB8EE';
                    });
                    emoji.addEventListener('mouseout', () => {
                        emoji.style.backgroundColor = 'transparent';
                    });
                });
            });

            observer.observe(container, { childList: true, subtree: true });

            return () => {
                observer.disconnect();
            };
        }
    }, []);

    return (
        <div className={styles.emojiContainer} ref={containerRef}>
            <EmojiPicker
                className={styles.emojiComponent}
                previewConfig={{ showPreview: false }}
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
