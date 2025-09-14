const geminiConfig = require('../config/gemini');
const prompts = require('../utils/prompts');

class LLMOrchestrator {
  constructor() {
    this.model = null;
    this.embeddingModel = null;
  }

  /**
   * Initialize Gemini models
   */
  async initialize() {
    try {
      if (geminiConfig.isConfigured()) {
        this.model = geminiConfig.getGenerativeModel();
        this.embeddingModel = geminiConfig.getEmbeddingModel();
        console.log('✅ Gemini API initialized successfully');
      } else {
        console.warn('⚠️ Gemini API not configured - using mock responses');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Gemini API:', error.message);
      throw error;
    }
  }

  /**
   * Generate embeddings for text chunks
   * @param {Array} textChunks - Array of text chunks
   * @returns {Promise<Array>} Array of embeddings
   */
  async generateEmbeddings(textChunks) {
    if (!this.embeddingModel) {
      // Return mock embeddings for development
      return textChunks.map(() => Array(768).fill(0).map(() => Math.random()));
    }

    try {
      const embeddings = [];
      
      for (const chunk of textChunks) {
        const result = await this.embeddingModel.embedContent(chunk.content);
        embeddings.push(result.embedding.values);
      }
      
      return embeddings;
    } catch (error) {
      console.error('Embedding generation error:', error);
      // Fallback to mock embeddings
      return textChunks.map(() => Array(768).fill(0).map(() => Math.random()));
    }
  }

  /**
   * Generate quiz questions from document chunks
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} Generated quiz data
   */
  async generateQuiz(params) {
    const {
      textChunks,
      questionCount = 5,
      difficulty = 'medium',
      questionTypes = ['multiple-choice'],
      documentTitle = 'Document'
    } = params;

    try {
      // Select relevant chunks (for now, use first few chunks)
      const selectedChunks = this.selectRelevantChunks(textChunks, questionCount);
      
      // Generate questions
      const questions = [];
      
      for (let i = 0; i < questionCount; i++) {
        const chunkIndex = i % selectedChunks.length;
        const chunk = selectedChunks[chunkIndex];
        const questionType = questionTypes[i % questionTypes.length];
        
        const question = await this.generateSingleQuestion({
          chunk,
          questionType,
          difficulty,
          questionNumber: i + 1
        });
        
        if (question) {
          questions.push(question);
        }
      }
      
      return {
        success: true,
        questions,
        metadata: {
          documentTitle,
          questionCount: questions.length,
          difficulty,
          generatedAt: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('Quiz generation error:', error);
      throw error;
    }
  }

  /**
   * Generate a single question from a text chunk
   * @param {Object} params - Question generation parameters
   * @returns {Promise<Object>} Generated question
   */
  async generateSingleQuestion(params) {
    const { chunk, questionType, difficulty, questionNumber } = params;
    
    if (!this.model) {
      // Return mock question for development
      return this.generateMockQuestion(questionType, difficulty, questionNumber, chunk);
    }

    try {
      const prompt = prompts.getQuestionGenerationPrompt({
        content: chunk.content,
        questionType,
        difficulty,
        chunkId: chunk.id,
        pageNumber: chunk.pageNumber
      });

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Parse JSON response
      const questionData = JSON.parse(response);
      
      // Add metadata
      questionData.sourceChunks = [chunk.id];
      questionData.sourceCitation = `Page ${chunk.pageNumber || 'Unknown'}`;
      questionData.sourcePages = chunk.pageNumber ? [chunk.pageNumber] : [];
      questionData.generatedAt = new Date();
      
      return questionData;
      
    } catch (error) {
      console.error('Single question generation error:', error);
      // Fallback to mock question
      return this.generateMockQuestion(questionType, difficulty, questionNumber, chunk);
    }
  }

  /**
   * Generate topic tags for text chunks
   * @param {Array} textChunks - Array of text chunks
   * @returns {Promise<Array>} Array of topic tags
   */
  async generateTopicTags(textChunks) {
    if (!this.model) {
      // Return mock topics
      const mockTopics = ['Machine Learning', 'Data Science', 'Neural Networks', 'Statistics'];
      return textChunks.map(() => mockTopics[Math.floor(Math.random() * mockTopics.length)]);
    }

    try {
      const topics = [];
      
      for (const chunk of textChunks) {
        const prompt = prompts.getTopicExtractionPrompt(chunk.content);
        const result = await this.model.generateContent(prompt);
        const topic = result.response.text().trim();
        topics.push(topic);
      }
      
      return topics;
    } catch (error) {
      console.error('Topic generation error:', error);
      // Fallback to mock topics
      const mockTopics = ['Machine Learning', 'Data Science', 'Neural Networks', 'Statistics'];
      return textChunks.map(() => mockTopics[Math.floor(Math.random() * mockTopics.length)]);
    }
  }

  /**
   * Simplify explanation (ELI5 feature)
   * @param {string} explanation - Original explanation
   * @returns {Promise<string>} Simplified explanation
   */
  async simplifyExplanation(explanation) {
    if (!this.model) {
      return `Simple version: ${explanation.substring(0, 100)}...`;
    }

    try {
      const prompt = prompts.getELI5Prompt(explanation);
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('ELI5 generation error:', error);
      return `Simple version: ${explanation.substring(0, 100)}...`;
    }
  }

  /**
   * Select relevant chunks for quiz generation
   * @param {Array} textChunks - All available chunks
   * @param {number} questionCount - Number of questions needed
   * @returns {Array} Selected chunks
   */
  selectRelevantChunks(textChunks, questionCount) {
    // For now, select chunks evenly distributed throughout the document
    const totalChunks = textChunks.length;
    const step = Math.max(1, Math.floor(totalChunks / questionCount));
    
    const selectedChunks = [];
    for (let i = 0; i < totalChunks && selectedChunks.length < questionCount * 2; i += step) {
      selectedChunks.push(textChunks[i]);
    }
    
    return selectedChunks;
  }

  /**
   * Generate mock question for development/fallback
   * @param {string} questionType 
   * @param {string} difficulty 
   * @param {number} questionNumber 
   * @param {Object} chunk 
   * @returns {Object} Mock question
   */
  generateMockQuestion(questionType, difficulty, questionNumber, chunk) {
    const mockQuestions = {
      'multiple-choice': {
        id: `q${questionNumber}`,
        question: `What is the main concept discussed in this section? (Question ${questionNumber})`,
        type: 'multiple-choice',
        options: [
          'Machine Learning algorithms',
          'Data preprocessing techniques',
          'Statistical analysis methods',
          'Neural network architectures'
        ],
        correctAnswer: 'Machine Learning algorithms',
        explanation: 'This section primarily discusses machine learning algorithms and their applications in data analysis.',
        difficulty,
        topic: 'Machine Learning'
      },
      'true-false': {
        id: `q${questionNumber}`,
        question: `The concepts in this section are fundamental to understanding the topic. (Question ${questionNumber})`,
        type: 'true-false',
        correctAnswer: 'true',
        explanation: 'Yes, the concepts discussed form the foundation for understanding the broader topic.',
        difficulty,
        topic: 'Fundamentals'
      },
      'short-answer': {
        id: `q${questionNumber}`,
        question: `Explain the key concept mentioned in this section. (Question ${questionNumber})`,
        type: 'short-answer',
        correctAnswer: 'The key concept involves understanding how different components work together to achieve the desired outcome.',
        explanation: 'This section explains the interconnected nature of the concepts and their practical applications.',
        difficulty,
        topic: 'Concepts'
      }
    };

    const question = mockQuestions[questionType] || mockQuestions['multiple-choice'];
    
    // Add source information
    question.sourceChunks = [chunk.id];
    question.sourceCitation = `Page ${chunk.pageNumber || 'Unknown'}`;
    question.sourcePages = chunk.pageNumber ? [chunk.pageNumber] : [];
    question.generatedAt = new Date();
    
    return question;
  }
}

module.exports = new LLMOrchestrator();