const Session = require('../models/Session');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const adaptiveEngine = require('../services/adaptiveEngine');
const llmOrchestrator = require('../services/llmOrchestrator');

class AnswerController {
  /**
   * Start a new quiz session
   * POST /api/quiz/:quizId/start
   */
  async startQuizSession(req, res) {
    try {
      const { quizId } = req.params;
      const userId = req.user?.firebaseUid || 'temp_user';

      // Find the quiz
      const quiz = await Quiz.findById(quizId);
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

      if (quiz.status !== 'ready') {
        return res.status(400).json({
          success: false,
          message: 'Quiz is not ready yet'
        });
      }

      // Generate unique session ID
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create new session
      const session = new Session({
        userId,
        quizId,
        sessionId,
        totalQuestions: quiz.questions.length,
        adaptiveData: {
          correctAnswers: 0,
          totalAnswers: 0,
          currentAccuracy: 0,
          difficultyHistory: [{ difficulty: quiz.settings.difficulty, timestamp: new Date() }],
          lastFiveAnswers: [],
          streakCount: 0,
          averageResponseTime: 0,
          topicPerformance: []
        }
      });

      await session.save();

      // Update quiz attempt count
      await Quiz.findByIdAndUpdate(quizId, {
        $inc: { totalAttempts: 1 }
      });

      res.status(201).json({
        success: true,
        sessionId,
        message: 'Quiz session started',
        totalQuestions: quiz.questions.length,
        currentDifficulty: quiz.settings.difficulty
      });

    } catch (error) {
      console.error('Start quiz session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start quiz session',
        error: error.message
      });
    }
  }

  /**
   * Submit an answer and get adaptive feedback
   * POST /api/quiz/:quizId/answer
   */
  async submitAnswer(req, res) {
    try {
      const { quizId } = req.params;
      const { 
        sessionId, 
        questionId, 
        answer, 
        responseTime,
        timeToFirstInteraction = 0
      } = req.body;

      const userId = req.user?.firebaseUid || 'temp_user';

      // Validate input
      if (!sessionId || !questionId || !answer) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: sessionId, questionId, answer'
        });
      }

      // Find session
      const session = await Session.findOne({ sessionId, userId });
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Find quiz and question
      const quiz = await Quiz.findById(quizId);
      const question = quiz.questions.find(q => q.id === questionId);
      
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      // Check if already answered
      const existingAnswer = session.answers.find(a => a.questionId === questionId);
      if (existingAnswer) {
        return res.status(400).json({
          success: false,
          message: 'Question already answered'
        });
      }

      // Evaluate answer
      const isCorrect = this.evaluateAnswer(answer, question.correctAnswer, question.type);

      // Create answer record
      const answerRecord = {
        questionId,
        userAnswer: answer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        responseTime: responseTime || 30000,
        timeToFirstInteraction,
        questionDifficulty: question.difficulty,
        topic: question.topic,
        answeredAt: new Date()
      };

      // Update session with answer
      session.answers.push(answerRecord);
      session.currentQuestionIndex += 1;
      session.lastActivityAt = new Date();

      // Update adaptive data
      const updatedAdaptiveData = adaptiveEngine.updateSessionData(
        session.adaptiveData,
        isCorrect,
        responseTime || 30000,
        question.topic
      );

      session.adaptiveData = updatedAdaptiveData;

      // Analyze performance and get adaptive recommendations
      const currentDifficulty = this.getCurrentDifficulty(session.adaptiveData.difficultyHistory);
      const analysis = adaptiveEngine.analyzePerformance(updatedAdaptiveData, currentDifficulty);

      // Update difficulty if needed
      if (analysis.shouldAdapt) {
        session.adaptiveData.difficultyHistory.push({
          difficulty: analysis.nextDifficulty,
          timestamp: new Date()
        });
      }

      // Update topic performance in adaptive data
      this.updateTopicPerformance(session.adaptiveData, question.topic, isCorrect);

      await session.save();

      // Update user stats
      await this.updateUserStats(userId, isCorrect, responseTime);

      // Prepare response
      const response = {
        success: true,
        isCorrect,
        explanation: question.explanation,
        correctAnswer: question.correctAnswer,
        
        // Adaptive insights
        adaptiveInsights: {
          currentAccuracy: analysis.currentAccuracy,
          trend: analysis.insights.trend,
          recommendation: analysis.insights.recommendation,
          confidence: analysis.confidence,
          streakCount: updatedAdaptiveData.streakCount
        },

        // Next difficulty info
        nextDifficulty: analysis.nextDifficulty,
        difficultyChanged: analysis.shouldAdapt,
        adaptationReason: analysis.shouldAdapt ? 
          adaptiveEngine.getAdaptationReason(analysis) : null,

        // Progress info
        progress: {
          answered: session.answers.length,
          total: session.totalQuestions,
          percentage: Math.round((session.answers.length / session.totalQuestions) * 100)
        }
      };

      res.json(response);

    } catch (error) {
      console.error('Submit answer error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit answer',
        error: error.message
      });
    }
  }

  /**
   * Get next question with adaptive difficulty
   * GET /api/quiz/:quizId/next
   */
  async getNextQuestion(req, res) {
    try {
      const { quizId } = req.params;
      const { sessionId } = req.query;
      const userId = req.user?.firebaseUid || 'temp_user';

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required'
        });
      }

      // Find session
      const session = await Session.findOne({ sessionId, userId });
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Find quiz
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      // Check if quiz is complete
      if (session.currentQuestionIndex >= session.totalQuestions) {
        return res.status(400).json({
          success: false,
          message: 'Quiz already completed'
        });
      }

      // Get current difficulty
      const currentDifficulty = this.getCurrentDifficulty(session.adaptiveData.difficultyHistory);
      
      // Find next question based on adaptive difficulty
      const nextQuestion = this.selectNextQuestion(
        quiz.questions, 
        session.answers, 
        currentDifficulty,
        session.adaptiveData
      );

      if (!nextQuestion) {
        return res.status(404).json({
          success: false,
          message: 'No more questions available'
        });
      }

      // Return question without correct answer
      const questionResponse = {
        id: nextQuestion.id,
        question: nextQuestion.question,
        type: nextQuestion.type,
        options: nextQuestion.options,
        difficulty: nextQuestion.difficulty,
        topic: nextQuestion.topic,
        sourceCitation: nextQuestion.sourceCitation
      };

      res.json({
        success: true,
        question: questionResponse,
        progress: {
          current: session.currentQuestionIndex + 1,
          total: session.totalQuestions,
          percentage: Math.round(((session.currentQuestionIndex + 1) / session.totalQuestions) * 100)
        },
        currentDifficulty
      });

    } catch (error) {
      console.error('Get next question error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get next question',
        error: error.message
      });
    }
  }

  /**
   * Complete quiz session
   * POST /api/quiz/:quizId/complete
   */
  async completeQuizSession(req, res) {
    try {
      const { quizId } = req.params;
      const { sessionId } = req.body;
      const userId = req.user?.firebaseUid || 'temp_user';

      // Find session
      const session = await Session.findOne({ sessionId, userId });
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Calculate final results
      const totalAnswers = session.answers.length;
      const correctAnswers = session.answers.filter(a => a.isCorrect).length;
      const finalAccuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
      const totalTime = Date.now() - session.startedAt.getTime();

      // Generate insights
      const insights = this.generateSessionInsights(session);

      // Update session
      session.status = 'completed';
      session.completedAt = new Date();
      session.finalScore = correctAnswers;
      session.finalAccuracy = finalAccuracy;
      session.totalTime = totalTime;
      session.insights = insights;

      await session.save();

      // Update quiz average score
      await this.updateQuizAverageScore(quizId);

      res.json({
        success: true,
        results: {
          score: correctAnswers,
          total: totalAnswers,
          accuracy: Math.round(finalAccuracy),
          totalTime: Math.round(totalTime / 1000), // seconds
          insights
        },
        sessionId
      });

    } catch (error) {
      console.error('Complete quiz session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete quiz session',
        error: error.message
      });
    }
  }

  /**
   * Evaluate user answer against correct answer
   * @param {string} userAnswer 
   * @param {string} correctAnswer 
   * @param {string} questionType 
   * @returns {boolean}
   */
  evaluateAnswer(userAnswer, correctAnswer, questionType) {
    const normalizeAnswer = (answer) => answer.toLowerCase().trim();

    switch (questionType) {
      case 'multiple-choice':
      case 'true-false':
        return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
      
      case 'short-answer':
        // Simple keyword matching for short answers
        const userWords = normalizeAnswer(userAnswer).split(/\s+/);
        const correctWords = normalizeAnswer(correctAnswer).split(/\s+/);
        
        // Check if user answer contains key words from correct answer
        const keyWords = correctWords.filter(word => word.length > 3);
        const matchedWords = keyWords.filter(word => 
          userWords.some(userWord => userWord.includes(word) || word.includes(userWord))
        );
        
        return matchedWords.length >= Math.ceil(keyWords.length * 0.6); // 60% keyword match
      
      default:
        return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
    }
  }

  /**
   * Get current difficulty from history
   * @param {Array} difficultyHistory 
   * @returns {string}
   */
  getCurrentDifficulty(difficultyHistory) {
    if (!difficultyHistory || difficultyHistory.length === 0) {
      return 'medium';
    }
    return difficultyHistory[difficultyHistory.length - 1].difficulty;
  }

  /**
   * Select next question based on adaptive difficulty
   * @param {Array} allQuestions 
   * @param {Array} answeredQuestions 
   * @param {string} targetDifficulty 
   * @param {Object} adaptiveData 
   * @returns {Object|null}
   */
  selectNextQuestion(allQuestions, answeredQuestions, targetDifficulty, adaptiveData) {
    const answeredIds = new Set(answeredQuestions.map(a => a.questionId));
    const availableQuestions = allQuestions.filter(q => !answeredIds.has(q.id));

    if (availableQuestions.length === 0) {
      return null;
    }

    // First, try to find questions of target difficulty
    const targetDifficultyQuestions = availableQuestions.filter(q => q.difficulty === targetDifficulty);
    
    if (targetDifficultyQuestions.length > 0) {
      // Prefer questions from weak topics if available
      const weakTopics = this.getWeakTopics(adaptiveData);
      const weakTopicQuestions = targetDifficultyQuestions.filter(q => weakTopics.includes(q.topic));
      
      if (weakTopicQuestions.length > 0) {
        return weakTopicQuestions[0];
      }
      
      return targetDifficultyQuestions[0];
    }

    // Fallback to any available question
    return availableQuestions[0];
  }

  /**
   * Get weak topics from adaptive data
   * @param {Object} adaptiveData 
   * @returns {Array}
   */
  getWeakTopics(adaptiveData) {
    if (!adaptiveData.topicPerformance || adaptiveData.topicPerformance.length === 0) {
      return [];
    }

    return adaptiveData.topicPerformance
      .filter(tp => tp.accuracy < 0.7)
      .map(tp => tp.topic);
  }

  /**
   * Update topic performance in adaptive data
   * @param {Object} adaptiveData 
   * @param {string} topic 
   * @param {boolean} isCorrect 
   */
  updateTopicPerformance(adaptiveData, topic, isCorrect) {
    let topicPerf = adaptiveData.topicPerformance.find(tp => tp.topic === topic);
    
    if (!topicPerf) {
      topicPerf = { topic, correct: 0, total: 0, accuracy: 0 };
      adaptiveData.topicPerformance.push(topicPerf);
    }

    topicPerf.total += 1;
    if (isCorrect) {
      topicPerf.correct += 1;
    }
    topicPerf.accuracy = topicPerf.correct / topicPerf.total;
  }

  /**
   * Generate session insights
   * @param {Object} session 
   * @returns {Object}
   */
  generateSessionInsights(session) {
    const answers = session.answers;
    const totalAnswers = answers.length;
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    
    // Topic analysis
    const topicPerformance = {};
    answers.forEach(answer => {
      if (!topicPerformance[answer.topic]) {
        topicPerformance[answer.topic] = { correct: 0, total: 0 };
      }
      topicPerformance[answer.topic].total += 1;
      if (answer.isCorrect) {
        topicPerformance[answer.topic].correct += 1;
      }
    });

    const strongTopics = [];
    const weakTopics = [];
    
    Object.keys(topicPerformance).forEach(topic => {
      const perf = topicPerformance[topic];
      const accuracy = perf.correct / perf.total;
      
      if (accuracy >= 0.8) {
        strongTopics.push(topic);
      } else if (accuracy < 0.6) {
        weakTopics.push(topic);
      }
    });

    // Generate recommendations
    const recommendations = [];
    if (weakTopics.length > 0) {
      recommendations.push(`Review concepts related to: ${weakTopics.join(', ')}`);
    }
    if (strongTopics.length > 0) {
      recommendations.push(`Great job on: ${strongTopics.join(', ')}`);
    }

    // Calculate learning velocity (improvement over time)
    const learningVelocity = this.calculateLearningVelocity(answers);
    
    // Calculate consistency score
    const consistencyScore = this.calculateConsistencyScore(answers);

    return {
      strongTopics,
      weakTopics,
      recommendedActions: recommendations,
      learningVelocity,
      consistencyScore
    };
  }

  /**
   * Calculate learning velocity
   * @param {Array} answers 
   * @returns {number}
   */
  calculateLearningVelocity(answers) {
    if (answers.length < 4) return 0;

    const firstHalf = answers.slice(0, Math.floor(answers.length / 2));
    const secondHalf = answers.slice(Math.floor(answers.length / 2));

    const firstAccuracy = firstHalf.filter(a => a.isCorrect).length / firstHalf.length;
    const secondAccuracy = secondHalf.filter(a => a.isCorrect).length / secondHalf.length;

    return Math.round((secondAccuracy - firstAccuracy) * 100);
  }

  /**
   * Calculate consistency score
   * @param {Array} answers 
   * @returns {number}
   */
  calculateConsistencyScore(answers) {
    if (answers.length < 3) return 100;

    // Calculate variance in response times
    const responseTimes = answers.map(a => a.responseTime);
    const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const variance = responseTimes.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / responseTimes.length;
    
    // Lower variance = higher consistency
    const consistencyScore = Math.max(0, 100 - (variance / 1000)); // Normalize variance
    
    return Math.round(Math.min(100, consistencyScore));
  }

  /**
   * Update user statistics
   * @param {string} userId 
   * @param {boolean} isCorrect 
   * @param {number} responseTime 
   */
  async updateUserStats(userId, isCorrect, responseTime) {
    try {
      const updateData = {
        $inc: {
          'stats.totalQuestions': 1,
          'stats.correctAnswers': isCorrect ? 1 : 0
        },
        lastLoginAt: new Date()
      };

      // Update streak
      if (isCorrect) {
        updateData.$inc['stats.currentStreak'] = 1;
      } else {
        updateData['stats.currentStreak'] = 0;
      }

      await User.findOneAndUpdate(
        { firebaseUid: userId },
        updateData,
        { upsert: true }
      );
    } catch (error) {
      console.error('Update user stats error:', error);
    }
  }

  /**
   * Update quiz average score
   * @param {string} quizId 
   */
  async updateQuizAverageScore(quizId) {
    try {
      const sessions = await Session.find({ 
        quizId, 
        status: 'completed',
        finalAccuracy: { $exists: true }
      });

      if (sessions.length > 0) {
        const avgScore = sessions.reduce((sum, session) => sum + session.finalAccuracy, 0) / sessions.length;
        
        await Quiz.findByIdAndUpdate(quizId, {
          averageScore: Math.round(avgScore)
        });
      }
    } catch (error) {
      console.error('Update quiz average score error:', error);
    }
  }
}

module.exports = new AnswerController();