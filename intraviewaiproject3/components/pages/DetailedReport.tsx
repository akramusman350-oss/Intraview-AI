"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, Settings, User, Video, LogOut } from "lucide-react"

interface DetailedReportProps {
  onNavigate: (page: string) => void
  onLogout: () => void
}

export function DetailedReport({ onNavigate, onLogout }: DetailedReportProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="font-bold text-lg text-slate-900">IntraView AI</span>
        </div>

        <nav className="space-y-2 flex-1">
          <button
            onClick={() => onNavigate("candidate-dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => onNavigate("candidate-profile")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <User className="w-5 h-5" />
            Profile
          </button>
          <button
            onClick={() => onNavigate("candidate-interviews")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <Video className="w-5 h-5" />
            Interviews
          </button>
          <button
            onClick={() => onNavigate("candidate-settings")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </nav>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-white border-b border-slate-200 px-8 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Detailed Interview Report</h1>
          <p className="text-slate-600 text-sm mt-1">In-depth analysis with transcripts and feedback</p>
        </div>

        <div className="p-8 max-w-4xl">
          <Tabs defaultValue="transcript" className="w-full">
            <TabsList className="w-full justify-start bg-white border-b border-slate-200">
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="code">Code Review</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="transcript" className="mt-6">
              <Card className="p-6 bg-white border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Interview Transcript</h3>
                <div className="space-y-4 font-mono text-sm">
                  <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                    <p className="text-blue-900 font-semibold">[00:00:15] AI Interviewer</p>
                    <p className="text-blue-800">Tell me about a time when you faced a challenging project deadline.</p>
                  </div>
                  <div className="border-l-4 border-slate-500 pl-4 py-2 bg-slate-50">
                    <p className="text-slate-900 font-semibold">[00:00:18] Candidate</p>
                    <p className="text-slate-800">
                      In my previous role at TechCorp, I was working on a critical feature...
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                    <p className="text-blue-900 font-semibold">[00:02:45] AI Interviewer</p>
                    <p className="text-blue-800">How did you handle the pressure and timeline?</p>
                  </div>
                  <div className="border-l-4 border-slate-500 pl-4 py-2 bg-slate-50">
                    <p className="text-slate-900 font-semibold">[00:02:48] Candidate</p>
                    <p className="text-slate-800">I started by breaking down requirements and prioritizing tasks...</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="code" className="mt-6">
              <Card className="p-6 bg-white border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Code Review & Analysis</h3>
                <div className="bg-slate-900 text-green-400 p-4 rounded font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}`}</pre>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border-l-4 border-green-500 text-green-800">
                    <p className="font-semibold">✓ Strengths:</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>Optimal O(n) time complexity</li>
                      <li>Clean and readable code</li>
                      <li>Efficient use of HashMap</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800">
                    <p className="font-semibold">⚠ Suggestions:</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>Consider adding input validation</li>
                      <li>Add comments for clarity</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="metrics" className="mt-6">
              <Card className="p-6 bg-white border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 rounded border border-slate-200">
                      <p className="text-slate-600 text-sm">Time Complexity</p>
                      <p className="text-lg font-bold text-slate-900">O(n)</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded border border-slate-200">
                      <p className="text-slate-600 text-sm">Space Complexity</p>
                      <p className="text-lg font-bold text-slate-900">O(n)</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded border border-slate-200">
                      <p className="text-slate-600 text-sm">Tests Passed</p>
                      <p className="text-lg font-bold text-slate-900">10/12</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded border border-slate-200">
                      <p className="text-slate-600 text-sm">Execution Time</p>
                      <p className="text-lg font-bold text-slate-900">0.2ms</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="mt-6">
              <Card className="p-6 bg-white border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Personalized Recommendations</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded border border-blue-200">
                    <p className="font-semibold text-blue-900 mb-2">📚 Study Topic: HashMap/Dictionary</p>
                    <p className="text-blue-800">
                      You solved this using a HashMap. Master related problems like LRU Cache and Two Sum variants.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded border border-blue-200">
                    <p className="font-semibold text-blue-900 mb-2">🎯 Practice Area: Edge Cases</p>
                    <p className="text-blue-800">
                      Work on handling edge cases more systematically. Review null checks and boundary conditions.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded border border-blue-200">
                    <p className="font-semibold text-blue-900 mb-2">💬 Communication Tip</p>
                    <p className="text-blue-800">
                      While explaining your approach, try to slow down slightly and explain your reasoning step-by-step.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4 mt-8">
            <Button onClick={() => onNavigate("report-summary")} variant="outline">
              ← Back to Summary
            </Button>
            <Button onClick={() => onNavigate("candidate-dashboard")}>Done</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
