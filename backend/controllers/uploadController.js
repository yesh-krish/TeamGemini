const Document = require('../models/Document');
const pdfProcessor = require('../services/pdfProcessor');

class UploadController {
  /**
   * Handle PDF file upload
   * POST /api/upload
   */
  async uploadFile(req, res) {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Get user ID from auth middleware (we'll implement auth later)
      const userId = req.user?.firebaseUid || 'temp_user'; // Temporary for testing

      // Start processing PDF asynchronously
      pdfProcessor.processPDF(req.file, userId)
        .catch(error => {
          console.error('Background PDF processing failed:', error);
        });

      // Return immediate response with file ID
      const response = {
        success: true,
        fileId: req.file.filename.split('_')[0] + '_' + req.file.filename.split('_')[1], // Extract unique ID
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        status: 'processing',
        message: 'PDF upload successful. Processing started...'
      };

      res.status(200).json(response);

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Upload failed',
        error: error.message
      });
    }
  }

  /**
   * Get file processing status
   * GET /api/upload/:fileId/status
   */
  async getUploadStatus(req, res) {
    try {
      const { fileId } = req.params;
      
      // Find document by filename pattern (since we're using fileId as part of filename)
      const document = await Document.findOne({
        filename: { $regex: `^${fileId}` }
      }).select('status processingProgress processingMessage errorMessage filename originalName');

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      const response = {
        success: true,
        fileId,
        filename: document.originalName,
        status: document.status,
        progress: document.processingProgress,
        message: document.processingMessage
      };

      // Add error message if failed
      if (document.status === 'failed' && document.errorMessage) {
        response.error = document.errorMessage;
      }

      res.json(response);

    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get status',
        error: error.message
      });
    }
  }

  /**
   * Get user's documents
   * GET /api/documents
   */
  async getUserDocuments(req, res) {
    try {
      // Get user ID from auth middleware
      const userId = req.user?.firebaseUid || 'temp_user'; // Temporary for testing

      const documents = await Document.find({ userId })
        .select('filename originalName fileSize status processingProgress createdAt pageCount wordCount quizCount')
        .sort({ createdAt: -1 });

      const response = {
        success: true,
        documents: documents.map(doc => ({
          id: doc._id,
          filename: doc.originalName,
          fileSize: doc.fileSize,
          status: doc.status,
          progress: doc.processingProgress,
          uploadedAt: doc.createdAt,
          pageCount: doc.pageCount,
          wordCount: doc.wordCount,
          quizCount: doc.quizCount || 0,
          // Generate file ID for frontend compatibility
          fileId: doc.filename.split('_')[0] + '_' + doc.filename.split('_')[1]
        }))
      };

      res.json(response);

    } catch (error) {
      console.error('Get documents error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get documents',
        error: error.message
      });
    }
  }

  /**
   * Delete document
   * DELETE /api/documents/:fileId
   */
  async deleteDocument(req, res) {
    try {
      const { fileId } = req.params;
      const userId = req.user?.firebaseUid || 'temp_user';

      // Find and delete document
      const document = await Document.findOneAndDelete({
        filename: { $regex: `^${fileId}` },
        userId
      });

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      // TODO: Delete associated quizzes and sessions
      // TODO: Delete physical file from disk

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });

    } catch (error) {
      console.error('Delete document error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete document',
        error: error.message
      });
    }
  }
}

module.exports = new UploadController();