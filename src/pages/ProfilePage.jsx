import { apiService } from "../api";
import React, { useState, useEffect } from "react";
import '../styles/profile.css';

const ProfilePage = () => {
    const [profile, setProfile] = useState({
        username: "",
        userId: "",
        avatar: URL,
        stats: {
            processedPublications: 0,
            correctRecords: 0,
            checkRatio: 0,
            speciesCount: 0,
            mostCommonSpecies: null
        },
        records: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const per_stats = await apiService.getProfile();

                let avatarUrl = null;

                if (per_stats.data[1]) {
                    avatarUrl = await apiService.getProfilePhoto(per_stats.data[1]);
                }

                const profileData = {
                    username: per_stats.data[0] || "Не указан",
                    userId: per_stats.data[1],
                    avatar: avatarUrl,
                    stats: {
                        processedPublications: per_stats.data[2].processed_publs || 0,
                        correctRecords: per_stats.data[2].rec_ok || 0,
                        checkRatio: per_stats.data[2].check_ratio || 0,
                        speciesCount: per_stats.data[2].species_count || 0,
                        mostCommonSpecies: per_stats.data[2].most_common_species || "Нет данных"
                    },
                    records: Array.isArray(per_stats.data[3]) ? per_stats.data[3] : []
                };

                setProfile(profileData);
            } catch (error) {
                console.error("Ошибка при загрузке профиля:", error);
                setError(error.message || "Произошла ошибка при загрузке данных");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedRecords = React.useMemo(() => {
        if (!sortConfig.key) return profile.records;

        return [...profile.records].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [profile.records, sortConfig]);

    if (loading) return <div className="loading-message">
        Загрузка данных<span className="loading-dots"></span>
    </div>;

    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="profile-container">
            {/* Боковая панель с профилем */}
            <div className="profile-sidebar">
                <div className="profile-card">
                    <div className="profile-avatar">
                        {profile.avatar ? (
                            <img src={profile.avatar} alt="Аватар пользователя" />
                        ) : (
                            <div className="avatar-fallback">
                                {profile.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <h2 className="profile-name">{profile.username}</h2>
                    <div className="profile-id">ID: {profile.userId}</div>
                </div>

                <div className="quick-stats">
                    <div className="stat-item">
                        <div className="stat-number">{profile.stats.processedPublications}</div>
                        <div className="stat-label">Обработано публикаций</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{profile.stats.speciesCount}</div>
                        <div className="stat-label">Видов найдено</div>
                    </div>
                </div>
            </div>

            {/* Основное содержимое */}
            <div className="profile-content">
                <section className="stats-section">
                    <h2 className="section-title">Основная статистика</h2>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>Публикаций обработано</h3>
                            <div className="stat-value">{profile.stats.processedPublications}</div>
                        </div>

                        <div className="stat-card">
                            <h3>Правильных записей</h3>
                            <div className="stat-value">{profile.stats.correctRecords}</div>
                        </div>

                        <div className="stat-card">
                            <h3>Коэффициент проверки</h3>
                            <div className="stat-value">{profile.stats.checkRatio.toFixed(2)}</div>
                        </div>

                        <div className="stat-card">
                            <h3>Всего видов</h3>
                            <div className="stat-value">{profile.stats.speciesCount}</div>
                        </div>
                    </div>
                </section>

                <div className="detailed-stats">
                    <section className="common-species">
                        <h3 className="section-subtitle">Самый частый вид</h3>
                        <div className="species-value">
                            {profile.stats.mostCommonSpecies || "Нет данных"}
                        </div>
                    </section>
                </div>

                <section className="records-section">
                    <h2 className="section-title">Последние записи</h2>

                    {profile.records.length > 0 ? (
                        <div className="records-table-container">
                            <div className="table-info">
                                Показано {sortedRecords.length} из {profile.records.length} записей
                            </div>
                            <table className="records-table">
                                <thead>
                                <tr>
                                    <th onClick={() => requestSort('date')}>
                                        Дата и время
                                        {sortConfig.key === 'date' && (
                                            <span className="sort-arrow">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                        )}
                                    </th>
                                    <th onClick={() => requestSort('author')}>
                                        Автор
                                        {sortConfig.key === 'author' && (
                                            <span className="sort-arrow">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                        )}
                                    </th>
                                    <th onClick={() => requestSort('species')}>
                                        Вид
                                        {sortConfig.key === 'species' && (
                                            <span className="sort-arrow">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                        )}
                                    </th>
                                    <th onClick={() => requestSort('abundance')}>
                                        Количество
                                        {sortConfig.key === 'abundance' && (
                                            <span className="sort-arrow">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                        )}
                                    </th>
                                    <th onClick={() => requestSort('locality')}>
                                        Локация
                                        {sortConfig.key === 'locality' && (
                                            <span className="sort-arrow">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                        )}
                                    </th>
                                    <th onClick={() => requestSort('even_date')}>
                                        Дата сбора
                                        {sortConfig.key === 'even_date' && (
                                            <span className="sort-arrow">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                        )}
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {sortedRecords.map((record, index) => (
                                    <tr key={index}>
                                        <td>{new Date(record.date).toLocaleString()}</td>
                                        <td>{record.author}</td>
                                        <td>{record.species}</td>
                                        <td>{record.abundance}</td>
                                        <td>{record.locality}</td>
                                        <td>{record.even_date}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="no-records">Нет данных о записях</div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ProfilePage;
