const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
// const authMiddleware = require('../middleware/auth'); // We'll implement this later

/**
 * @route POST /api/generate-quiz
 * @desc Generate quiz from document
 * @access Private
 */
router.post('/generate-quiz',
  // authMiddleware, // TODO: Add authentication
  quizController.generateQuiz
);

/**
 * @route GET /api/quiz/:quizId
 * @desc Get quiz by ID
 * @access Private
 */
router.get('/quiz/:quizId',
  // authMiddleware, // TODO: Add authentication
  quizController.getQuiz
);

/**
 * @route GET /api/quiz/:quizId/status
 * @desc Get quiz generation status
 * @access Private
 */
router.get('/quiz/:quizId/status',
  // authMiddleware, // TODO: Add authentication
  quizController.getQuizStatus
);

/**
 * @route GET /api/quizzes
 * @desc Get user's quizzes
 * @access Private
 */
router.get('/quizzes',
  // authMiddleware, // TODO: Add authentication
  quizController.getUserQuizzes
);

/**
 * @route DELETE /api/quiz/:quizId
 * @desc Delete quiz
 * @access Private
 */
router.delete('/quiz/:quizId',
  // authMiddleware, // TODO: Add authentication
  quizController.deleteQuiz
);

module.exports = router;