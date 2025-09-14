const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { upload, handleUploadError } = require('../middleware/upload');
// const authMiddleware = require('../middleware/auth'); // We'll implement this later

/**
 * @route POST /api/upload
 * @desc Upload PDF file
 * @access Private (will add auth later)
 */
router.post('/', 
  // authMiddleware, // TODO: Add authentication
  upload,
  handleUploadError,
  uploadController.uploadFile
);

/**
 * @route GET /api/upload/:fileId/status
 * @desc Get file processing status
 * @access Private
 */
router.get('/:fileId/status',
  // authMiddleware, // TODO: Add authentication
  uploadController.getUploadStatus
);

/**
 * @route GET /api/documents
 * @desc Get user's documents
 * @access Private
 */
router.get('/documents',
  // authMiddleware, // TODO: Add authentication
  uploadController.getUserDocuments
);

/**
 * @route DELETE /api/documents/:fileId
 * @desc Delete document
 * @access Private
 */
router.delete('/documents/:fileId',
  // authMiddleware, // TODO: Add authentication
  uploadController.deleteDocument
);

module.exports = router;