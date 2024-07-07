import React from 'react';
import styles from './chatHeader.module.scss';
import menuIcon from '../../assets/img/menu-icon.png';
import defaultProfilePic from '../../assets/img/default-profile-img.png';


function ChatHeader() {
    return (
        <header className={styles.header}>
            <div className={styles.profileContainer}>
            <img src={defaultProfilePic} className={styles.profilePic} />
                <div className={styles.profileInfo}>
                    <div>Denise</div>
                    <div>online</div>
                </div>
            </div>
            <img className={styles.menuIcon} src={menuIcon} />
        </header>
    );
}

export default ChatHeader;