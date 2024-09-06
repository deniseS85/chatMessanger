import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from './myProfile.module.scss';
import backIcon from '../../assets/img/close-icon.png';
import mailIcon from '../../assets/img/mail-icon.png';
import mobileIcon from '../../assets/img/mobile-icon.png';
import defaultProfileImg from '../../assets/img/default-profile-img.png';
import axios from 'axios';
import Cookies from "js-cookie";
import Avatar from 'react-nice-avatar';


const MyProfile = ({ onClose, isProfileOpen }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [userData, setUserData] = useState(null);
    const modalRef = useRef(null);

    useEffect(() => {
        if (isProfileOpen) {
            setIsVisible(true);

            const fetchUserData = async () => {
                const userId = Cookies.get('userId');
                try {
                    const response = await axios.get(`http://localhost:8081/users/${userId}`);
                    setUserData(response.data);
                    console.log(response.data)
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
            fetchUserData();
        }
    }, [isProfileOpen]);

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
        if (userData?.avatar_config) {
            return <Avatar style={{ width: '100%', height: '100%' }} {...JSON.parse(userData.avatar_config)} />;
        } else if (userData?.profile_img) {
            return <img src={`http://localhost:8081/uploads/${userData.profile_img}`} alt="Profile" className={styles.profileImage} />;
        } else {
            return <img src={defaultProfileImg} alt="Default Profile" className={styles.defaultImage} />;
        }
    };

    return (
        <div className={`${styles.overlay} ${isVisible ? styles.visible : ''}`}>
            <div className={`${styles.myProfileContent} ${isVisible ? styles.visible : ''}`} ref={modalRef}>
                <div className={styles.profileHeader}>
                    <div className={styles.profileHeadline}>Profile</div>
                    <img 
                        src={backIcon}
                        alt='Back'
                        className={styles.closeIcon}
                        onClick={handleClose}
                    />
                </div>
                <div className={styles.profileInfo}>
                <div className={styles.profileImg}>
                    {renderProfileImage()}
                </div>
                <div className={styles.profileName}>{ userData?.username }</div>
                <div className={styles.profileStatus}>{userData?.online_status}</div>
                </div>
                <div className={styles.contactContainer}>
                    <div className={styles.contactInfo}>
                        <img src={mobileIcon} />
                        <div>{ userData?.phone_number }</div>
                    </div>
                    <div className={styles.contactInfo}>
                        <img src={mailIcon} />
                        <div>{ userData?.email }</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;