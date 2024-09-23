import React, { useState, useEffect, useCallback } from 'react';
import styles from './userList.module.scss';
import logoIcon from '../../assets/img/logo.png';
import defaultProfilePic from '../../assets/img/default-profile-img.png';
import catPic from '../../assets/img/cat.jpg'; 
import dogPic from '../../assets/img/dog.png';
import addIcon from '../../assets/img/add-icon.png';

function UserList({ onUserClick, isHovered, showOnlyProfilePics, addNewContact }) {
    const [searchUser, setsearchUser] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    const users = [
        { id: 1, name: 'Alice', status: 'online', profilePic: catPic },
        { id: 2, name: 'Bob', status: 'offline', profilePic: dogPic },
        { id: 3, name: 'Charlie', status: 'online', profilePic: dogPic },
        { id: 4, name: 'David', status: 'offline', profilePic: dogPic },
        { id: 5, name: 'Eve', status: 'online', profilePic: defaultProfilePic }
    ];

    const handleSearchChange = (event) => {
        setsearchUser(event.target.value);
    };

     const handleUserClick = useCallback((user) => {
        setSelectedUser(user === selectedUser ? null : user);
        onUserClick(user);
    }, [selectedUser, onUserClick]);

    useEffect(() => {
        const listItems = document.querySelectorAll(`.${styles.item}`);
        listItems.forEach(item => {
            const profilePic = item.getElementsByClassName(styles.profilePic)[0];

            if (item.dataset.userid === selectedUser?.id.toString()) {
                item.style.backgroundColor = '#7F76FF';
                item.style.borderRadius = showOnlyProfilePics ? '0' : '50px';
                if (profilePic) {
                    profilePic.style.border = '1px solid rgb(223, 223, 250)';
                }
            } else {
                item.style.backgroundColor = '';
                profilePic.style.border = '';
                item.style.borderRadius = showOnlyProfilePics ? '0' : '50px';
            }
        });
    }, [selectedUser, showOnlyProfilePics]);

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().startsWith(searchUser.toLowerCase())
    );

    return (
        <div className={`${styles.userList} ${isHovered ? styles.hovered : ''} ${showOnlyProfilePics ? styles.showOnlyProfilePics : ''}`}>
            <div className={styles.logoContainer}>
                <img src={logoIcon} alt="Logo" />
                <div>Chat</div>
            </div>
            <div className={styles.searchContainer}>
                <input 
                    type="text" 
                    className={styles.searchInput} 
                    placeholder="Search..." 
                    value={searchUser} 
                    onChange={handleSearchChange} 
                />
            </div>
            <ul className={styles.list} >
                {filteredUsers.map(user => (
                    <li 
                        key={user.id}
                        className={`${styles.item} ${selectedUser === user ? styles.selected : ''}`} 
                        data-userid={user.id}
                        onClick={() => handleUserClick(user)}
                    >
                        <div className={styles.profilePicContainer}>
                            <img src={user.profilePic || defaultProfilePic} className={styles.profilePic} alt="Profile" />
                        </div>
                        {!showOnlyProfilePics && user.name}
                    </li>
                ))}
            </ul>
            <button 
                className={`${styles.addUserButton} ${showOnlyProfilePics ? styles.isOnlyProfilePic : ''}`} 
                onClick={addNewContact}
            >
                <img src={addIcon} className={styles.addUserImg} alt="Add" />
            </button>
        </div>
    );
}

export default UserList;

