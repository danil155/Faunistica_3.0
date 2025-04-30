import "./styles/styles.css";
import React, { useEffect, useState } from "react";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Home from "./pages/Home";
import LoginModal from './components/login/LoginModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import FormModePage from "./pages/FormModePage";
import TextModePage from "./pages/TextModePage";
import LoginPage from "./pages/LoginPage";
import useToken  from "./components/useToken";
import StatsPage from "./pages/Stats";
import ProtectedRoute from "./components/ProtectedRoute";
import { api, apiService } from "./api";


function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, setToken, removeToken } = useToken();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [stats, setStats] = useState(null);


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.getGeneralStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      removeToken();
      navigate('/');
    }
  };

  const handleClose = () => {
    setShowLoginModal(false);
    navigate('/');
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setToken()
    navigate('/text')
  };

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

                    onLoginSuccess={handleLoginSuccess}

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

      {stats && (
          <div className="stats-preview">
            <p>Всего записей: {stats.total_records}</p>
            <p>Последняя запись: {stats.latest_record?.date}</p>
          </div>
      )}
    </div>
  );
}

export default App;
