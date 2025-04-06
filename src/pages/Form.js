import { useEffect, useState } from "react";
import SpecimenForm from "../components/specimen-form/SpecimenForm";

let data = {};

const TogglePage = () => {
  const [isTextMode, setIsTextMode] = useState(true);
  const [text, setText] = useState("");
  const [data, setData] = useState("");
  const [formData, setFormData] = useState({
    country: '',
    region: '',
    district: '',
    place: '',
    north: '',
    east: '',
    place_notes: '',
    begin_year: null,
    begin_month: null,
    begin_day: null,
    end_year: null,
    end_month: null,
    end_day: null,
    biotope: '',
    collector: '',
    measurement_units: '',
    selective_gain: '', // выборочное усиление
    matherial_notes: '', //примечания к сбору материала
    family: '',
    genus: '',
    species: '',
    taxonomic_notes: '',
    is_new_species: null,
    is_defined_species: null,
    is_in_wsc: null,
    specimens: {}
  });

  const toggleMode = () => {
    setIsTextMode(!isTextMode);
  };

  const handleTextChange = (event) => {
    setText(event.target.value); // Обновляем состояние при вводе
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const transformSpecimensToObject = (specimensArray) => {
    const result = {};
    
    specimensArray.forEach(specimen => {
      const key = `${specimen.gender}_${specimen.maturity}`;
      result[key] = specimen.count;
    });
    
    return result;
  };

  const handleSpecimensChange = (newSpecimensArray) => {
    const specimensObject = transformSpecimensToObject(newSpecimensArray);
    setFormData(prev => ({ ...prev, specimens: specimensObject }));
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
              onChange={handleTextChange}
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
              <div class="sec">
                <legend>Административное положение</legend>
                <div className="form-row">
                <label for="counry">Страна: <input className="form-element" defaultValue={data.country} id="country" /></label>
                <label for="region"> Регион: <input className="form-element" defaultValue={data.region} id="region" /></label>
                <label for="district">Район: <input className="form-element" defaultValue={data.district} id="district"  /></label>
                <label for="gathering-place">Место сбора: <input className="form-element"
                  defaultValue={data.gathering_place}
                  id="gathering-place" />
                </label>
                </div>
              </div>

              <div class="sec">
                <legend>Географическое положение</legend>
                <div className="form-row">
                <label for="coordinate_north">⁰N<input className="form-element" defaultValue={data.coordinate_north}
                         id="coordinate_north" /></label>
                <label for="coordinate_east">⁰E<input className="form-element" defaultValue={data.coordinate_east}
                         id="coordinate_east" /></label>
                </div>
              </div>

              <div class="sec">
                <legend>Сбор материала</legend>
                <div className="form-row">
                <label for="date">Дата: <input
                    type="date"
                    className="form-element"
                    defaultValue={data.date}
                    id="date"
                  />
                </label>

                <label for="biotope">Биотоп: <input
                    className="form-element"
                    id="biotope"
                    type="text"
                  /></label>
                
                <label for="measurement-units">Единицы измерения: <input
                    className="form-element"
                    defaultValue={"Особи, шт."}
                    id="measurement-units"
                  /></label>
                  
                <label for="collector">Коллектор: <input
                  className="form-element"
                  defaultValue={data.collector}
                  id="collector"
                /></label>

                <label for="selective-gain">Выборочное усиление: <input
                    className="form-element"
                    id="selective-gain"
                  /></label>
                  </div>
              </div>

              <div class="sec">
                <legend>Таксономия</legend>
                <div className="form-row">
                <label for="family">Семейство: <input className="form-element" defaultValue={data.family} id="family" /></label>
                <label for="genera">Род: <input className="form-element" defaultValue={data.genera} id="genera" /></label>
                <label for="species">Видовое название: <input className="form-element" id="species" /></label>
                <label for="taxonomic-notes">Таксономические примечания: <input className="form-element" id="taxonomic-notes" /></label>
                </div>
              </div>

              

              <div class="sec">
                <legend>Добавление особей</legend>

                <SpecimenForm 
              value={Object.keys(formData.specimens).length > 0 
                ? Object.entries(formData.specimens).map(([key, count]) => {
                    const [gender, maturity] = key.split('_');
                    return { gender, maturity, count };
                  })
                : []}
              onChange={handleSpecimensChange} 
              />
              </div>
              <button type="submit">Отправить наблюдение</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TogglePage;
