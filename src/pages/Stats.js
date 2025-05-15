import React, { useEffect, useState } from 'react';
import '../styles/stats.css';
import { BarChart } from '@mui/x-charts';
import { apiService } from "../api";

const StatsPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiService.getGeneralStats();
                setStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error">Ошибка: {error}</div>;
    if (!stats) return <div className="no-data">Нет данных для отображения</div>;

    // Подготовка данных для графика
    const chartData = {
        series: [
            {
                data: stats.top_species.map(item => item.count),
            },
        ],
        xAxis: [
            {
                data: stats.top_species.map(item => item.species),
                scaleType: 'band',
            },
        ],
    };

    return (
        <div className="stats-container">
            <h2>Статистика</h2>
            <div id="stats">
                <div>
                <div className="info-container">
                    <p>Всего публикаций</p>
                    <h3>{stats.total_publications}</h3>
                </div>
                <div className="info-container">
                    <p>Обработано публикаций</p>
                    <h3>{stats.processed_publications}</h3>
                </div>
                </div>
                <div>
                <div className="info-container">
                    <p>Всего видов</p>
                    <h3>{stats.total_species}</h3>
                </div>
                <div className="info-container">
                    <p>Уникальных видов</p>
                    <h3>{stats.unique_species}</h3>
                </div>
                </div>
                <div className='info-container'>
                    <p>Распределение количества особей по видам</p>
                    <BarChart
                        series={chartData.series}
                        xAxis={chartData.xAxis}
                        width={500}
                        height={400}
                        colors={['#2196F3']}
                    />
                </div>

                <div className='info-container'>
                    <p>Последние записи</p>
                    <table className='stats-table'>
                        <thead>
                        <tr>
                            <th>Дата</th>
                            <th>Вид</th>
                            <th>Местоположение</th>
                            <th>Пользователь</th>
                        </tr>
                        </thead>
                        <tbody>
                        {stats?.latest_records.map((record, index) => (
                            <tr key={index}>
                                <td>{new Date(record.datetime).toLocaleDateString()}</td>
                                <td>{record.species}</td>
                                <td>{record.location}</td>
                                <td>{record.username}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StatsPage;