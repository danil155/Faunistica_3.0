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

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;
    
    return (
        <div className="stats-container">
            <h2>Статистика</h2>
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Всего записей</h3>
                    <p>{stats.total_records}</p>
                </div>
                {/*<div className='info-container'>*/}
                {/*    <p>Распределение видов:</p>*/}
                {/*    <BarChart series={chartData.series}*/}
                {/*              xAxis={chartData.xAxis}*/}
                {/*              width={400}*/}
                {/*              height={300}*/}
                {/*              colors={['#2196F3']} />*/}
                {/*</div>*/}
                <div className='info-container'>
                    <p>Последние добавленные особи</p>
                    <table className='stats-table'>
                        <thead>
                        <tr>
                            <th>Дата</th>
                            <th>Вид</th>
                            <th>Место</th>
                            <th>Волонтер</th>
                        </tr>
                        </thead>
                        <tbody>
                        {/*{mockStats.recentEntries.map((entry) => (*/}
                        {/*    <tr>*/}
                        {/*        <td>{entry.date}</td>*/}
                        {/*        <td>{entry.species}</td>*/}
                        {/*        <td>{entry.region + ", " + entry.district}</td>*/}
                        {/*        <td>{entry.volunteer}</td>*/}
                        {/*    </tr>*/}
                        {/*))}*/}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StatsPage;