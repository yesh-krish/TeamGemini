const Analytics = require('../models/Analytics');
const Session = require('../models/Session');
const User = require('../models/User');
const Quiz = require('../models/Quiz');

class AnalyticsService {
  /**
   * Calculate and update user analytics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated analytics
   */
  async calculateUserAnalytics(userId) {
    try {
      // Get all completed sessions for user
      const sessions = await Session.find({
        userId,
        status: 'completed',
        finalAccuracy: { $exists: true }
      }).sort({ completedAt: 1 });

      if (sessions.length === 0) {
        return this.createEmptyAnalytics(userId);
      }

      // Calculate overall stats
      const overallStats = this.calculateOverallStats(sessions);
      
      // Calculate daily stats
      const dailyStats = this.calculateDailyStats(sessions);
      
      // Calculate topic stats
      const topicStats = this.calculateTopicStats(sessions);
      
      // Calculate trends
      const trends = this.calculateTrends(sessions, dailyStats);
      
      // Generate adaptive insights
      const adaptiveInsights = this.generateAdaptiveInsights(sessions, topicStats);

      // Update or create analytics record
      const analytics = await Analytics.findOneAndUpdate(
        { userId },
        {
          userId,
          overallStats,
          dailyStats,
          topicStats,
          trends,
          adaptiveInsights,
          lastCalculated: new Date()
        },
        { upsert: true, new: true }
      );

      return analytics;

    } catch (error) {
      console.error('Calculate user analytics error:', error);
      throw error;
    }
  }

  /**
   * Calculate overall performance statistics
   * @param {Array} sessions - User sessions
   * @returns {Object} Overall stats
   */
  calculateOverallStats(sessions) {
    const totalQuizzes = sessions.length;
    const totalQuestions = sessions.reduce((sum, session) => sum + session.answers.length, 0);
    const totalCorrect = sessions.reduce((sum, session) => 
      sum + session.answers.filter(a => a.isCorrect).length, 0);
    
    const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    
    // Calculate average response time
    const allAnswers = sessions.flatMap(session => session.answers);
    const averageResponseTime = allAnswers.length > 0 
      ? allAnswers.reduce((sum, answer) => sum + answer.responseTime, 0) / allAnswers.length
      : 0;

    // Calculate total time spent
    const totalTimeSpent = sessions.reduce((sum, session) => sum + (session.totalTime || 0), 0);

    // Calculate streaks
    const { currentStreak, longestStreak } = this.calculateStreaks(sessions);

    // Calculate consistency score
    const consistencyScore = this.calculateOverallConsistency(sessions);

    // Calculate learning velocity
    const { learningVelocity, baselineAccuracy } = this.calculateLearningVelocity(sessions);

    return {
      totalQuizzes,
      totalQuestions,
      totalCorrect,
      overallAccuracy: Math.round(overallAccuracy),
      averageResponseTime: Math.round(averageResponseTime),
      totalTimeSpent,
      currentStreak,
      longestStreak,
      consistencyScore,
      learningVelocity,
      baselineAccuracy
    };
  }

  /**
   * Calculate daily performance statistics
   * @param {Array} sessions - User sessions
   * @returns {Array} Daily stats
   */
  calculateDailyStats(sessions) {
    const dailyData = {};

    sessions.forEach(session => {
      const date = session.completedAt.toISOString().split('T')[0];
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date: new Date(date),
          questionsAnswered: 0,
          correctAnswers: 0,
          quizzesCompleted: 0,
          timeSpent: 0,
          difficultyBreakdown: {
            easy: { correct: 0, total: 0 },
            medium: { correct: 0, total: 0 },
            hard: { correct: 0, total: 0 }
          }
        };
      }

      const dayData = dailyData[date];
      dayData.quizzesCompleted += 1;
      dayData.timeSpent += session.totalTime || 0;

      session.answers.forEach(answer => {
        dayData.questionsAnswered += 1;
        if (answer.isCorrect) {
          dayData.correctAnswers += 1;
        }

        // Update difficulty breakdown
        const difficulty = answer.questionDifficulty || 'medium';
        if (dayData.difficultyBreakdown[difficulty]) {
          dayData.difficultyBreakdown[difficulty].total += 1;
          if (answer.isCorrect) {
            dayData.difficultyBreakdown[difficulty].correct += 1;
          }
        }
      });

      // Calculate accuracy and average response time
      dayData.accuracy = dayData.questionsAnswered > 0 
        ? (dayData.correctAnswers / dayData.questionsAnswered) * 100 
        : 0;
      
      const dayAnswers = session.answers;
      dayData.averageResponseTime = dayAnswers.length > 0
        ? dayAnswers.reduce((sum, a) => sum + a.responseTime, 0) / dayAnswers.length
        : 0;
    });

    return Object.values(dailyData).sort((a, b) => a.date - b.date);
  }

  /**
   * Calculate topic-based performance statistics
   * @param {Array} sessions - User sessions
   * @returns {Array} Topic stats
   */
  calculateTopicStats(sessions) {
    const topicData = {};

    sessions.forEach(session => {
      session.answers.forEach(answer => {
        const topic = answer.topic || 'Unknown';
        
        if (!topicData[topic]) {
          topicData[topic] = {
            topic,
            questionsAnswered: 0,
            correctAnswers: 0,
            totalResponseTime: 0,
            difficultyDistribution: {
              easy: 0,
              medium: 0,
              hard: 0
            },
            lastPracticed: answer.answeredAt,
            masteryLevel: 'beginner'
          };
        }

        const topicStats = topicData[topic];
        topicStats.questionsAnswered += 1;
        topicStats.totalResponseTime += answer.responseTime;
        
        if (answer.isCorrect) {
          topicStats.correctAnswers += 1;
        }

        // Update difficulty distribution
        const difficulty = answer.questionDifficulty || 'medium';
        if (topicStats.difficultyDistribution[difficulty] !== undefined) {
          topicStats.difficultyDistribution[difficulty] += 1;
        }

        // Update last practiced
        if (answer.answeredAt > topicStats.lastPracticed) {
          topicStats.lastPracticed = answer.answeredAt;
        }
      });
    });

    // Calculate derived stats and mastery levels
    return Object.values(topicData).map(topic => {
      topic.accuracy = topic.questionsAnswered > 0 
        ? (topic.correctAnswers / topic.questionsAnswered) * 100 
        : 0;
      
      topic.averageResponseTime = topic.questionsAnswered > 0
        ? topic.totalResponseTime / topic.questionsAnswered
        : 0;

      // Determine mastery level
      if (topic.accuracy >= 85 && topic.questionsAnswered >= 5) {
        topic.masteryLevel = 'advanced';
      } else if (topic.accuracy >= 70 && topic.questionsAnswered >= 3) {
        topic.masteryLevel = 'intermediate';
      } else {
        topic.masteryLevel = 'beginner';
      }

      // Remove temporary field
      delete topic.totalResponseTime;

      return topic;
    }).sort((a, b) => b.accuracy - a.accuracy);
  }

  /**
   * Calculate performance trends
   * @param {Array} sessions - User sessions
   * @param {Array} dailyStats - Daily statistics
   * @returns {Object} Trend analysis
   */
  calculateTrends(sessions, dailyStats) {
    if (sessions.length < 3) {
      return {
        accuracyTrend: 'stable',
        speedTrend: 'stable',
        difficultyTrend: 'stable',
        engagementTrend: 'stable'
      };
    }

    // Accuracy trend
    const recentAccuracy = this.getRecentAverage(dailyStats, 'accuracy', 7);
    const olderAccuracy = this.getOlderAverage(dailyStats, 'accuracy', 7, 14);
    const accuracyTrend = this.determineTrend(recentAccuracy, olderAccuracy, 5);

    // Speed trend (response time)
    const recentSpeed = this.getRecentAverage(dailyStats, 'averageResponseTime', 7);
    const olderSpeed = this.getOlderAverage(dailyStats, 'averageResponseTime', 7, 14);
    const speedTrend = this.determineTrend(olderSpeed, recentSpeed, 2000); // Inverted for speed

    // Difficulty trend
    const difficultyTrend = this.calculateDifficultyTrend(sessions);

    // Engagement trend (quizzes per day)
    const recentEngagement = this.getRecentAverage(dailyStats, 'quizzesCompleted', 7);
    const olderEngagement = this.getOlderAverage(dailyStats, 'quizzesCompleted', 7, 14);
    const engagementTrend = this.determineTrend(recentEngagement, olderEngagement, 0.5);

    return {
      accuracyTrend,
      speedTrend,
      difficultyTrend,
      engagementTrend
    };
  }

  /**
   * Generate adaptive learning insights
   * @param {Array} sessions - User sessions
   * @param {Array} topicStats - Topic statistics
   * @returns {Object} Adaptive insights
   */
  generateAdaptiveInsights(sessions, topicStats) {
    // Determine preferred difficulty
    const difficultyPerformance = this.analyzeDifficultyPerformance(sessions);
    const preferredDifficulty = this.getPreferredDifficulty(difficultyPerformance);

    // Calculate optimal session length
    const optimalSessionLength = this.calculateOptimalSessionLength(sessions);

    // Determine best performance time
    const bestPerformanceTime = this.getBestPerformanceTime(sessions);

    // Identify weak and strong areas
    const weakAreas = topicStats
      .filter(topic => topic.accuracy < 70)
      .map(topic => topic.topic)
      .slice(0, 3);

    const strongAreas = topicStats
      .filter(topic => topic.accuracy >= 85)
      .map(topic => topic.topic)
      .slice(0, 3);

    // Generate recommendations
    const recommendedFocus = this.generateRecommendations(topicStats, sessions);

    return {
      preferredDifficulty,
      optimalSessionLength,
      bestPerformanceTime,
      weakAreas,
      strongAreas,
      recommendedFocus
    };
  }

  /**
   * Calculate streaks from sessions
   * @param {Array} sessions - User sessions
   * @returns {Object} Streak information
   */
  calculateStreaks(sessions) {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Sort sessions by completion date
    const sortedSessions = sessions.sort((a, b) => a.completedAt - b.completedAt);

    sortedSessions.forEach(session => {
      const accuracy = session.finalAccuracy || 0;
      
      if (accuracy >= 70) { // Consider 70%+ as a "good" session
        tempStreak += 1;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    // Current streak is the streak at the end
    const recentSessions = sortedSessions.slice(-10);
    for (let i = recentSessions.length - 1; i >= 0; i--) {
      const accuracy = recentSessions[i].finalAccuracy || 0;
      if (accuracy >= 70) {
        currentStreak += 1;
      } else {
        break;
      }
    }

    return { currentStreak, longestStreak };
  }

  /**
   * Calculate overall consistency score
   * @param {Array} sessions - User sessions
   * @returns {number} Consistency score (0-100)
   */
  calculateOverallConsistency(sessions) {
    if (sessions.length < 3) return 100;

    const accuracies = sessions.map(s => s.finalAccuracy || 0);
    const mean = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / accuracies.length;
    const standardDeviation = Math.sqrt(variance);

    // Lower standard deviation = higher consistency
    const consistencyScore = Math.max(0, 100 - (standardDeviation * 2));
    return Math.round(consistencyScore);
  }

  /**
   * Calculate learning velocity
   * @param {Array} sessions - User sessions
   * @returns {Object} Learning velocity data
   */
  calculateLearningVelocity(sessions) {
    if (sessions.length < 4) {
      return { learningVelocity: 0, baselineAccuracy: 0 };
    }

    const sortedSessions = sessions.sort((a, b) => a.completedAt - b.completedAt);
    const firstQuarter = sortedSessions.slice(0, Math.ceil(sessions.length / 4));
    const lastQuarter = sortedSessions.slice(-Math.ceil(sessions.length / 4));

    const baselineAccuracy = firstQuarter.reduce((sum, s) => sum + (s.finalAccuracy || 0), 0) / firstQuarter.length;
    const currentAccuracy = lastQuarter.reduce((sum, s) => sum + (s.finalAccuracy || 0), 0) / lastQuarter.length;

    const learningVelocity = Math.round(currentAccuracy - baselineAccuracy);

    return { learningVelocity, baselineAccuracy: Math.round(baselineAccuracy) };
  }

  /**
   * Get recent average for a metric
   * @param {Array} dailyStats - Daily statistics
   * @param {string} metric - Metric name
   * @param {number} days - Number of recent days
   * @returns {number} Average value
   */
  getRecentAverage(dailyStats, metric, days) {
    const recentData = dailyStats.slice(-days);
    if (recentData.length === 0) return 0;
    
    return recentData.reduce((sum, day) => sum + (day[metric] || 0), 0) / recentData.length;
  }

  /**
   * Get older average for comparison
   * @param {Array} dailyStats - Daily statistics
   * @param {string} metric - Metric name
   * @param {number} skipDays - Days to skip from end
   * @param {number} takeDays - Days to take for average
   * @returns {number} Average value
   */
  getOlderAverage(dailyStats, metric, skipDays, takeDays) {
    const startIndex = Math.max(0, dailyStats.length - skipDays - takeDays);
    const endIndex = Math.max(0, dailyStats.length - skipDays);
    const olderData = dailyStats.slice(startIndex, endIndex);
    
    if (olderData.length === 0) return 0;
    
    return olderData.reduce((sum, day) => sum + (day[metric] || 0), 0) / olderData.length;
  }

  /**
   * Determine trend direction
   * @param {number} recent - Recent value
   * @param {number} older - Older value
   * @param {number} threshold - Threshold for change
   * @returns {string} Trend direction
   */
  determineTrend(recent, older, threshold) {
    const difference = recent - older;
    
    if (Math.abs(difference) < threshold) return 'stable';
    return difference > 0 ? 'improving' : 'declining';
  }

  /**
   * Calculate difficulty trend
   * @param {Array} sessions - User sessions
   * @returns {string} Difficulty trend
   */
  calculateDifficultyTrend(sessions) {
    if (sessions.length < 5) return 'stable';

    const recentSessions = sessions.slice(-5);
    const olderSessions = sessions.slice(-10, -5);

    const getAvgDifficulty = (sessionList) => {
      const difficultyMap = { easy: 1, medium: 2, hard: 3 };
      let totalDifficulty = 0;
      let count = 0;

      sessionList.forEach(session => {
        session.answers.forEach(answer => {
          const difficulty = answer.questionDifficulty || 'medium';
          totalDifficulty += difficultyMap[difficulty] || 2;
          count += 1;
        });
      });

      return count > 0 ? totalDifficulty / count : 2;
    };

    const recentAvg = getAvgDifficulty(recentSessions);
    const olderAvg = getAvgDifficulty(olderSessions);

    return this.determineTrend(recentAvg, olderAvg, 0.3);
  }

  /**
   * Analyze difficulty performance
   * @param {Array} sessions - User sessions
   * @returns {Object} Difficulty performance analysis
   */
  analyzeDifficultyPerformance(sessions) {
    const difficultyStats = {
      easy: { correct: 0, total: 0, avgTime: 0 },
      medium: { correct: 0, total: 0, avgTime: 0 },
      hard: { correct: 0, total: 0, avgTime: 0 }
    };

    sessions.forEach(session => {
      session.answers.forEach(answer => {
        const difficulty = answer.questionDifficulty || 'medium';
        if (difficultyStats[difficulty]) {
          difficultyStats[difficulty].total += 1;
          difficultyStats[difficulty].avgTime += answer.responseTime;
          if (answer.isCorrect) {
            difficultyStats[difficulty].correct += 1;
          }
        }
      });
    });

    // Calculate accuracies and average times
    Object.keys(difficultyStats).forEach(difficulty => {
      const stats = difficultyStats[difficulty];
      stats.accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
      stats.avgTime = stats.total > 0 ? stats.avgTime / stats.total : 0;
    });

    return difficultyStats;
  }

  /**
   * Get preferred difficulty based on performance
   * @param {Object} difficultyPerformance - Difficulty performance data
   * @returns {string} Preferred difficulty
   */
  getPreferredDifficulty(difficultyPerformance) {
    const difficulties = ['easy', 'medium', 'hard'];
    let bestDifficulty = 'medium';
    let bestScore = 0;

    difficulties.forEach(difficulty => {
      const perf = difficultyPerformance[difficulty];
      if (perf.total >= 3) { // Need at least 3 questions for reliable data
        // Score based on accuracy and engagement (more questions = more engagement)
        const score = perf.accuracy * 0.7 + Math.min(perf.total / 10, 1) * 30;
        if (score > bestScore) {
          bestScore = score;
          bestDifficulty = difficulty;
        }
      }
    });

    return bestDifficulty;
  }

  /**
   * Calculate optimal session length
   * @param {Array} sessions - User sessions
   * @returns {number} Optimal session length in minutes
   */
  calculateOptimalSessionLength(sessions) {
    if (sessions.length < 3) return 15; // Default 15 minutes

    // Find sessions with best accuracy
    const goodSessions = sessions.filter(s => (s.finalAccuracy || 0) >= 75);
    
    if (goodSessions.length === 0) return 15;

    const avgLength = goodSessions.reduce((sum, s) => sum + (s.totalTime || 0), 0) / goodSessions.length;
    return Math.round(avgLength / (1000 * 60)); // Convert to minutes
  }

  /**
   * Get best performance time of day
   * @param {Array} sessions - User sessions
   * @returns {string} Best performance time
   */
  getBestPerformanceTime(sessions) {
    const timeSlots = {
      morning: { total: 0, accuracy: 0 },
      afternoon: { total: 0, accuracy: 0 },
      evening: { total: 0, accuracy: 0 },
      night: { total: 0, accuracy: 0 }
    };

    sessions.forEach(session => {
      const hour = session.startedAt.getHours();
      let timeSlot;
      
      if (hour >= 6 && hour < 12) timeSlot = 'morning';
      else if (hour >= 12 && hour < 17) timeSlot = 'afternoon';
      else if (hour >= 17 && hour < 22) timeSlot = 'evening';
      else timeSlot = 'night';

      timeSlots[timeSlot].total += 1;
      timeSlots[timeSlot].accuracy += session.finalAccuracy || 0;
    });

    // Calculate average accuracy for each time slot
    let bestTime = 'morning';
    let bestAccuracy = 0;

    Object.keys(timeSlots).forEach(time => {
      const slot = timeSlots[time];
      if (slot.total >= 2) { // Need at least 2 sessions for reliable data
        const avgAccuracy = slot.accuracy / slot.total;
        if (avgAccuracy > bestAccuracy) {
          bestAccuracy = avgAccuracy;
          bestTime = time;
        }
      }
    });

    return bestTime;
  }

  /**
   * Generate learning recommendations
   * @param {Array} topicStats - Topic statistics
   * @param {Array} sessions - User sessions
   * @returns {Array} Recommendations
   */
  generateRecommendations(topicStats, sessions) {
    const recommendations = [];

    // Focus on weak topics
    const weakTopics = topicStats.filter(t => t.accuracy < 70).slice(0, 2);
    if (weakTopics.length > 0) {
      recommendations.push(`Focus on improving: ${weakTopics.map(t => t.topic).join(', ')}`);
    }

    // Suggest practice frequency
    const daysSinceLastQuiz = sessions.length > 0 
      ? Math.floor((Date.now() - sessions[sessions.length - 1].completedAt) / (1000 * 60 * 60 * 24))
      : 0;

    if (daysSinceLastQuiz > 3) {
      recommendations.push('Regular practice recommended - try to take quizzes every 2-3 days');
    }

    // Difficulty recommendations
    const avgAccuracy = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.finalAccuracy || 0), 0) / sessions.length
      : 0;

    if (avgAccuracy > 85) {
      recommendations.push('Consider trying harder difficulty levels to challenge yourself');
    } else if (avgAccuracy < 60) {
      recommendations.push('Try easier questions to build confidence and understanding');
    }

    return recommendations.slice(0, 3); // Limit to 3 recommendations
  }

  /**
   * Create empty analytics for new users
   * @param {string} userId - User ID
   * @returns {Object} Empty analytics object
   */
  createEmptyAnalytics(userId) {
    return {
      userId,
      overallStats: {
        totalQuizzes: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        overallAccuracy: 0,
        averageResponseTime: 0,
        totalTimeSpent: 0,
        currentStreak: 0,
        longestStreak: 0,
        consistencyScore: 100,
        learningVelocity: 0,
        baselineAccuracy: 0
      },
      dailyStats: [],
      topicStats: [],
      trends: {
        accuracyTrend: 'stable',
        speedTrend: 'stable',
        difficultyTrend: 'stable',
        engagementTrend: 'stable'
      },
      adaptiveInsights: {
        preferredDifficulty: 'medium',
        optimalSessionLength: 15,
        bestPerformanceTime: 'morning',
        weakAreas: [],
        strongAreas: [],
        recommendedFocus: ['Start taking quizzes to get personalized insights']
      },
      lastCalculated: new Date()
    };
  }
}

module.exports = new AnalyticsService();