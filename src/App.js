import "./styles/styles.css";
import React, { useEffect, useState } from "react";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Home from "./pages/Home";
import LoginModal from './components/login/LoginModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { Route, Routes} from 'react-router-dom';
import FormModePage from "./pages/FormModePage";
import TextModePage from "./pages/TextModePage";
import LoginPage from "./pages/LoginPage";
import useToken  from "./components/useToken";
import StatsPage from "./pages/Stats";
import FeedbackPage from "./pages/Feedback";


function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuth, login, logout } = useToken();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (isAuth === false && (location.pathname === '/form' || location.pathname === '/text')) {
      navigate('/');
    }
  }, [isAuth, location.pathname, navigate]);


  const handleLogin = async (username, password) => {
    try {
      await login(username, password);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleClose = () => {
    setShowLoginModal(false);
  };

  const handleLoginPageClose = () => {
    navigate("/");
  }

  return (
    <div className="App">
      <Navbar
        isAuthenticated={isAuth}
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

                    onLogin={handleLogin}
                />
            )}
            <Home
                isAuthenticated={isAuth}
                onLoginClick={() => setShowLoginModal(true)}
            />
          </>
        }/>
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/form" element={!(isAuth)?<FormModePage />:<LoginPage onLogin={handleLogin} onClose={handleLoginPageClose} />}/>
        <Route path="/text" element={!(isAuth)?<TextModePage />:<LoginPage onLogin={handleLogin} onClose={handleLoginPageClose} />}/>
        <Route path="/stats" element={<StatsPage/>} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
