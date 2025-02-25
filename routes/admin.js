const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const Users = require('../models/users');
const Items = require('../models/items');
const Quiz = require('../models/Quiz');

// Страница администрирования
router.get('/', async (req, res) => {
    try {
        const users = await Users.find();  // Получаем всех пользователей
        const items = await Items.find();  // Получаем все товары
        const quiz = await Quiz.find();  // Получаем все вопросы викторины

        // Отправляем данные в шаблон admin.ejs
        res.render('admin', { users, items, quiz, ERROR_LOG: "" });
    } catch (err) {
        console.error("❌ Error fetching data:", err);
        res.status(500).send("Error fetching data.");
    }
});

// Обработка добавления нового пользователя
router.post('/addUser', async (req, res) => {
    const { username, password, adminStatus } = req.body;

    try {
        const existingUser = await Users.findOne({ username });

        if (existingUser) {
            return res.render('admin', { users: await Users.find(), items: await Items.find(), quiz: await Quiz.find(), ERROR_LOG: "This username is already chosen. Please choose another" });
        }

        const hash = await bcrypt.hash(password, 10);

        const newUser = new Users({
            username,
            password: hash,
            userID: Date.now(),
            creationDate: new Date(),
            adminStatus: adminStatus === 'on',
            deletionDate: null,
            updateDate: new Date()
        });

        await newUser.save();
        res.redirect('/admin');
    } catch (err) {
        console.error("❌ Error during user creation:", err);
        res.status(500).send("Error during user creation.");
    }
});

// Страница редактирования вопроса
router.get('/editQuestion/:id', async (req, res) => {
    try {
        const question = await Quiz.findById(req.params.id);
        if (!question) {
            return res.status(404).send("Question not found");
        }
        res.render('editQuestion', { question });
    } catch (err) {
        console.error("❌ Error fetching question:", err);
        res.status(500).send("Error fetching question");
    }
});

// Обработка редактирования вопроса
router.post('/editQuestion/:id', async (req, res) => {
    const { question, option1, option2, option3, option4, answer } = req.body;

    try {
        const updatedQuestion = await Quiz.findByIdAndUpdate(req.params.id, {
            question,
            options: [option1, option2, option3, option4],
            answer
        }, { new: true });

        if (!updatedQuestion) {
            return res.status(404).send("Question not found");
        }

        res.redirect('/admin');
    } catch (err) {
        console.error("❌ Error updating question:", err);
        res.status(500).send("Error updating question.");
    }
});

// Добавление нового вопроса
router.post('/addQuestion', async (req, res) => {
    const { question, option1, option2, option3, option4, answer } = req.body;

    const newQuestion = new Quiz({
        question,
        options: [option1, option2, option3, option4],
        answer
    });

    try {
        await newQuestion.save();
        res.redirect('/admin');
    } catch (err) {
        console.error("❌ Error adding question:", err);
        res.status(500).send("Error adding question.");
    }
});

// Удаление вопроса
router.post('/deleteQuestion/:id', async (req, res) => {
    try {
        const deletedQuestion = await Quiz.findByIdAndDelete(req.params.id);
        if (!deletedQuestion) {
            return res.status(404).send("Question not found");
        }
        res.redirect('/admin');
    } catch (err) {
        console.error("❌ Error deleting question:", err);
        res.status(500).send("Error deleting question.");
    }
});

// Удаление пользователя
router.post('/delete/:id', async (req, res) => {
    try {
        const deletedUser = await Users.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).send("User not found");
        }
        res.redirect('/admin');
    } catch (err) {
        console.error("❌ Error deleting user:", err);
        res.status(500).send("Error deleting user.");
    }
});

module.exports = router;
