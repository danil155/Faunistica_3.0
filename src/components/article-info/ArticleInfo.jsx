import React, {useEffect, useState} from 'react';
import {apiService} from "../../api";
import PublicationErrorModal from "../PublicationErrorModal";
import {Link, useParams} from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const ArticleInfo = ({ isEditMode = false }) => {
    const [publication, setPublication] = useState(null);
    const [showPublicationError, setShowPublicationError] = useState(false);
    const { hash } = useParams();
    const fetchPublication = async () => {
        try {
            let data;
            if (isEditMode && hash) {
                let publ_req = {"hash": hash}
                data = await apiService.getPublicationFromHash(publ_req);
            } else {
                data = await apiService.getPublication();
            }
            setPublication(data);
            setShowPublicationError(false);

        } catch (err) {
            setShowPublicationError(true);
        }
    }
    useEffect(() => {
        fetchPublication()
            .catch(error => {
                console.error("Failed to fetch publication:", error);
            });
        }
        , [])

    function handleRetry() {
        console.log('uwu');
        fetchPublication()
            .catch(error => {
                console.error("Failed to fetch publication:", error);
            })
        setShowPublicationError(false);
    }

    const handleChangePublication = async () => {
        try {
            const result = await apiService.ChangePublication();
            if (result) {
                window.location.reload();
            } else {
                toast.error("Не удалось сменить публикацию. Пожалуйста, попробуйте снова.");
            }
        } catch (error) {
            console.error("Error changing publication:", error);
            if (error.message) {
                toast.error(error.message);
            } else {
                toast.error("Произошла непредвиденная ошибка");
            }
        }
    }

    return (
        <>
        {showPublicationError && <PublicationErrorModal onRetry={handleRetry} />}
            <>
                <h4>Ваша статья</h4>
                <div className='article-card'>
                    <img src={publication?.year ? require(`../../img/publ-spider-${(publication?.year % 8)}.jpg`) : "https://placehold.co/120x120"} alt="Обложка статьи" />
                    <div id="article_info_container">
                        <p>Название: {publication?.name ?? "Все рассказы (сборник)"}</p>
                        <p>Авторы: {publication?.author ?? "Эдгар Аллан По"}</p>
                        <p>Год издания: {publication?.year ?? 2009}</p>
                        <p>Ссылка на файл: <Link to={publication?.pdf_file ?? "https://www.youtube.com/watch?v=dQw4w9WgXcQ"} target="_blank">{publication?.pdf_file ?? "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}</Link></p>
                    </div>
                </div>
                {!isEditMode && publication && (
                    <button 
                        type="button"
                        onClick={handleChangePublication}
                        className='change-publ-btn'
                    >
                        Сменить публикацию
                    </button>
                )}
            </>
        </>
    );
};

export default ArticleInfo