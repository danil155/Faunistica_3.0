import "./styles.css";
import React from "react";
import { NavLink } from "react-router-dom";
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";

const Navbar = ({ isAuthenticated, onLoginClick, onLogoutClick }) => {
  return (
      <nav className="nav">
          <div className="nav-content">
            <NavLink to="/" className="logo" style={{color: "white", textDecoration: "none"}}>
              <div className="logo">
                Паутина данных
              </div>
            </NavLink>
            <nav className="nav">
              <ul className="nav-list">
                <li>
                  <NavLink to="/text" >Форма</NavLink>
                </li>
                <li>
                  <a href="/">Инструкция</a>
                </li>
                <li>
                  <Link to="/stats">Статистика</Link>
                </li>
                <li>
                  <a href="/">О нас</a>
                </li>
              </ul>
            </nav>
            <div id="user-container" className="user-container">
            {isAuthenticated && (
            <>
              <Link to="/" className="nav-link">Личный кабинет</Link>
              <Link to="/text" className="nav-link">Добавить особей</Link>
            </>
          )}
          {isAuthenticated ? (
            <button onClick={onLogoutClick} className="auth-button">Выйти</button>
          ) : (
            <button onClick={onLoginClick} className="auth-button">Войти / <b>Зарегистрироваться</b></button>
          )}
            </div>
          </div>
      </nav>
  );
};

export default Navbar;
