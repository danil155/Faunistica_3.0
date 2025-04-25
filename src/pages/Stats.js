import React from 'react';
import '../styles/stats.css';
import { BarChart } from '@mui/x-charts';


const StatsPage = () => {
    const mockStats = {
        totalArticles: 3000,
        processedArticles: 1000,
        addedIndividuals: 420,
        addedSpecies: 228,
        speciesStats: [
            { name: 'Liphistius albipes Schwendinger', count: 56 },
            { name: 'Liphistius tenuis', count: 43 },
            { name: 'Liphistius tham', count: 38 },
            { name: 'undefined', count: 205 }
        ], 
        recentEntries: [
            {date: '2022-2-2', species: 'Liphistius albipes Schwendinger', region: 'Пермский край', district: 'Кировский р-н', volunteer: 'latenight'},
            {date: '2025-3-2', species: 'Liphistius albipes Schwendinger', region: 'г. Москва', district: 'Битцевский парк', volunteer: 'Wels'},
            {date: '2025-3-22', species: 'Liphistius albipes Schwendinger', region: 'г. Москва', district: 'Мытищи', volunteer: 'Clown'},
            {date: '2025-3-24', species: 'Liphistius albipes Schwendinger', region: 'Челябинская обл.', district: ' Троицкий р-н', volunteer: 'Clown'}
        ]
    }

    const chartData = {
        series: [{
            data: mockStats.speciesStats.map(item => item.count),
            label: 'Количество особей',
        }],
        xAxis: [{
            data: mockStats.speciesStats.map(item => item.name),
            scaleType: 'band',
        }],
    };
    
    return (
        <div className="stats-container">
            <h1>Статистика</h1>
            <div id='stats'>
                <div>
                <div className='info-container'>
                    <p>Обработано {mockStats.processedArticles} статьи из {mockStats.totalArticles}</p>
                    <progress className="progress-bar" value={(mockStats.processedArticles/mockStats.totalArticles * 100).toFixed(2)} max={100} />
                </div>
                <div className='info-container'>
                    <p>Добавлено особей:</p>
                    <h3 className='stats-heading'>{mockStats.addedIndividuals}</h3>
                    <p>Добавлено <b>уникальных</b> особей:</p>
                    <h3 className='stats-heading'>{mockStats.addedSpecies}</h3>
                </div>
                </div>
                <div className='info-container'>
                    <p>Распределение видов:</p>
                    <BarChart series={chartData.series}
                                xAxis={chartData.xAxis}
                                width={400}
                                height={300}
                                colors={['#2196F3']} />
                </div>
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
                            {mockStats.recentEntries.map((entry) => (
                                <tr>
                                    <td>{entry.date}</td>
                                    <td>{entry.species}</td>
                                    <td>{entry.region + ", " + entry.district}</td>
                                    <td>{entry.volunteer}</td>
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