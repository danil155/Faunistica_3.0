import "./styles.css";
import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
      <nav className="nav">
        <div className="container">
          <div className="nav-content">
            <NavLink to="/" className="logo" style={{color: "white", textDecoration: "none"}}>
              <div className="logo">
                Паутина данных
              </div>
            </NavLink>
            <nav className="nav">
              <ul className="nav-list">
                <li>
                  <NavLink to="/form/text" >Форма</NavLink>
                </li>
                <li>
                  <a href="/">Инструкция</a>
                </li>
                <li>
                  <a href="/">Статистика</a>
                </li>
                <li>
                  <a href="/">О нас</a>
                </li>
              </ul>
            </nav>
            <div id="user-container" className="user-container"></div>
          </div>
        </div>
      </nav>
  );
};

export default Navbar;
