const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  type: { type: String, enum: ['multiple-choice', 'true-false', 'short-answer'], required: true },

  // Multiple choice options
  options: [{ type: String }], // Only for multiple-choice questions

  correctAnswer: { type: String, required: true },
  explanation: { type: String, required: true },

  // RAG-specific fields
  sourceChunks: [{ type: String }], // IDs of text chunks used to generate this question
  sourceCitation: { type: String }, // "Page 15, Section 3.2"
  sourcePages: [{ type: Number }], // [15, 16]

  // Difficulty and topic
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  topic: { type: String, required: true }, // Auto-generated topic tag

  // Generation metadata
  generatedAt: { type: Date, default: Date.now },
  promptUsed: { type: String }, // Store the prompt for debugging
});

const quizSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },

  // Quiz metadata
  title: { type: String, required: true },
  description: { type: String },

  // Generation settings
  settings: {
    questionCount: { type: Number, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    questionTypes: [{ type: String, enum: ['multiple-choice', 'true-false', 'short-answer'] }],
    adaptiveMode: { type: Boolean, default: true }
  },

  // Quiz content
  questions: [questionSchema],

  // Status tracking
  status: {
    type: String,
    enum: ['generating', 'ready', 'failed'],
    default: 'generating'
  },
  generationProgress: { type: Number, default: 0 }, // 0-100
  generationMessage: { type: String },

  // Analytics
  totalAttempts: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for performance
quizSchema.index({ userId: 1, createdAt: -1 });
quizSchema.index({ documentId: 1 });
quizSchema.index({ status: 1 });

module.exports = mongoose.model('Quiz', quizSchema);