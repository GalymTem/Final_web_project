const express = require('express');
const axios = require('axios');
const fetch = require('node-fetch');  // Для работы с API
const router = express.Router();

// Массив для хранения истории запросов
const requestHistory = [];  // Хранит запросы и их ответы

// API ключ для RAWG
const rawgApiKey = '9ee73bdd2b004ef1a504a6a9e822b372';  // Замените на ваш ключ от RAWG

// API ключ для Giant Bomb
const apiKeyGiantBomb = '6a1792b69a6abdb655faf20673978c5ec89f341f';  // Замените на ваш ключ от Giant Bomb

// Обработка GET запроса для поиска игр
router.get('/gameSearch', async (req, res) => {
    const query = req.query.query || '';  // Поиск по названию игры
    const genre = req.query.genre || '';  // Фильтрация по жанру, если есть

    // Формируем URL для запросов к RAWG API
    const rawgUrl = `https://api.rawg.io/api/games?key=${rawgApiKey}&page_size=10&search=${query}&genres=${genre}`;
    
    // Формируем URL для запросов к Giant Bomb API для получения даты выхода и разработчика
    const giantBombUrl = `https://www.giantbomb.com/api/search/?api_key=${apiKeyGiantBomb}&format=json&query=${query}&resources=games`;

    try {
        // Запрос к RAWG API
        const rawgResponse = await fetch(rawgUrl);
        const rawgData = await rawgResponse.json();

        // Запрос к Giant Bomb API
        const giantBombResponse = await fetch(giantBombUrl);
        const giantBombData = await giantBombResponse.json();

        // Ищем первую игру из ответа Giant Bomb
        const gameId = giantBombData.results[0]?.id;

        // Если игра найдена, делаем второй запрос для получения подробной информации о ней
        let gameDetails = {};
        if (gameId) {
            const gameDetailsUrl = `https://www.giantbomb.com/api/game/${gameId}/?api_key=${apiKeyGiantBomb}&format=json`;
            const gameDetailsResponse = await fetch(gameDetailsUrl);
            const gameDetailsData = await gameDetailsResponse.json();
            gameDetails = gameDetailsData.results;
        }

        // Добавляем запрос и результат в историю
        requestHistory.push({
            query: query,
            genre: genre,
            response: rawgData.results,  // Сохраняем результаты от RAWG (с картинками)
            gameDetails: gameDetails  // Добавляем дату выхода от Giant Bomb
        });

        // Отправка данных на страницу
        res.render('gameSearch', { 
            rawgGames: rawgData.results,  // Результаты от RAWG
            gameDetails,  // Дата выхода игры от Giant Bomb
            requestHistory  // История запросов
        });
    } catch (error) {
        console.error("❌ Error fetching data from RAWG or Giant Bomb API:", error);
        res.send('Error fetching data from APIs');
    }
});

module.exports = router;
