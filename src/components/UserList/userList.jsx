import React from 'react';
import styles from './userList.module.css';

function UserList() {
    const users = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
        { id: 4, name: 'David' },
        { id: 5, name: 'Eve' }
      ];
    
      return (
        <div className={styles.userList}>
          <h2 className={styles.title}>Contacts</h2>
          <ul className={styles.list}>
            {users.map(user => (
              <li key={user.id} className={styles.item}>
                {user.name}
              </li>
            ))}
          </ul>
        </div>
      );
}

export default UserList;