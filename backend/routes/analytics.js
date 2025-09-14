const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
// const authMiddleware = require('../middleware/auth'); // We'll implement this later

/**
 * @route GET /api/analytics/performance
 * @desc Get user's overall performance metrics
 * @access Private
 */
router.get('/analytics/performance',
  // authMiddleware, // TODO: Add authentication
  analyticsController.getPerformanceAnalytics
);

/**
 * @route GET /api/analytics/trends
 * @desc Get performance trends over time
 * @access Private
 */
router.get('/analytics/trends',
  // authMiddleware, // TODO: Add authentication
  analyticsController.getPerformanceTrends
);

/**
 * @route GET /api/analytics/topics
 * @desc Get topic-based performance analytics
 * @access Private
 */
router.get('/analytics/topics',
  // authMiddleware, // TODO: Add authentication
  analyticsController.getTopicAnalytics
);

/**
 * @route GET /api/analytics/difficulty
 * @desc Get difficulty distribution analytics
 * @access Private
 */
router.get('/analytics/difficulty',
  // authMiddleware, // TODO: Add authentication
  analyticsController.getDifficultyAnalytics
);

/**
 * @route GET /api/session/:sessionId
 * @desc Get detailed session analytics
 * @access Private
 */
router.get('/session/:sessionId',
  // authMiddleware, // TODO: Add authentication
  analyticsController.getSessionAnalytics
);

/**
 * @route POST /api/export-study-guide
 * @desc Generate personalized study guide
 * @access Private
 */
router.post('/export-study-guide',
  // authMiddleware, // TODO: Add authentication
  analyticsController.generateStudyGuide
);

/**
 * @route GET /api/insights/:userId
 * @desc Get personalized learning insights (alias for performance)
 * @access Private
 */
router.get('/insights/:userId',
  // authMiddleware, // TODO: Add authentication
  analyticsController.getPerformanceAnalytics
);

module.exports = router;