const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const fetch = require('node-fetch');  // Для работы с API

const Users = require('./models/users');
const Items = require('./models/items');
const quizRoutes = require("./routes/quiz");
const adminRouter = require('./routes/admin');
const gameSearchRoutes = require('./routes/gameSearch');  // Путь к маршруту для поиска игр

const app = express();  // Инициализация express

const PORT = 3000;
const WEATHER_API_KEY = "d83716d85906320ec9f1e42a06418b0a";
const uri = 'mongodb+srv://admin:7VNevS5u90fQbwPG@cluster0.88dfs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Ваши API ключи
const apiKeyRAWG = '9ee73bdd2b004ef1a504a6a9e822b372';  // Замените на ваш ключ от RAWG
const apiKeyGiantBomb = '6a1792b69a6abdb655faf20673978c5ec89f341f';  // Замените на ваш ключ от Giant Bomb

// Используем маршруты для поиска игр
app.use(gameSearchRoutes);

// Подключение к MongoDB
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ Database connection error:', err));

// Настройка сессий
app.use(session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 }
}));

// Настройка парсинга данных
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Устанавливаем EJS как шаблонизатор
app.set('view engine', 'ejs');

// Маршруты
app.use("/quiz", quizRoutes);
app.use('/admin', authAdmin, adminRouter);

// Middleware для проверки авторизации пользователя
function authUser(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    return res.redirect('/');
}

// Middleware для проверки админ-доступа
function authAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.adminStatus) {
        return next();
    }
    return res.redirect('/mainPage');
}

// Роут для поиска игр через RAWG API и Giant Bomb API
app.get('/gameSearch', async (req, res) => {
    const query = req.query.query || '';  // Поиск по названию игры
    const genre = req.query.genre || '';  // Фильтрация по жанру

    // Формируем URL для запросов к RAWG API
    const rawgUrl = `https://api.rawg.io/api/games?key=${apiKeyRAWG}&page_size=10&search=${query}&genres=${genre}`;
    
    // Формируем URL для запросов к Giant Bomb API для получения даты выхода и разработчика
    const giantBombUrl = `https://www.giantbomb.com/api/search/?api_key=${apiKeyGiantBomb}&format=json&query=${query}&resources=games`;

    try {
        // Запрос к RAWG API
        const rawgResponse = await fetch(rawgUrl);
        const rawgData = await rawgResponse.json();

        // Запрос к Giant Bomb API
        const giantBombResponse = await fetch(giantBombUrl);
        const giantBombData = await giantBombResponse.json();

        // Отправка данных на страницу
        res.render('gameSearch', { 
            rawgGames: rawgData.results,  // Результаты от RAWG
            giantBombGames: giantBombData.results, // Результаты от Giant Bomb (дата выхода, разработчик)
        });
    } catch (error) {
        console.error('❌ Error fetching data from APIs:', error);
        res.send('Error fetching data from APIs');
    }
});

// Главная страница (Страница входа)
app.get('/', (req, res) => {
    res.render('loginPage', { ERROR_LOG: "" });
});

// Погода
app.get('/weather', authUser, async (req, res) => {
    try {
        const { lat = 51.15, lon = 71.42 } = req.query;
        const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
        );
        const weatherData = weatherResponse.data;
        const { temp, feels_like, humidity, pressure } = weatherData.main;
        const { speed: windSpeed } = weatherData.wind;
        const { icon, description } = weatherData.weather[0];
        const { country } = weatherData.sys;
        var curDate = new Date(Number(weatherData["dt"]) * 1000);
        curDate.setHours(curDate.getHours() + 5);
        var dt_txt = curDate.toISOString();

        res.render('weather', {
            CURRENT: dt_txt.substring(11, 19),
            TEMP: temp,
            FEEL: feels_like,
            HUM: humidity,
            PRESS: pressure,
            WIND: windSpeed,
            CODE: country,
            DESC: description,
            ICON: icon
        });
    } catch (error) {
        console.error("❌ Error fetching weather data:", error);
        res.status(500).send("Error fetching weather data.");
    }
});

// Главная страница с товарами
app.get('/mainPage', authUser, async (req, res) => {
    try {
        const items = await Items.find();
        res.render('mainPage', { items });
    } catch (error) {
        console.error("❌ Error loading main page:", error);
        res.status(500).send("Error loading main page.");
    }
});

// Страница регистрации
app.get('/register', (req, res) => {
    res.render("registerPage", { ERROR_LOG: "" });
});

// Обработка регистрации
app.post('/register', async (req, res) => {
    const { name, password } = req.body;

    try {
        const existingUser = await Users.findOne({ username: name });

        if (existingUser) {
            return res.render('registerPage', { ERROR_LOG: "This username is already chosen. Please choose another" });
        }

        const hash = await bcrypt.hash(password, 10);
        const newUser = new Users({
            username: name,
            password: hash,
            userID: Date.now(),
            creationDate: new Date(),
            adminStatus: false,
            deletionDate: null,
            updateDate: new Date()
        });

        await newUser.save();
        res.redirect('/');
    } catch (error) {
        console.error("❌ Error during registration:", error);
        res.status(500).send("Error during registration.");
    }
});

// Обработка выхода из системы
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Обработка входа в систему
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await Users.findOne({ username });

        if (!user) {
            return res.render('loginPage', { ERROR_LOG: "Invalid username or password" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.render('loginPage', { ERROR_LOG: "Invalid username or password" });
        }

        req.session.user = username;
        req.session.adminStatus = user.adminStatus;

        res.redirect('/mainPage');
    } catch (error) {
        console.error("❌ Error during login:", error);
        res.status(500).send("Error during login.");
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
