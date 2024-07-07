import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css';
import './index.scss';
import ChatHeader from './components/ChatHeader/chatHeader';
import ChatContainer from './components/ChatContainer/chatContainer';
import UserList from './components/UserList/userList';

const App = () => (
    <div className="app">
        <div className="sidebar">
            <UserList />
        </div>
        <div className="main-content">
            <ChatHeader />
            <ChatContainer />
        </div>
    </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);