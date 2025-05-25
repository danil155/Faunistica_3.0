import React, { useEffect, useState } from 'react';
import { apiService } from "../../api";
import PublicationErrorModal from "../PublicationErrorModal";
import { useTranslation } from 'react-i18next';
import { Link, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const ArticleInfo = ({isEditMode = false}) => {
    const {t} = useTranslation('articleInfo');
    const [publication, setPublication] = useState(null);
    const [showPublicationError, setShowPublicationError] = useState(false);
    const {hash} = useParams();

    const fetchPublication = async () => {
        try {
            let data;
            if (isEditMode && hash) {
                let publ_req = {"hash": hash};
                data = await apiService.getPublicationFromHash(publ_req);
            } else {
                data = await apiService.getPublication();
            }
            setPublication(data);
            setShowPublicationError(false);

        } catch (err) {
            setShowPublicationError(true);
        }
    };

    useEffect(() => {
            fetchPublication()
                .catch(error => {
                    console.error("Failed to fetch publication:", error);
                });
        }, []);

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
                toast.error(t("error.change_error"));
            }
        } catch (error) {
            console.error("Error changing publication:", error);
            if (error.message) {
                toast.error(error.message);
            } else {
                toast.error(t("error.unexpected_error"));
            }
        }
    };

    return (
        <>
            {showPublicationError && <PublicationErrorModal onRetry={handleRetry}/>}
            <>
                <h4>{t("data.title")}</h4>
                <div className='article-card'>
                    <img
                        src={publication?.year ? require(`../../img/publ-spider-${(publication?.year % 8)}.jpg`) : "https://placehold.co/120x120"}
                        alt={t("data.alt")}/>
                    <div id="article_info_container">
                        <p>{t("data.field.title")} {publication?.name ?? t("data.field.title")}</p>
                        <p>{t("data.field.author")} {publication?.author ?? t("data.field.title")}</p>
                        <p>{t("data.field.year")} {publication?.year ?? 2009}</p>
                        <p>{t("data.field.link")} <Link
                            to={publication?.pdf_file ?? "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
                            target="_blank">{publication?.pdf_file ?? "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}</Link>
                        </p>
                    </div>
                </div>
                {!isEditMode && publication && (
                    <button
                        type="button"
                        onClick={handleChangePublication}
                        className='change-publ-btn'
                    >
                        {t("button")}
                    </button>
                )}
            </>
        </>
    );
};

export default ArticleInfo;