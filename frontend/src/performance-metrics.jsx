"use client"
import { Card } from "./components/ui/card"
import { Progress } from "./components/ui/progress"
import { TrendingUp, TrendingDown, Target, Clock, Brain, Zap } from "lucide-react"

export function PerformanceMetrics() {
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>

      <div className="space-y-6">
        {/* Accuracy */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-300 text-sm">Overall Accuracy</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-white font-semibold">78%</span>
            </div>
          </div>
          <Progress value={78} className="h-2" />
        </div>

        {/* Response Time */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-300 text-sm">Avg Response Time</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-green-500" />
              <span className="text-white font-semibold">45s</span>
            </div>
          </div>
          <Progress value={65} className="h-2" />
          <p className="text-xs text-zinc-500 mt-1">15s faster than average</p>
        </div>

        {/* Adaptive Learning */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-300 text-sm">Adaptive Progress</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-blue-500" />
              <span className="text-white font-semibold">92%</span>
            </div>
          </div>
          <Progress value={92} className="h-2" />
          <p className="text-xs text-zinc-500 mt-1">Excellent adaptation rate</p>
        </div>

        {/* Consistency */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-300 text-sm">Consistency Score</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-yellow-500" />
              <span className="text-white font-semibold">84%</span>
            </div>
          </div>
          <Progress value={84} className="h-2" />
          <p className="text-xs text-zinc-500 mt-1">Very consistent performance</p>
        </div>
      </div>

      {/* Learning Velocity */}
      <div className="mt-6 p-4 bg-zinc-800 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-zinc-300 text-sm">Learning Velocity</span>
          <span className="text-green-400 font-semibold">+12%</span>
        </div>
        <p className="text-xs text-zinc-500">You're learning 12% faster than your baseline. Keep up the great work!</p>
      </div>
    </Card>
  )
}
