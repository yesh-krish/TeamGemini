class AdaptiveEngine {
  constructor() {
    this.settings = {
      baselineAccuracy: 0.7, // 70% baseline
      adaptationThreshold: 0.15, // 15% threshold for changes
      streakBonus: 0.1, // 10% bonus for streaks
      minQuestionsForAdaptation: 3, // Minimum questions before adapting
      responseTimeWeight: 0.2, // How much response time affects difficulty
      topicMasteryThreshold: 0.8 // 80% accuracy = topic mastery
    };
  }

  /**
   * Analyze user performance and determine next difficulty
   * @param {Object} sessionData - Current session performance data
   * @param {string} currentDifficulty - Current difficulty level
   * @returns {Object} Adaptive recommendations
   */
  analyzePerformance(sessionData, currentDifficulty) {
    const {
      answers = [],
      correctAnswers = 0,
      totalAnswers = 0,
      averageResponseTime = 0,
      streakCount = 0,
      lastFiveAnswers = [],
      topicPerformance = {}
    } = sessionData;

    // Calculate current accuracy
    const currentAccuracy = totalAnswers > 0 ? correctAnswers / totalAnswers : 0;
    
    // Calculate recent accuracy (last 5 answers)
    const recentAccuracy = lastFiveAnswers.length > 0 
      ? lastFiveAnswers.filter(Boolean).length / lastFiveAnswers.length 
      : currentAccuracy;

    // Apply streak bonus
    const adjustedAccuracy = streakCount >= 3 
      ? Math.min(1, recentAccuracy + this.settings.streakBonus) 
      : recentAccuracy;

    // Analyze response time (faster = easier, slower = harder)
    const responseTimeFactor = this.analyzeResponseTime(averageResponseTime);
    
    // Determine if difficulty should change
    const nextDifficulty = this.calculateNextDifficulty(
      currentDifficulty, 
      adjustedAccuracy, 
      responseTimeFactor,
      totalAnswers
    );

    // Analyze topic performance
    const topicInsights = this.analyzeTopicPerformance(topicPerformance);

    // Generate performance insights
    const insights = this.generateInsights(sessionData, topicInsights);

    return {
      nextDifficulty,
      shouldAdapt: nextDifficulty !== currentDifficulty,
      currentAccuracy,
      recentAccuracy,
      adjustedAccuracy,
      responseTimeFactor,
      topicInsights,
      insights,
      confidence: this.calculateConfidence(totalAnswers)
    };
  }

  /**
   * Calculate next difficulty level
   * @param {string} currentDifficulty 
   * @param {number} adjustedAccuracy 
   * @param {number} responseTimeFactor 
   * @param {number} totalAnswers 
   * @returns {string} Next difficulty level
   */
  calculateNextDifficulty(currentDifficulty, adjustedAccuracy, responseTimeFactor, totalAnswers) {
    // Need minimum questions before adapting
    if (totalAnswers < this.settings.minQuestionsForAdaptation) {
      return currentDifficulty;
    }

    const difficultyLevels = ['easy', 'medium', 'hard'];
    const currentIndex = difficultyLevels.indexOf(currentDifficulty);
    
    // Combine accuracy and response time factors
    const combinedScore = adjustedAccuracy + (responseTimeFactor * this.settings.responseTimeWeight);
    
    // Determine direction of change
    if (combinedScore > this.settings.baselineAccuracy + this.settings.adaptationThreshold) {
      // Increase difficulty
      const newIndex = Math.min(difficultyLevels.length - 1, currentIndex + 1);
      return difficultyLevels[newIndex];
    } else if (combinedScore < this.settings.baselineAccuracy - this.settings.adaptationThreshold) {
      // Decrease difficulty
      const newIndex = Math.max(0, currentIndex - 1);
      return difficultyLevels[newIndex];
    }

    return currentDifficulty; // No change
  }

  /**
   * Analyze response time patterns
   * @param {number} averageResponseTime - Average response time in milliseconds
   * @returns {number} Response time factor (-1 to 1)
   */
  analyzeResponseTime(averageResponseTime) {
    // Optimal response time ranges (in seconds)
    const optimalRanges = {
      easy: { min: 10, max: 30 },
      medium: { min: 20, max: 45 },
      hard: { min: 30, max: 60 }
    };

    const responseTimeSeconds = averageResponseTime / 1000;
    
    // If very fast (< 10s), questions might be too easy
    if (responseTimeSeconds < 10) return 0.3;
    
    // If very slow (> 60s), questions might be too hard
    if (responseTimeSeconds > 60) return -0.3;
    
    // Normal range
    return 0;
  }

  /**
   * Analyze topic-based performance
   * @param {Object} topicPerformance - Performance by topic
   * @returns {Object} Topic insights
   */
  analyzeTopicPerformance(topicPerformance) {
    const topics = Object.keys(topicPerformance);
    const strongTopics = [];
    const weakTopics = [];
    const masteredTopics = [];

    topics.forEach(topic => {
      const { correct, total } = topicPerformance[topic];
      const accuracy = total > 0 ? correct / total : 0;

      if (accuracy >= this.settings.topicMasteryThreshold) {
        masteredTopics.push({ topic, accuracy });
      } else if (accuracy >= this.settings.baselineAccuracy) {
        strongTopics.push({ topic, accuracy });
      } else {
        weakTopics.push({ topic, accuracy });
      }
    });

    return {
      strongTopics: strongTopics.sort((a, b) => b.accuracy - a.accuracy),
      weakTopics: weakTopics.sort((a, b) => a.accuracy - b.accuracy),
      masteredTopics: masteredTopics.sort((a, b) => b.accuracy - a.accuracy)
    };
  }

  /**
   * Generate performance insights and recommendations
   * @param {Object} sessionData - Session performance data
   * @param {Object} topicInsights - Topic analysis results
   * @returns {Object} Performance insights
   */
  generateInsights(sessionData, topicInsights) {
    const { correctAnswers, totalAnswers, streakCount } = sessionData;
    const accuracy = totalAnswers > 0 ? correctAnswers / totalAnswers : 0;

    // Determine performance trend
    const trend = this.calculateTrend(sessionData.lastFiveAnswers);
    
    // Generate recommendation
    let recommendation = '';
    if (accuracy >= 0.8) {
      recommendation = 'Excellent performance! Ready for more challenging questions.';
    } else if (accuracy >= 0.6) {
      recommendation = 'Good progress. Continue at this pace for optimal learning.';
    } else {
      recommendation = 'Consider reviewing the material before continuing.';
    }

    // Add topic-specific recommendations
    if (topicInsights.weakTopics.length > 0) {
      const weakestTopic = topicInsights.weakTopics[0].topic;
      recommendation += ` Focus on improving your understanding of ${weakestTopic}.`;
    }

    return {
      accuracy,
      trend,
      recommendation,
      streakCount,
      strongAreas: topicInsights.strongTopics.map(t => t.topic),
      weakAreas: topicInsights.weakTopics.map(t => t.topic),
      masteredAreas: topicInsights.masteredTopics.map(t => t.topic)
    };
  }

  /**
   * Calculate performance trend from recent answers
   * @param {Array} lastFiveAnswers - Array of boolean values
   * @returns {string} Trend direction
   */
  calculateTrend(lastFiveAnswers) {
    if (lastFiveAnswers.length < 4) return 'stable';

    const firstHalf = lastFiveAnswers.slice(0, 2).filter(Boolean).length / 2;
    const secondHalf = lastFiveAnswers.slice(-2).filter(Boolean).length / 2;

    if (secondHalf > firstHalf + 0.2) return 'improving';
    if (secondHalf < firstHalf - 0.2) return 'declining';
    return 'stable';
  }

  /**
   * Calculate confidence level based on sample size
   * @param {number} totalAnswers - Total number of answers
   * @returns {string} Confidence level
   */
  calculateConfidence(totalAnswers) {
    if (totalAnswers < 5) return 'low';
    if (totalAnswers < 10) return 'medium';
    return 'high';
  }

  /**
   * Update session adaptive data
   * @param {Object} sessionData - Current session data
   * @param {boolean} isCorrect - Whether the answer was correct
   * @param {number} responseTime - Response time in milliseconds
   * @param {string} topic - Question topic
   * @returns {Object} Updated session data
   */
  updateSessionData(sessionData, isCorrect, responseTime, topic) {
    const updatedData = { ...sessionData };

    // Update basic counters
    updatedData.totalAnswers = (updatedData.totalAnswers || 0) + 1;
    if (isCorrect) {
      updatedData.correctAnswers = (updatedData.correctAnswers || 0) + 1;
      updatedData.streakCount = (updatedData.streakCount || 0) + 1;
    } else {
      updatedData.streakCount = 0;
    }

    // Update last five answers
    updatedData.lastFiveAnswers = updatedData.lastFiveAnswers || [];
    updatedData.lastFiveAnswers.push(isCorrect);
    if (updatedData.lastFiveAnswers.length > 5) {
      updatedData.lastFiveAnswers.shift();
    }

    // Update average response time
    const currentAvg = updatedData.averageResponseTime || 0;
    const totalAnswers = updatedData.totalAnswers;
    updatedData.averageResponseTime = 
      (currentAvg * (totalAnswers - 1) + responseTime) / totalAnswers;

    // Update topic performance
    updatedData.topicPerformance = updatedData.topicPerformance || {};
    if (!updatedData.topicPerformance[topic]) {
      updatedData.topicPerformance[topic] = { correct: 0, total: 0 };
    }
    
    updatedData.topicPerformance[topic].total += 1;
    if (isCorrect) {
      updatedData.topicPerformance[topic].correct += 1;
    }

    return updatedData;
  }

  /**
   * Generate adaptive prompt parameters for next question
   * @param {Object} analysis - Performance analysis results
   * @param {Array} availableTopics - Available topics to choose from
   * @returns {Object} Prompt parameters
   */
  generateAdaptivePromptParams(analysis, availableTopics = []) {
    const { insights, topicInsights, nextDifficulty } = analysis;

    // Determine focus topics
    let focusTopics = [];
    if (topicInsights.weakTopics.length > 0) {
      // Focus on weak topics for improvement
      focusTopics = topicInsights.weakTopics.slice(0, 2).map(t => t.topic);
    } else if (topicInsights.strongTopics.length > 0) {
      // Challenge with strong topics at higher difficulty
      focusTopics = topicInsights.strongTopics.slice(0, 2).map(t => t.topic);
    }

    return {
      targetDifficulty: nextDifficulty,
      focusTopics,
      userPerformance: insights.accuracy,
      strongTopics: insights.strongAreas,
      weakTopics: insights.weakAreas,
      adaptationReason: this.getAdaptationReason(analysis)
    };
  }

  /**
   * Get human-readable adaptation reason
   * @param {Object} analysis - Performance analysis
   * @returns {string} Adaptation reason
   */
  getAdaptationReason(analysis) {
    const { shouldAdapt, nextDifficulty, insights } = analysis;
    
    if (!shouldAdapt) {
      return 'Maintaining current difficulty level based on performance';
    }

    if (insights.accuracy > 0.8) {
      return `Increasing difficulty to ${nextDifficulty} - you're doing great!`;
    } else if (insights.accuracy < 0.6) {
      return `Adjusting to ${nextDifficulty} difficulty to help you learn better`;
    }

    return `Adapting difficulty to ${nextDifficulty} based on your progress`;
  }
}

module.exports = new AdaptiveEngine();