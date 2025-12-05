"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, RotateCcw } from "lucide-react"

interface CodingInterviewProps {
  onNavigate: (page: string) => void
}

export function CodingInterview({ onNavigate }: CodingInterviewProps) {
  const [timeLeft, setTimeLeft] = useState(45 * 60) // 45 minutes
  const [language, setLanguage] = useState("javascript")
  const [code, setCode] = useState(`function twoSum(nums, target) {
  // Write your solution here
  return [];
}`)
  const [output, setOutput] = useState("")
  const [testResults, setTestResults] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("problem")

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleRun = () => {
    setOutput("Running tests...")
    setTimeout(() => {
      setTestResults([
        { id: 1, input: "[2, 7, 11, 15], target=9", output: "[0, 1]", status: "passed", time: "0.2ms" },
        { id: 2, input: "[3, 2, 4], target=6", output: "[1, 2]", status: "passed", time: "0.1ms" },
        { id: 3, input: "[3, 3], target=6", output: "[0, 1]", status: "failed", expected: "[0, 1]", time: "0.1ms" },
      ])
      setOutput("✓ 2/3 tests passed")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Two Sum Problem</h1>
          <p className="text-slate-600 text-sm mt-1">Difficulty: Medium</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600">Time Remaining</p>
          <p className={`text-2xl font-bold ${timeLeft < 300 ? "text-red-600" : "text-slate-900"}`}>
            {formatTime(timeLeft)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex gap-6 p-6">
        {/* Left - Problem Statement */}
        <div className="flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="bg-slate-100 border-b border-slate-200">
              <TabsTrigger value="problem">Problem</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>

            <TabsContent value="problem" className="flex-1 p-6 overflow-y-auto">
              <h3 className="font-semibold text-slate-900 mb-4">
                Given an array of integers nums and an integer target...
              </h3>
              <p className="text-slate-700 mb-4">
                Return the indices of the two numbers such that they add up to target. You may assume each input has
                exactly one solution, and you cannot use the same element twice.
              </p>
              <div className="bg-slate-50 p-4 rounded-lg mb-4">
                <p className="font-mono text-sm text-slate-900">
                  Input: nums = [2,7,11,15], target = 9<br />
                  Output: [0,1]
                  <br />
                  Explanation: nums[0] + nums[1] == 9, we return [0, 1].
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-slate-900">Constraints:</p>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li>
                    2 {"<"}= nums.length {"<"}= 10^4
                  </li>
                  <li>
                    -10^9 {"<"}= nums[i] {"<"}= 10^9
                  </li>
                  <li>
                    -10^9 {"<"}= target {"<"}= 10^9
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="instructions" className="flex-1 p-6 overflow-y-auto">
              <h3 className="font-semibold text-slate-900 mb-4">How to use the editor:</h3>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>Write your solution in the code editor</li>
                <li>Use the language selector to change programming language</li>
                <li>Click "Run Code" to test against sample test cases</li>
                <li>Click "Submit" when you're confident in your solution</li>
                <li>Don't use external libraries or frameworks</li>
              </ul>
            </TabsContent>

            <TabsContent value="examples" className="flex-1 p-6 overflow-y-auto">
              <h3 className="font-semibold text-slate-900 mb-4">Test Cases:</h3>
              <div className="space-y-3">
                {[
                  { input: "[2, 7, 11, 15]", target: "9", output: "[0, 1]" },
                  { input: "[3, 2, 4]", target: "6", output: "[1, 2]" },
                  { input: "[3, 3]", target: "6", output: "[0, 1]" },
                ].map((test, i) => (
                  <div key={i} className="bg-slate-50 p-3 rounded border border-slate-200">
                    <p className="font-mono text-sm text-slate-900">
                      Input: {test.input}, target={test.target}
                      <br />
                      Output: {test.output}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right - Code Editor */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Language Selector */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-3">
            <label className="font-medium text-slate-900">Language:</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Editor */}
          <div className="flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
              <p className="text-white font-mono text-sm">editor.js</p>
              <button
                onClick={() =>
                  setCode(`function twoSum(nums, target) {
  // Write your solution here
  return [];
}`)
                }
                className="p-2 hover:bg-slate-800 rounded transition text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 font-mono text-sm border-0 rounded-none resize-none"
              style={{ fontFamily: "Courier New, monospace" }}
            />
          </div>

          {/* Output Console */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col h-40">
            <div className="bg-slate-900 px-4 py-2">
              <p className="text-white font-mono text-sm">Console Output</p>
            </div>
            <div className="flex-1 p-4 bg-slate-950 font-mono text-sm text-green-400 overflow-y-auto">
              {testResults.length > 0 ? (
                <div>
                  {testResults.map((result, i) => (
                    <div key={i}>
                      <p>
                        {result.status === "passed" ? "✓" : "✗"} Test Case {result.id}: {result.status}
                      </p>
                    </div>
                  ))}
                  <p className="mt-2">{output}</p>
                </div>
              ) : (
                <p>{output || "Ready to run tests..."}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button onClick={handleRun} className="flex-1 gap-2">
              <Play className="w-4 h-4" />
              Run Code
            </Button>
            <Button onClick={() => onNavigate("interview-complete")} className="flex-1 bg-green-600 hover:bg-green-700">
              Submit Solution
            </Button>
            <Button onClick={() => onNavigate("candidate-dashboard")} variant="outline" className="flex-1">
              End Interview
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
