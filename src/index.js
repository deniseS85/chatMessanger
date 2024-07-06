import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css';
import './index.scss';
import ChatHeader from './components/ChatHeader/chatHeader';
import ChatContainer from './components/ChatContainer/chatContainer';
import ChatInput from './components/ChatInput/chatInput';
import Message from './components/Message/message';
import MessageList from './components/MessageList/messageList';
import UserList from './components/UserList/userList';

const App = () => (
    <div className="app">
        <div className="sidebar">
            <UserList />
        </div>
        <div className="main-content">
            <ChatHeader />
            <div className="chat-container">
               {/*  <MessageList /> */}
                <ChatContainer />
                <ChatInput />
            </div>
        </div>
    </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);