import React from 'react';
import styles from './chatHeader.module.css';

function ChatHeader() {
    return (
        <header className={styles.header}>
            <h1 className={styles.title}>Chat Messenger</h1>
            <div className={styles.actions}>
                <button className={styles.button}>Settings</button>
                <button className={styles.button}>Logout</button>
            </div>
        </header>
    );
}

export default ChatHeader;