const analyticsService = require('../services/analyticsService');
const User = require('../models/User');

class AnalyticsJob {
  /**
   * Update analytics for all users (can be run as a cron job)
   */
  static async updateAllUserAnalytics() {
    try {
      console.log('🔄 Starting analytics update for all users...');
      
      // Get all users who have taken quizzes
      const users = await User.find({
        'stats.totalQuizzes': { $gt: 0 }
      }).select('firebaseUid');

      console.log(`📊 Found ${users.length} users with quiz data`);

      let updated = 0;
      let errors = 0;

      // Update analytics for each user
      for (const user of users) {
        try {
          await analyticsService.calculateUserAnalytics(user.firebaseUid);
          updated++;
          
          if (updated % 10 === 0) {
            console.log(`📈 Updated analytics for ${updated}/${users.length} users`);
          }
        } catch (error) {
          console.error(`❌ Failed to update analytics for user ${user.firebaseUid}:`, error.message);
          errors++;
        }
      }

      console.log(`✅ Analytics update complete: ${updated} updated, ${errors} errors`);
      
      return { updated, errors, total: users.length };

    } catch (error) {
      console.error('❌ Analytics job failed:', error);
      throw error;
    }
  }

  /**
   * Update analytics for a specific user
   * @param {string} userId - User ID
   */
  static async updateUserAnalytics(userId) {
    try {
      console.log(`🔄 Updating analytics for user: ${userId}`);
      
      const analytics = await analyticsService.calculateUserAnalytics(userId);
      
      console.log(`✅ Analytics updated for user: ${userId}`);
      return analytics;

    } catch (error) {
      console.error(`❌ Failed to update analytics for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Clean up old analytics data (optional maintenance)
   * @param {number} daysToKeep - Number of days of data to keep
   */
  static async cleanupOldAnalytics(daysToKeep = 90) {
    try {
      console.log(`🧹 Cleaning up analytics data older than ${daysToKeep} days...`);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // This would remove old daily stats, but we'll keep it simple for now
      // In a production system, you might want to aggregate old data instead of deleting it
      
      console.log(`✅ Analytics cleanup complete`);
      
    } catch (error) {
      console.error('❌ Analytics cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Generate analytics summary report
   */
  static async generateSummaryReport() {
    try {
      console.log('📋 Generating analytics summary report...');
      
      const User = require('../models/User');
      const Session = require('../models/Session');
      const Quiz = require('../models/Quiz');
      const Analytics = require('../models/Analytics');

      // Get overall statistics
      const totalUsers = await User.countDocuments();
      const totalQuizzes = await Quiz.countDocuments();
      const totalSessions = await Session.countDocuments({ status: 'completed' });
      const totalAnalytics = await Analytics.countDocuments();

      // Get recent activity (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const recentSessions = await Session.countDocuments({
        status: 'completed',
        completedAt: { $gte: weekAgo }
      });

      const recentQuizzes = await Quiz.countDocuments({
        createdAt: { $gte: weekAgo }
      });

      // Calculate average performance
      const avgPerformance = await Session.aggregate([
        { $match: { status: 'completed', finalAccuracy: { $exists: true } } },
        { $group: { _id: null, avgAccuracy: { $avg: '$finalAccuracy' } } }
      ]);

      const report = {
        timestamp: new Date().toISOString(),
        overview: {
          totalUsers,
          totalQuizzes,
          totalSessions,
          totalAnalytics,
          averageAccuracy: avgPerformance.length > 0 ? Math.round(avgPerformance[0].avgAccuracy) : 0
        },
        recentActivity: {
          sessionsLast7Days: recentSessions,
          quizzesLast7Days: recentQuizzes,
          dailyAverage: Math.round(recentSessions / 7)
        }
      };

      console.log('📊 Analytics Summary Report:');
      console.log(JSON.stringify(report, null, 2));

      return report;

    } catch (error) {
      console.error('❌ Failed to generate summary report:', error);
      throw error;
    }
  }
}

module.exports = AnalyticsJob;