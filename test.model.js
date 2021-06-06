const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const QuestionsSchema = new Schema({
    //TODO Обдумать автоиндексы в вопросах и вариантах ответов
    question: {type: String, required: true},
    options: [
        {
            option: {type: String, required: true},
            aftertext: {type: String, required: false}
        }
    ],
    truth: {type: Number, required: true}
})

const ResultsSchema = new Schema({
    _id: {type: Number, required: true, index: true},
    score: {type: Number, required: true},
    attemptsLeft: {type: Number, required: true}
})

//TODO Добавить везде тримы пробелов
// либо найти глобальное решение этой проблемы
const testSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String, required: false},
    ownerID: {type: Number, required: true},
    isGroup: {type: Boolean, required: true},
    isActive: {type: Boolean, required: true},
    showAnswers: {type: Boolean, required: true},
    numberOfAttempts: {type: Number, required: true},
    questions: [QuestionsSchema],
    finals: [{type: String, required: true}],
    results: [ResultsSchema]
}, {
    timestamps: true,
});

const Test = mongoose.model('Test', testSchema, "Tests");

module.exports = Test;