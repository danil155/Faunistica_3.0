import React from "react";
import LoginModal from "../components/login/LoginModal";

const LoginPage = ({onLogin, onClose}) => {
    return (
        <div className="login-container">
            <LoginModal 
                onClose={onClose}
                onLogin={onLogin}
            />
        </div>
    );
};

export default LoginPage;