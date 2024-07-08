import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css';
import './index.scss';
import ChatHeader from './components/ChatHeader/chatHeader';
import ChatContainer from './components/ChatContainer/chatContainer';
import UserList from './components/UserList/userList';

const App = () => {
    const [selectedUser, setSelectedUser] = useState(null);

    return (
        <div className="app">
            <div className="sidebar">
                <UserList onUserClick={setSelectedUser} />
            </div>
            <div className="main-content">
                <ChatHeader selectedUser={selectedUser} />
                <ChatContainer />
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);