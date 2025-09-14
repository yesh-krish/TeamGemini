const mongoose = require('mongoose');

const conceptualKnowledgeSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  score: { type: Number, required: true },
  questionsAnswered: { type: Number, required: true },
});

const learningMetricsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  overallMasteryScore: { type: Number, default: 0 },
  avgTimePerQuestion: { type: Number, default: 0 },
  quizCompletionRate: { type: Number, default: 0 },
  totalQuizzes: { type: Number, default: 0 },
  studyStreak: { type: Number, default: 0 },
  totalStudyTime: { type: Number, default: 0 },
  eli5UsageCount: { type: Number, default: 0 },
  conceptualKnowledgeScores: [conceptualKnowledgeSchema], // Array of sub-documents
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('LearningMetrics', learningMetricsSchema);