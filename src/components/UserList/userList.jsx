import React, { useState } from 'react';
import styles from './userList.module.scss';
import logoIcon from '../../assets/img/logo.png';
import defaultProfilePic from '../../assets/img/default-profile-img.png';

function UserList() {
    const [searchUser, setsearchUser] = useState('');
    const users = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
        { id: 4, name: 'David' },
        { id: 5, name: 'Eve' }
    ];

    const handleSearchChange = (event) => {
        setsearchUser(event.target.value);
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().startsWith(searchUser.toLowerCase())
    );

    return (
        <div className={styles.userList}>
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
            <ul className={styles.list}>
                {filteredUsers.map(user => (
                    <li key={user.id} className={styles.item}>
                        <div className={styles.profilePicContainer}>
                            <img src={defaultProfilePic} alt="Profile" className={styles.profilePic} />
                        </div>
                        {user.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UserList;
