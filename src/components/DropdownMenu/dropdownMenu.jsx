import React from 'react';
import styles from './dropdownMenu.module.scss';

const DropdownMenu = ({ onLogout, onSelectMessages, onDeleteChat, onSearchMessages }) => {
    return (
        <div className={styles.dropdownMenu}>
            <ul>
                <li onClick={onLogout}>Logout</li>
                <li onClick={onSelectMessages}>Nachrichten auswählen</li>
                <li onClick={onDeleteChat}>Chat löschen</li>
                <li onClick={onSearchMessages}>Nachricht suchen</li>
            </ul>
        </div>
    );
};

export default DropdownMenu;
