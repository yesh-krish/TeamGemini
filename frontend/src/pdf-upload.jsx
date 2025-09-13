"use client"

import { useState, useCallback } from "react"
import { Upload, FileText, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function PDFUpload() {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files).filter((file) => file.type === "application/pdf")
    files.forEach(processFile)
  }, [])

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files || [])
    files.forEach(processFile)
  }, [])

  const processFile = (file) => {
    const id =
      (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2)

    const newFile = {
      file,
      id,
      progress: 0,
      status: "uploading",
    }

    setUploadedFiles((prev) => [...prev, newFile])

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadedFiles((prev) =>
        prev.map((f) => {
          if (f.id === id) {
            if (f.progress < 100) {
              return { ...f, progress: f.progress + 10 }
            } else {
              clearInterval(interval)
              return { ...f, status: "processing" }
            }
          }
          return f
        }),
      )
    }, 200)

    // Simulate processing completion
    setTimeout(() => {
      setUploadedFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status: "complete" } : f)))
    }, 3000)
  }

  const removeFile = (id) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div
          className={`border-2 border-dashed rounded-lg p-12 transition-colors ${
            isDragOver ? "border-white bg-zinc-800/50" : "border-zinc-700 hover:border-zinc-600"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input type="file" accept=".pdf" multiple className="hidden" id="pdf-upload" onChange={handleFileSelect} />
          <label htmlFor="pdf-upload" className="cursor-pointer">
            <div className="text-center">
              <Upload className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
              <p className="text-lg text-zinc-300 mb-2">Choose PDF files or drag them here</p>
              <p className="text-sm text-zinc-500">Maximum file size: 10MB per file</p>
            </div>
          </label>
        </div>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Uploaded Files</h3>
          {uploadedFiles.map((uploadedFile) => (
            <Card key={uploadedFile.id} className="bg-zinc-900 border-zinc-800 p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-zinc-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{uploadedFile.file.name}</p>
                  <p className="text-xs text-zinc-500">{(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB</p>

                  {uploadedFile.status === "uploading" && (
                    <div className="mt-2">
                      <Progress value={uploadedFile.progress} className="h-1" />
                      <p className="text-xs text-zinc-500 mt-1">Uploading... {uploadedFile.progress}%</p>
                    </div>
                  )}

                  {uploadedFile.status === "processing" && (
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
                      <p className="text-xs text-zinc-500">Processing PDF...</p>
                    </div>
                  )}

                  {uploadedFile.status === "complete" && (
                    <p className="text-xs text-green-500 mt-1">Ready for quiz generation</p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(uploadedFile.id)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}

          {uploadedFiles.some((f) => f.status === "complete") && (
            <Button className="w-full bg-white text-black hover:bg-zinc-200 font-semibold">
              Generate Quiz from {uploadedFiles.filter((f) => f.status === "complete").length} file(s)
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
