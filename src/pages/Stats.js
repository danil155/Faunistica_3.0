import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/stats.css';
import { BarChart } from '@mui/x-charts';
import { apiService } from "../api";

const StatsPage = () => {
    const { t } = useTranslation('stats');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
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

    if (loading) return <div className="loading-message">
        {t("messages.loading")}<span className="loading-dots"></span>
    </div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!stats) return <div className="no-data">{t("messages.no_data")}</div>;

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
            <h2>{t("stats.title")}</h2>
            <div id="stats">
                <div>
                <div className="info-container">
                    <p>{t("stats.basic.publ_all")}</p>
                    <h3>{stats.total_publications}</h3>
                </div>
                <div className="info-container">
                    <p>{t("stats.basic.publ_processed")}</p>
                    <h3>{stats.processed_publications}</h3>
                </div>
                </div>
                <div>
                <div className="info-container">
                    <p>{t("stats.basic.species_all")}</p>
                    <h3>{stats.total_species}</h3>
                </div>
                <div className="info-container">
                    <p>{t("stats.basic.species_unique")}</p>
                    <h3>{stats.unique_species}</h3>
                </div>
                </div>
                <div className='info-container'>
                    <p>{t("stats.hysto_title")}</p>
                    <BarChart
                        series={chartData.series}
                        xAxis={chartData.xAxis}
                        width={500}
                        height={400}
                        colors={['#2196F3']}
                    />
                </div>

                <div className='info-container'>
                    <p>{t("stats.table.title")}</p>
                    <table className='stats-table'>
                        <thead>
                        <tr>
                            <th>{t("stats.table.date")}</th>
                            <th>{t("stats.table.species")}</th>
                            <th>{t("stats.table.location")}</th>
                            <th>{t("stats.table.user")}</th>
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