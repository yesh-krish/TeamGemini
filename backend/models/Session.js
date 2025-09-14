const mongoose = require('mongoose');

// Individual answer schema
const answerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  userAnswer: { type: String, required: true },
  correctAnswer: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  
  // Timing data
  responseTime: { type: Number, required: true }, // milliseconds
  timeToFirstInteraction: { type: Number }, // Time until user started answering
  
  // Adaptive learning data
  questionDifficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  topic: { type: String, required: true },
  
  // ELI5 usage
  eli5Requested: { type: Boolean, default: false },
  eli5Explanation: { type: String },
  
  answeredAt: { type: Date, default: Date.now }
});

// Adaptive performance tracking
const adaptiveDataSchema = new mongoose.Schema({
  correctAnswers: { type: Number, default: 0 },
  totalAnswers: { type: Number, default: 0 },
  currentAccuracy: { type: Number, default: 0 },
  
  // Difficulty progression
  difficultyHistory: [{ 
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Performance trends
  lastFiveAnswers: [{ type: Boolean }], // true for correct, false for incorrect
  streakCount: { type: Number, default: 0 },
  averageResponseTime: { type: Number, default: 0 },
  
  // Topic performance
  topicPerformance: [{
    topic: { type: String },
    correct: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 }
  }]
});

const sessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  
  // Session metadata
  sessionId: { type: String, required: true, unique: true },
  
  // Session status
  status: { 
    type: String, 
    enum: ['active', 'paused', 'completed', 'abandoned'], 
    default: 'active' 
  },
  
  // Progress tracking
  currentQuestionIndex: { type: Number, default: 0 },
  totalQuestions: { type: Number, required: true },
  
  // Answers and performance
  answers: [answerSchema],
  
  // Final results
  finalScore: { type: Number },
  finalAccuracy: { type: Number }, // percentage
  totalTime: { type: Number }, // total session time in milliseconds
  
  // Adaptive learning data
  adaptiveData: adaptiveDataSchema,
  
  // Session insights
  insights: {
    strongTopics: [{ type: String }],
    weakTopics: [{ type: String }],
    recommendedActions: [{ type: String }],
    learningVelocity: { type: Number }, // compared to user's baseline
    consistencyScore: { type: Number } // 0-100
  },
  
  // Timestamps
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  lastActivityAt: { type: Date, default: Date.now },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for performance (sessionId already has unique index, userId will be added manually)
sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ quizId: 1 });
sessionSchema.index({ status: 1 });

module.exports = mongoose.model('Session', sessionSchema);