"use client"

export class AdaptiveQuizEngine {
  constructor() {
    this.performance = {
      correctAnswers: 0,
      totalAnswers: 0,
      averageResponseTime: 0,
      difficultyHistory: [],
      streakCount: 0,
      lastFiveAnswers: [],
    }

    this.settings = {
      baselineAccuracy: 0.7, // 70% baseline
      adaptationThreshold: 0.15, // 15% threshold for changes
      maxDifficultyJump: 1, // Max 1 level jump (not used below but kept for parity)
      streakBonus: 0.1, // 10% bonus for streaks
    }
  }

  updatePerformance(isCorrect, responseTime, currentDifficulty) {
    this.performance.totalAnswers++
    if (isCorrect) {
      this.performance.correctAnswers++
      this.performance.streakCount++
    } else {
      this.performance.streakCount = 0
    }

    // Update last five answers for trend analysis
    this.performance.lastFiveAnswers.push(isCorrect)
    if (this.performance.lastFiveAnswers.length > 5) {
      this.performance.lastFiveAnswers.shift()
    }

    // Update average response time
    this.performance.averageResponseTime =
      (this.performance.averageResponseTime * (this.performance.totalAnswers - 1) + responseTime) /
      this.performance.totalAnswers

    this.performance.difficultyHistory.push(currentDifficulty)
  }

  getNextDifficulty(currentDifficulty) {
    if (this.performance.totalAnswers < 3) {
      return currentDifficulty // Need at least 3 answers for adaptation
    }

    const currentAccuracy = this.performance.correctAnswers / this.performance.totalAnswers
    const recentAccuracy =
      this.performance.lastFiveAnswers.length >= 3
        ? this.performance.lastFiveAnswers.filter(Boolean).length / this.performance.lastFiveAnswers.length
        : currentAccuracy

    // Apply streak bonus
    const adjustedAccuracy =
      this.performance.streakCount >= 3 ? Math.min(1, recentAccuracy + this.settings.streakBonus) : recentAccuracy

    const difficultyLevels = ["easy", "medium", "hard"]
    const currentIndex = difficultyLevels.indexOf(currentDifficulty)

    // Determine if we should increase or decrease difficulty
    if (adjustedAccuracy > this.settings.baselineAccuracy + this.settings.adaptationThreshold) {
      const newIndex = Math.min(difficultyLevels.length - 1, currentIndex + 1)
      return difficultyLevels[newIndex]
    } else if (adjustedAccuracy < this.settings.baselineAccuracy - this.settings.adaptationThreshold) {
      const newIndex = Math.max(0, currentIndex - 1)
      return difficultyLevels[newIndex]
    }

    return currentDifficulty // No change needed
  }

  getPerformanceInsights() {
    const accuracy =
      this.performance.totalAnswers > 0 ? this.performance.correctAnswers / this.performance.totalAnswers : 0

    // Analyze trend from last 5 answers
    let trend = "stable"
    if (this.performance.lastFiveAnswers.length >= 4) {
      const firstHalf = this.performance.lastFiveAnswers.slice(0, 2).filter(Boolean).length / 2
      const secondHalf = this.performance.lastFiveAnswers.slice(-2).filter(Boolean).length / 2

      if (secondHalf > firstHalf + 0.2) trend = "improving"
      else if (secondHalf < firstHalf - 0.2) trend = "declining"
    }

    // Generate recommendation
    let recommendation = ""
    if (accuracy > 0.8) {
      recommendation = "Excellent performance! Ready for more challenging questions."
    } else if (accuracy > 0.6) {
      recommendation = "Good progress. Continue at this pace for optimal learning."
    } else {
      recommendation = "Consider reviewing the material before continuing."
    }

    // Determine confidence level based on sample size
    const confidenceLevel =
      this.performance.totalAnswers < 5 ? "low" : this.performance.totalAnswers < 10 ? "medium" : "high"

    return { accuracy, trend, recommendation, confidenceLevel }
  }

  reset() {
    this.performance = {
      correctAnswers: 0,
      totalAnswers: 0,
      averageResponseTime: 0,
      difficultyHistory: [],
      streakCount: 0,
      lastFiveAnswers: [],
    }
  }
}
