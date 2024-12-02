import React from 'react';
import styles from './notificationsContainer.module.scss'; 
import Avatar from 'react-nice-avatar';
import defaultProfilePic from '../../assets/img/default-profile-img.png';
import BASE_URL from '../../config_base_url';

const NotificationsContainer = ({ isOpen, notificationRef, pendingRequests, onNotificationClick }) => {
    return (
        <div 
            ref={notificationRef}
            className={`${styles.notificationsContainer} ${isOpen ? styles.open : ''}`}
        >
            <div className={styles.notificationsContent} >
                <div className={styles.formHeadline}>Notifications</div>

                {pendingRequests.length > 0 ? (
                    pendingRequests.map(request => (
                        <div 
                            key={request.FriendID} 
                            className={styles.notificationItem}
                            onClick={() => onNotificationClick(request)}
                        >
                            {request.profile_img ? (
                                <img 
                                    src={`${BASE_URL}/uploads/${request.profile_img}`} 
                                    alt={`${request.username}'s profile`} 
                                    className={styles.profilePic}
                                />
                            ) : request.avatar_config ? (
                                <Avatar 
                                    className={styles.profilePic} 
                                    {...JSON.parse(request.avatar_config)}
                                    alt={`${request.username}'s profile`} 
                                />
                            ) : (
                                <img 
                                    src={defaultProfilePic} 
                                    alt={`${request.username}'s profile`} 
                                    className={styles.profilePic}
                                />
                            )}
                            <div><span className={styles.username}>{request.username}</span> sent you a friend request</div>
                        </div>
                    ))
                ) : (
                    <div className={styles.noNotifications}>No new notifications</div>
                )}
            </div>
        </div>
    );
};

export default NotificationsContainer;
