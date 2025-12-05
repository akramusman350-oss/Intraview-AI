"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Mic, Clock, Play } from "lucide-react"

interface DualModeInterviewProps {
  profileData: {
    name: string
    title: string
    skills: string[]
    education: string
    projects: string
  }
  onNavigate: (page: string, data?: any) => void
}

export function DualModeInterview({ profileData, onNavigate }: DualModeInterviewProps) {
  const [mode, setMode] = useState<"verbal" | "coding">("verbal")
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes per mode
  const [isActive, setIsActive] = useState(true)
  const [transcript, setTranscript] = useState([
    {
      speaker: "AI",
      text: "Hello! Let's discuss your experience with React. Can you tell me about your most complex React project?",
    },
    { speaker: "Candidate", text: "I built a real-time data dashboard that handles thousands of updates per second." },
  ])
  const [codeProblems] = useState([
    {
      id: 1,
      title: "Two Sum",
      description: "Given an array of integers and a target sum, return indices of two numbers that add up to target.",
      examples: "[2, 7, 11, 15], target = 9 → [0, 1]",
    },
    {
      id: 2,
      title: "Longest Substring",
      description: "Find the longest substring without repeating characters.",
    },
  ])
  const [currentProblem, setCurrentProblem] = useState(0)
  const [code, setCode] = useState("// Start typing your solution here\n")

  useEffect(() => {
    if (!isActive) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (mode === "verbal") {
            setMode("coding")
            return 300
          } else {
            handleFinishInterview()
            return 0
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, mode])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleFinishInterview = () => {
    const sessionData = {
      profileData,
      mode,
      completedAt: new Date().toISOString(),
      codeSubmitted: code,
      verbalscore: Math.random() * 100,
      technicalScore: Math.random() * 100,
    }
    onNavigate("detailed-report", sessionData)
  }

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col">
      {/* Top Bar */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium">AI Tracking Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium">Voice Recording</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-lg">
            <Clock className="w-5 h-5" />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
          <Button onClick={() => handleFinishInterview()} variant="destructive" className="bg-red-600 hover:bg-red-700">
            End Interview
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-hidden">
        {mode === "verbal" ? (
          // Verbal Mode
          <div className="grid grid-cols-3 gap-4 h-full">
            {/* Video Grid */}
            <div className="col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4 h-1/2">
                {/* AI Video */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Eye className="w-12 h-12 text-blue-900" />
                    </div>
                    <p className="text-sm font-medium">Interview AI</p>
                  </div>
                </div>

                {/* User Video */}
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-slate-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Mic className="w-12 h-12 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium">{profileData.name}</p>
                  </div>
                </div>
              </div>

              {/* AI Question */}
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <p className="text-sm text-slate-400 mb-2">Current Question</p>
                  <p className="text-base leading-relaxed">
                    "Describe a time when you had to learn a new technology quickly. How did you approach it?"
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Transcript Sidebar */}
            <div className="bg-slate-800 rounded-lg p-4 flex flex-col border border-slate-700">
              <h3 className="font-semibold mb-4 text-sm text-slate-300">Live Transcript</h3>
              <div className="flex-1 overflow-y-auto space-y-3">
                {transcript.map((entry, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="text-blue-400 font-medium text-xs mb-1">{entry.speaker}</p>
                    <p className="text-slate-200 text-xs leading-relaxed">{entry.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Coding Mode
          <div className="grid grid-cols-2 gap-6 h-full">
            {/* Problem Statement */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-blue-300">{codeProblems[currentProblem].title}</h2>
              <div className="space-y-4 text-sm text-slate-300">
                <div>
                  <p className="font-semibold text-slate-200 mb-2">Description</p>
                  <p>{codeProblems[currentProblem].description}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-200 mb-2">Examples</p>
                  <p className="font-mono text-xs bg-slate-900 p-3 rounded text-green-400">
                    {codeProblems[currentProblem].examples}
                  </p>
                </div>
              </div>

              {/* Problem Navigation */}
              <div className="flex gap-2 mt-6">
                {codeProblems.map((_, idx) => (
                  <Button
                    key={idx}
                    onClick={() => setCurrentProblem(idx)}
                    variant={currentProblem === idx ? "default" : "outline"}
                    size="sm"
                    className={currentProblem === idx ? "bg-blue-600 text-white" : "border-slate-600"}
                  >
                    Problem {idx + 1}
                  </Button>
                ))}
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex flex-col bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div className="bg-slate-900 p-4 border-b border-slate-700">
                <p className="text-sm font-medium text-slate-400">Code Editor</p>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 bg-slate-800 text-slate-100 p-4 font-mono text-sm border-0 focus:outline-none resize-none"
                placeholder="// Write your solution here"
              />
              <div className="bg-slate-900 p-4 border-t border-slate-700 space-y-2">
                <p className="text-xs text-slate-400">Console Output:</p>
                <div className="bg-black p-3 rounded text-xs text-green-400 font-mono min-h-16 max-h-24 overflow-y-auto">
                  $ Run test cases to see output
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="bg-slate-800 border-t border-slate-700 px-6 py-4 flex justify-end gap-3">
        {mode === "verbal" ? (
          <Button onClick={() => setMode("coding")} className="bg-blue-600 hover:bg-blue-700 text-white">
            Proceed to Coding
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleFinishInterview} className="bg-green-600 hover:bg-green-700 text-white">
            Submit & Finish
            <Play className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}

import { ArrowRight } from "lucide-react"
