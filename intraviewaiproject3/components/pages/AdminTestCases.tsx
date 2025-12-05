"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Home,
  FileText,
  Code,
  Users,
  Video,
  Sliders,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  Sparkles,
  Loader2,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"

interface AdminTestCasesProps {
  onNavigate: (page: string) => void
  onLogout: () => void
}

interface Question {
  id: string
  title: string
  difficulty?: string
  description?: string
  category?: string
  topics?: string[]
  examples?: Array<{ example_num?: number; example_text?: string; images?: any[] }>
  constraints?: string[]
  hints?: string[]
  code_snippets?: Record<string, string>
}

interface TestCase {
  id: string
  input: string
  output: string
  is_hidden: boolean
}

export function AdminTestCases({ onNavigate, onLogout }: AdminTestCasesProps) {
  const { toast } = useToast()
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedQuestion, setSelectedQuestion] = useState<string>("")
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewQuestion, setViewQuestion] = useState<Question | null>(null)
  const [editing, setEditing] = useState<TestCase | null>(null)
  const [form, setForm] = useState({ input: "", output: "", is_hidden: false })
  const [search, setSearch] = useState("")
  
  // Pagination for questions
  const [questionsPage, setQuestionsPage] = useState(1)
  const [questionsTotal, setQuestionsTotal] = useState(0)
  const questionsLimit = 20
  
  // Pagination for test cases
  const [testCasesPage, setTestCasesPage] = useState(1)
  const testCasesLimit = 10

  // Gemini generation state
  const [geminiDialogOpen, setGeminiDialogOpen] = useState(false)
  const [geminiPrompt, setGeminiPrompt] = useState("")
  const [geminiDifficulty, setGeminiDifficulty] = useState("Medium")
  const [generating, setGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<Array<{
    title: string
    description: string
    category: string
    difficulty: string
  }>>([])
  const difficulties = ["Easy", "Medium", "Hard"]

  const loadQuestions = useCallback(async () => {
    try {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : ""
      const data = await api.get<{ items: Question[]; total: number; page: number; limit: number }>(
        `/questions?category=Coding&page=${questionsPage}&limit=${questionsLimit}${searchParam}`
      )
      setQuestions(data.items)
      setQuestionsTotal(data.total)
      if (data.items.length && !selectedQuestion) {
        setSelectedQuestion(data.items[0].id)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load coding questions",
        description: error.message,
      })
    }
  }, [toast, questionsPage, questionsLimit, search, selectedQuestion])

  const loadTestCases = useCallback(
    async (questionId: string) => {
      if (!questionId) return
      try {
        setLoading(true)
        const data = await api.get<TestCase[]>(`/testcases/${questionId}`)
        setTestCases(data)
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Failed to load test cases",
          description: error.message,
        })
      } finally {
        setLoading(false)
      }
    },
    [toast]
  )

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  useEffect(() => {
    // Reset to page 1 when search changes
    if (search !== undefined) {
      setQuestionsPage(1)
    }
  }, [search])

  useEffect(() => {
    if (selectedQuestion) {
      loadTestCases(selectedQuestion)
      setTestCasesPage(1) // Reset test cases page when question changes
    } else {
      setTestCases([])
    }
  }, [selectedQuestion, loadTestCases])

  // Paginate test cases client-side
  const paginatedTestCases = useMemo(() => {
    const start = (testCasesPage - 1) * testCasesLimit
    const end = start + testCasesLimit
    return testCases.slice(start, end)
  }, [testCases, testCasesPage, testCasesLimit])

  const testCasesTotal = testCases.length

  const openDialog = (testCase?: TestCase) => {
    if (testCase) {
      setEditing(testCase)
      setForm({ input: testCase.input, output: testCase.output, is_hidden: testCase.is_hidden })
    } else {
      setEditing(null)
      setForm({ input: "", output: "", is_hidden: false })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!selectedQuestion) return
    try {
      if (editing) {
        await api.put(`/testcases/${editing.id}`, {
          input: form.input,
          output: form.output,
          is_hidden: form.is_hidden,
        })
        toast({ 
          title: "Test case is updated",
          description: "Test case has been successfully updated"
        })
      } else {
        await api.post("/testcases", { question_id: selectedQuestion, ...form })
        toast({ 
          title: "Test case is added",
          description: "Test case has been successfully added"
        })
      }
      setDialogOpen(false)
      loadTestCases(selectedQuestion)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to save test case",
        description: error.message,
      })
    }
  }

  const handleDelete = async (testCase: TestCase) => {
    if (!window.confirm("Delete this test case?")) return
    try {
      await api.delete(`/testcases/${testCase.id}`)
      toast({ 
        title: "Test case is deleted",
        description: "Test case has been successfully deleted"
      })
      loadTestCases(selectedQuestion)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete test case",
        description: error.message,
      })
    }
  }

  // Extract number from prompt (e.g., "generate 5 questions" -> 5)
  const extractCount = (prompt: string): number => {
    const match = prompt.match(/\b(\d+)\s+questions?\b/i)
    return match ? parseInt(match[1], 10) : 5
  }

  const handleGenerateQuestions = async () => {
    if (!geminiPrompt.trim()) {
      toast({
        variant: "destructive",
        title: "Prompt required",
        description: "Please enter a prompt for question generation",
      })
      return
    }

    try {
      setGenerating(true)
      const count = extractCount(geminiPrompt)
      const response = await api.post("/questions/generate", {
        prompt: geminiPrompt,
        category: "Coding", // Keep as "Coding" in backend, but display as "Programming"
        difficulty: geminiDifficulty,
        count: count,
      })
      setGeneratedQuestions(response.questions || [])
      toast({
        title: "Questions generated successfully",
        description: `Generated ${response.questions?.length || 0} questions from Gemini`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to generate questions",
        description: error.message,
      })
      setGeneratedQuestions([])
    } finally {
      setGenerating(false)
    }
  }

  const handleAddGeneratedQuestion = async (question: typeof generatedQuestions[0]) => {
    try {
      const created = await api.post<Question>("/questions", {
        title: question.title,
        category: "Coding", // Keep as "Coding" in backend, but display as "Programming"
        difficulty: question.difficulty,
        description: question.description,
      })
      toast({
        title: "Question is added",
        description: `Question with "${question.title}" is added`,
      })
      // Remove from generated list
      setGeneratedQuestions((prev) => prev.filter((q, i) => q.title !== question.title || i !== prev.findIndex((q2) => q2.title === question.title)))
      // Refresh questions list
      await loadQuestions()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to add question",
        description: error.message,
      })
    }
  }

  const handleViewQuestion = async (question: Question) => {
    try {
      // Fetch full question details from API to ensure we have all fields
      const fullQuestion = await api.get<Question>(`/questions/${question.id}`)
      setViewQuestion(fullQuestion)
      setViewDialogOpen(true)
    } catch (error: any) {
      // Fallback to cached question if API call fails
      setViewQuestion(question)
      setViewDialogOpen(true)
      toast({
        variant: "destructive",
        title: "Failed to load full question details",
        description: error.message,
      })
    }
  }

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col h-full overflow-y-auto">
        <div className="flex items-center gap-2 mb-8">
          <Image src="/logo-01.png" alt="IntraView AI" width={32} height={32} className="w-8 h-8 object-contain" />
          <span className="font-bold text-lg text-slate-900">IntraView AI</span>
        </div>

        <nav className="space-y-2 flex-1">
          <button
            onClick={() => onNavigate("admin-dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => onNavigate("admin-questions")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <FileText className="w-5 h-5" />
            Question Bank
          </button>
          <button
            onClick={() => onNavigate("admin-testcases")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 text-blue-800 font-medium"
          >
            <Code className="w-5 h-5" />
            Test Cases
          </button>
          <button
            onClick={() => onNavigate("admin-candidates")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <Users className="w-5 h-5" />
            Candidates
          </button>
          <button
            onClick={() => onNavigate("admin-sessions")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <Video className="w-5 h-5" />
            Sessions
          </button>
          <button
            onClick={() => onNavigate("admin-rubrics")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <Sliders className="w-5 h-5" />
            Rubrics
          </button>
          <button
            onClick={() => onNavigate("admin-analytics")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <BarChart3 className="w-5 h-5" />
            Analytics
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="space-y-2 border-t border-slate-200 pt-4">
          <button
            onClick={() => onNavigate("admin-settings")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Sticky Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Test Case Management</h1>
            <p className="text-slate-600 text-sm mt-1">Manage test cases for Programming questions</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => selectedQuestion && loadTestCases(selectedQuestion)}
              disabled={loading || !selectedQuestion}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setGeminiDialogOpen(true)}
              >
                <Sparkles className="w-4 h-4" />
                Generate Question with Gemini
              </Button>
              <Button className="gap-2" onClick={() => openDialog()} disabled={!selectedQuestion}>
                <Plus className="w-4 h-4" />
                Add Test Case
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Coding questions list */}
          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Programming Questions</h2>
                <p className="text-slate-600 text-sm">Select a question to view and manage its test cases.</p>
              </div>
              <div className="w-72">
                <Input
                  placeholder="Search programming questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((q) => (
                    <TableRow
                      key={q.id}
                      className={`${
                        q.id === selectedQuestion ? "bg-slate-50/60" : "hover:bg-slate-50"
                      }`}
                      onClick={() => setSelectedQuestion(q.id)}
                    >
                      <TableCell className="font-medium text-slate-900">{q.title}</TableCell>
                      <TableCell className="text-slate-600">{q.difficulty || "Medium"}</TableCell>
                      <TableCell>
                        <button
                          className="p-2 hover:bg-slate-200 rounded transition"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewQuestion(q)
                          }}
                          title="View full question"
                        >
                          <Eye className="w-4 h-4 text-slate-700" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!questions.length && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-slate-500 py-6">
                        No coding questions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Pagination for Questions */}
            {questionsTotal > 0 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Showing {(questionsPage - 1) * questionsLimit + 1} to{" "}
                  {Math.min(questionsPage * questionsLimit, questionsTotal)} of {questionsTotal} questions
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuestionsPage((p) => Math.max(1, p - 1))}
                    disabled={questionsPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.ceil(questionsTotal / questionsLimit) }, (_, i) => i + 1)
                      .filter((page) => {
                        const totalPages = Math.ceil(questionsTotal / questionsLimit)
                        return (
                          page === 1 ||
                          page === totalPages ||
                          (page >= questionsPage - 2 && page <= questionsPage + 2)
                        )
                      })
                      .map((page, idx, arr) => {
                        const prevPage = arr[idx - 1]
                        const showEllipsis = prevPage && page - prevPage > 1
                        return (
                          <div key={page} className="flex items-center gap-1">
                            {showEllipsis && <span className="px-2 text-slate-400">...</span>}
                            <Button
                              variant={questionsPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setQuestionsPage(page)}
                              className="min-w-[2.5rem]"
                            >
                              {page}
                            </Button>
                          </div>
                        )
                      })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuestionsPage((p) => p + 1)}
                    disabled={questionsPage >= Math.ceil(questionsTotal / questionsLimit)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Test Cases Table */}
          {selectedQuestion && (
            <Card className="p-6 bg-white border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Test Cases</h2>
                  <p className="text-slate-600 text-sm">
                    {loading ? "Loading..." : `${testCases.length} test case${testCases.length !== 1 ? "s" : ""} for selected question`}
                  </p>
                </div>
              </div>
              {loading ? (
                <div className="text-center py-8 text-slate-500">Loading test cases...</div>
              ) : testCases.length > 0 ? (
                <>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead>Input</TableHead>
                          <TableHead>Expected Output</TableHead>
                          <TableHead>Hidden</TableHead>
                          <TableHead className="w-32">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedTestCases.map((testCase) => (
                          <TableRow key={testCase.id} className="border-b border-slate-200 hover:bg-slate-50">
                            <TableCell className="font-mono text-xs text-slate-900 max-w-md truncate">
                              {testCase.input}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-slate-900 max-w-md truncate">
                              {testCase.output}
                            </TableCell>
                            <TableCell>
                              {testCase.is_hidden ? (
                                <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">Hidden</span>
                              ) : (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Visible</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <button
                                  className="p-2 hover:bg-slate-200 rounded transition"
                                  onClick={() => openDialog(testCase)}
                                  title="Edit test case"
                                >
                                  <Edit className="w-4 h-4 text-slate-600" />
                                </button>
                                <button
                                  className="p-2 hover:bg-slate-200 rounded transition"
                                  onClick={() => handleDelete(testCase)}
                                  title="Delete test case"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {/* Pagination for Test Cases */}
                  {testCasesTotal > testCasesLimit && (
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-slate-600">
                        Showing {(testCasesPage - 1) * testCasesLimit + 1} to{" "}
                        {Math.min(testCasesPage * testCasesLimit, testCasesTotal)} of {testCasesTotal} test cases
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTestCasesPage((p) => Math.max(1, p - 1))}
                          disabled={testCasesPage === 1}
                        >
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.ceil(testCasesTotal / testCasesLimit) }, (_, i) => i + 1)
                            .filter((page) => {
                              const totalPages = Math.ceil(testCasesTotal / testCasesLimit)
                              return (
                                page === 1 ||
                                page === totalPages ||
                                (page >= testCasesPage - 2 && page <= testCasesPage + 2)
                              )
                            })
                            .map((page, idx, arr) => {
                              const prevPage = arr[idx - 1]
                              const showEllipsis = prevPage && page - prevPage > 1
                              return (
                                <div key={page} className="flex items-center gap-1">
                                  {showEllipsis && <span className="px-2 text-slate-400">...</span>}
                                  <Button
                                    variant={testCasesPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTestCasesPage(page)}
                                    className="min-w-[2.5rem]"
                                  >
                                    {page}
                                  </Button>
                                </div>
                              )
                            })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTestCasesPage((p) => p + 1)}
                          disabled={testCasesPage >= Math.ceil(testCasesTotal / testCasesLimit)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No test cases found. Click "Add Test Case" to create one.
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Add / Edit test case */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Test Case" : "Add Test Case"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Input</Label>
              <Textarea
                rows={4}
                value={form.input}
                onChange={(e) => setForm((prev) => ({ ...prev, input: e.target.value }))}
                placeholder="Input payload..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Expected Output</Label>
              <Textarea
                rows={4}
                value={form.output}
                onChange={(e) => setForm((prev) => ({ ...prev, output: e.target.value }))}
                placeholder="Expected output..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form.input || !form.output}>
              {editing ? "Update Test Case" : "Create Test Case"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View question details */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Question Details</DialogTitle>
          </DialogHeader>
          {viewQuestion ? (
            <div className="space-y-6 overflow-y-auto flex-1 pr-2">
              {/* Title and Meta */}
              <div>
                <Label className="text-sm font-semibold text-slate-700">Title</Label>
                <p className="mt-1 text-slate-900 font-medium text-xl">{viewQuestion.title}</p>
              </div>
              <div className="flex gap-4 flex-wrap">
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Category</Label>
                  <p className="mt-1 text-slate-900">{viewQuestion.category === "Coding" ? "Programming" : viewQuestion.category || "Programming"}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Difficulty</Label>
                  <p className="mt-1 text-slate-900">{viewQuestion.difficulty || "Medium"}</p>
                </div>
                {viewQuestion.topics && viewQuestion.topics.length > 0 && (
                  <div className="flex-1">
                    <Label className="text-sm font-semibold text-slate-700">Topics</Label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {viewQuestion.topics.map((topic, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {viewQuestion.description && (
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">Description</Label>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 max-h-64 overflow-y-auto">
                    <p className="text-sm text-slate-900 leading-relaxed whitespace-normal">
                      {viewQuestion.description.split(/\s+/).join(' ')}
                    </p>
                  </div>
                </div>
              )}

              {/* Examples */}
              {viewQuestion.examples && viewQuestion.examples.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">Examples</Label>
                  <div className="space-y-3">
                    {viewQuestion.examples.map((example, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        {example.example_num && (
                          <p className="text-xs font-semibold text-blue-800 mb-2">Example {example.example_num}</p>
                        )}
                        {example.example_text && (
                          <pre className="whitespace-pre-wrap text-sm text-slate-900 font-mono">
                            {example.example_text}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Constraints */}
              {viewQuestion.constraints && viewQuestion.constraints.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">Constraints</Label>
                  <ul className="list-disc list-inside space-y-1 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    {viewQuestion.constraints.map((constraint, idx) => (
                      <li key={idx} className="text-sm text-slate-900">
                        {constraint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hints */}
              {viewQuestion.hints && viewQuestion.hints.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">Hints</Label>
                  <div className="space-y-2">
                    {viewQuestion.hints.map((hint, idx) => (
                      <div key={idx} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-xs font-semibold text-purple-700 mb-1">Hint {idx + 1}</p>
                        <p className="text-sm text-slate-900 whitespace-pre-wrap">{hint}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Snippets */}
              {viewQuestion.code_snippets && Object.keys(viewQuestion.code_snippets).length > 0 && (
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">Code Snippets</Label>
                  <div className="space-y-2">
                    {Object.entries(viewQuestion.code_snippets).map(([lang, code]) => (
                      <div key={lang} className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                        <p className="text-xs font-semibold text-slate-400 mb-2 uppercase">{lang}</p>
                        <pre className="text-xs text-slate-100 font-mono overflow-x-auto">
                          <code>{code}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No question selected.</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gemini Generation Dialog */}
      <Dialog open={geminiDialogOpen} onOpenChange={setGeminiDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Programming Questions with Gemini AI</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Prompt</label>
              <Textarea
                value={geminiPrompt}
                onChange={(e) => setGeminiPrompt(e.target.value)}
                placeholder="e.g., generate 5 questions of advanced python programming"
                rows={3}
              />
              <p className="text-xs text-slate-500">
                Include the number of questions in your prompt (e.g., "generate 5 questions")
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Difficulty Level</label>
                <Select value={geminiDifficulty} onValueChange={setGeminiDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((diff) => (
                      <SelectItem key={diff} value={diff}>
                        {diff}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleGenerateQuestions}
              disabled={generating || !geminiPrompt.trim()}
              className="w-full gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Questions
                </>
              )}
            </Button>

            {/* Generated Questions */}
            {generatedQuestions.length > 0 && (
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Generated Questions ({generatedQuestions.length})
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {generatedQuestions.map((q, idx) => (
                    <Card key={idx} className="p-4 bg-slate-50 border-slate-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-slate-900">{q.title}</h4>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                              Programming
                            </span>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                              {q.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-3">{q.description}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddGeneratedQuestion(q)}
                          className="gap-2 shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGeminiDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
