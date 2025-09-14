"use client"

import { useState } from "react"
import { ArrowLeft, Brain, Settings, Zap } from "lucide-react"
import { Button } from "src/components/ui/button"
import { Card } from "src/components/ui/card"
import { Slider } from "src/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/ui/select"
import { Label } from "recharts"
import { QuizGenerator } from "src/quiz-generator"
import Link from "next/link"

export default function GeneratePage() {
  const [questionCount, setQuestionCount] = useState([10])
  const [difficulty, setDifficulty] = useState("adaptive")
  const [questionTypes, setQuestionTypes] = useState("mixed")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    // Simulate generation process
    setTimeout(() => {
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white">Generate Quiz</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-zinc-900 border-zinc-800 p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-zinc-400" />
                <h2 className="text-xl font-semibold text-white">Quiz Settings</h2>
              </div>

              <div className="space-y-6">
                {/* Question Count */}
                <div>
                  <Label className="text-sm font-medium text-zinc-300 mb-3 block">
                    Number of Questions: {questionCount[0]}
                  </Label>
                  <Slider
                    value={questionCount}
                    onValueChange={setQuestionCount}
                    max={50}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 mt-1">
                    <span>5</span>
                    <span>50</span>
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <Label className="text-sm font-medium text-zinc-300 mb-3 block">Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="adaptive">Adaptive (Recommended)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Question Types */}
                <div>
                  <Label className="text-sm font-medium text-zinc-300 mb-3 block">Question Types</Label>
                  <Select value={questionTypes} onValueChange={setQuestionTypes}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="multiple-choice">Multiple Choice Only</SelectItem>
                      <SelectItem value="true-false">True/False Only</SelectItem>
                      <SelectItem value="short-answer">Short Answer Only</SelectItem>
                      <SelectItem value="mixed">Mixed Types</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-white text-black hover:bg-zinc-200 font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Brain className="w-4 h-4 mr-2 animate-pulse" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Quiz
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Quiz Generator */}
          <div className="lg:col-span-2">
            <QuizGenerator
              isGenerating={isGenerating}
              settings={{
                questionCount: questionCount[0],
                difficulty,
                questionTypes,
              }}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
