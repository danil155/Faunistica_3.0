import React from "react";
import {Link, NavLink} from 'react-router-dom';

import spider from "../img/main-baby.webp";
import icon1 from "../img/about-proj-icon-1.svg";
import icon2 from "../img/about-proj-icon-2.svg";
import icon3 from "../img/about-proj-icon-3.svg";
import spidey from "../img/spider.webp";

const Home = ({isAuthenticated, onLoginClick}) => {
    return (
      <>
        <main className="main">
          <div className="main-container">
            <section className="hero">
              <div className="hero-image">
                <img
                  src={spider}
                  alt="Паук"
                  className="spider-image"
                />
                <div className="hero-text">
                  <h1>Станьте нашим волонтёром!</h1>
                  {isAuthenticated ? 
                    <p className="participant">Ура! Вы участник!</p> :
                    <button className="join-button" onClick={onLoginClick}>Участвовать</button>
                  }
                </div>
              </div>
            </section>

            <section className="what-we-do">
              <h2>Помогите оцифровать научные исследование о фауне Пермского края</h2>
              <p>
                Чем мы занимаемся?
              </p>
            </section>

            <section className="about-project">
              <div className="proj-step">
                <img src={icon1} alt="people icon" />
                <h3>Разработка платформы оцифровки данных</h3>
              </div>
              <div className="proj-step">
                <img src={icon2} alt="database icon" />
                <h3>Сбор базы данных по обнаруженным видам</h3>
              </div>
              <div className="proj-step">
                <img src={icon3} alt={"community icon"}/>
                <h3>Обеспечение свободного доступа к полученным данным</h3>
              </div>
            </section>

            <section id="volunteer-info-container">
              <div id="volunteer-info">
                <img src={spidey} id="volunteer-spider" alt={"volunteer spider"} />
                
                <div id="volunteer-info-text">
                  <h2>Роль волонтеров</h2>
                  <p>Нам нужна помощь волонтеров в распознавании и структурировании 
                    сведений о находках пауков из предложенных научных статей: кого, где, когда и кто нашел. </p>
                  <Link className="join-button" to="/instruction">Узнать больше</Link>
                </div>
              </div>
            </section>

            <section className="what-we-do">
              <h2>Как нам помочь?</h2>
              <div className="about-project">
              <div className="proj-step">
                <span>1</span>
                <p>Зарегистрируйся через нашего <Link to={"https://t.me/FaunisticaV3Bot"}>тг-бота</Link></p>
              </div>
              <div className="proj-step">
                <span>2</span>
                <p>Внимательно изучи <NavLink to={"/"}>инструкцию</NavLink></p>
              </div>
              <div className="proj-step">
                <span>3</span>
                <p>Заполни свою первую <NavLink to={"/text"}>форму</NavLink></p>
              </div>
              </div>
            </section>
          </div>
        </main>
      </>
     );
}
 
export default Home;