"use client"

import { useState, useEffect } from "react"
import { Brain, FileText, CheckCircle } from "lucide-react"
import { Card } from "./components/ui/card"
import { Progress } from "./components/ui/progress"
import Button from "./components/ui/button"
import Link from "next/link"

export function QuizGenerator({ isGenerating, settings }) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [generatedQuestions, setGeneratedQuestions] = useState([])

  useEffect(() => {
    if (isGenerating) {
      setProgress(0)
      setGeneratedQuestions([])

      const steps = [
        { step: "Analyzing PDF content...", duration: 800 },
        { step: "Extracting key concepts...", duration: 600 },
        { step: "Generating questions...", duration: 1000 },
        { step: "Optimizing difficulty...", duration: 400 },
        { step: "Finalizing quiz...", duration: 200 },
      ]

      let currentProgress = 0
      steps.forEach((stepInfo, index) => {
        setTimeout(() => {
          setCurrentStep(stepInfo.step)
          setProgress(((index + 1) / steps.length) * 100)

          if (index === steps.length - 1) {
            setTimeout(() => {
              setGeneratedQuestions(generateMockQuestions(settings))
            }, 200)
          }
        }, currentProgress)
        currentProgress += stepInfo.duration
      })
    }
  }, [isGenerating, settings])

  const generateMockQuestions = (settings) => {
    const mockQuestions = [
      {
        id: "1",
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
        id: "2",
        question: "Neural networks are inspired by the structure of the human brain.",
        type: "true-false",
        correctAnswer: "true",
        explanation:
          "Neural networks are indeed inspired by the biological neural networks found in animal brains, particularly the way neurons connect and process information.",
        difficulty: "easy",
        source: "Page 8, Introduction",
      },
      {
        id: "3",
        question: "Explain the difference between supervised and unsupervised learning.",
        type: "short-answer",
        correctAnswer:
          "Supervised learning uses labeled training data to learn patterns, while unsupervised learning finds patterns in data without labels.",
        explanation:
          "Supervised learning algorithms learn from input-output pairs (labeled data), while unsupervised learning algorithms find hidden patterns or structures in data without knowing the correct answers.",
        difficulty: "hard",
        source: "Page 22, Chapter 4",
      },
    ]

    return mockQuestions.slice(0, Math.min(settings.questionCount, mockQuestions.length))
  }

  if (isGenerating) {
    return (
      <Card className="bg-zinc-900 border-zinc-800 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-8 h-8 text-white animate-pulse" />
          </div>

          <h3 className="text-2xl font-semibold mb-4 text-white">Generating Your Quiz</h3>
          <p className="text-zinc-400 mb-8">{currentStep}</p>

          <div className="max-w-md mx-auto">
            <Progress value={progress} className="mb-4" />
            <p className="text-sm text-zinc-500">{Math.round(progress)}% complete</p>
          </div>
        </div>
      </Card>
    )
  }

  if (generatedQuestions.length === 0) {
    return (
      <Card className="bg-zinc-900 border-zinc-800 p-8">
        <div className="text-center">
          <FileText className="w-16 h-16 text-zinc-600 mx-auto mb-6" />
          <h3 className="text-xl font-semibold mb-2 text-white">Ready to Generate</h3>
          <p className="text-zinc-400">Configure your quiz settings and click "Generate Quiz" to begin</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quiz Summary */}
      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Quiz Generated Successfully</h3>
          <CheckCircle className="w-6 h-6 text-green-500" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{generatedQuestions.length}</div>
            <div className="text-sm text-zinc-400">Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">~{Math.ceil(generatedQuestions.length * 1.5)}</div>
            <div className="text-sm text-zinc-400">Minutes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{settings.difficulty}</div>
            <div className="text-sm text-zinc-400">Difficulty</div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Link href="/quiz/ml-basics" className="flex-1">
            <Button className="w-full bg-white text-black hover:bg-zinc-200">Start Quiz</Button>
          </Link>
          <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent">
            Preview Questions
          </Button>
        </div>
      </Card>

      {/* Generated Questions Preview */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Question Preview</h4>
        {generatedQuestions.slice(0, 3).map((question, index) => (
          <Card key={question.id} className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-400">Q{index + 1}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    question.difficulty === "easy"
                      ? "bg-green-900 text-green-300"
                      : question.difficulty === "medium"
                        ? "bg-yellow-900 text-yellow-300"
                        : "bg-red-900 text-red-300"
                  }`}
                >
                  {question.difficulty}
                </span>
              </div>
              <span className="text-xs text-zinc-500">{question.source}</span>
            </div>

            <h5 className="text-white font-medium mb-3">{question.question}</h5>

            {question.type === "multiple-choice" && question.options && (
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="text-sm text-zinc-400 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full border border-zinc-700 flex items-center justify-center text-xs">
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    {option}
                  </div>
                ))}
              </div>
            )}

            {question.type === "true-false" && (
              <div className="flex gap-4">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full border border-zinc-700 flex items-center justify-center text-xs">
                    T
                  </span>
                  True
                </div>
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full border border-zinc-700 flex items-center justify-center text-xs">
                    F
                  </span>
                  False
                </div>
              </div>
            )}
          </Card>
        ))}

        {generatedQuestions.length > 3 && (
          <p className="text-center text-zinc-500 text-sm">+{generatedQuestions.length - 3} more questions</p>
        )}
      </div>
    </div>
  )
}
