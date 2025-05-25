import React from "react";
import { Link, NavLink } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';

import spider from "../img/main-baby.webp";
import icon1 from "../img/about-proj-icon-1.svg";
import icon2 from "../img/about-proj-icon-2.svg";
import icon3 from "../img/about-proj-icon-3.svg";
import spidey from "../img/spider.webp";

const Home = ({isAuthenticated, onLoginClick}) => {
    const {t} = useTranslation('home');

    return (
        <>
            <main className="main">
                <div className="main-container">
                    <section className="hero">
                        <div className="hero-image">
                            <img
                                src={spider}
                                alt={t('hero.spider_alt')}
                                className="spider-image"
                            />
                            <div className="hero-text">
                                <h1>{t('hero.title')}</h1>
                                {isAuthenticated ?
                                    <p className="participant">{t('hero.participant')}</p> :
                                    <button className="join-button"
                                            onClick={onLoginClick}>{t('hero.participate_button')}</button>
                                }
                            </div>
                        </div>
                    </section>

                    <section className="what-we-do">
                        <h2>{t('mission.title')}</h2>
                        <p>
                            {t('mission.question')}
                        </p>
                    </section>

                    <section className="about-project">
                        <div className="proj-step">
                            <img src={icon1} alt={t('activities.platform_icon_alt')}/>
                            <h3>{t('activities.platform')}</h3>
                        </div>
                        <div className="proj-step">
                            <img src={icon2} alt={t('activities.database_icon_alt')}/>
                            <h3>{t('activities.database')}</h3>
                        </div>
                        <div className="proj-step">
                            <img src={icon3} alt={t('activities.access_icon_alt')}/>
                            <h3>{t('activities.access')}</h3>
                        </div>
                    </section>

                    <section id="volunteer-info-container">
                        <div id="volunteer-info">
                            <img src={spidey} id="volunteer-spider" alt={t('volunteer.spider_alt')}/>

                            <div id="volunteer-info-text">
                                <h2>{t('volunteer.title')}</h2>
                                <p>{t('volunteer.description')}</p>
                                <Link className="join-button" to="/instruction">{t('volunteer.learn_more')}</Link>
                            </div>
                        </div>
                    </section>

                    <section className="what-we-do">
                        <h2>{t('how_to_help.title')}</h2>
                        <div className="about-project">
                            <div className="proj-step">
                                <span>1</span>
                                <p>
                                    <Trans i18nKey="how_to_help.step1" t={t}>
                                        Register via our <Link to="https://t.me/FaunisticaV3Bot">telegram bot</Link>
                                    </Trans>
                                </p>
                            </div>
                            <div className="proj-step">
                                <span>2</span>
                                <p>
                                    <Trans i18nKey="how_to_help.step2" t={t}>
                                        Carefully study the <NavLink to="/instruction">instructions</NavLink>
                                    </Trans>
                                </p>
                            </div>
                            <div className="proj-step">
                                <span>3</span>
                                <p>
                                    <Trans i18nKey="how_to_help.step3" t={t}>
                                        Fill out your first <NavLink to="/text">form</NavLink>
                                    </Trans>
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
};

export default Home;