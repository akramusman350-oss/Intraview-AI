"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Search,
  Sparkles,
  Loader2,
  Eye,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"

interface AdminQuestionsProps {
  onNavigate: (page: string) => void
  onLogout: () => void
}

interface Question {
  id: string
  title: string
  category: string
  programming_subcategory?: string
  difficulty: string
  description: string
  created_at: string
}

interface QuestionResponse {
  items: Question[]
  total: number
  page: number
  limit: number
}

const categories = ["Behavioral", "Programming", "System Design", "Technical"]
const difficulties = ["Easy", "Medium", "Hard"]

export function AdminQuestions({ onNavigate, onLogout }: AdminQuestionsProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedProgrammingSubcategory, setSelectedProgrammingSubcategory] = useState("all")
  const [programmingSubcategories, setProgrammingSubcategories] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 })
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Question | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewQuestion, setViewQuestion] = useState<Question | null>(null)
  const emptyForm = { title: "", category: "Programming", difficulty: "Medium", description: "" }
  const [form, setForm] = useState(emptyForm)
  
  // Gemini generation state
  const [geminiDialogOpen, setGeminiDialogOpen] = useState(false)
  const [geminiPrompt, setGeminiPrompt] = useState("")
  const [geminiCategory, setGeminiCategory] = useState("Programming")
  const [geminiProgrammingSubcategory, setGeminiProgrammingSubcategory] = useState("all")
  const [geminiDifficulty, setGeminiDifficulty] = useState("Medium")
  const [generating, setGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<Array<{
    title: string
    description: string
    category: string
    difficulty: string
    programming_subcategory?: string
  }>>([])

  const fetchProgrammingSubcategories = useCallback(async () => {
    try {
      const data = await api.get<{ subcategories: string[] }>("/questions/programming-subcategories")
      setProgrammingSubcategories(data.subcategories || [])
    } catch (error: any) {
      console.error("Failed to load programming subcategories:", error)
      setProgrammingSubcategories([])
    }
  }, [])

  const fetchQuestions = useCallback(
    async (page = pagination.page) => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          page: String(page),
          limit: String(pagination.limit),
        })
        if (searchQuery) params.append("search", searchQuery)
        if (selectedCategory !== "all") {
          // Map display names to backend category names
          let backendCategory = selectedCategory
          if (selectedCategory === "Programming") backendCategory = "Coding"
          else if (selectedCategory === "Technical") backendCategory = "Programming"
          params.append("category", backendCategory)
        }
        if (selectedCategory === "Technical" && selectedProgrammingSubcategory !== "all") {
          params.append("programming_subcategory", selectedProgrammingSubcategory)
        }
        if (selectedDifficulty !== "all") params.append("difficulty", selectedDifficulty)

        const data = await api.get<QuestionResponse>(`/questions?${params.toString()}`)
        // Map backend category names to display names
        const mappedQuestions = data.items.map((q) => {
          if (q.category === "Coding") {
            return { ...q, category: "Programming" }
          } else if (q.category === "Programming") {
            return { ...q, category: "Technical" }
          }
          return q
        })
        setQuestions(mappedQuestions)
        setPagination({ page: data.page, total: data.total, limit: data.limit })
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Failed to load questions",
          description: error.message,
        })
      } finally {
        setLoading(false)
      }
    },
    [pagination.limit, searchQuery, selectedCategory, selectedProgrammingSubcategory, selectedDifficulty, toast]
  )

  useEffect(() => {
    fetchProgrammingSubcategories()
  }, [fetchProgrammingSubcategories])

  useEffect(() => {
    fetchQuestions(1)
  }, [fetchQuestions])

  // Reset programming subcategory when category changes
  useEffect(() => {
    if (selectedCategory !== "Technical") {
      setSelectedProgrammingSubcategory("all")
    }
  }, [selectedCategory])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(pagination.total / pagination.limit)), [pagination])

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
      // Map display names to backend category names
      let backendCategory = geminiCategory
      if (geminiCategory === "Programming") backendCategory = "Coding"
      else if (geminiCategory === "Technical") backendCategory = "Programming"
      
      const response = await api.post("/questions/generate", {
        prompt: geminiPrompt,
        category: backendCategory,
        difficulty: geminiDifficulty,
        programming_subcategory: geminiCategory === "Technical" && geminiProgrammingSubcategory !== "all" 
          ? geminiProgrammingSubcategory 
          : null,
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
      // Map display names to backend category names
      let backendCategory = question.category
      if (question.category === "Programming") backendCategory = "Coding"
      else if (question.category === "Technical") backendCategory = "Programming"
      
      const payload: any = {
        title: question.title,
        category: backendCategory,
        difficulty: question.difficulty,
        description: question.description,
      }
      if (question.category === "Technical" && question.programming_subcategory) {
        payload.programming_subcategory = question.programming_subcategory
      }
      const created = await api.post<Question>("/questions", payload)
      toast({
        title: "Question is added",
        description: `Question with "${question.title}" is added`,
      })
      // Remove from generated list
      setGeneratedQuestions((prev) => prev.filter((q, i) => q.title !== question.title || i !== prev.findIndex((q2) => q2.title === question.title)))
      // Refresh questions list
      await fetchQuestions(pagination.page)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to add question",
        description: error.message,
      })
    }
  }

  const openDialogForCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const handleViewQuestion = (question: Question) => {
    setViewQuestion(question)
    setViewDialogOpen(true)
  }

  const openDialogForEdit = (question: Question) => {
    setEditing(question)
    // Map backend category names to display names
    let displayCategory = question.category
    if (question.category === "Coding") displayCategory = "Programming"
    else if (question.category === "Programming") displayCategory = "Technical"
    
    setForm({
      title: question.title,
      category: displayCategory,
      difficulty: question.difficulty,
      description: question.description,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      // Map display category names to backend category names
      let backendCategory = form.category
      if (form.category === "Programming") backendCategory = "Coding"
      else if (form.category === "Technical") backendCategory = "Programming"
      
      const payload = {
        title: form.title,
        category: backendCategory,
        difficulty: form.difficulty,
        description: form.description,
      }
      
      if (editing) {
        const updated = await api.put<Question>(`/questions/${editing.id}`, payload)
        toast({ 
          title: "Question is updated",
          description: `Question with "${form.title}" is updated`
        })
        // Optimistically update local list
        setQuestions((prev) => prev.map((q) => (q.id === editing.id ? { ...q, ...updated } : q)))
      } else {
        const created = await api.post<Question>("/questions", payload)
        toast({ 
          title: "Question is added",
          description: `Question with "${form.title}" is added`
        })
        // Prepend new question to the current page
        setQuestions((prev) => [created, ...prev])
        setPagination((prev) => ({ ...prev, total: prev.total + 1 }))
      }
      setDialogOpen(false)
      // Keep data in sync with server but without the user needing a manual refresh
      fetchQuestions(editing ? pagination.page : 1)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to save question",
        description: error.message,
      })
    }
  }

  const handleDelete = async (question: Question) => {
    if (!window.confirm(`Delete "${question.title}"? This action cannot be undone.`)) return
    try {
      await api.delete(`/questions/${question.id}`)
      toast({ 
        title: "Question is deleted",
        description: "Question has been successfully deleted"
      })
      // Optimistically remove from local list
      setQuestions((prev) => prev.filter((q) => q.id !== question.id))
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }))
      fetchQuestions(pagination.page)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete question",
        description: error.message,
      })
    }
  }

  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 text-blue-800 font-medium"
          >
            <FileText className="w-5 h-5" />
            Question Bank
          </button>
          <button
            onClick={() => onNavigate("admin-testcases")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
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
          {/* Settings */}
          <button
            onClick={() => onNavigate("admin-settings")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>

          {/* Logout */}
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
            <h1 className="text-2xl font-bold text-slate-900">Question Bank</h1>
            <p className="text-slate-600 text-sm mt-1">
              Showing {questions.length} of {pagination.total} questions
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setGeminiDialogOpen(true)}
            >
              <Sparkles className="w-4 h-4" />
              Generate Question with Gemini
            </Button>
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open)
                if (!open) {
                  // Reset state so each new Add/Edit starts from a clean form
                  setEditing(null)
                  setForm(emptyForm)
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={openDialogForCreate}>
            <Plus className="w-4 h-4" />
            Add New Question
          </Button>
              </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Question" : "Add Question"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Question Title</label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Describe the question"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Category</label>
                    <Select
                      value={form.category}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Difficulty</label>
                    <Select
                      value={form.difficulty}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, difficulty: value }))}
                    >
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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <Textarea
                    placeholder="Provide the question prompt..."
                    rows={5}
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!form.title || !form.description}>
                  {editing ? "Save Changes" : "Create Question"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>

          {/* Gemini Generation Dialog */}
          <Dialog open={geminiDialogOpen} onOpenChange={setGeminiDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Generate Questions with Gemini AI</DialogTitle>
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
                    <label className="text-sm font-medium text-slate-700">Category</label>
                    <Select value={geminiCategory} onValueChange={setGeminiCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {geminiCategory === "Technical" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Technical Subcategory</label>
                      <Select
                        value={geminiProgrammingSubcategory}
                        onValueChange={setGeminiProgrammingSubcategory}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Subcategories</SelectItem>
                          {programmingSubcategories.map((subcat) => (
                            <SelectItem key={subcat} value={subcat}>
                              {subcat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
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
                                  {q.category}
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Filters */}
          <Card className="p-6 bg-white border-slate-200 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={(value) => handleFilterChange(setSelectedCategory, value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedCategory === "Technical" && (
                <Select
                  value={selectedProgrammingSubcategory}
                  onValueChange={(value) => handleFilterChange(setSelectedProgrammingSubcategory, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Technical Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Technical Categories</SelectItem>
                    {programmingSubcategories.map((subcat) => (
                      <SelectItem key={subcat} value={subcat}>
                        {subcat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select
                value={selectedDifficulty}
                onValueChange={(value) => handleFilterChange(setSelectedDifficulty, value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {difficulties.map((diff) => (
                    <SelectItem key={diff} value={diff}>
                      {diff}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Questions Table */}
          <Card className="bg-white border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((q) => (
                  <TableRow key={q.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <TableCell className="font-mono text-sm text-slate-600">{q.id}</TableCell>
                    <TableCell className="font-medium text-slate-900">{q.title}</TableCell>
                    <TableCell>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {q.category === "Programming" ? "Programming" : q.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          q.difficulty === "Easy"
                            ? "bg-green-100 text-green-700"
                            : q.difficulty === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {q.created_at ? new Date(q.created_at).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button 
                          className="p-2 hover:bg-slate-200 rounded transition" 
                          onClick={() => handleViewQuestion(q)}
                          title="View full question"
                        >
                          <Eye className="w-4 h-4 text-slate-600" />
                        </button>
                        <button className="p-2 hover:bg-slate-200 rounded transition" onClick={() => openDialogForEdit(q)}>
                          <Edit className="w-4 h-4 text-slate-600" />
                        </button>
                        <button className="p-2 hover:bg-slate-200 rounded transition" onClick={() => handleDelete(q)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!questions.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-6">
                      {loading ? "Loading questions..." : "No questions found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          <div className="flex items-center justify-between mt-6">
            <Button variant="outline" disabled={pagination.page === 1} onClick={() => fetchQuestions(pagination.page - 1)}>
              Previous
            </Button>
            <p className="text-sm text-slate-600">
              Page {pagination.page} of {totalPages}
            </p>
            <Button
              variant="outline"
              disabled={pagination.page >= totalPages}
              onClick={() => fetchQuestions(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* View Question Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Question Details</DialogTitle>
          </DialogHeader>
          {viewQuestion ? (
            <div className="space-y-6 overflow-y-auto flex-1 pr-2">
              {/* Title and Meta */}
              <div>
                <label className="text-sm font-semibold text-slate-700">Title</label>
                <p className="mt-1 text-slate-900 font-medium text-xl">{viewQuestion.title}</p>
              </div>
              <div className="flex gap-4 flex-wrap">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Category</label>
                  <p className="mt-1 text-slate-900">{viewQuestion.category || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Difficulty</label>
                  <p className="mt-1 text-slate-900">{viewQuestion.difficulty || "Medium"}</p>
                </div>
                {viewQuestion.programming_subcategory && (
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Subcategory</label>
                    <p className="mt-1 text-slate-900">{viewQuestion.programming_subcategory}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {viewQuestion.description && (
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Description</label>
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
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Examples</label>
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
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Constraints</label>
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
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Hints</label>
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
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Code Snippets</label>
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
    </div>
  )
}
