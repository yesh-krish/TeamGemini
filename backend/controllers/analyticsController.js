const analyticsService = require('../services/analyticsService');
const Session = require('../models/Session');
const Analytics = require('../models/Analytics');
const llmOrchestrator = require('../services/llmOrchestrator');

class AnalyticsController {
  /**
   * Get user's performance analytics
   * GET /api/analytics/performance
   */
  async getPerformanceAnalytics(req, res) {
    try {
      const userId = req.user?.firebaseUid || 'temp_user';

      // Calculate and get latest analytics
      const analytics = await analyticsService.calculateUserAnalytics(userId);

      // Format response to match frontend expectations
      const response = {
        success: true,
        performance: {
          overallAccuracy: analytics.overallStats.overallAccuracy,
          averageResponseTime: Math.round(analytics.overallStats.averageResponseTime / 1000), // Convert to seconds
          adaptiveProgress: this.calculateAdaptiveProgress(analytics),
          consistencyScore: analytics.overallStats.consistencyScore,
          
          // Additional metrics
          totalQuizzes: analytics.overallStats.totalQuizzes,
          totalQuestions: analytics.overallStats.totalQuestions,
          currentStreak: analytics.overallStats.currentStreak,
          longestStreak: analytics.overallStats.longestStreak,
          learningVelocity: analytics.overallStats.learningVelocity,
          
          // Time-based metrics
          totalTimeSpent: Math.round(analytics.overallStats.totalTimeSpent / (1000 * 60)), // Convert to minutes
          averageSessionLength: analytics.adaptiveInsights.optimalSessionLength,
          bestPerformanceTime: analytics.adaptiveInsights.bestPerformanceTime
        },
        lastUpdated: analytics.lastCalculated
      };

      res.json(response);

    } catch (error) {
      console.error('Get performance analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get performance analytics',
        error: error.message
      });
    }
  }

  /**
   * Get performance trends over time
   * GET /api/analytics/trends
   */
  async getPerformanceTrends(req, res) {
    try {
      const userId = req.user?.firebaseUid || 'temp_user';
      const { days = 30 } = req.query;

      const analytics = await Analytics.findOne({ userId });
      
      if (!analytics) {
        return res.json({
          success: true,
          trends: {
            performanceData: [],
            trends: {
              accuracyTrend: 'stable',
              speedTrend: 'stable',
              difficultyTrend: 'stable',
              engagementTrend: 'stable'
            }
          }
        });
      }

      // Filter daily stats for requested period
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
      
      const recentDailyStats = analytics.dailyStats.filter(
        day => new Date(day.date) >= cutoffDate
      );

      // Format for frontend charts (matching frontend expectations)
      const performanceData = recentDailyStats.map(day => ({
        date: day.date.toISOString().split('T')[0], // YYYY-MM-DD format
        score: Math.round(day.accuracy),
        difficulty: this.getDominantDifficulty(day.difficultyBreakdown),
        questionsAnswered: day.questionsAnswered,
        timeSpent: Math.round(day.timeSpent / (1000 * 60)), // Convert to minutes
        responseTime: Math.round(day.averageResponseTime / 1000) // Convert to seconds
      }));

      res.json({
        success: true,
        trends: {
          performanceData,
          trends: analytics.trends,
          summary: {
            totalDays: recentDailyStats.length,
            averageScore: this.calculateAverageScore(recentDailyStats),
            totalQuestions: recentDailyStats.reduce((sum, day) => sum + day.questionsAnswered, 0),
            totalTime: Math.round(recentDailyStats.reduce((sum, day) => sum + day.timeSpent, 0) / (1000 * 60))
          }
        }
      });

    } catch (error) {
      console.error('Get performance trends error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get performance trends',
        error: error.message
      });
    }
  }

  /**
   * Get topic-based performance analytics
   * GET /api/analytics/topics
   */
  async getTopicAnalytics(req, res) {
    try {
      const userId = req.user?.firebaseUid || 'temp_user';

      const analytics = await Analytics.findOne({ userId });
      
      if (!analytics || !analytics.topicStats) {
        return res.json({
          success: true,
          topics: {
            topicBreakdown: [],
            strongTopics: [],
            weakTopics: [],
            masteryLevels: { beginner: 0, intermediate: 0, advanced: 0 }
          }
        });
      }

      // Format topic data for frontend
      const topicBreakdown = analytics.topicStats.map(topic => ({
        topic: topic.topic,
        accuracy: Math.round(topic.accuracy),
        questionsAnswered: topic.questionsAnswered,
        correctAnswers: topic.correctAnswers,
        averageResponseTime: Math.round(topic.averageResponseTime / 1000), // Convert to seconds
        masteryLevel: topic.masteryLevel,
        lastPracticed: topic.lastPracticed,
        difficultyDistribution: topic.difficultyDistribution
      }));

      // Separate strong and weak topics
      const strongTopics = topicBreakdown.filter(t => t.accuracy >= 80);
      const weakTopics = topicBreakdown.filter(t => t.accuracy < 70);

      // Calculate mastery level distribution
      const masteryLevels = {
        beginner: analytics.topicStats.filter(t => t.masteryLevel === 'beginner').length,
        intermediate: analytics.topicStats.filter(t => t.masteryLevel === 'intermediate').length,
        advanced: analytics.topicStats.filter(t => t.masteryLevel === 'advanced').length
      };

      res.json({
        success: true,
        topics: {
          topicBreakdown: topicBreakdown.sort((a, b) => b.accuracy - a.accuracy),
          strongTopics: strongTopics.slice(0, 5),
          weakTopics: weakTopics.slice(0, 5),
          masteryLevels,
          insights: {
            totalTopics: analytics.topicStats.length,
            masteredTopics: masteryLevels.advanced,
            needsWork: weakTopics.length,
            recommendations: analytics.adaptiveInsights.recommendedFocus
          }
        }
      });

    } catch (error) {
      console.error('Get topic analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get topic analytics',
        error: error.message
      });
    }
  }

  /**
   * Get difficulty distribution analytics
   * GET /api/analytics/difficulty
   */
  async getDifficultyAnalytics(req, res) {
    try {
      const userId = req.user?.firebaseUid || 'temp_user';

      const analytics = await Analytics.findOne({ userId });
      
      if (!analytics || !analytics.dailyStats) {
        return res.json({
          success: true,
          difficulty: {
            distribution: [
              { difficulty: 'Easy', count: 0, accuracy: 0, color: '#22c55e' },
              { difficulty: 'Medium', count: 0, accuracy: 0, color: '#eab308' },
              { difficulty: 'Hard', count: 0, accuracy: 0, color: '#ef4444' }
            ],
            preferredDifficulty: 'medium',
            recommendations: []
          }
        });
      }

      // Aggregate difficulty data from daily stats
      const difficultyAgg = {
        easy: { total: 0, correct: 0 },
        medium: { total: 0, correct: 0 },
        hard: { total: 0, correct: 0 }
      };

      analytics.dailyStats.forEach(day => {
        Object.keys(day.difficultyBreakdown).forEach(difficulty => {
          const data = day.difficultyBreakdown[difficulty];
          difficultyAgg[difficulty].total += data.total;
          difficultyAgg[difficulty].correct += data.correct;
        });
      });

      // Format for frontend
      const distribution = [
        {
          difficulty: 'Easy',
          count: difficultyAgg.easy.total,
          accuracy: difficultyAgg.easy.total > 0 
            ? Math.round((difficultyAgg.easy.correct / difficultyAgg.easy.total) * 100) 
            : 0,
          color: '#22c55e'
        },
        {
          difficulty: 'Medium',
          count: difficultyAgg.medium.total,
          accuracy: difficultyAgg.medium.total > 0 
            ? Math.round((difficultyAgg.medium.correct / difficultyAgg.medium.total) * 100) 
            : 0,
          color: '#eab308'
        },
        {
          difficulty: 'Hard',
          count: difficultyAgg.hard.total,
          accuracy: difficultyAgg.hard.total > 0 
            ? Math.round((difficultyAgg.hard.correct / difficultyAgg.hard.total) * 100) 
            : 0,
          color: '#ef4444'
        }
      ];

      // Generate recommendations
      const recommendations = this.generateDifficultyRecommendations(distribution, analytics);

      res.json({
        success: true,
        difficulty: {
          distribution,
          preferredDifficulty: analytics.adaptiveInsights.preferredDifficulty,
          recommendations,
          insights: {
            totalQuestions: Object.values(difficultyAgg).reduce((sum, d) => sum + d.total, 0),
            overallTrend: analytics.trends.difficultyTrend,
            adaptiveEnabled: true
          }
        }
      });

    } catch (error) {
      console.error('Get difficulty analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get difficulty analytics',
        error: error.message
      });
    }
  }

  /**
   * Get detailed session analytics
   * GET /api/session/:sessionId
   */
  async getSessionAnalytics(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.firebaseUid || 'temp_user';

      const session = await Session.findOne({ sessionId, userId })
        .populate('quizId', 'title settings');

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Calculate detailed session metrics
      const sessionAnalytics = this.calculateSessionAnalytics(session);

      res.json({
        success: true,
        session: {
          id: session.sessionId,
          quiz: session.quizId,
          status: session.status,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
          duration: session.totalTime,
          
          // Performance metrics
          score: session.finalScore,
          accuracy: session.finalAccuracy,
          totalQuestions: session.totalQuestions,
          
          // Detailed analytics
          analytics: sessionAnalytics,
          
          // Adaptive data
          adaptiveData: session.adaptiveData,
          insights: session.insights
        }
      });

    } catch (error) {
      console.error('Get session analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get session analytics',
        error: error.message
      });
    }
  }

  /**
   * Generate personalized study guide
   * POST /api/export-study-guide
   */
  async generateStudyGuide(req, res) {
    try {
      const { sessionId, quizId } = req.body;
      const userId = req.user?.firebaseUid || 'temp_user';

      if (!sessionId && !quizId) {
        return res.status(400).json({
          success: false,
          message: 'Either sessionId or quizId is required'
        });
      }

      let session;
      if (sessionId) {
        session = await Session.findOne({ sessionId, userId });
      } else {
        // Find the most recent session for this quiz
        session = await Session.findOne({ quizId, userId, status: 'completed' })
          .sort({ completedAt: -1 });
      }

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'No completed session found'
        });
      }

      // Get incorrect answers
      const incorrectAnswers = session.answers.filter(answer => !answer.isCorrect);
      
      if (incorrectAnswers.length === 0) {
        return res.json({
          success: true,
          studyGuide: "Congratulations! You answered all questions correctly. Keep up the excellent work!",
          type: 'success'
        });
      }

      // Get weak topics from session insights
      const weakTopics = session.insights?.weakTopics || [];

      // Generate study guide using LLM
      const studyGuide = await this.generatePersonalizedStudyGuide({
        incorrectAnswers,
        weakTopics,
        userName: 'Student', // Could get from user profile
        sessionData: session
      });

      res.json({
        success: true,
        studyGuide,
        type: 'improvement',
        metadata: {
          sessionId: session.sessionId,
          incorrectCount: incorrectAnswers.length,
          weakTopics,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Generate study guide error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate study guide',
        error: error.message
      });
    }
  }

  /**
   * Calculate adaptive progress score
   * @param {Object} analytics - Analytics data
   * @returns {number} Adaptive progress score (0-100)
   */
  calculateAdaptiveProgress(analytics) {
    const factors = [
      analytics.overallStats.overallAccuracy * 0.4, // 40% weight on accuracy
      Math.min(analytics.overallStats.totalQuizzes * 5, 100) * 0.2, // 20% weight on engagement
      analytics.overallStats.consistencyScore * 0.2, // 20% weight on consistency
      Math.max(0, analytics.overallStats.learningVelocity + 50) * 0.2 // 20% weight on improvement
    ];

    return Math.round(factors.reduce((sum, factor) => sum + factor, 0));
  }

  /**
   * Get dominant difficulty from breakdown
   * @param {Object} difficultyBreakdown - Difficulty breakdown data
   * @returns {string} Dominant difficulty
   */
  getDominantDifficulty(difficultyBreakdown) {
    let maxCount = 0;
    let dominant = 'medium';

    Object.keys(difficultyBreakdown).forEach(difficulty => {
      const count = difficultyBreakdown[difficulty].total;
      if (count > maxCount) {
        maxCount = count;
        dominant = difficulty;
      }
    });

    return dominant;
  }

  /**
   * Calculate average score from daily stats
   * @param {Array} dailyStats - Daily statistics
   * @returns {number} Average score
   */
  calculateAverageScore(dailyStats) {
    if (dailyStats.length === 0) return 0;
    
    const totalAccuracy = dailyStats.reduce((sum, day) => sum + day.accuracy, 0);
    return Math.round(totalAccuracy / dailyStats.length);
  }

  /**
   * Generate difficulty recommendations
   * @param {Array} distribution - Difficulty distribution
   * @param {Object} analytics - Analytics data
   * @returns {Array} Recommendations
   */
  generateDifficultyRecommendations(distribution, analytics) {
    const recommendations = [];

    // Check performance on each difficulty
    distribution.forEach(diff => {
      if (diff.count >= 5) { // Need sufficient data
        if (diff.accuracy >= 90) {
          recommendations.push(`Excellent performance on ${diff.difficulty.toLowerCase()} questions - consider moving up!`);
        } else if (diff.accuracy < 60) {
          recommendations.push(`Focus on improving ${diff.difficulty.toLowerCase()} question accuracy`);
        }
      }
    });

    // Overall trend recommendation
    if (analytics.trends.difficultyTrend === 'increasing') {
      recommendations.push('Great job adapting to harder questions!');
    } else if (analytics.trends.difficultyTrend === 'decreasing') {
      recommendations.push('Take time to master current difficulty before advancing');
    }

    return recommendations.slice(0, 3);
  }

  /**
   * Calculate detailed session analytics
   * @param {Object} session - Session data
   * @returns {Object} Session analytics
   */
  calculateSessionAnalytics(session) {
    const answers = session.answers || [];
    
    // Time analysis
    const responseTimes = answers.map(a => a.responseTime);
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;
    
    // Topic analysis
    const topicPerformance = {};
    answers.forEach(answer => {
      const topic = answer.topic || 'Unknown';
      if (!topicPerformance[topic]) {
        topicPerformance[topic] = { correct: 0, total: 0 };
      }
      topicPerformance[topic].total += 1;
      if (answer.isCorrect) {
        topicPerformance[topic].correct += 1;
      }
    });

    // Difficulty progression
    const difficultyProgression = session.adaptiveData?.difficultyHistory || [];

    return {
      averageResponseTime: Math.round(avgResponseTime / 1000), // Convert to seconds
      topicPerformance,
      difficultyProgression,
      streakCount: session.adaptiveData?.streakCount || 0,
      adaptationCount: difficultyProgression.length - 1,
      learningVelocity: session.insights?.learningVelocity || 0,
      consistencyScore: session.insights?.consistencyScore || 100
    };
  }

  /**
   * Generate personalized study guide
   * @param {Object} params - Study guide parameters
   * @returns {Promise<string>} Generated study guide
   */
  async generatePersonalizedStudyGuide(params) {
    try {
      const { incorrectAnswers, weakTopics, userName, sessionData } = params;

      // Initialize LLM if needed
      if (!llmOrchestrator.model) {
        await llmOrchestrator.initialize();
      }

      // Use LLM to generate study guide (if available)
      if (llmOrchestrator.model) {
        const prompts = require('../utils/prompts');
        const prompt = prompts.getStudyGuidePrompt({
          incorrectAnswers,
          weakTopics,
          userName
        });

        const result = await llmOrchestrator.model.generateContent(prompt);
        return result.response.text();
      }

      // Fallback to template-based study guide
      return this.generateTemplateStudyGuide(params);

    } catch (error) {
      console.error('Generate personalized study guide error:', error);
      return this.generateTemplateStudyGuide(params);
    }
  }

  /**
   * Generate template-based study guide
   * @param {Object} params - Study guide parameters
   * @returns {string} Template study guide
   */
  generateTemplateStudyGuide(params) {
    const { incorrectAnswers, weakTopics, userName = 'Student' } = params;

    let guide = `# Personalized Study Guide for ${userName}\n\n`;
    guide += `Generated on: ${new Date().toLocaleDateString()}\n\n`;

    if (weakTopics.length > 0) {
      guide += `## Areas for Improvement\n\n`;
      guide += `Focus your study efforts on these topics:\n`;
      weakTopics.forEach(topic => {
        guide += `- **${topic}**: Review key concepts and practice more questions\n`;
      });
      guide += `\n`;
    }

    if (incorrectAnswers.length > 0) {
      guide += `## Questions to Review\n\n`;
      incorrectAnswers.slice(0, 5).forEach((answer, index) => {
        guide += `### Question ${index + 1}: ${answer.topic}\n`;
        guide += `**Your Answer:** ${answer.userAnswer}\n`;
        guide += `**Correct Answer:** ${answer.correctAnswer}\n`;
        guide += `**Key Learning Point:** Review the concepts related to ${answer.topic}\n\n`;
      });
    }

    guide += `## Study Recommendations\n\n`;
    guide += `1. **Review Fundamentals**: Go back to basic concepts in your weak areas\n`;
    guide += `2. **Practice Regularly**: Take quizzes every 2-3 days to maintain progress\n`;
    guide += `3. **Focus on Understanding**: Don't just memorize - understand the 'why' behind answers\n`;
    guide += `4. **Track Progress**: Monitor your improvement in weak topic areas\n\n`;

    guide += `## Next Steps\n\n`;
    guide += `- Retake quizzes focusing on your weak topics\n`;
    guide += `- Spend extra time studying the concepts you missed\n`;
    guide += `- Consider easier difficulty levels if you're struggling\n\n`;

    guide += `Keep up the great work! Learning is a journey, and every mistake is an opportunity to improve. 🚀`;

    return guide;
  }
}

module.exports = new AnalyticsController();