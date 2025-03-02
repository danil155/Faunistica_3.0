import React from "react";

import spider from "../img/main_spider.webp";
import qr from "../img/tlg_bot_QR.svg";

const Home = () => {
    return ( 
        <main className="main">
        <div className="container">
          <section className="hero">
            <div className="hero-image">
              <img
                src={spider}
                alt="Паук"
                className="spider-image"
              />
              <div className="hero-text">
                <h1>Станьте нашим волонтёром!</h1>
                <a href="/" className="join-button">
                  Участвовать
                </a>
              </div>
            </div>
          </section>

          <section className="project-info-placeholder">
            <h2>Информация о проекте</h2>
            <p>
              Здесь будет описание нашего проекта.
            </p>
          </section>

          <section className="volunteer-guide-placeholder">
            <h2>Инструкция волонтера</h2>
            <p>
              Здесь будет инструкция для волонтеров.
            </p>
          </section>

          <section className="statistics-placeholder">
            <h2>Статистика</h2>
            <p>
              Здесь будет отображена статистика по проекту (как вариант).
            </p>
          </section>
          <a
              href="https://thenerdstash.com/deep-rock-galactic-the-origin-story-behind-rock-and-stone/"
              target="_blanc"
              rel="noopener noreferrer"
              style={{color: "black"}}>
            <section className="about-placeholder">
              <h2>О нас</h2>
              <p>
                Rock & Stone!
              </p>
            </section>
          </a>
        </div>
        <div className="popup" id="popup">
          <div className="popup-content">
            <span className="close-button" id="close-popup">
              &times;
            </span>
            <h2>Вход/Регистрация</h2>
            <form id="register-form">
              <a href="https://t.me/faunistica_2_bot" target="_blank">
                <img
                  src={qr}
                  alt="QR-код"
                  width="250"
                  height="250"
                />
              </a>
              <p>Получите пароль у телеграм бота</p>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="пароль"
                required
              />

              <button type="submit" className="submit-button">
                <a href="form.html">Войти</a>
              </button>
            </form>
          </div>
        </div>
      </main>
     );
}
 
export default Home;