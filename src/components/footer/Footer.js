import React from "react";
import vkIcon from "../../img/Icon.svg"

import "./style.css";

const Footer = () => {
  return (
    <footer className="footer">
      
        <div className="project-info">
          <p>
            Паутина Данных 
          </p>
        </div>
        <div className="social-media">
          <a href="https://vk.com/data_web">
          <img src={vkIcon} alt="лого вк" className="social-media-logo"/>
          <p>Вконтакте</p>
          </a>
        </div>

    </footer>
  );
};

export default Footer;
