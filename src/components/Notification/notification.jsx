import React, { useLayoutEffect, useRef, useState, useEffect, useCallback } from 'react';
import styles from './notification.module.scss';

const Notification = ({ message, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const infoImgRef = useRef(null);
    const notificationRef = useRef(null);

    useEffect(() => {
        setIsVisible(!!message);
    }, [message]);

    useLayoutEffect(() => {
        if (isVisible) {
            const updateTopPosition = () => {
                if (infoImgRef.current) {
                    const height = infoImgRef.current.offsetHeight;
                    infoImgRef.current.style.setProperty('--dynamic-offset', `${height}px`);
                    infoImgRef.current.style.top = `calc(-${height / 2}px)`;
                }
            };

            updateTopPosition();
            window.addEventListener('resize', updateTopPosition);

            return () => {
                window.removeEventListener('resize', updateTopPosition);
            };
        }
    }, [isVisible]);

    const handleClickOutside = useCallback((e) => {
        if (notificationRef.current && !notificationRef.current.contains(e.target)) {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    const iconClass = message.type === 'success' ? styles.success : styles.error;

    return (
        <div className={`${styles.overlay} ${isVisible ? styles.visible : ''}`}>
            <div className={`${styles.notification} ${isVisible ? styles.visible : ''}`} ref={notificationRef}>
                <div className={`${styles.infoImg} ${iconClass}`} ref={infoImgRef}></div>
                {message.isHtml ? (
                    <div className={styles.header} dangerouslySetInnerHTML={{ __html: message.message }} />
                ) : (
                    <div className={styles.header}>{message.message}</div>
                )}
                <button onClick={onClose}>Close</button>
            </div>
        </div> 
    );
};

export default Notification;
