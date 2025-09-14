const Quiz = require('../models/Quiz');
const Document = require('../models/Document');
const llmOrchestrator = require('../services/llmOrchestrator');

class QuizController {
  constructor() {
    // Initialize LLM Orchestrator
    this.initializeLLM();
  }

  async initializeLLM() {
    try {
      await llmOrchestrator.initialize();
    } catch (error) {
      console.error('Failed to initialize LLM:', error);
    }
  }

  /**
   * Generate quiz from document
   * POST /api/generate-quiz
   */
  async generateQuiz(req, res) {
    try {
      const {
        documentId,
        questionCount = 5,
        difficulty = 'medium',
        questionTypes = ['multiple-choice'],
        title
      } = req.body;

      const userId = req.user?.firebaseUid || 'temp_user';

      // Validate input
      if (!documentId) {
        return res.status(400).json({
          success: false,
          message: 'Document ID is required'
        });
      }

      // Find the document
      const document = await Document.findById(documentId);
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      if (document.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      if (document.status !== 'complete') {
        return res.status(400).json({
          success: false,
          message: 'Document is still being processed'
        });
      }

      // Create quiz record
      const quiz = new Quiz({
        userId,
        documentId,
        title: title || `Quiz: ${document.originalName}`,
        settings: {
          questionCount,
          difficulty,
          questionTypes,
          adaptiveMode: true
        },
        status: 'generating',
        generationProgress: 0,
        generationMessage: 'Starting quiz generation...'
      });

      await quiz.save();

      // Start background generation
      this.generateQuizBackground(quiz._id, document)
        .catch(error => {
          console.error('Background quiz generation failed:', error);
        });

      // Return immediate response
      res.status(201).json({
        success: true,
        quizId: quiz._id,
        status: 'generating',
        message: 'Quiz generation started',
        estimatedTime: '2-3 minutes'
      });

    } catch (error) {
      console.error('Generate quiz error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start quiz generation',
        error: error.message
      });
    }
  }

  /**
   * Background quiz generation process
   * @param {string} quizId - Quiz ID
   * @param {Object} document - Document object
   */
  async generateQuizBackground(quizId, document) {
    try {
      // Update progress
      await this.updateQuizProgress(quizId, 10, 'Analyzing document content...');

      // Get text chunks
      const textChunks = document.textChunks || [];
      if (textChunks.length === 0) {
        throw new Error('No text chunks found in document');
      }

      await this.updateQuizProgress(quizId, 30, 'Generating topic tags...');

      // Generate topic tags for chunks
      const topics = await llmOrchestrator.generateTopicTags(textChunks);
      
      // Update chunks with topics
      for (let i = 0; i < textChunks.length && i < topics.length; i++) {
        textChunks[i].topic = topics[i];
      }

      await this.updateQuizProgress(quizId, 50, 'Creating quiz questions...');

      // Get quiz settings
      const quiz = await Quiz.findById(quizId);
      const { questionCount, difficulty, questionTypes } = quiz.settings;

      // Generate quiz questions
      const quizData = await llmOrchestrator.generateQuiz({
        textChunks,
        questionCount,
        difficulty,
        questionTypes,
        documentTitle: document.originalName
      });

      await this.updateQuizProgress(quizId, 80, 'Finalizing quiz...');

      // Update quiz with generated questions
      quiz.questions = quizData.questions;
      quiz.status = 'ready';
      quiz.generationProgress = 100;
      quiz.generationMessage = 'Quiz generation complete!';
      
      await quiz.save();

      // Update document quiz count
      await Document.findByIdAndUpdate(document._id, {
        $inc: { quizCount: 1 },
        lastUsed: new Date()
      });

      console.log(`✅ Quiz ${quizId} generated successfully`);

    } catch (error) {
      console.error('Background generation error:', error);
      
      await Quiz.findByIdAndUpdate(quizId, {
        status: 'failed',
        generationMessage: `Generation failed: ${error.message}`
      });
    }
  }

  /**
   * Get quiz by ID
   * GET /api/quiz/:quizId
   */
  async getQuiz(req, res) {
    try {
      const { quizId } = req.params;
      const userId = req.user?.firebaseUid || 'temp_user';

      const quiz = await Quiz.findById(quizId)
        .populate('documentId', 'originalName pageCount wordCount');

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      if (quiz.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        quiz: {
          id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          status: quiz.status,
          settings: quiz.settings,
          questions: quiz.questions,
          document: quiz.documentId,
          createdAt: quiz.createdAt,
          totalAttempts: quiz.totalAttempts
        }
      });

    } catch (error) {
      console.error('Get quiz error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get quiz',
        error: error.message
      });
    }
  }

  /**
   * Get quiz generation status
   * GET /api/quiz/:quizId/status
   */
  async getQuizStatus(req, res) {
    try {
      const { quizId } = req.params;
      const userId = req.user?.firebaseUid || 'temp_user';

      const quiz = await Quiz.findById(quizId)
        .select('status generationProgress generationMessage userId');

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      if (quiz.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        status: quiz.status,
        progress: quiz.generationProgress,
        message: quiz.generationMessage
      });

    } catch (error) {
      console.error('Get quiz status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get quiz status',
        error: error.message
      });
    }
  }

  /**
   * Get user's quizzes
   * GET /api/quizzes
   */
  async getUserQuizzes(req, res) {
    try {
      const userId = req.user?.firebaseUid || 'temp_user';
      const { page = 1, limit = 10 } = req.query;

      const quizzes = await Quiz.find({ userId })
        .populate('documentId', 'originalName')
        .select('title status settings createdAt totalAttempts averageScore')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Quiz.countDocuments({ userId });

      res.json({
        success: true,
        quizzes: quizzes.map(quiz => ({
          id: quiz._id,
          title: quiz.title,
          status: quiz.status,
          questionCount: quiz.settings.questionCount,
          difficulty: quiz.settings.difficulty,
          document: quiz.documentId?.originalName || 'Unknown',
          createdAt: quiz.createdAt,
          totalAttempts: quiz.totalAttempts,
          averageScore: quiz.averageScore
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Get user quizzes error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get quizzes',
        error: error.message
      });
    }
  }

  /**
   * Delete quiz
   * DELETE /api/quiz/:quizId
   */
  async deleteQuiz(req, res) {
    try {
      const { quizId } = req.params;
      const userId = req.user?.firebaseUid || 'temp_user';

      const quiz = await Quiz.findOneAndDelete({
        _id: quizId,
        userId
      });

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      // TODO: Delete associated sessions and results

      res.json({
        success: true,
        message: 'Quiz deleted successfully'
      });

    } catch (error) {
      console.error('Delete quiz error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete quiz',
        error: error.message
      });
    }
  }

  /**
   * Update quiz generation progress
   * @param {string} quizId 
   * @param {number} progress 
   * @param {string} message 
   */
  async updateQuizProgress(quizId, progress, message) {
    await Quiz.findByIdAndUpdate(quizId, {
      generationProgress: progress,
      generationMessage: message,
      updatedAt: new Date()
    });
  }
}

module.exports = new QuizController();