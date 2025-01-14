import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from './myProfile.module.scss';
import closeIcon from '../../assets/img/close-icon.png';
import backIcon from '../../assets/img/back-icon.png';
import mailIcon from '../../assets/img/mail-icon.png';
import mobileIcon from '../../assets/img/mobile-icon.png';
import defaultProfileImg from '../../assets/img/default-profile-img.png';
import editIcon from '../../assets/img/edit-icon.png';
import saveEditUserIcon from '../../assets/img/save-edit-user-icon.png';
import cancelEditUserIcon from '../../assets/img/cancel-edit-user-icon.png';
import uploadImage from '../../assets/img/upload-image-icon.png';
import axios from 'axios';
import Cookies from "js-cookie";
import Avatar from 'react-nice-avatar';
import AvatarSelector from '../AvatarSelector/avatarSelector'; 
import { formatPhoneNumberIntl } from 'react-phone-number-input';
import BASE_URL from '../../config_base_url';
import { io } from 'socket.io-client';
const socket = io(BASE_URL);

const MyProfile = ({ onClose, isProfileOpen, updateUserData }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [userData, setUserData] = useState(null);
    const modalRef = useRef(null);
    const dropdownRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone_number: '',
        profile_img: null,
        profile_img_preview: '',
        selectedAvatar: null,
    });
    const fileInputRef = useRef(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAvatarSelectorVisible, setIsAvatarSelectorVisible] = useState(false);

    useEffect(() => {
        if (isProfileOpen) {
            setIsVisible(true);

            const fetchUserData = async () => {
                const userId = Cookies.get('userId');
                try {
                    const response = await axios.get(`${BASE_URL}/users/${userId}`);
                    setUserData(response.data);
                    setFormData({
                        username: response.data.username,
                        email: response.data.email,
                        phone_number: response.data.phone_number,
                        profile_img: response.data.profile_img,
                        profile_img_preview: response.data.profile_img ? `${BASE_URL}/uploads/${response.data.profile_img}` : '',
                        selectedAvatar: response.data.avatar_config ? JSON.parse(response.data.avatar_config) : null,
                    });
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
            fetchUserData();
        }
    }, [isProfileOpen]);

    const handleEdit = () => {
        setIsEditing(true);
    }

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormData({
            username: userData?.username || '',
            email: userData?.email || '',
            phone_number: userData?.phone_number || '',
            profile_img: userData?.profile_img || null,
            profile_img_preview: userData?.profile_img ? `${BASE_URL}/uploads/${userData.profile_img}` : '',
            selectedAvatar: userData?.avatar_config ? JSON.parse(userData.avatar_config) : null,
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleImageClick = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleFileInputClick = () => {
        fileInputRef.current.click();
        setIsDropdownOpen(false);
    };

    const handleAvatarSelect = (avatarConfig) => {
        setFormData(prevData => ({
            ...prevData,
            selectedAvatar: avatarConfig,
            profile_img: null,
            profile_img_preview: '',
        }));
        setIsAvatarSelectorVisible(false);
    };

    const handleAvatarClick = () => {
        setIsAvatarSelectorVisible(!isAvatarSelectorVisible);
        setIsDropdownOpen(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        
        if (file) {
            setFormData((prev) => ({
                ...prev,
                profile_img: file,
                profile_img_preview: URL.createObjectURL(file),
                selectedAvatar: null,
            }));
        }
    };

    useEffect(() => {
        return () => {
            if (formData.profile_img_preview) {
                URL.revokeObjectURL(formData.profile_img_preview);
            }
        };
    }, [formData.profile_img_preview]);

    const handleClearImage = () => {
        setFormData(prevData => ({
            ...prevData,
            profile_img: null,
            profile_img_preview: defaultProfileImg,
            selectedAvatar: null,
        }));
        setIsDropdownOpen(false);
    };
    
    const handleSave = async () => {
        const userId = Cookies.get('userId');
        const formDataToSend = new FormData();
        formDataToSend.append('username', formData.username);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('phone_number', formData.phone_number);

        if (formData.profile_img === null && formData.profile_img_preview === defaultProfileImg) {
            formDataToSend.append('deleteProfileImg', 'true');
        }

        if (formData.profile_img) {
            formDataToSend.append('profile_img', formData.profile_img);
        }
    
        if (formData.selectedAvatar) {
            formDataToSend.append('avatarConfig', JSON.stringify(formData.selectedAvatar));
        }
    
        try {
            await axios.put(`${BASE_URL}/edit-user/${userId}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            setIsEditing(false);
            const response = await axios.get(`${BASE_URL}/users/${userId}`);
            const userData = response.data;

            if (userData.profile_img && !userData.profilePic) {
                userData.profilePic = userData.profile_img;
            }

            setUserData(userData);
            updateUserData(userData);
            socket.emit('profileUpdated', { updatedData: userData });
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    };

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

        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setIsDropdownOpen(false);
        }
    }, [handleClose]);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    const renderProfileImage = () => {
        const imageSrc = formData.profile_img_preview || (userData?.profile_img ? `${BASE_URL}/uploads/${userData.profile_img}` : defaultProfileImg);
    
        return isEditing ? (
            <>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
                <div className={styles.profileImageEditContainer} onClick={handleImageClick}>
                    {formData.selectedAvatar ? (
                        <Avatar className={styles.profileImageEdit} {...formData.selectedAvatar} />
                    ) : (
                        <img src={imageSrc} alt="Profile" className={styles.profileImageEdit} />
                    )}
                    <img src={uploadImage} alt="Upload" className={styles.uploadImage} />
                </div>
        
                <div className={`${styles.dropdownMenu} ${isDropdownOpen ? styles.visible : ''}`} ref={dropdownRef}>
                    <div onClick={handleFileInputClick} className={styles.dropdownItem}>Upload Image</div>
                    <div onClick={handleAvatarClick} className={styles.dropdownItem}>Select Avatar</div>
                    <div onClick={handleClearImage} className={styles.dropdownItem}>Delete Picture</div>
                </div>
             
                <div className={`${styles.avatarSelectorContainer} ${isAvatarSelectorVisible ? styles.visible : ''}`}>
                        <img 
                        src={backIcon}
                        alt='Back'
                        className={styles.backIcon}
                        onClick={() => setIsAvatarSelectorVisible(false)}
                    />
                    <AvatarSelector onSelect={handleAvatarSelect} />
                </div>
            
            </>
        ) : (
            <>
                {userData?.avatar_config ? (
                    <Avatar style={{ width: '100%', height: '100%' }} {...JSON.parse(userData.avatar_config)} />
                ) : (
                    <img src={imageSrc} alt="Profile" className={styles.profileImage} />
                )}
            </>
        );
    };
    
    return (
        <div className={`${styles.overlay} ${isVisible ? styles.visible : ''}`}>
            <div className={`${styles.myProfileContent} ${isVisible ? styles.visible : ''}`} ref={modalRef}>
                <div className={styles.profileHeader}>
                    <div className={styles.profileHeadline}>Profile</div>
                    {isEditing ? (
                        <img
                            src={saveEditUserIcon}
                            alt="Save"
                            className={styles.editIcon}
                            onClick={handleSave}
                        />
                    ) : (
                        <img
                            src={editIcon}
                            alt="Edit"
                            className={styles.editIcon}
                            onClick={handleEdit}
                        />
                    )}
                    {isEditing ? (
                        <img
                            src={cancelEditUserIcon}
                            alt="Cancel"
                            className={styles.closeIcon}
                            onClick={handleCancelEdit}
                        />
                    ) : (
                        <img
                            src={closeIcon}
                            alt="Back"
                            className={styles.closeIcon}
                            onClick={handleClose}
                        />
                    )}
                    
                </div>
                <div className={styles.profileInfo}>
                    <div className={styles.profileImg}>
                        {renderProfileImage()}
                    </div>
                    {isEditing ? (
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className={styles.usernameInput}
                        />
                    ) : (
                        <div className={styles.profileName}>{userData?.username}</div>
                    )}
                    <div className={styles.profileStatus}>{userData?.online_status}</div>
                </div>
                <div className={styles.contactContainer}>
                    <div className={styles.contactInfo}>
                        <img src={mobileIcon} alt="Mobile Icon" />
                        {isEditing ? (
                            <input
                                type="text"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleInputChange}
                            />
                        ) : (
                            <div>{formatPhoneNumberIntl(userData?.phone_number)}</div>
                        )}
                    </div>
                    <div className={styles.contactInfo}>
                        <img src={mailIcon} alt="Mail Icon" />
                        {isEditing ? (
                            <input
                                type="text"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        ) : (
                            <div>{userData?.email}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;