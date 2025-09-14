const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const Document = require('../models/Document');

class PDFProcessor {
  constructor() {
    this.chunkSize = 1000; // Characters per chunk
    this.chunkOverlap = 200; // Character overlap between chunks
  }

  /**
   * Process uploaded PDF file
   * @param {Object} fileInfo - File information from multer
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Document object
   */
  async processPDF(fileInfo, userId) {
    let document = null;
    
    try {
      // Create document record
      document = new Document({
        userId,
        filename: fileInfo.filename,
        originalName: fileInfo.originalname,
        fileSize: fileInfo.size,
        mimeType: fileInfo.mimetype,
        filePath: fileInfo.path,
        status: 'processing'
      });
      
      await document.save();
      
      // Update status to processing
      await this.updateDocumentStatus(document._id, 'processing', 10, 'Extracting text from PDF...');
      
      // Extract text from PDF
      const pdfBuffer = await fs.readFile(fileInfo.path);
      const pdfData = await pdfParse(pdfBuffer);
      
      await this.updateDocumentStatus(document._id, 'processing', 30, 'Text extraction complete. Analyzing content...');
      
      // Update document with extracted text
      document.rawText = pdfData.text;
      document.pageCount = pdfData.numpages;
      document.wordCount = this.countWords(pdfData.text);
      
      await this.updateDocumentStatus(document._id, 'chunking', 50, 'Breaking text into chunks...');
      
      // Create text chunks
      const chunks = this.createTextChunks(pdfData.text);
      document.textChunks = chunks;
      
      await this.updateDocumentStatus(document._id, 'embedding', 70, 'Preparing for AI processing...');
      
      // TODO: Generate embeddings (will implement with Gemini API)
      // For now, we'll mark as complete without embeddings
      
      await this.updateDocumentStatus(document._id, 'complete', 100, 'PDF processing complete!');
      
      document.status = 'complete';
      await document.save();
      
      return document;
      
    } catch (error) {
      console.error('PDF processing error:', error);
      
      if (document) {
        await this.updateDocumentStatus(
          document._id, 
          'failed', 
          0, 
          `Processing failed: ${error.message}`
        );
      }
      
      throw error;
    }
  }

  /**
   * Create text chunks for RAG processing
   * @param {string} text - Full text content
   * @returns {Array} Array of text chunks
   */
  createTextChunks(text) {
    const chunks = [];
    let chunkIndex = 0;
    
    // Simple chunking by character count with overlap
    for (let i = 0; i < text.length; i += (this.chunkSize - this.chunkOverlap)) {
      const chunk = text.slice(i, i + this.chunkSize);
      
      if (chunk.trim().length > 0) {
        chunks.push({
          id: `chunk_${chunkIndex}`,
          content: chunk.trim(),
          chunkIndex,
          wordCount: this.countWords(chunk),
          startPosition: i,
          endPosition: Math.min(i + this.chunkSize, text.length)
        });
        
        chunkIndex++;
      }
    }
    
    return chunks;
  }

  /**
   * Count words in text
   * @param {string} text 
   * @returns {number} Word count
   */
  countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Update document processing status
   * @param {string} documentId 
   * @param {string} status 
   * @param {number} progress 
   * @param {string} message 
   */
  async updateDocumentStatus(documentId, status, progress, message) {
    await Document.findByIdAndUpdate(documentId, {
      status,
      processingProgress: progress,
      processingMessage: message,
      updatedAt: new Date()
    });
  }

  /**
   * Get processing status
   * @param {string} documentId 
   * @returns {Promise<Object>} Status information
   */
  async getProcessingStatus(documentId) {
    const document = await Document.findById(documentId).select(
      'status processingProgress processingMessage errorMessage'
    );
    
    if (!document) {
      throw new Error('Document not found');
    }
    
    return {
      status: document.status,
      progress: document.processingProgress,
      message: document.processingMessage,
      error: document.errorMessage
    };
  }
}

module.exports = new PDFProcessor();