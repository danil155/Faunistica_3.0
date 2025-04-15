import React from "react";

import "./style.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="project-info">
          <p>
            Паутина Данных — это проект, направленный на создание базы данных
            пауков Пермского края.
          </p>
        </div>
        <div className="contact">
          <p>
            Контактная информация:
            <a href="mailto:info@spiderdata.ru">info@spiderdata.ru</a>
          </p>
        </div>
        <div className="social-media">
          <a href="/">Facebook</a>
          <a href="/">Instagram</a>
          <a href="/">ВКонтакте</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
