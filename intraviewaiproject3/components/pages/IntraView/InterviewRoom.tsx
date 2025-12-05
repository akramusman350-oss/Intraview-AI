"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IntraViewSidebar } from "../../IntraViewSidebar"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  Phone,
  Code2,
  MessageSquare,
  Play,
  Copy,
  Terminal,
  ChevronLeft,
} from "lucide-react"

interface InterviewRoomProps {
  profileData: any
  onComplete: (data: any) => void
  onExit: () => void
}

export function InterviewRoom({ profileData, onComplete, onExit }: InterviewRoomProps) {
  const [stage, setStage] = useState<"verbal" | "coding">("verbal")
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [code, setCode] = useState("// Write your solution here\nfunction solution(n) {\n  \n}")
  const [timeRemaining, setTimeRemaining] = useState(45 * 60)
  const [questionStartTime, setQuestionStartTime] = useState(2 * 60)

  useEffect(() => {
    if (stage === "verbal" && questionStartTime > 0) {
      const interval = setInterval(() => {
        setQuestionStartTime((prev) => {
          if (prev <= 1) {
            if (currentQuestion < verbalQuestions.length - 1) {
              setCurrentQuestion((q) => q + 1)
              return 2 * 60
            } else {
              // All questions done, auto-switch to coding
              setStage("coding")
              return 2 * 60
            }
          }
          return prev - 1
        })
        setTimeRemaining((prev) => Math.max(0, prev - 1))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [stage, questionStartTime, currentQuestion])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const verbalQuestions = [
    "Tell me about your experience with React and how you've used hooks in production.",
    "Explain the difference between var, let, and const in JavaScript.",
    "How do you approach debugging a complex issue in your codebase?",
    "Describe a time you had to learn a new technology quickly.",
  ]

  const codingProblems = [
    {
      title: "Two Sum",
      description:
        "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.",
      examples: ["Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]"],
      testCases: [
        { input: "[2,7,11,15], 9", expected: "[0,1]", passed: true },
        { input: "[3,2,4], 6", expected: "[1,2]", passed: false },
        { input: "[3,3], 6", expected: "[0,1]", passed: false },
      ],
    },
  ]

  const handleCompleteInterview = () => {
    onComplete({
      confidenceScore: 78,
      technicalAccuracy: 82,
      videoAnalysis: {
        eyeContact: 75,
        articulation: 88,
        clarity: 85,
      },
      codeTestResults: {
        testsPassed: 2,
        totalTests: 3,
        executionTime: "1.2ms",
      },
      feedback: {
        strengths: [
          "Clear articulation and confident communication",
          "Strong problem-solving approach",
          "Good code structure and readability",
        ],
        improvements: [
          "Could optimize solution for better time complexity",
          "More eye contact would improve engagement",
        ],
      },
    })
  }

  return (
    <div className="flex h-screen bg-background">
      <IntraViewSidebar currentView="interviews" onNavigate={() => {}} profileCompleted={true} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-card border-b border-border sticky top-0 z-50 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-foreground">IntraView AI</h1>
              <Badge variant="outline" className="text-accent">
                {stage === "verbal"
                  ? `Verbal Mode - Question ${currentQuestion + 1}/${verbalQuestions.length}`
                  : "Coding Mode"}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-2xl font-mono font-semibold text-primary">{formatTime(timeRemaining)}</div>
              <Button variant="outline" size="sm" onClick={onExit}>
                <Phone className="w-4 h-4 mr-2" />
                End Interview
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {stage === "verbal" ? (
            // Verbal Mode
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Video Grid */}
                <div className="lg:col-span-2">
                  <Card className="overflow-hidden">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted min-h-96">
                      {/* AI Video */}
                      <div className="bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                        <div className="text-center">
                          <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">AI Interviewer</p>
                        </div>
                      </div>
                      {/* User Video */}
                      <div className="bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
                        {isVideoOff ? (
                          <div className="text-center">
                            <VideoOff className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Camera Off</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="w-16 h-16 bg-secondary rounded-full mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">You</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="bg-card border-t border-border p-4 flex gap-4 justify-center">
                      <Button
                        size="icon"
                        variant={isMuted ? "destructive" : "outline"}
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant={isVideoOff ? "destructive" : "outline"}
                        onClick={() => setIsVideoOff(!isVideoOff)}
                      >
                        {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                      </Button>
                      <Button size="icon" variant="outline">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Transcript Sidebar */}
                <Card className="p-4">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Live Transcript
                  </h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">AI</p>
                      <p className="text-sm text-foreground">{verbalQuestions[currentQuestion]}</p>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">You</p>
                      <p className="text-sm text-foreground">
                        I've been working with React for 3 years now, and hooks have been instrumental...
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Question Display */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Question {currentQuestion + 1} of {verbalQuestions.length}
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    Time per question: {formatTime(questionStartTime)}
                  </div>
                </div>
                <p className="text-foreground text-lg mb-6">{verbalQuestions[currentQuestion]}</p>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <div className="flex-1" />
                  <p className="text-sm text-muted-foreground py-2">Auto-advancing to next question...</p>
                </div>
              </Card>
            </div>
          ) : (
            // Coding Mode
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Problem Statement */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">{codingProblems[0].title}</h3>
                  <p className="text-muted-foreground mb-4">{codingProblems[0].description}</p>
                  <div className="space-y-3 mb-6">
                    <p className="font-semibold text-sm text-foreground">Example:</p>
                    <pre className="bg-secondary p-3 rounded text-xs text-foreground overflow-x-auto">
                      {codingProblems[0].examples[0]}
                    </pre>
                  </div>

                  {/* Test Cases */}
                  <div className="space-y-2">
                    <p className="font-semibold text-sm text-foreground">Test Cases:</p>
                    {codingProblems[0].testCases.map((tc, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded flex items-center gap-3 ${
                          tc.passed ? "bg-green-500/10 border border-green-500/30" : "bg-muted border border-border"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${tc.passed ? "bg-green-500" : "bg-muted-foreground"}`} />
                        <div className="text-xs font-mono text-foreground">
                          {tc.input} → {tc.expected}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Code Editor */}
                <div className="space-y-4">
                  <Card className="overflow-hidden">
                    <div className="bg-card border-b border-border p-3 flex items-center justify-between">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Code2 className="w-4 h-4" />
                        Solution
                      </h3>
                      <Button size="sm" variant="ghost">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full p-4 bg-secondary font-mono text-sm text-foreground border-none focus:outline-none resize-none"
                      rows={12}
                    />
                  </Card>

                  {/* Console */}
                  <Card className="p-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                      <Terminal className="w-4 h-4" />
                      Console
                    </h3>
                    <div className="bg-secondary rounded p-3 font-mono text-xs text-muted-foreground space-y-1 min-h-24">
                      <p>{">"} Solution submitted</p>
                      <p>Running tests...</p>
                      <p className="text-green-500">Test 1: PASSED ✓</p>
                      <p className="text-red-500">Test 2: FAILED ✗</p>
                      <p className="text-muted-foreground">Test 3: PENDING</p>
                    </div>
                  </Card>

                  <Button className="w-full" size="lg" onClick={handleCompleteInterview}>
                    <Play className="w-4 h-4 mr-2" />
                    Submit & View Results
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
