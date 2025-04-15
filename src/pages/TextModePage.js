import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormContext } from "./FormContext";

const TextModePage = () => {
  const [text, setText] = useState("");
  const navigate = useNavigate();
  const { setFormState, pinnedData } = useFormContext();

  const handleTextChange = (event) => {
    setText(event.target.value);
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
      
      // Обновляем состояние формы перед переходом
      setFormState(prev => ({
        ...prev,
        ...result,
        // Сохраняем закрепленные данные
        ...Object.values(pinnedData).reduce((acc, sectionData) => ({
          ...acc,
          ...sectionData
        }), {})
      }));
    
    } catch (error) {
      console.error("Error request: ", error);
    };

    navigate('/form');
  }

  return (
    <div className="container">
      {<>
         <header>
         <h3>Введите текст для частичного автозаполнения</h3>
         <p>или</p>
         <button 
           onClick={() => navigate('/form')} 
           className="toggle-button"
         >
           Заполните форму вручную
         </button>
       </header>
       <div className="content">
         <textarea
           placeholder="Введите ваш текст здесь..."
           className="text-area"
           value={text}
           onChange={handleTextChange}
         ></textarea>
         <button id="button_submit_text" onClick={handleSubmit}>
           Автозаполнение
         </button>
       </div>
       </>
      }
    </div>
  );
};

export default TextModePage;