import React from "react";
import { useTranslation } from 'react-i18next';
import vkIcon from "../../img/Icon.svg"

import "./style.css";

const Footer = () => {
    const {t} = useTranslation('footer');
    return (
        <footer className="footer">

            <div className="project-info">
                <p>
                    {t("title")}
                </p>
            </div>
            <div className="social-media">
                <a href="https://vk.com/data_web">
                    <img src={vkIcon} alt={t("alt.logo1")} className="social-media-logo"/>
                    <p>{t("logo1")}</p>
                </a>
            </div>

        </footer>
    );
};

export default Footer;