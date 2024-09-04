import React, { useRef, useState, useEffect } from 'react';
import styles from './dropdownMenu.module.scss';

const DropdownMenu = ({ isOpen, onLogout, onSelectMessages, onDeleteChat, onSearchMessages }) => {
    const menuRef = useRef(null);
    const [maxHeight, setMaxHeight] = useState('0px');

    useEffect(() => {
        if (menuRef.current) {
            setMaxHeight(isOpen ? `${menuRef.current.scrollHeight}px` : '0px');
        }
    }, [isOpen]);
    
    return (
        <div 
            ref={menuRef}
            className={`${styles.dropdownMenu} ${isOpen ? styles.open : ''}`}
            style={{ maxHeight }}
        >
            <ul>
                <li onClick={onSelectMessages}>Select Message</li>
                <li onClick={onSearchMessages}>Search Message</li>
                <li onClick={onDeleteChat}>Delete Chat</li>
                <li onClick={onLogout}>Logout</li>
            </ul>
        </div>
    );
};

export default DropdownMenu;
