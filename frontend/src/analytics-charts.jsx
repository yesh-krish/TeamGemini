"use client"

import { Card } from "./components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const performanceData = [
  { date: "Mon", score: 65, difficulty: "easy" },
  { date: "Tue", score: 72, difficulty: "medium" },
  { date: "Wed", score: 68, difficulty: "medium" },
  { date: "Thu", score: 85, difficulty: "hard" },
  { date: "Fri", score: 78, difficulty: "medium" },
  { date: "Sat", score: 82, difficulty: "hard" },
  { date: "Sun", score: 88, difficulty: "hard" },
]

const difficultyData = [
  { difficulty: "Easy", count: 8, color: "#22c55e" },
  { difficulty: "Medium", count: 12, color: "#eab308" },
  { difficulty: "Hard", count: 4, color: "#ef4444" },
]

const topicData = [
  { topic: "ML Basics", correct: 15, incorrect: 3 },
  { topic: "Neural Networks", correct: 8, incorrect: 7 },
  { topic: "Deep Learning", correct: 6, incorrect: 9 },
  { topic: "Data Processing", correct: 12, incorrect: 2 },
]

export function AnalyticsCharts() {
  return (
    <div className="space-y-6">
      {/* Performance Over Time */}
      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Performance Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#ffffff"
                strokeWidth={2}
                dot={{ fill: "#ffffff", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Topic Performance */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Topic Performance</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="topic" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" />
                <Bar dataKey="correct" fill="#22c55e" />
                <Bar dataKey="incorrect" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-zinc-400 text-sm">Correct</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-zinc-400 text-sm">Incorrect</span>
            </div>
          </div>
        </Card>

        {/* Difficulty Distribution */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Difficulty Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={difficultyData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="count">
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {difficultyData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                <span className="text-zinc-400 text-sm">{item.difficulty}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
