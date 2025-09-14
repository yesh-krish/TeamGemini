"use client"

import { ArrowLeft, TrendingUp, Target, Clock, BarChart3, Download, HelpCircle, BookOpen, Zap } from "lucide-react"
import { Button } from "src/components/ui/button"
import { Card } from "src/components/ui/card"
import { Progress } from "src/components/ui/progress"
import { Badge } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function AnalyticsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("week")

  // Mock data - replace with real data from your backend
  const overallMasteryScore = 78
  const avgTimePerQuestion = 45 // seconds
  const quizCompletionRate = 85
  const totalQuizzes = 24
  const studyStreak = 7
  const totalStudyTime = 42 // hours
  const eli5UsageCount = 12

  // Conceptual knowledge data for heatmap
  const conceptualKnowledge = [
    { topic: "Machine Learning Basics", score: 92, questions: 15, color: "bg-green-500" },
    { topic: "Neural Networks", score: 68, questions: 12, color: "bg-yellow-500" },
    { topic: "Deep Learning", score: 45, questions: 8, color: "bg-red-500" },
    { topic: "Data Preprocessing", score: 88, questions: 10, color: "bg-green-500" },
    { topic: "Computer Vision", score: 72, questions: 6, color: "bg-yellow-500" },
    { topic: "Natural Language Processing", score: 55, questions: 9, color: "bg-red-500" },
  ]

  // Recent quiz data with source citations
  const recentQuizzes = [
    {
      title: "Machine Learning Basics",
      score: 85,
      difficulty: "medium",
      date: "2 hours ago",
      sourceCitations: 3,
      mistakeCount: 2,
    },
    {
      title: "Neural Networks",
      score: 72,
      difficulty: "hard",
      date: "1 day ago",
      sourceCitations: 5,
      mistakeCount: 4,
    },
    {
      title: "Data Preprocessing",
      score: 91,
      difficulty: "easy",
      date: "2 days ago",
      sourceCitations: 2,
      mistakeCount: 1,
    },
    {
      title: "Deep Learning",
      score: 68,
      difficulty: "hard",
      date: "3 days ago",
      sourceCitations: 4,
      mistakeCount: 5,
    },
  ]

  // Difficulty progression data
  const difficultyProgression = [
    { question: 1, difficulty: 3 },
    { question: 2, difficulty: 4 },
    { question: 3, difficulty: 3 },
    { question: 4, difficulty: 5 },
    { question: 5, difficulty: 4 },
    { question: 6, difficulty: 3 },
    { question: 7, difficulty: 4 },
    { question: 8, difficulty: 5 },
  ]

  const handleExportWeaknessReport = async () => {
    // This would call your backend API to generate the personalized weakness report
    console.log("Generating weakness report...")
    // Mock implementation - replace with actual API call
    alert("Weakness report generated! Check your downloads.")
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-white">Learning Analytics Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                onClick={handleExportWeaknessReport}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Weakness Report
              </Button>
              <Button className="bg-white text-black hover:bg-zinc-200">
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Full Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Tier 1: Core Performance Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Core Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Overall Mastery Score - Hero Metric */}
            <Card className="bg-zinc-900 border-zinc-800 p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-zinc-400 text-sm mb-2">Overall Mastery Score</p>
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#374151"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={
                            overallMasteryScore >= 80 ? "#10b981" : overallMasteryScore >= 60 ? "#f59e0b" : "#ef4444"
                          }
                          strokeWidth="2"
                          strokeDasharray={`${overallMasteryScore}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-2xl font-bold ${getScoreColor(overallMasteryScore)}`}>
                          {overallMasteryScore}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">{overallMasteryScore}%</p>
                      <p className="text-green-400 text-sm flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +5% this week
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-zinc-400" />
                </div>
              </div>
            </Card>

            {/* Time on Task */}
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Avg Time per Question</p>
                  <p className="text-2xl font-bold text-white">{avgTimePerQuestion}s</p>
                  <p className="text-green-400 text-xs flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    -8s improvement
                  </p>
                </div>
                <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-zinc-400" />
                </div>
              </div>
            </Card>

            {/* Quiz Completion Rate */}
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Completion Rate</p>
                  <p className="text-2xl font-bold text-white">{quizCompletionRate}%</p>
                  <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${quizCompletionRate}%` }}></div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-zinc-400" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Tier 2: Deeper Insights */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Deeper Learning Insights</h2>

          {/* Conceptual Knowledge Heatmap */}
          <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Conceptual Knowledge Heatmap</h3>
            <div className="space-y-3">
              {conceptualKnowledge.map((concept, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">{concept.topic}</span>
                      <span className={`font-bold ${getScoreColor(concept.score)}`}>{concept.score}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-zinc-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${getScoreBgColor(concept.score)}`}
                          style={{ width: `${concept.score}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-zinc-400">{concept.questions} questions</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Difficulty Progression Chart */}
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Adaptive Difficulty Progression</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-zinc-400 mb-2">
                  <span>Question #</span>
                  <span>Difficulty Level</span>
                </div>
                {difficultyProgression.map((point, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-zinc-300 w-8">{point.question}</span>
                    <div className="flex-1 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-4 h-4 rounded-sm ${level <= point.difficulty ? "bg-blue-500" : "bg-zinc-700"}`}
                        />
                      ))}
                    </div>
                    <span className="text-zinc-400 text-sm w-12">Level {point.difficulty}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Mistake & Revision Frequency */}
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Mistake Analysis</h3>
              <div className="space-y-4">
                {recentQuizzes.map((quiz, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-white text-sm">{quiz.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {quiz.mistakeCount} mistakes
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {quiz.sourceCitations} citations
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${getScoreColor(quiz.score)}`}>{quiz.score}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Tier 3: Engagement & Behavioral Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Engagement Metrics</h2>
          <div>
            {/* User Engagement Funnel */}
            

            {/* Content Utilization */}
            

            {/* Study Recommendations */}
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">AI Recommendations</h3>
              <div className="space-y-3">
                <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-red-400" />
                    <span className="text-red-300 font-medium text-sm">Priority</span>
                  </div>
                  <p className="text-red-200 text-xs">
                    Focus on Deep Learning fundamentals - 45% accuracy needs improvement
                  </p>
                </div>

                <div className="p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-300 font-medium text-sm">Timing</span>
                  </div>
                  <p className="text-yellow-200 text-xs">
                    You're spending too much time on basic questions - trust your knowledge
                  </p>
                </div>

                <div className="p-3 bg-green-900/20 border border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-300 font-medium text-sm">Strength</span>
                  </div>
                  <p className="text-green-200 text-xs">Excellent progress in ML Basics - ready for advanced topics</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Activity with Enhanced Details */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Recent Quiz Performance</h3>
            <div className="flex gap-2">
              <Button
                variant={selectedTimeframe === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe("week")}
                className="text-xs"
              >
                Week
              </Button>
              <Button
                variant={selectedTimeframe === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe("month")}
                className="text-xs"
              >
                Month
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {recentQuizzes.map((quiz, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-white">{quiz.title}</h4>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        quiz.difficulty === "easy"
                          ? "border-green-600 text-green-300"
                          : quiz.difficulty === "medium"
                            ? "border-yellow-600 text-yellow-300"
                            : "border-red-600 text-red-300"
                      }`}
                    >
                      {quiz.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <span>{quiz.date}</span>
                    <span>• {quiz.mistakeCount} mistakes</span>
                    <span>• {quiz.sourceCitations} source citations</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${getScoreColor(quiz.score)}`}>{quiz.score}%</div>
                  <Progress value={quiz.score} className="w-16 h-1 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  )
}
