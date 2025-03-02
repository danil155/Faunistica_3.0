import React, { useEffect, useState } from "react";

let data = {};

const TogglePage = () => {
  const [isTextMode, setIsTextMode] = useState(true);
  const [text, setText] = useState("");
  const [data, setData] = useState("");

  const toggleMode = () => {
    setIsTextMode(!isTextMode);
  };

  const handleChange = (event) => {
    setText(event.target.value); // Обновляем состояние при вводе
  };

  async function handleSubmit() {
    if (!text.trim()) {
      alert("Введите текст!");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5001/api/get_info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const result = await res.json();

      setData(result);

      console.log(result);

      setIsTextMode(false);
    } catch (error) {
      console.error("Error request: ", error);
    }
  }

  return (
    <div className="container">
      <header>
        <h3>
          {isTextMode
            ? "Введите текст для частичного автозаполнения"
            : "Заполните форму вручную"}
        </h3>
        <p>или</p>
        <button onClick={toggleMode} className="toggle-button">
          {isTextMode
            ? "Заполните форму вручную"
            : "Введите текст для частичного автозаполнения"}
        </button>
      </header>
      <div className="content">
        {isTextMode ? (
          <>
            <textarea
              placeholder="Введите ваш текст здесь..."
              className="text-area"
              value={text}
              onChange={handleChange}
            ></textarea>
            <button id="button_submit_text" onClick={handleSubmit}>
              Автозаполнение
            </button>
          </>
        ) : (
          <div className="form-sections-container">
            <section>
              <h3>Ваша текущая статья:</h3>
              <p>
                <strong>Название:</strong> Дневник Бриджит Джонс
              </p>
              <p>
                <strong>Автор:</strong> Хелен Филдинг
              </p>
              <p>
                <strong>ISBN:</strong> 978-5-699-70224-4
              </p>
            </section>
            <form action="" method="get" className="form">
              <h3>Географическое положение</h3>
              <div id="sec">
                <div className="form">
                  <label>Страна: </label>
                  <input className="form-element" defaultValue={data.country} />
                </div>
                <div className="form">
                  <label>Регион: </label>
                  <input className="form-element" defaultValue={data.region} />
                </div>
                <div className="form">
                  <label>Район: </label>
                  <input
                    className="form-element"
                    defaultValue={data.district}
                  />
                </div>
                <div className="form">
                  <label>Место сбора: </label>
                  <input className="form-element"
                  defaultValue={data.gathering_place}
                  />
                </div>
              </div>
              <h3>Географическое положение</h3>
              <div id="sec">
                <div className="form">
                  <input className="form-element"
                         defaultValue={data.coordinate_north}
                  />
                  <label>⁰N</label>
                </div>
                <div className="form">
                <input className="form-element"
                       defaultValue={data.coordinate_east}
                />
                <label>⁰E</label>
                </div>
              </div>
              <h3>Сбор материала</h3>
              <div id="sec">
              <div className="form">
                  <label>Дата:</label>
                  <input
                    type="date"
                    className="form-element"
                    defaultValue={data.date}
                  />
                </div>
                <div className="form">
                  <label>Биотоп:</label>
                  <input
                    className="form-element"
                  />
                </div>
                <div className="form">
                  <label>Единицы измерения:</label>
                  <input
                    className="form-element"
                    defaultValue={"Особи, шт."}
                  />
                </div>
                <div className="form">
                  <label>Коллектор: </label>
                  <input
                    className="form-element"
                    defaultValue={data.collector}
                  />
                </div>
                <div className="form">
                  <label>Выборочное условие:</label>
                  <input
                    className="form-element"
                  />
                </div>
              </div>
              <h3>Сбор материала</h3>
              <div id="sec">
              <div className="form">
                  <label>Семейство:</label>
                  <div className="form-element">паук</div>
                </div>
                <div className="form">
                  <label>Род:</label>
                  <div className="form-element">паук</div>
                </div>
                <div className="form">
                  <label>Видовое название:</label>
                  <div className="form-element">паук</div>
                </div>
                <div className="form">
                  <label>Таксономические примечания:</label>
                  <input className="form-element"/>
                </div>
              </div>
              <h3>Количество:</h3>
              <div id="sec">
                <div className="form">
                  <label>Самцов:</label>
                  <input className="form-element" type="number" min="0" max="20" defaultValue={data.count_males}/>
                </div>
                <div className="form">
                  <label>Субвзрослых самцов:</label>
                  <input className="form-element" type="number" min="0" max="20" defaultValue={0}/>
                </div>
                <div className="form">
                  <label>Самок:</label>
                  <input className="form-element" type="number" min="0" max="20" defaultValue={data.count_females}/>
                </div>
                <div className="form">
                  <label>Субвзрослых самок:</label>
                  <input className="form-element" type="number" min="0" max="20" defaultValue={0}/>
                </div>
                <div className="form">
                  <label>Взрослых (пол не определен):</label>
                  <input className="form-element" type="number" min="0" max="20" defaultValue={0}/>
                </div>
                <div className="form">
                  <label>Ювенильных (пол не определен):</label>
                  <input className="form-element" type="number" min="0" max="20" defaultValue={0}/>
                </div>
                <div className="form">
                  <label>Примечания об экземпляре:</label>
                  <input className="form-element"/>
                </div>

              </div>
              <div className="form">
                <input type="submit" className="submit" value="Сохранить!" />
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TogglePage;
