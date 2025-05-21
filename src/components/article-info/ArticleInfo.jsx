import React, {useEffect, useState} from 'react';
import {apiService} from "../../api";
import PublicationErrorModal from "../PublicationErrorModal";
import {Link} from "react-router-dom";


const ArticleInfo = () => {
    const [publication, setPublication] = useState(null);
    const [showPublicationError, setShowPublicationError] = useState(false);
    const fetchPublication = async () => {
        try {
            const data = await apiService.getPublication();
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
            </>
        </>
    );
};

export default ArticleInfo