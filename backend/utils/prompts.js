class PromptTemplates {
  /**
   * Generate prompt for quiz question creation
   * @param {Object} params - Parameters for prompt generation
   * @returns {string} Formatted prompt
   */
  getQuestionGenerationPrompt(params) {
    const { content, questionType, difficulty, chunkId, pageNumber } = params;
    
    const difficultyInstructions = {
      easy: 'Create straightforward questions that test basic understanding and recall of key facts.',
      medium: 'Create questions that require some analysis and application of concepts.',
      hard: 'Create complex questions that require deep understanding, synthesis, and critical thinking.'
    };

    const typeInstructions = {
      'multiple-choice': {
        instruction: 'Create a multiple-choice question with 4 options (A, B, C, D). Only one option should be correct.',
        format: `{
  "id": "generated_id",
  "question": "Your question here",
  "type": "multiple-choice",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option A",
  "explanation": "Detailed explanation of why this is correct",
  "difficulty": "${difficulty}",
  "topic": "Main topic of the question"
}`
      },
      'true-false': {
        instruction: 'Create a true/false question that tests understanding of a specific concept.',
        format: `{
  "id": "generated_id", 
  "question": "Your true/false statement here",
  "type": "true-false",
  "correctAnswer": "true",
  "explanation": "Detailed explanation of why this is true/false",
  "difficulty": "${difficulty}",
  "topic": "Main topic of the question"
}`
      },
      'short-answer': {
        instruction: 'Create a short-answer question that requires a brief written response.',
        format: `{
  "id": "generated_id",
  "question": "Your question here", 
  "type": "short-answer",
  "correctAnswer": "Sample correct answer",
  "explanation": "Detailed explanation and key points to look for",
  "difficulty": "${difficulty}",
  "topic": "Main topic of the question"
}`
      }
    };

    const typeConfig = typeInstructions[questionType] || typeInstructions['multiple-choice'];

    return `You are an expert educational content creator. Your task is to generate a high-quality quiz question based on the provided text.

INSTRUCTIONS:
- ${difficultyInstructions[difficulty]}
- ${typeConfig.instruction}
- The question must be directly answerable from the provided text
- Include a clear, educational explanation
- Identify the main topic/concept being tested
- Ensure the question is grammatically correct and clear

DIFFICULTY LEVEL: ${difficulty}
QUESTION TYPE: ${questionType}

SOURCE TEXT:
${content}

OUTPUT FORMAT (must be valid JSON):
${typeConfig.format}

Generate the question now:`;
  }

  /**
   * Generate prompt for topic extraction
   * @param {string} content - Text content to analyze
   * @returns {string} Topic extraction prompt
   */
  getTopicExtractionPrompt(content) {
    return `Analyze the following text and identify the main topic or concept being discussed. 

Respond with only a short phrase or keyword (2-4 words maximum) that best describes the primary subject matter.

Examples of good responses:
- "Machine Learning"
- "Neural Networks" 
- "Data Preprocessing"
- "Statistical Analysis"
- "Deep Learning"

TEXT TO ANALYZE:
${content}

MAIN TOPIC:`;
  }

  /**
   * Generate ELI5 (Explain Like I'm 5) prompt
   * @param {string} explanation - Original explanation to simplify
   * @returns {string} ELI5 prompt
   */
  getELI5Prompt(explanation) {
    return `You are a teacher who is excellent at explaining complex topics to young children. 

Take the following explanation and rewrite it in very simple terms that a 5-year-old could understand. Use:
- Simple, everyday words
- Short sentences
- Fun analogies or comparisons to familiar things
- Avoid technical jargon
- Keep it engaging and friendly

ORIGINAL EXPLANATION:
${explanation}

SIMPLE EXPLANATION FOR A 5-YEAR-OLD:`;
  }

  /**
   * Generate adaptive difficulty prompt
   * @param {Object} params - Adaptive parameters
   * @returns {string} Adaptive prompt
   */
  getAdaptiveDifficultyPrompt(params) {
    const { 
      content, 
      userPerformance, 
      strongTopics = [], 
      weakTopics = [], 
      targetDifficulty 
    } = params;

    const performanceContext = userPerformance > 0.8 
      ? "The user is performing very well and needs more challenging questions."
      : userPerformance < 0.6 
      ? "The user is struggling and needs easier, more foundational questions."
      : "The user is performing adequately and can handle moderate difficulty.";

    const topicGuidance = weakTopics.length > 0 
      ? `Focus more on these topics where the user needs improvement: ${weakTopics.join(', ')}.`
      : strongTopics.length > 0 
      ? `The user is strong in: ${strongTopics.join(', ')}. You can create more advanced questions in these areas.`
      : '';

    return `You are an adaptive learning AI that creates personalized quiz questions.

PERFORMANCE CONTEXT:
${performanceContext}

TOPIC GUIDANCE:
${topicGuidance}

TARGET DIFFICULTY: ${targetDifficulty}

Based on this context, create a question from the following content that is appropriately challenging for this user's current level.

CONTENT:
${content}

Create a question that will help this user learn effectively at their current level.`;
  }

  /**
   * Generate study guide prompt
   * @param {Object} params - Study guide parameters
   * @returns {string} Study guide prompt
   */
  getStudyGuidePrompt(params) {
    const { incorrectAnswers, weakTopics, userName = 'Student' } = params;

    const incorrectQuestions = incorrectAnswers.map(answer => 
      `Question: ${answer.question}\nYour Answer: ${answer.userAnswer}\nCorrect Answer: ${answer.correctAnswer}\nTopic: ${answer.topic}`
    ).join('\n\n');

    return `Create a personalized study guide for ${userName} based on their quiz performance.

AREAS THAT NEED IMPROVEMENT:
${weakTopics.join(', ')}

QUESTIONS ANSWERED INCORRECTLY:
${incorrectQuestions}

Create a comprehensive but concise study guide that:
1. Summarizes the key concepts for each weak topic
2. Provides clear explanations for the missed questions
3. Offers study tips and strategies
4. Includes encouraging, positive language
5. Suggests next steps for improvement

Keep the tone supportive and motivating. Format it as a well-structured study guide.`;
  }
}

module.exports = new PromptTemplates();