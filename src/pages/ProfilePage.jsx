import { apiService } from "../api";
import React, { useState, useEffect } from "react";
import '../styles/profile.css';

const ProfilePage = () => {
    const [profile, setProfile] = useState({
        username: "",
        avatar: "",
        stats: {
            totalArticles: 0,
            processedArticles: 0,
            lastActivity: ""
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await apiService.getProfile();
                setProfile(data.data);
            } catch (error) {
                console.error("Ошибка при загрузке профиля:", error);
                setError(error.message || "Произошла ошибка при загрузке данных");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <div className="loading-message">
        Загрузка данных<span className="loading-dots"></span>
    </div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="profile">
            <div className="profile-content">
                <h2>Личный кабинет</h2>
                <div className="profile-header">
                    {profile.avatar && (
                        <img
                            src={profile.avatar}
                            alt="Аватар пользователя"
                            className="profile-avatar"
                        />
                    )}
                    <h2>{profile.username}</h2>
                </div>

                <div className="profile-stats">
                    <h3>Статистика</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-label">Всего статей:</span>
                            <span className="stat-value">{profile.stats.totalArticles}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Обработано:</span>
                            <span className="stat-value">{profile.stats.processedArticles}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Последняя активность:</span>
                            <span className="stat-value">{profile.stats.lastActivity || "Нет данных"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;