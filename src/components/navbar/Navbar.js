import "./styles.css";
import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useState } from "react";

const Navbar = ({ isAuthenticated, onLoginClick, onLogoutClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
      <nav className="nav">
          <div className={`nav-content ${isMenuOpen ? 'open' : ''}`}>
            <NavLink to="/" className="logo" style={{color: "white", textDecoration: "none"}}>
              <div className="logo">
                Паутина данных
              </div>
            </NavLink>

            <button className="burger-menu" onClick={toggleMenu} aria-label="Toggle menu">
              <div className={`burger-line ${isMenuOpen ? 'open' : ''}`}></div>
              <div className={`burger-line ${isMenuOpen ? 'open' : ''}`}></div>
              <div className={`burger-line ${isMenuOpen ? 'open' : ''}`}></div>
            </button>

            <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
              <ul className="nav-list">
                <li>
                  <NavLink to="/text" onClick={() => setIsMenuOpen(false)}>Форма</NavLink>
                </li>
                <li>
                  <a href="/" onClick={() => setIsMenuOpen(false)}>Инструкция</a>
                </li>
                <li>
                  <Link to="/stats" onClick={() => setIsMenuOpen(false)}>Статистика</Link>
                </li>
                <li>
                  <a href="/" onClick={() => setIsMenuOpen(false)}>О нас</a>
                </li>
              </ul>
              
              {isAuthenticated ? (
                <button 
                  onClick={() => {
                    onLogoutClick();
                    setIsMenuOpen(false);
                  }} 
                  className="mobile-auth-button"
                >
                  Выйти
                </button>
              ) : (
                <button 
                  onClick={() => {
                    onLoginClick();
                    setIsMenuOpen(false);
                  }} 
                  className="mobile-auth-button"
                >
                  Войти / <b>Зарегистрироваться</b>
                </button>
              )}
            </div>
          </div>
      </nav>
  );
};

export default Navbar;