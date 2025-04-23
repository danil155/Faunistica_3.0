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
                <div className='info-container'>
                    <p>Обработано {mockStats.processedArticles} статьи из {mockStats.totalArticles}</p>
                    <progress className="progress-bar" value={mockStats.processedArticles} max={mockStats.totalArticles}/>
                </div>
                <div className='info-container'>
                    <p>Добавлено особей:</p>
                    <h3 className='stats-heading'>{mockStats.addedIndividuals}</h3>
                    <p>Добавлено <b>уникальных</b> особей:</p>
                    <h3 className='stats-heading'>{mockStats.addedSpecies}</h3>
                </div>
                <div className='info-container'>
                    <p>Распределение видов:</p>
                    <BarChart series={chartData.series}
                                xAxis={chartData.xAxis}
                                width={400}
                                height={300} />
                </div>
            </div>
        </div>
    );
};

export default StatsPage;