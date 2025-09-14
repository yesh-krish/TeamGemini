const mongoose = require('mongoose');

// Text chunk schema for RAG
const textChunkSchema = new mongoose.Schema({
  id: { type: String, required: true },
  content: { type: String, required: true },
  pageNumber: { type: Number },
  chunkIndex: { type: Number, required: true },
  
  // Vector embedding for semantic search
  embedding: [{ type: Number }], // High-dimensional vector from Gemini
  
  // Metadata
  topic: { type: String }, // Auto-generated topic tag
  wordCount: { type: Number },
  startPosition: { type: Number }, // Character position in original document
  endPosition: { type: Number },
  
  createdAt: { type: Date, default: Date.now }
});

const documentSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  
  // File information
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  fileSize: { type: Number, required: true }, // in bytes
  mimeType: { type: String, required: true },
  filePath: { type: String, required: true }, // Local storage path
  
  // Processing status
  status: { 
    type: String, 
    enum: ['uploading', 'processing', 'chunking', 'embedding', 'complete', 'failed'], 
    default: 'uploading' 
  },
  processingProgress: { type: Number, default: 0 }, // 0-100
  processingMessage: { type: String },
  errorMessage: { type: String },
  
  // Extracted content
  rawText: { type: String }, // Full extracted text
  textChunks: [textChunkSchema], // Chunked text with embeddings
  
  // Document metadata
  pageCount: { type: Number },
  wordCount: { type: Number },
  language: { type: String, default: 'en' },
  
  // Topics extracted from document
  topics: [{ 
    name: { type: String },
    confidence: { type: Number },
    chunkIds: [{ type: String }] // Which chunks contain this topic
  }],
  
  // Usage statistics
  quizCount: { type: Number, default: 0 },
  lastUsed: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for performance
documentSchema.index({ userId: 1, createdAt: -1 });
documentSchema.index({ status: 1 });
documentSchema.index({ 'textChunks.id': 1 });

module.exports = mongoose.model('Document', documentSchema);