import "./styles/styles.css";
import React, { useEffect, useState } from "react";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Home from "./pages/Home";
import LoginModal from './components/login/LoginModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';
import FormModePage from "./pages/FormModePage";
import TextModePage from "./pages/TextModePage";
import useToken from "./components/useToken";
import StatsPage from "./pages/Stats";
import { Outlet } from 'react-router-dom';
import FeedbackPage from "./pages/Feedback";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuth, login, logout } = useToken();
  const [showLoginModal, setShowLoginModal] = useState(false);

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
    navigate("/");
  };

  const PrivateRoutes = ({ auth }) => {
    const [initialCheckDone, setInitialCheckDone] = useState(false);

    useEffect(() => {
      if (auth !== null && !initialCheckDone) {
        if (!auth) {
          setShowLoginModal(true);
        }
        setInitialCheckDone(true);
      }
    }, [auth, initialCheckDone]);

    if (auth === false) {
			navigate("/", { state: { loginRedirect: true } });
			return null;
		}
		
		return auth ? <Outlet /> : null;
  };

  return (
      <div className="App">
        <Navbar
            isAuthenticated={isAuth}
            isLoading={isAuth === null}
            onLoginClick={() => setShowLoginModal(true)}
            onLogoutClick={handleLogout}
        />

        {showLoginModal && isAuth === false && (
            <LoginModal
                onClose={handleClose}
                onLogin={handleLogin}
            />
        )}

        <Routes>
          <Route path="/" element={
            <Home
                isAuthenticated={isAuth}
                onLoginClick={() => setShowLoginModal(true)}
            />
          }/>
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route element={<PrivateRoutes auth={isAuth} />}>
            <Route path="/form" element={<FormModePage />} />
            <Route path="/text" element={<TextModePage />} />
          </Route>
          <Route path="/stats" element={<StatsPage />} />
        </Routes>

        <Footer />
      </div>
  );
}

export default App;