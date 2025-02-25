const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz");
const QuizHistory = require("../models/QuizHistory");


// Получить 5 случайных вопросов
router.get("/", async (req, res) => {
  try {
    const questions = await Quiz.aggregate([{ $sample: { size: 5 } }]);
    res.render("quiz", { questions });
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка загрузки викторины");
  }
});

// Обработка ответов
router.post("/submit", async (req, res) => {
    console.log("Request Body:", req.body); // Отладочный лог
    
    if (!req.body || !req.body.answers) {
        return res.status(400).send("No answers submitted.");
    }

    const answers = req.body.answers; // Теперь `answers` не будет undefined

    const questions = await Quiz.find({});
    let score = 0;

    questions.forEach((question, index) => {
        if (answers[index].trim().toLowerCase() === question.answer.trim().toLowerCase()) {
            score++;
        }        
    });

    res.render("quizResult", { score, total: questions.length });
});

module.exports = router;
