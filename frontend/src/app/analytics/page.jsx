"use client"

import { ArrowLeft, TrendingUp, Target, Clock, Brain, Award, BarChart3 } from "lucide-react"
import { Button } from "src/components/ui/button"
import { Card } from "src/components/ui/card"
import { Progress } from "src/components/ui/progress"
import { AnalyticsCharts } from "src/analytics-charts"
import { PerformanceMetrics } from "src/performance-metrics"
import Link from "next/link"

export default function AnalyticsPage() {
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
              <h1 className="text-2xl font-bold text-white">Learning Analytics</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent">
                Export Data
              </Button>
              <Button className="bg-white text-black hover:bg-zinc-200">Generate Report</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Total Quizzes</p>
                <p className="text-2xl font-bold text-white">24</p>
                <p className="text-green-400 text-xs flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% this week
                </p>
              </div>
              <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-zinc-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Average Score</p>
                <p className="text-2xl font-bold text-white">78%</p>
                <p className="text-green-400 text-xs flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5% improvement
                </p>
              </div>
              <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-zinc-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Study Time</p>
                <p className="text-2xl font-bold text-white">42h</p>
                <p className="text-zinc-400 text-xs flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  This month
                </p>
              </div>
              <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-zinc-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Streak</p>
                <p className="text-2xl font-bold text-white">7 days</p>
                <p className="text-yellow-400 text-xs flex items-center mt-1">
                  <Award className="w-3 h-3 mr-1" />
                  Personal best!
                </p>
              </div>
              <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-zinc-400" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Analytics */}
          <div className="lg:col-span-2 space-y-6">
            <AnalyticsCharts />

            {/* Recent Quizzes */}
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Quiz Performance</h3>
              <div className="space-y-4">
                {[
                  { title: "Machine Learning Basics", score: 85, difficulty: "medium", date: "2 hours ago" },
                  { title: "Neural Networks", score: 72, difficulty: "hard", date: "1 day ago" },
                  { title: "Data Preprocessing", score: 91, difficulty: "easy", date: "2 days ago" },
                  { title: "Deep Learning", score: 68, difficulty: "hard", date: "3 days ago" },
                ].map((quiz, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{quiz.title}</h4>
                      <p className="text-sm text-zinc-400">{quiz.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          quiz.difficulty === "easy"
                            ? "bg-green-900 text-green-300"
                            : quiz.difficulty === "medium"
                              ? "bg-yellow-900 text-yellow-300"
                              : "bg-red-900 text-red-300"
                        }`}
                      >
                        {quiz.difficulty}
                      </span>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-white">{quiz.score}%</div>
                        <Progress value={quiz.score} className="w-16 h-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PerformanceMetrics />

            {/* Learning Insights */}
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Learning Insights</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 font-medium">Strength</span>
                  </div>
                  <p className="text-blue-200 text-sm">You excel at basic concepts and definitions</p>
                </div>

                <div className="p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-300 font-medium">Focus Area</span>
                  </div>
                  <p className="text-yellow-200 text-sm">Mathematical foundations need more practice</p>
                </div>

                <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-300 font-medium">Improvement</span>
                  </div>
                  <p className="text-green-200 text-sm">Your adaptive learning is working well</p>
                </div>
              </div>
            </Card>

            {/* Study Recommendations */}
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
                  <p className="text-zinc-300 text-sm">Review gradient descent concepts before next quiz</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
                  <p className="text-zinc-300 text-sm">Practice more hard-level questions to improve</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
                  <p className="text-zinc-300 text-sm">Your current pace is optimal for retention</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
