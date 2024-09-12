import React, { useLayoutEffect, useRef, useState, useEffect, useCallback } from 'react';
import styles from './notification.module.scss';

const Notification = ({ message, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const infoImgRef = useRef(null);
    const notificationRef = useRef(null);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
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


    if (!isVisible) return null;

    return (
        <div className={`${styles.overlay} ${isVisible ? styles.visible : ''}`}>
            <div className={`${styles.notification} ${isVisible ? styles.visible : ''}`} ref={notificationRef}>
                <div className={styles.infoImg} ref={infoImgRef}></div>
                <div className={styles.header} dangerouslySetInnerHTML={{ __html: message }} />
                <button onClick={onClose}>Close</button>
            </div>
        </div> 
    );
};

export default Notification;
