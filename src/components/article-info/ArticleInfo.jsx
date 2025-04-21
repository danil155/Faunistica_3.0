import React from 'react';


const ArticleInfo = () => {
    const mock = {
        name: 'Фаунистика',
        authors: 'Кузнецова Мария',
        year: '2025',
        isbn: 'uwu-uwu-uwu'
    };
    return (
        <div className='article-card'>
            <img src="https://placehold.co/120x120" alt="Обложка статьи" />
            <div id="article_info_container">
                <p>Название: {mock.name}</p>
                <p>Авторы: {mock.authors}</p>
                <p>Год издания: {mock.year}</p>
                <p>ISBN: {mock.isbn}</p>
            </div>
        </div>
    );
};

export default ArticleInfo