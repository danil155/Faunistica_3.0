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
import  useToken  from "./components/useToken";
import StatsPage from "./pages/Stats";


function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, setToken, removeToken } = useToken();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userData, setUserData] = useState(null);
  
  
  const handleLogout = () => {
    removeToken();
    navigate('/');
  }

  const handleClose = () => {
    setShowLoginModal(false);
    navigate('/');
  }

  return (
    <div className="App">
        <Navbar 
          isAuthenticated={!!token} 
          onLoginClick={() => setShowLoginModal(true)}
          onLogoutClick={handleLogout}
        />
        {/*<Home />*/}
        <Routes>
          <Route path="/" element={
            <>
            {showLoginModal && (
              <LoginModal 
                onClose={handleClose}
                
                onLogin={setToken}
              />
            )}
            <Home
              isAuthenticated={!!token}
              onLoginClick={() => setShowLoginModal(true)}
            />
            </>
            }/>
          <Route path="/form" element={!!token?<FormModePage />:<LoginPage onLogin={setToken} onClose={handleClose}/>}/>
          <Route path="/text" element={!!token?<TextModePage />:<LoginPage onLogin={setToken} onClose={handleClose}/>}/>
          <Route path="/stats" element={<StatsPage/>} />
        </Routes>

        <Footer />
    </div>
  );
}

export default App;
