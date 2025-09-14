const llmOrchestrator = require('./llmOrchestrator');

class ELI5Service {
  /**
   * Simplify explanation for easier understanding
   * @param {string} originalExplanation - Original complex explanation
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Simplified explanation
   */
  async simplifyExplanation(originalExplanation, options = {}) {
    try {
      const {
        targetAge = 5,
        maxLength = 200,
        includeAnalogy = true
      } = options;

      // Initialize LLM if not already done
      if (!llmOrchestrator.model) {
        await llmOrchestrator.initialize();
      }

      // Generate simplified explanation
      const simplifiedText = await llmOrchestrator.simplifyExplanation(originalExplanation);

      // Post-process the explanation
      const processedExplanation = this.postProcessExplanation(simplifiedText, maxLength);

      return {
        success: true,
        originalExplanation,
        simplifiedExplanation: processedExplanation,
        targetAge,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('ELI5 service error:', error);
      
      // Fallback to basic simplification
      const fallbackExplanation = this.createFallbackExplanation(originalExplanation);
      
      return {
        success: true,
        originalExplanation,
        simplifiedExplanation: fallbackExplanation,
        targetAge: 5,
        isFallback: true,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Post-process the simplified explanation
   * @param {string} explanation - Raw simplified explanation
   * @param {number} maxLength - Maximum length
   * @returns {string} Processed explanation
   */
  postProcessExplanation(explanation, maxLength) {
    let processed = explanation.trim();

    // Remove any remaining technical jargon
    const technicalTerms = {
      'algorithm': 'step-by-step instructions',
      'parameter': 'setting',
      'optimization': 'making better',
      'iteration': 'repetition',
      'implementation': 'building',
      'methodology': 'way of doing things',
      'framework': 'structure',
      'paradigm': 'approach',
      'heuristic': 'rule of thumb',
      'coefficient': 'number'
    };

    Object.keys(technicalTerms).forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      processed = processed.replace(regex, technicalTerms[term]);
    });

    // Ensure it's not too long
    if (processed.length > maxLength) {
      processed = processed.substring(0, maxLength - 3) + '...';
    }

    // Make sure it ends with proper punctuation
    if (!/[.!?]$/.test(processed)) {
      processed += '.';
    }

    return processed;
  }

  /**
   * Create a fallback explanation when AI is not available
   * @param {string} originalExplanation 
   * @returns {string} Fallback explanation
   */
  createFallbackExplanation(originalExplanation) {
    // Extract key concepts and create a simple explanation
    const sentences = originalExplanation.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) {
      return "This is about an important concept that helps us understand how things work.";
    }

    // Take the first sentence and simplify it
    let firstSentence = sentences[0].trim();
    
    // Basic simplification rules
    const simplifications = [
      { from: /\b(therefore|thus|consequently|hence)\b/gi, to: 'so' },
      { from: /\b(furthermore|moreover|additionally)\b/gi, to: 'also' },
      { from: /\b(utilize|employ)\b/gi, to: 'use' },
      { from: /\b(demonstrate|illustrate)\b/gi, to: 'show' },
      { from: /\b(facilitate|enable)\b/gi, to: 'help' },
      { from: /\b(approximately|roughly)\b/gi, to: 'about' },
      { from: /\b(significant|substantial)\b/gi, to: 'big' },
      { from: /\b(minimal|negligible)\b/gi, to: 'small' }
    ];

    simplifications.forEach(rule => {
      firstSentence = firstSentence.replace(rule.from, rule.to);
    });

    // Add a friendly prefix
    const friendlyPrefixes = [
      "Think of it like this: ",
      "Here's a simple way to understand it: ",
      "Imagine that ",
      "It's like when "
    ];

    const prefix = friendlyPrefixes[Math.floor(Math.random() * friendlyPrefixes.length)];
    
    return prefix + firstSentence.toLowerCase() + ".";
  }

  /**
   * Get explanation difficulty level
   * @param {string} explanation 
   * @returns {Object} Difficulty analysis
   */
  analyzeDifficulty(explanation) {
    const words = explanation.toLowerCase().split(/\s+/);
    const totalWords = words.length;

    // Count complex words (more than 2 syllables or technical terms)
    const complexWords = words.filter(word => {
      return word.length > 8 || this.isTechnicalTerm(word);
    });

    const complexityRatio = complexWords.length / totalWords;
    
    let level = 'easy';
    if (complexityRatio > 0.3) level = 'hard';
    else if (complexityRatio > 0.15) level = 'medium';

    return {
      level,
      complexityRatio: Math.round(complexityRatio * 100),
      totalWords,
      complexWords: complexWords.length,
      readingTime: Math.ceil(totalWords / 200) // Assuming 200 words per minute
    };
  }

  /**
   * Check if a word is technical
   * @param {string} word 
   * @returns {boolean}
   */
  isTechnicalTerm(word) {
    const technicalTerms = [
      'algorithm', 'parameter', 'optimization', 'iteration', 'implementation',
      'methodology', 'framework', 'paradigm', 'heuristic', 'coefficient',
      'neural', 'regression', 'classification', 'supervised', 'unsupervised',
      'gradient', 'matrix', 'vector', 'tensor', 'probability', 'statistics'
    ];

    return technicalTerms.some(term => word.includes(term));
  }

  /**
   * Generate multiple explanation levels
   * @param {string} originalExplanation 
   * @returns {Promise<Object>} Multiple explanation levels
   */
  async generateMultipleLevels(originalExplanation) {
    try {
      const levels = await Promise.all([
        this.simplifyExplanation(originalExplanation, { targetAge: 5, maxLength: 150 }),
        this.simplifyExplanation(originalExplanation, { targetAge: 10, maxLength: 200 }),
        this.simplifyExplanation(originalExplanation, { targetAge: 15, maxLength: 250 })
      ]);

      return {
        success: true,
        original: originalExplanation,
        levels: {
          elementary: levels[0].simplifiedExplanation,
          middle: levels[1].simplifiedExplanation,
          high: levels[2].simplifiedExplanation
        },
        difficulty: this.analyzeDifficulty(originalExplanation)
      };

    } catch (error) {
      console.error('Generate multiple levels error:', error);
      
      return {
        success: false,
        error: error.message,
        fallback: this.createFallbackExplanation(originalExplanation)
      };
    }
  }
}

module.exports = new ELI5Service();