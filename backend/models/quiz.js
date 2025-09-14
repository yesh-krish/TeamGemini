const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  topic: { type: String, required: true },
  difficultyLevel: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  timeSpent: { type: Number },
});

const quizSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  quizTitle: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  score: { type: Number, required: true },
  timeTaken: { type: Number, required: true },
  sourceCitations: { type: Number },
  mistakeCount: { type: Number },
  questions: [questionSchema], // Array of question sub-documents
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Quiz', quizSchema);