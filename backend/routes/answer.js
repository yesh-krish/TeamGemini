const express = require('express');
const router = express.Router();
const answerController = require('../controllers/answerController');
const eli5Service = require('../services/eli5Service');
// const authMiddleware = require('../middleware/auth'); // We'll implement this later

/**
 * @route POST /api/quiz/:quizId/start
 * @desc Start a new quiz session
 * @access Private
 */
router.post('/quiz/:quizId/start',
  // authMiddleware, // TODO: Add authentication
  answerController.startQuizSession
);

/**
 * @route POST /api/quiz/:quizId/answer
 * @desc Submit an answer and get adaptive feedback
 * @access Private
 */
router.post('/quiz/:quizId/answer',
  // authMiddleware, // TODO: Add authentication
  answerController.submitAnswer
);

/**
 * @route GET /api/quiz/:quizId/next
 * @desc Get next question with adaptive difficulty
 * @access Private
 */
router.get('/quiz/:quizId/next',
  // authMiddleware, // TODO: Add authentication
  answerController.getNextQuestion
);

/**
 * @route POST /api/quiz/:quizId/complete
 * @desc Complete quiz session and get final results
 * @access Private
 */
router.post('/quiz/:quizId/complete',
  // authMiddleware, // TODO: Add authentication
  answerController.completeQuizSession
);

/**
 * @route POST /api/eli5
 * @desc Simplify explanation (Explain Like I'm 5)
 * @access Private
 */
router.post('/eli5', async (req, res) => {
  try {
    const { explanation, targetAge = 5, maxLength = 200 } = req.body;

    if (!explanation) {
      return res.status(400).json({
        success: false,
        message: 'Explanation text is required'
      });
    }

    const result = await eli5Service.simplifyExplanation(explanation, {
      targetAge,
      maxLength
    });

    res.json(result);

  } catch (error) {
    console.error('ELI5 endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to simplify explanation',
      error: error.message
    });
  }
});

/**
 * @route POST /api/eli5/levels
 * @desc Generate multiple explanation levels
 * @access Private
 */
router.post('/eli5/levels', async (req, res) => {
  try {
    const { explanation } = req.body;

    if (!explanation) {
      return res.status(400).json({
        success: false,
        message: 'Explanation text is required'
      });
    }

    const result = await eli5Service.generateMultipleLevels(explanation);
    res.json(result);

  } catch (error) {
    console.error('ELI5 levels endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate explanation levels',
      error: error.message
    });
  }
});

module.exports = router;