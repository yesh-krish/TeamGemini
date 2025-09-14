const mongoose = require('mongoose');

// Daily performance aggregation
const dailyStatsSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  questionsAnswered: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  averageResponseTime: { type: Number, default: 0 },
  quizzesCompleted: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 }, // total time in milliseconds
  
  // Difficulty breakdown
  difficultyBreakdown: {
    easy: { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
    medium: { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
    hard: { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } }
  }
});

// Topic performance tracking
const topicStatsSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  questionsAnswered: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  averageResponseTime: { type: Number, default: 0 },
  difficultyDistribution: {
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 }
  },
  lastPracticed: { type: Date },
  masteryLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' }
});

const analyticsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  
  // Overall performance metrics
  overallStats: {
    totalQuizzes: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    overallAccuracy: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 },
    
    // Streaks and consistency
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    consistencyScore: { type: Number, default: 0 }, // 0-100
    
    // Learning velocity (improvement rate)
    learningVelocity: { type: Number, default: 0 }, // percentage improvement
    baselineAccuracy: { type: Number, default: 0 }
  },
  
  // Time-series performance data
  dailyStats: [dailyStatsSchema],
  
  // Topic-based performance
  topicStats: [topicStatsSchema],
  
  // Adaptive learning insights
  adaptiveInsights: {
    preferredDifficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    optimalSessionLength: { type: Number }, // in minutes
    bestPerformanceTime: { type: String }, // time of day
    weakAreas: [{ type: String }],
    strongAreas: [{ type: String }],
    recommendedFocus: [{ type: String }]
  },
  
  // Performance trends
  trends: {
    accuracyTrend: { type: String, enum: ['improving', 'stable', 'declining'] },
    speedTrend: { type: String, enum: ['faster', 'stable', 'slower'] },
    difficultyTrend: { type: String, enum: ['increasing', 'stable', 'decreasing'] },
    engagementTrend: { type: String, enum: ['increasing', 'stable', 'decreasing'] }
  },
  
  // Last updated timestamp
  lastCalculated: { type: Date, default: Date.now },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for performance
analyticsSchema.index({ userId: 1 });
analyticsSchema.index({ 'dailyStats.date': 1 });
analyticsSchema.index({ 'topicStats.topic': 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);