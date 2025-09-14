const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true }, // Firebase Auth UID
  email: { type: String, required: true, unique: true },
  displayName: { type: String },
  
  
  // Learning preferences
  preferences: {
    defaultDifficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    preferredQuestionTypes: [{ type: String, enum: ['multiple-choice', 'true-false', 'short-answer'] }],
    adaptiveLearning: { type: Boolean, default: true }
  },
  
  // Performance tracking
  stats: {
    totalQuizzes: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 }
  },
  
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for performance (removed duplicates since unique: true already creates indexes)

module.exports = mongoose.model('User', userSchema);