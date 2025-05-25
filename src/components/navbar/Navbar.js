import "./navbar.css";
import React from "react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import LanguageSwitcher from "../LanguageSwitcher";
import { useTranslation, Trans } from 'react-i18next';

const Navbar = ({ isAuthenticated, onLoginClick, onLogoutClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation('navbar');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
      <nav className="nav">
          <div className={`nav-content ${isMenuOpen ? 'open' : ''}`}>
            <NavLink to="/" className="logo" style={{color: "white", textDecoration: "none"}}>
              <div className="logo">
                {t('logo')}
              </div>
            </NavLink>

            <button className="burger-menu" onClick={toggleMenu} aria-label={t('menu.toggle')}>
              <div className={`burger-line ${isMenuOpen ? 'open' : ''}`}></div>
              <div className={`burger-line ${isMenuOpen ? 'open' : ''}`}></div>
              <div className={`burger-line ${isMenuOpen ? 'open' : ''}`}></div>
            </button>

            <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
              <ul className="nav-list">
                <li>
                  <NavLink to="/text" onClick={() => setIsMenuOpen(false)}>{t('links.form')}</NavLink>
                </li>
                <li>
                  <NavLink to="/instruction" onClick={() => setIsMenuOpen(false)}>{t('links.instruction')}</NavLink>
                </li>
                <li>
                  <NavLink to="/stats" onClick={() => setIsMenuOpen(false)}>{t('links.stats')}</NavLink>
                </li>
                <li>
                  <NavLink to="/feedback" onClick={() => setIsMenuOpen(false)}>{t('links.support')}</NavLink>
                </li>
                <li>
                  <NavLink to="/profile" onClick={() => setIsMenuOpen(false)}>{t('links.profile')}</NavLink>
                </li>
              </ul>
              <div className="user-controls">
                <LanguageSwitcher />
                {isAuthenticated ? (
                  <button 
                    onClick={() => {
                      onLogoutClick();
                      setIsMenuOpen(false);
                    }} 
                    className="mobile-auth-button"
                  >
                    {t('auth.logout')}
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      onLoginClick();
                      setIsMenuOpen(false);
                    }} 
                    className="mobile-auth-button"
                  >
                    <Trans i18nKey="navbar.auth.login">
                      Войти / <b>Зарегистрироваться</b>
                    </Trans>
                  </button>
                )}
              </div>
            </div>
          </div>
      </nav>
  );
};

export default Navbar;