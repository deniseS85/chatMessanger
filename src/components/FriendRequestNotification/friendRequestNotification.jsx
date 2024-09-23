import React, { useLayoutEffect, useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import styles from './friendRequestNotification.module.scss';
import Avatar from 'react-nice-avatar';
import defaultImage from '../../assets/img/default-profile-img.png';
import closeIcon from '../../assets/img/close-icon.png';
import { io } from 'socket.io-client';
const socket = io('http://localhost:8081')

const FriendRequestNotification = ({ request, onClose, checkForRequests }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [userInfo, setUserInfo] = useState({ username: '', profile_img: '', avatar_config: '' });
    const infoImgRef = useRef(null);
    const notificationRef = useRef(null);

    useEffect(() => {
        if (request) {
            setIsVisible(true);

            axios.get(`http://localhost:8081/users/${request.UserId1}`)
                .then(response => {
                    const { username, profile_img, avatar_config } = response.data;

                    setUserInfo({
                        username: username || '',
                        profile_img: profile_img || '',
                        avatar_config: avatar_config || ''
                    });
                })
                .catch(error => {
                    console.error('Fehler beim Abrufen der Benutzerinformationen:', error);
                });
        }
    }, [request]);

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

    const handleClose = useCallback(() => {
        axios.post('http://localhost:8081/check-friend-request/update-request-status', { requestId: request.FriendID })
            .then(response => {
                setIsVisible(false);
                setTimeout(() => {
                    onClose();
                }, 300)
               
            })
            .catch(error => {
                console.error('Fehler beim Aktualisieren des Anfrage-Status:', error);
            });
    }, [request.FriendID, onClose]); 
    
    const handleClickOutside = useCallback((e) => {
        if (notificationRef.current && !notificationRef.current.contains(e.target)) {
            handleClose();
        }
    }, [handleClose]);
    
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    const handleAccept = () => {
        axios.post('http://localhost:8081/check-friend-request/accept', { requestId: request.FriendID })
            .then(response => {
                if (typeof checkForRequests === 'function') {
                    checkForRequests();
                }

                socket.emit('respondToFriendRequest', { senderId: request.UserId1, status: 'accepted', userInfo });
                onClose();
            })
            .catch(error => {
                console.error('Fehler beim Akzeptieren der Freundschaftsanfrage:', error);
            });
    };

    const handleReject = () => {
        axios.post('http://localhost:8081/check-friend-request/reject', { requestId: request.FriendID })
            .then(response => {
                if (typeof checkForRequests === 'function') {
                    checkForRequests();
                }

                socket.emit('respondToFriendRequest', { senderId: request.UserId1, status: 'rejected', userInfo });
                onClose();
            })
            .catch(error => {
                console.error('Fehler beim Ablehnen der Freundschaftsanfrage:', error);
            });
    };

    return (
        <div className={`${styles.overlay} ${isVisible ? styles.visible : ''}`}>
            <div className={`${styles.notification} ${isVisible ? styles.visible : ''}`} ref={notificationRef}>
                <div className={styles.infoImg} ref={infoImgRef}>
                    {userInfo.profile_img ? (
                        <img 
                            className={styles.profileImage} 
                            src={`http://localhost:8081/uploads/${userInfo.profile_img}`} 
                            alt={`${userInfo.username}'s profile`} 
                        />
                    ) : userInfo.avatar_config ? (
                        <Avatar 
                            className={styles.profileImage} 
                            {...JSON.parse(userInfo.avatar_config)}
                            alt={`${userInfo.username}'s profile`} 
                        />
                    ) : (
                        <img 
                            src={defaultImage} 
                            className={styles.profileImage}
                            alt={`${userInfo.username}'s profile`}
                        />
                    )}
                </div>
                <div className={styles.header}>
                    <span className={styles.username}>{userInfo.username}</span>wants to be friends with you! 😊
                </div>
                <div className={styles.actions}>
                    <button onClick={handleAccept}>Accept</button>
                    <button onClick={handleReject}>Reject</button>
                </div>
                <img 
                    className={styles.closeIcon} 
                    src={closeIcon} 
                    alt="Close"
                    onClick={handleClose} 
                />
            </div>
        </div>
      
    );
};

export default FriendRequestNotification;
