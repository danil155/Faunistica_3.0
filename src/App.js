import "./styles/styles.css";
import React from "react";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Home from "./pages/Home";
import LoginModal from './components/login/LoginModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { useState, useEffect } from 'react';
import FormModePage from "./pages/FormModePage";
import TextModePage from "./pages/TextModePage";
import LoginPage from "./pages/LoginPage";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleLogin = (data) => {
    setIsAuthenticated(true);
    setUserData(data);
    setShowLoginModal(false);
  }
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    navigate('/');
  }
  return (
    <div className="App">
        <Navbar 
          isAuthenticated={isAuthenticated} 
          onLoginClick={() => setShowLoginModal(true)}
          onLogoutClick={handleLogout}
        />
        {/*<Home />*/}
        <Routes>
          <Route path="/" element={
            <>
            {showLoginModal && (
              <LoginModal 
                onClose={() => setShowLoginModal(false)}
                onLogin={handleLogin}
              />
            )}
            <Home
              isAuthenticated={isAuthenticated}
              onLoginClick={() => setShowLoginModal(true)}
            />
            </>
            }/>
          <Route path="/form" element={<FormModePage/>}/>
          <Route path="/text" element={<TextModePage/>}/>
        </Routes>

        <Footer />
    </div>
  );
}

export default App;
