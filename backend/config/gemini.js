const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiConfig {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY not found in environment variables');
    }
    
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    
    // Model configurations
    this.models = {
      // For text generation (quiz creation)
      generative: 'gemini-pro',
      // For embeddings (RAG)
      embedding: 'embedding-001'
    };
    
    // Generation config
    this.generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    };
    
    // Safety settings
    this.safetySettings = [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ];
  }

  /**
   * Get generative model instance
   */
  getGenerativeModel() {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }
    
    return this.genAI.getGenerativeModel({
      model: this.models.generative,
      generationConfig: this.generationConfig,
      safetySettings: this.safetySettings,
    });
  }

  /**
   * Get embedding model instance
   */
  getEmbeddingModel() {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }
    
    return this.genAI.getGenerativeModel({
      model: this.models.embedding
    });
  }

  /**
   * Check if API is configured
   */
  isConfigured() {
    return !!this.apiKey;
  }
}

module.exports = new GeminiConfig();