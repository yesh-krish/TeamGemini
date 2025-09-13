"use client"

import { useState, useEffect } from "react"
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Target,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import { Button } from "./components/ui/button"
import { Card } from "./components/ui/card"
import { Progress } from "./components/ui/progress"
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group"
import { Label } from "./components/ui/label"
import { Textarea } from "./components/ui/textarea"
import { AdaptiveQuizEngine } from "./adaptive-quiz-engine"

const mockQuestions = [
  {
    id: "1",
    question: "What is machine learning?",
    type: "multiple-choice",
    options: [
      "A type of computer hardware",
      "A method for computers to learn from data",
      "A programming language",
      "A database system",
    ],
    correctAnswer: "A method for computers to learn from data",
    explanation:
      "Machine learning is a subset of AI that enables computers to learn and improve from data without being explicitly programmed.",
    difficulty: "easy",
    source: "Page 5, Introduction",
  },
  {
    id: "2",
    question: "What is the primary function of machine learning algorithms in data analysis?",
    type: "multiple-choice",
    options: [
      "To replace human decision-making entirely",
      "To identify patterns and make predictions from data",
      "To store large amounts of data efficiently",
      "To create visualizations of data",
    ],
    correctAnswer: "To identify patterns and make predictions from data",
    explanation:
      "Machine learning algorithms are designed to automatically identify patterns in data and use these patterns to make predictions or decisions without being explicitly programmed for each specific task.",
    difficulty: "medium",
    source: "Page 15, Section 3.2",
  },
  {
    id: "3",
    question: "Neural networks are inspired by the structure of the human brain.",
    type: "true-false",
    correctAnswer: "true",
    explanation:
      "Neural networks are indeed inspired by the biological neural networks found in animal brains, particularly the way neurons connect and process information.",
    difficulty: "easy",
    source: "Page 8, Introduction",
  },
  {
    id: "4",
    question: "Explain the mathematical foundation behind gradient descent optimization in deep learning.",
    type: "short-answer",
    correctAnswer:
      "Gradient descent uses partial derivatives to find the minimum of a cost function by iteratively moving in the direction of steepest descent.",
    explanation:
      "Gradient descent is an optimization algorithm that uses calculus to minimize the cost function by computing gradients and updating parameters in the opposite direction of the gradient.",
    difficulty: "hard",
    source: "Page 45, Advanced Topics",
  },
  {
    id: "5",
    question: "Overfitting occurs when a model performs well on training data but poorly on test data.",
    type: "true-false",
    correctAnswer: "true",
    explanation:
      "Overfitting happens when a model learns the training data too well, including noise and outliers, making it unable to generalize to new, unseen data.",
    difficulty: "medium",
    source: "Page 28, Model Validation",
  },
]

export function QuizInterface({ quizId, onComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showExplanation, setShowExplanation] = useState(false)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [adaptiveEngine] = useState(() => new AdaptiveQuizEngine())
  const [currentDifficulty, setCurrentDifficulty] = useState("medium")
  const [difficultyChanged, setDifficultyChanged] = useState(false)
  const [responseStartTime, setResponseStartTime] = useState(Date.now())
  const [performanceInsights, setPerformanceInsights] = useState(null)

  const availableQuestions = mockQuestions.filter((q) => q.difficulty === currentDifficulty)
  const currentQuestion = availableQuestions[currentQuestionIndex % availableQuestions.length] || mockQuestions[0]
  const progress = ((currentQuestionIndex + 1) / 10) * 100 // Fixed total of 10 questions
  const userAnswer = answers[currentQuestion.id] || ""

  useEffect(() => {
    setResponseStartTime(Date.now())
  }, [currentQuestionIndex])

  const handleAnswer = (answer) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }))
    setIsAnswered(true)
  }

  const handleSubmitAnswer = () => {
    const responseTime = Date.now() - responseStartTime
    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim()

    if (isCorrect) {
      setScore((prev) => prev + 1)
    }

    adaptiveEngine.updatePerformance(isCorrect, responseTime, currentDifficulty)

    const nextDifficulty = adaptiveEngine.getNextDifficulty(currentDifficulty)
    if (nextDifficulty !== currentDifficulty) {
      setCurrentDifficulty(nextDifficulty)
      setDifficultyChanged(true)
      setTimeout(() => setDifficultyChanged(false), 3000)
    }

    setPerformanceInsights(adaptiveEngine.getPerformanceInsights())
    setShowExplanation(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < 9) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setShowExplanation(false)
      setIsAnswered(false)
    } else {
      setIsComplete(true)
      onComplete()
    }
  }

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0)
    setAnswers({})
    setShowExplanation(false)
    setIsAnswered(false)
    setScore(0)
    setIsComplete(false)
    adaptiveEngine.reset()
    setCurrentDifficulty("medium")
    setPerformanceInsights(null)
  }

  if (isComplete) {
    const percentage = Math.round((score / 10) * 100)

    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-zinc-900 border-zinc-800 p-8 text-center">
          <div className="mb-6">
            {percentage >= 80 ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            ) : percentage >= 60 ? (
              <Target className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            )}

            <h2 className="text-3xl font-bold mb-2 text-white">Quiz Complete!</h2>
            <p className="text-zinc-400">
              {percentage >= 80 ? "Excellent work!" : percentage >= 60 ? "Good job!" : "Keep practicing!"}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{score}</div>
              <div className="text-sm text-zinc-400">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{10 - score}</div>
              <div className="text-sm text-zinc-400">Incorrect</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{percentage}%</div>
              <div className="text-sm text-zinc-400">Score</div>
            </div>
          </div>

          {performanceInsights && (
            <Card className="bg-zinc-800 border-zinc-700 p-4 mb-6 text-left">
              <h4 className="text-lg font-semibold text-white mb-3">Adaptive Learning Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-zinc-400">Final Difficulty:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-xs ${
                      currentDifficulty === "easy"
                        ? "bg-green-900 text-green-300"
                        : currentDifficulty === "medium"
                          ? "bg-yellow-900 text-yellow-300"
                          : "bg-red-900 text-red-300"
                    }`}
                  >
                    {currentDifficulty}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-zinc-400">Trend:</span>
                  <div className="ml-2 flex items-center">
                    {performanceInsights.trend === "improving" && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {performanceInsights.trend === "declining" && <TrendingDown className="w-4 h-4 text-red-500" />}
                    {performanceInsights.trend === "stable" && <Minus className="w-4 h-4 text-zinc-400" />}
                    <span className="ml-1 text-white text-xs">{performanceInsights.trend}</span>
                  </div>
                </div>
              </div>
              <p className="text-zinc-300 text-sm mt-3">{performanceInsights.recommendation}</p>
            </Card>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleRetakeQuiz}
              variant="outline"
              className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
            <Button className="flex-1 bg-white text-black hover:bg-zinc-200">View Analytics</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-zinc-400">Progress</span>
          <span className="text-sm text-zinc-400">{currentQuestionIndex + 1} of 10</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {difficultyChanged && (
        <Card className="bg-blue-900/20 border-blue-800 p-4 mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-blue-300 font-medium">Difficulty Adjusted!</p>
              <p className="text-blue-400 text-sm">
                Questions are now <span className="font-semibold">{currentDifficulty}</span> based on your performance
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Question Card */}
      <Card className="bg-zinc-900 border-zinc-800 p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-400">Question {currentQuestionIndex + 1}</span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                currentQuestion.difficulty === "easy"
                  ? "bg-green-900 text-green-300"
                  : currentQuestion.difficulty === "medium"
                    ? "bg-yellow-900 text-yellow-300"
                    : "bg-red-900 text-red-300"
              }`}
            >
              {currentQuestion.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <BookOpen className="w-3 h-3" />
            {currentQuestion.source}
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-6 text-white leading-relaxed">{currentQuestion.question}</h3>

        {/* Multiple Choice */}
        {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
          <RadioGroup value={userAnswer} onValueChange={handleAnswer} className="space-y-3" disabled={showExplanation}>
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3">
                <RadioGroupItem value={option} id={`option-${index}`} className="border-zinc-600 text-white" />
                <Label
                  htmlFor={`option-${index}`}
                  className={`flex-1 text-zinc-300 cursor-pointer p-3 rounded-lg border transition-colors ${
                    showExplanation && option === currentQuestion.correctAnswer
                      ? "border-green-500 bg-green-900/20"
                      : showExplanation && option === userAnswer && option !== currentQuestion.correctAnswer
                        ? "border-red-500 bg-red-900/20"
                        : userAnswer === option
                          ? "border-white bg-zinc-800"
                          : "border-zinc-700 hover:border-zinc-600"
                  }`}
                >
                  <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {/* True/False */}
        {currentQuestion.type === "true-false" && (
          <RadioGroup value={userAnswer} onValueChange={handleAnswer} className="space-y-3" disabled={showExplanation}>
            {["true", "false"].map((option) => (
              <div key={option} className="flex items-center space-x-3">
                <RadioGroupItem value={option} id={option} className="border-zinc-600 text-white" />
                <Label
                  htmlFor={option}
                  className={`flex-1 text-zinc-300 cursor-pointer p-3 rounded-lg border transition-colors ${
                    showExplanation && option === currentQuestion.correctAnswer.toLowerCase()
                      ? "border-green-500 bg-green-900/20"
                      : showExplanation &&
                          option === userAnswer &&
                          option !== currentQuestion.correctAnswer.toLowerCase()
                        ? "border-red-500 bg-red-900/20"
                        : userAnswer === option
                          ? "border-white bg-zinc-800"
                          : "border-zinc-700 hover:border-zinc-600"
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {/* Short Answer */}
        {currentQuestion.type === "short-answer" && (
          <Textarea
            value={userAnswer}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
            disabled={showExplanation}
          />
        )}

        {/* Explanation */}
        {showExplanation && (
          <div className="mt-6 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
            <div className="flex items-center gap-2 mb-2">
              {userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim() ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium text-white">
                {userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim()
                  ? "Correct!"
                  : "Incorrect"}
              </span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">{currentQuestion.explanation}</p>
            {currentQuestion.type === "short-answer" && (
              <div className="mt-3 p-3 bg-zinc-900 rounded border border-zinc-600">
                <span className="text-xs text-zinc-400 block mb-1">Sample Answer:</span>
                <span className="text-zinc-300 text-sm">{currentQuestion.correctAnswer}</span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end">
        {!showExplanation ? (
          <Button
            onClick={handleSubmitAnswer}
            disabled={!isAnswered}
            className="bg-white text-black hover:bg-zinc-200 font-semibold"
          >
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNextQuestion} className="bg-white text-black hover:bg-zinc-200 font-semibold">
            {currentQuestionIndex < 9 ? (
              <>
                Next Question
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              "Finish Quiz"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
