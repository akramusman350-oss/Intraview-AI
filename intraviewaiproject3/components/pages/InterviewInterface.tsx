"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye, Mic, X, ChevronRight } from "lucide-react"
import type { ProfileFormData } from "./ProfileSetup"

interface InterviewInterfaceProps {
  profileData: ProfileFormData
  onComplete: (interviewData: InterviewData) => void
  onExit: () => void
}

export interface InterviewData {
  mode: "verbal" | "coding"
  answers: string[]
  codeSubmission?: string
  testResults?: TestResult[]
  timestamp: Date
}

interface TestResult {
  name: string
  passed: boolean
  input: string
  expected: string
  actual: string
}

const INTERVIEW_QUESTIONS = [
  "Tell me about your most complex project. What challenges did you face?",
  "Describe a time when you had to learn a new technology quickly.",
  "How do you approach debugging a difficult issue?",
  "Tell me about your experience with the skills you listed.",
]

const CODING_PROBLEMS = [
  {
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.",
    examples: ["Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]"],
    testCases: [
      { name: "Test 1", input: "[2,7,11,15], 9", expected: "[0,1]", passed: true },
      { name: "Test 2", input: "[3,2,4], 6", expected: "[1,2]", passed: true },
      { name: "Test 3", input: "[3,3], 6", expected: "[0,1]", passed: false },
    ],
  },
]

export function InterviewInterface({ profileData, onComplete, onExit }: InterviewInterfaceProps) {
  const [mode, setMode] = useState<"verbal" | "coding">("verbal")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>(Array(INTERVIEW_QUESTIONS.length).fill(""))
  const [codeInput, setCodeInput] = useState("")
  const [timeLeft, setTimeLeft] = useState(45 * 60) // 45 minutes
  const [transcript, setTranscript] = useState("")
  const [testResults, setTestResults] = useState(CODING_PROBLEMS[0].testCases)

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (text: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = text
    setAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < INTERVIEW_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handleSubmitCode = () => {
    // Simulate test execution
    const passedTests = testResults.filter((t) => t.passed).length
    setTestResults((prev) => prev.map((test, idx) => ({ ...test, passed: idx < passedTests })))
  }

  const handleFinishInterview = () => {
    onComplete({
      mode,
      answers: mode === "verbal" ? answers : [],
      codeSubmission: mode === "coding" ? codeInput : undefined,
      testResults: mode === "coding" ? testResults : undefined,
      timestamp: new Date(),
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Top Bar */}
      <div className="bg-slate-950 border-b border-slate-700 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
            AI Tracking Active
          </Badge>
          <div className="flex items-center gap-2 text-slate-300">
            <Eye className="w-4 h-4" />
            <span className="text-sm">Eye Contact Tracking</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Mic className="w-4 h-4" />
            <span className="text-sm">Voice Analysis</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-400" />
            <span className="text-lg font-mono font-bold text-red-400">{formatTime(timeLeft)}</span>
          </div>
          <Button onClick={onExit} variant="destructive" size="sm">
            <X className="w-4 h-4 mr-2" />
            End Interview
          </Button>
        </div>
      </div>

      <div className="p-8">
        {/* Mode Selector */}
        <div className="flex gap-4 mb-8 max-w-4xl mx-auto">
          <Button
            onClick={() => {
              setMode("verbal")
              setCurrentQuestion(0)
            }}
            variant={mode === "verbal" ? "default" : "outline"}
            className={mode === "verbal" ? "bg-blue-600" : "border-slate-600 text-slate-300"}
          >
            Verbal Mode
          </Button>
          <Button
            onClick={() => setMode("coding")}
            variant={mode === "coding" ? "default" : "outline"}
            className={mode === "coding" ? "bg-blue-600" : "border-slate-600 text-slate-300"}
          >
            Coding Mode
          </Button>
        </div>

        {/* Verbal Mode */}
        {mode === "verbal" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Main Question Area */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800 border-slate-700 h-full">
                <CardHeader>
                  <CardTitle className="text-white">
                    Question {currentQuestion + 1} of {INTERVIEW_QUESTIONS.length}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Video Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-video bg-slate-700 rounded-lg border border-slate-600 flex items-center justify-center">
                      <span className="text-slate-400 text-sm">AI Avatar</span>
                    </div>
                    <div className="aspect-video bg-slate-700 rounded-lg border border-slate-600 flex items-center justify-center">
                      <span className="text-slate-400 text-sm">Your Video</span>
                    </div>
                  </div>

                  {/* Question */}
                  <div className="bg-slate-700 p-6 rounded-lg border border-slate-600">
                    <p className="text-white text-lg font-medium">{INTERVIEW_QUESTIONS[currentQuestion]}</p>
                  </div>

                  {/* Answer Area */}
                  <div className="space-y-2">
                    <label className="text-slate-300 text-sm font-medium">Your Response:</label>
                    <Textarea
                      value={answers[currentQuestion]}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      placeholder="Type or speak your answer here..."
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 min-h-24 resize-none"
                    />
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-4 justify-end">
                    {currentQuestion < INTERVIEW_QUESTIONS.length - 1 ? (
                      <Button onClick={handleNextQuestion} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Next Question
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button onClick={() => setMode("coding")} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Proceed to Coding
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transcript Sidebar */}
            <Card className="bg-slate-800 border-slate-700 h-fit sticky top-24">
              <CardHeader>
                <CardTitle className="text-white text-sm">Live Transcript</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-700 p-4 rounded-lg h-64 overflow-y-auto text-slate-300 text-sm leading-relaxed">
                  {transcript || "Transcript will appear here..."}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Coding Mode */}
        {mode === "coding" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Problem Statement */}
            <Card className="bg-slate-800 border-slate-700 h-fit lg:h-screen lg:overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-white">{CODING_PROBLEMS[0].title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300">{CODING_PROBLEMS[0].description}</p>

                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-slate-300 text-sm whitespace-pre-wrap font-mono">
                    {CODING_PROBLEMS[0].examples[0]}
                  </p>
                </div>

                <div>
                  <p className="text-white font-medium mb-3">Test Cases:</p>
                  <div className="space-y-2">
                    {testResults.map((test, idx) => (
                      <div key={idx} className="bg-slate-700 p-3 rounded border border-slate-600">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={test.passed ? "text-green-400" : "text-red-400"}>
                            {test.passed ? "✓" : "✗"} {test.name}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono space-y-1">
                          <div>Input: {test.input}</div>
                          <div>Expected: {test.expected}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Code Editor */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Code Editor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="def twoSum(nums, target):&#10;    # Write your solution here&#10;    pass"
                  className="bg-slate-700 border-slate-600 text-white font-mono text-sm min-h-96 resize-none"
                />

                <div className="flex gap-2">
                  <Button onClick={handleSubmitCode} className="flex-1 bg-green-600 hover:bg-green-700">
                    Run Tests
                  </Button>
                  <Button onClick={handleFinishInterview} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Submit & Finish
                  </Button>
                </div>

                {/* Console Output */}
                <div className="bg-slate-700 p-4 rounded border border-slate-600 min-h-24">
                  <p className="text-slate-400 text-xs font-mono">
                    {testResults.filter((t) => t.passed).length} / {testResults.length} tests passed
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
