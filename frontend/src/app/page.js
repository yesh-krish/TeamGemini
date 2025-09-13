"use client"

import { Upload } from "lucide-react"
import { Button } from "src/components/ui/button"
import { Card } from "src/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">QuizAI</h1>
            <nav className="flex items-center gap-6">
              <Button variant="ghost" className="text-zinc-400 hover:text-white">
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className="text-zinc-400 hover:text-white"
                onClick={() => (window.location.href = "/analytics")}
              >
                Analytics
              </Button>
              <Button className="bg-white text-black hover:bg-zinc-200">Sign In</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 text-balance">
            Transform Your PDFs into
            <span className="text-zinc-400"> Adaptive Quizzes</span>
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto text-pretty">
            Upload any PDF document and let our AI generate personalized quizzes that adapt to your learning pace
          </p>
        </div>

        {/* Upload Section */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-zinc-900 border-zinc-800 p-8">
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-white">Upload Your PDF</h3>
                <p className="text-zinc-400">Drag and drop your PDF file or click to browse</p>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-zinc-700 rounded-lg p-12 mb-6 hover:border-zinc-600 transition-colors cursor-pointer">
                <input type="file" accept=".pdf" className="hidden" id="pdf-upload" />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                    <p className="text-lg text-zinc-300 mb-2">Choose a PDF file or drag it here</p>
                    <p className="text-sm text-zinc-500">Maximum file size: 10MB</p>
                  </div>
                </label>
              </div>

              <Button
                className="w-full bg-white text-black hover:bg-zinc-200 font-semibold py-3"
                onClick={() => (window.location.href = "/generate")}
              >
                Generate Quiz
              </Button>
            </div>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
              <div className="w-6 h-6 bg-white rounded-sm"></div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">AI-Powered</h3>
            <p className="text-zinc-400">
              Advanced AI analyzes your PDFs and generates relevant questions automatically
            </p>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
              <div className="w-6 h-6 bg-white rounded-sm"></div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Adaptive Learning</h3>
            <p className="text-zinc-400">Quiz difficulty adjusts based on your performance for optimal learning</p>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
              <div className="w-6 h-6 bg-white rounded-sm"></div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Detailed Analytics</h3>
            <p className="text-zinc-400">Track your progress with comprehensive analytics and insights</p>
          </Card>
        </div>
      </main>
    </div>
  )
}
