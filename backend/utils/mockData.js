// Mock data for testing without MongoDB

class MockData {
  constructor() {
    this.documents = new Map();
    this.quizzes = new Map();
    this.sessions = new Map();
    this.users = new Map();
    this.analytics = new Map();
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  initializeSampleData() {
    // Sample document
    const sampleDoc = {
      _id: 'doc_sample_123',
      userId: 'temp_user',
      filename: 'sample_ml_textbook.pdf',
      originalName: 'Machine Learning Textbook.pdf',
      fileSize: 2048000,
      mimeType: 'application/pdf',
      filePath: '/uploads/sample_ml_textbook.pdf',
      status: 'complete',
      processingProgress: 100,
      processingMessage: 'Processing complete',
      rawText: 'Machine learning is a subset of artificial intelligence that focuses on algorithms and statistical models...',
      textChunks: [
        {
          id: 'chunk_1',
          content: 'Machine learning is a subset of artificial intelligence that focuses on algorithms and statistical models that enable computers to learn and make decisions from data.',
          chunkIndex: 0,
          pageNumber: 1,
          topic: 'Machine Learning Basics',
          wordCount: 25,
          startPosition: 0,
          endPosition: 150
        },
        {
          id: 'chunk_2', 
          content: 'Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes that process information.',
          chunkIndex: 1,
          pageNumber: 2,
          topic: 'Neural Networks',
          wordCount: 20,
          startPosition: 150,
          endPosition: 300
        }
      ],
      pageCount: 50,
      wordCount: 15000,
      quizCount: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.documents.set('doc_sample_123', sampleDoc);

    // Sample quiz
    const sampleQuiz = {
      _id: 'quiz_sample_456',
      userId: 'temp_user',
      documentId: 'doc_sample_123',
      title: 'Machine Learning Basics Quiz',
      settings: {
        questionCount: 5,
        difficulty: 'medium',
        questionTypes: ['multiple-choice', 'true-false'],
        adaptiveMode: true
      },
      questions: [
        {
          id: 'q1',
          question: 'What is machine learning?',
          type: 'multiple-choice',
          options: [
            'A type of computer hardware',
            'A subset of artificial intelligence',
            'A programming language',
            'A database system'
          ],
          correctAnswer: 'A subset of artificial intelligence',
          explanation: 'Machine learning is indeed a subset of AI that focuses on algorithms that can learn from data.',
          difficulty: 'easy',
          topic: 'Machine Learning Basics',
          sourceChunks: ['chunk_1'],
          sourceCitation: 'Page 1',
          sourcePages: [1],
          generatedAt: new Date()
        },
        {
          id: 'q2',
          question: 'Neural networks are inspired by biological systems.',
          type: 'true-false',
          correctAnswer: 'true',
          explanation: 'Neural networks are indeed inspired by biological neural networks found in animal brains.',
          difficulty: 'easy',
          topic: 'Neural Networks',
          sourceChunks: ['chunk_2'],
          sourceCitation: 'Page 2',
          sourcePages: [2],
          generatedAt: new Date()
        }
      ],
      status: 'ready',
      generationProgress: 100,
      generationMessage: 'Quiz generation complete',
      totalAttempts: 0,
      averageScore: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.quizzes.set('quiz_sample_456', sampleQuiz);

    // Sample user
    const sampleUser = {
      _id: 'user_temp',
      firebaseUid: 'temp_user',
      email: 'test@example.com',
      displayName: 'Test User',
      preferences: {
        defaultDifficulty: 'medium',
        preferredQuestionTypes: ['multiple-choice'],
        adaptiveLearning: true
      },
      stats: {
        totalQuizzes: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        averageScore: 0,
        averageResponseTime: 0,
        currentStreak: 0,
        longestStreak: 0
      },
      createdAt: new Date(),
      lastLoginAt: new Date()
    };

    this.users.set('temp_user', sampleUser);
  }

  // Mock database operations
  findDocument(query) {
    if (query._id) {
      return this.documents.get(query._id);
    }
    if (query.filename && query.filename.$regex) {
      // Simple regex matching for fileId
      const pattern = query.filename.$regex.replace(/^\^/, '').replace(/\$$/, '');
      for (const [id, doc] of this.documents) {
        if (doc.filename.includes(pattern)) {
          return doc;
        }
      }
    }
    return null;
  }

  findQuiz(id) {
    return this.quizzes.get(id);
  }

  findUser(firebaseUid) {
    return this.users.get(firebaseUid);
  }

  createSession(sessionData) {
    const sessionId = sessionData.sessionId;
    const session = {
      ...sessionData,
      _id: `session_${Date.now()}`,
      answers: [],
      adaptiveData: {
        correctAnswers: 0,
        totalAnswers: 0,
        currentAccuracy: 0,
        difficultyHistory: [{ difficulty: 'medium', timestamp: new Date() }],
        lastFiveAnswers: [],
        streakCount: 0,
        averageResponseTime: 0,
        topicPerformance: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }

  findSession(query) {
    if (query.sessionId) {
      return this.sessions.get(query.sessionId);
    }
    return null;
  }

  updateSession(sessionId, updateData) {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.assign(session, updateData);
      session.updatedAt = new Date();
      this.sessions.set(sessionId, session);
    }
    return session;
  }

  // Generate a new document ID for uploads
  generateDocumentId() {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate a new quiz ID
  generateQuizId() {
    return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get all documents for a user
  getUserDocuments(userId) {
    const userDocs = [];
    for (const [id, doc] of this.documents) {
      if (doc.userId === userId) {
        userDocs.push(doc);
      }
    }
    return userDocs.sort((a, b) => b.createdAt - a.createdAt);
  }

  // Get all quizzes for a user
  getUserQuizzes(userId) {
    const userQuizzes = [];
    for (const [id, quiz] of this.quizzes) {
      if (quiz.userId === userId) {
        userQuizzes.push(quiz);
      }
    }
    return userQuizzes.sort((a, b) => b.createdAt - a.createdAt);
  }

  // Add a new document
  addDocument(docData) {
    const id = this.generateDocumentId();
    const document = {
      _id: id,
      ...docData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.documents.set(id, document);
    return document;
  }

  // Add a new quiz
  addQuiz(quizData) {
    const id = this.generateQuizId();
    const quiz = {
      _id: id,
      ...quizData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.quizzes.set(id, quiz);
    return quiz;
  }

  // Update document
  updateDocument(id, updateData) {
    const doc = this.documents.get(id);
    if (doc) {
      Object.assign(doc, updateData);
      doc.updatedAt = new Date();
      this.documents.set(id, doc);
    }
    return doc;
  }

  // Update quiz
  updateQuiz(id, updateData) {
    const quiz = this.quizzes.get(id);
    if (quiz) {
      Object.assign(quiz, updateData);
      quiz.updatedAt = new Date();
      this.quizzes.set(id, quiz);
    }
    return quiz;
  }
}

// Export singleton instance
module.exports = new MockData();