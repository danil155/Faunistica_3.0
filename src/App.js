import "./styles/styles.css";
import React from "react";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Home from "./pages/Home";
import Form from "./pages/Form";
import LoginModal from './components/login/LoginModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { useState, useEffect } from 'react';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Сохраняем текущий путь при изменении
  useEffect(() => {
    localStorage.setItem('lastPath', location.pathname);
  }, [location]);

  // При загрузке проверяем сохранённый путь
  useEffect(() => {
    const lastPath = localStorage.getItem('lastPath');
    if (lastPath && lastPath !== location.pathname) {
      navigate(lastPath);
    }
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    navigate('/')
  };

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
          <Route path="/form/text" element={<Form/>}/>
        </Routes>

        <Footer />
    </div>
  );
}

export default App;
