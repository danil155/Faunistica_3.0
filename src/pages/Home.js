import React from "react";

import spider from "../img/main_spider.webp";

const Home = ({isAuthenticated, onLoginClick}) => {
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
                {isAuthenticated ? 
                  <p className="participant">Ура! Вы участник!</p> :
                  <button className="join-button" onClick={onLoginClick}>Стать волонтером</button>
                }
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
      </main>
     );
}
 
export default Home;