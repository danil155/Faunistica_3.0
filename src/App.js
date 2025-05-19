import "./styles/styles.css";
import "./styles/responsive.css"
import React, { useEffect, useState } from "react";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Home from "./pages/Home";
import LoginModal from './components/login/LoginModal';
import { useNavigate, Routes, Route, Outlet } from 'react-router-dom';
import FormModePage from "./pages/FormModePage";
import TextModePage from "./pages/TextModePage";
import useToken from "./components/useToken";
import StatsPage from "./pages/Stats";
import FeedbackPage from "./pages/Feedback";
import ProfilePage from "./pages/ProfilePage";

function App() {
  const navigate = useNavigate();
  const { isAuth, isLoading, login, logout } = useToken();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogin = async (username, password) => {
    try {
      await login(username, password);
      setShowLoginModal(false);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('formData');
    localStorage.removeItem('pinnedSections');
    localStorage.removeItem('pinnedData');
    localStorage.removeItem('collapsedSections');
  };

  const PrivateRoutes = ({ auth, loading }) => {
    useEffect(() => {
      if (!loading && auth === false) {
        setShowLoginModal(true);
        navigate("/", { replace: true });
      }
    }, [auth, loading, navigate]);

    if (loading) {
      return <div>Загрузка...</div>; // Или ваш лоадер
    }

    return auth ? <Outlet /> : null;
  };

  return (
      <div className="App">
        <Navbar
            isAuthenticated={isAuth}
            isLoading={isLoading}
            onLoginClick={() => setShowLoginModal(true)}
            onLogoutClick={handleLogout}
        />

        {showLoginModal && (
            <LoginModal
                onClose={() => setShowLoginModal(false)}
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
          <Route element={<PrivateRoutes auth={isAuth} loading={isLoading} />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/form" element={<FormModePage />} />
            <Route path="/text" element={<TextModePage />} />
          </Route>
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>

        <Footer />
      </div>
  );
}

export default App;