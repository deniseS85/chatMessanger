import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import 'bootstrap/dist/css/bootstrap.css';
import './index.scss';
import Login from './components/Login/login';
import Signup from './components/Signup/signup';
import Chat from './components/Chat/chat'; 
import ForgotPassword from './components/ForgotPassword/forgotPassword';
import ResetPassword from './components/ResetPassword/resetPassword';
import Cookies from 'js-cookie';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const location = useLocation();
    const nodeRef = React.createRef();

    useEffect(() => {
        const token = Cookies.get('authToken');
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, []);


    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    return (
        <TransitionGroup>
            <CSSTransition
                key={location.key}
                nodeRef={nodeRef}
                classNames="fade"
                timeout={300}
            >
                <div ref={nodeRef}>
                    <Routes location={location}>
                        <Route path="/" element={isLoggedIn ? <Navigate to="/chat" /> : <Login onLoginSuccess={handleLoginSuccess} />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/chat" element={isLoggedIn ? <Chat onLogout={handleLogout} /> : <Navigate to="/" />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                    </Routes>
                </div>
            </CSSTransition>
        </TransitionGroup>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Router>
        <App />
    </Router>
);
