import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from './friendProfile.module.scss';
import closeIcon from '../../assets/img/close-icon.png';
import defaultProfileImg from '../../assets/img/default-profile-img.png';
import mailIcon from '../../assets/img/mail-icon.png';
import mobileIcon from '../../assets/img/mobile-icon.png';
import Avatar from 'react-nice-avatar';
import { formatPhoneNumberIntl } from 'react-phone-number-input';
import axios from 'axios';
import BASE_URL from '../../config_base_url';
/* import { io } from 'socket.io-client';
const socket = io(BASE_URL); */

const FriendProfile = ({ selectedUser, isFriendProfileOpen, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [friendData, setFriendData] = useState(null);
    const modalRef = useRef(null);

    useEffect(() => {
        if (isFriendProfileOpen) {
            setIsVisible(true);

            const fetchFriendData = async () => {
                const friendId = selectedUser ? selectedUser.id : null;
                try {
                    const response = await axios.get(`${BASE_URL}/users/${friendId}`);
                    setFriendData(response.data);

                } catch (error) {
                    console.error('Error fetching friend data:', error);
                }
            };
            fetchFriendData();
        }
    }, [isFriendProfileOpen, selectedUser]);

    const handleClose = useCallback(() => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
    }, [onClose]);

    const handleClickOutside = useCallback((e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            handleClose();
        }
    }, [handleClose]);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

   const renderProfileImage = () => {
        const imageSrc = (friendData?.profile_img ? `${BASE_URL}/uploads/${friendData.profile_img}` : defaultProfileImg);
    
        if (friendData?.avatar_config) {
            return (
                <Avatar 
                    style={{ width: '100%', height: '100%' }} 
                    {...JSON.parse(friendData.avatar_config)} 
                />
            );
        }
    
        return (
            <img 
                src={imageSrc} 
                alt="Profile" 
                className={styles.profileImage} 
            />
        );
    };

    return (
        <div className={`${styles.overlay} ${isVisible ? styles.visible : ''}`}>
            <div className={`${styles.friendProfileContent} ${isVisible ? styles.visible : ''}`} ref={modalRef}>
                <div className={styles.profileHeader}>
                    <div className={styles.profileHeadline}>Friend Profile</div>
                    <img
                        src={closeIcon}
                        alt="Back"
                        className={styles.closeIcon}
                        onClick={handleClose}
                    />
                </div>
                <div className={styles.profileInfo}>
                    <div className={styles.profileImg}>{renderProfileImage()}</div>
                    <div className={styles.profileName}>{friendData?.username}</div>
                    <div className={styles.profileStatus}>{friendData?.online_status}</div>
                </div>
                <div className={styles.contactContainer}>
                    <div className={styles.contactInfo}>
                        <img src={mobileIcon} alt="Mobile Icon" />
                        <div>{formatPhoneNumberIntl(friendData?.phone_number)}</div>
                    </div>
                    <div className={styles.contactInfo}>
                        <img src={mailIcon} alt="Mail Icon" />
                        <div>{friendData?.email}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FriendProfile;