"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, FileText, Code, Users, Video, Sliders, BarChart3, Settings, LogOut } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"

interface AdminRubricsProps {
  onNavigate: (page: string) => void
  onLogout: () => void
}

type Criteria = {
  key: string
  label: string
  description: string
  value: number
}

type RubricConfig = {
  category: "programming" | "behavioral" | "technical"
  criteria: Criteria[]
}

const defaultRubrics: RubricConfig[] = [
  {
    category: "programming",
    criteria: [
      { key: "correctness", label: "Code Correctness", description: "Test cases passed, edge case handling", value: 40 },
      { key: "quality", label: "Code Quality", description: "Readability, comments, naming conventions", value: 25 },
      { key: "efficiency", label: "Efficiency", description: "Time and space complexity", value: 20 },
      { key: "approach", label: "Problem Approach", description: "Solution strategy, algorithm selection", value: 15 },
    ],
  },
  {
    category: "behavioral",
    criteria: [
      { key: "communication", label: "Communication", description: "Clarity, articulation, structure", value: 30 },
      { key: "relevance", label: "Relevance", description: "Answers the question, specific examples", value: 25 },
      { key: "confidence", label: "Confidence & Engagement", description: "Eye contact, tone, body language", value: 20 },
      { key: "experience", label: "Experience Depth", description: "Seniority alignment, technical knowledge", value: 15 },
      { key: "culture", label: "Cultural Fit", description: "Values alignment, team orientation", value: 10 },
    ],
  },
  {
    category: "technical",
    criteria: [
      { key: "knowledge", label: "Technical Knowledge", description: "Depth of understanding, core concepts mastery", value: 35 },
      { key: "problem_solving", label: "Problem Solving", description: "Analytical thinking, approach to complex problems", value: 30 },
      { key: "architecture", label: "System Design & Architecture", description: "Scalability, design patterns, best practices", value: 20 },
      { key: "practical", label: "Practical Application", description: "Real-world experience, tool familiarity", value: 15 },
    ],
  },
]

const defaultSettings = {
  passingThresholdCoding: 60,
  passingThresholdBehavioral: 65,
  passingThresholdTechnical: 62,
}

export function AdminRubrics({ onNavigate, onLogout }: AdminRubricsProps) {
  const { toast } = useToast()
  const [rubrics, setRubrics] = useState<RubricConfig[]>(defaultRubrics)
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rubricsResponse, settingsResponse] = await Promise.all([
          api.get<RubricConfig[]>("/admin/rubrics"),
          api.get<typeof defaultSettings>("/admin/settings"),
        ])
        if (rubricsResponse?.length) {
          // Map backend category names to display names
          const mappedRubrics = rubricsResponse.map((r: any) => {
            if (r.category === "coding") {
              return { ...r, category: "programming" }
            }
            return r
          })
          setRubrics(mappedRubrics as RubricConfig[])
        }
        if (settingsResponse) {
          setSettings(settingsResponse)
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Failed to load rubrics",
          description: error.message,
        })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [toast])

  const handleWeightChange = (category: RubricConfig["category"], key: string, value: number) => {
    setRubrics((prev) =>
      prev.map((rubric) =>
        rubric.category === category
          ? {
              ...rubric,
              criteria: rubric.criteria.map((criterion) =>
                criterion.key === key ? { ...criterion, value } : criterion
              ),
            }
          : rubric
      )
    )
  }

  const handleThresholdChange = (key: keyof typeof defaultSettings, value: number) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleReset = () => {
    setRubrics(defaultRubrics)
    setSettings(defaultSettings)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      // Map display category names back to backend category names
      const mappedRubrics = rubrics.map((r) => {
        if (r.category === "programming") {
          return { ...r, category: "coding" }
        }
        return r
      })
      await api.post("/admin/rubrics", mappedRubrics)
      await api.post("/admin/settings", settings)
      toast({ title: "Rubrics updated successfully" })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to save rubrics",
        description: error.message,
      })
    } finally {
      setSaving(false)
    }
  }

  const programmingRubric = rubrics.find((r) => r.category === "programming") ?? defaultRubrics[0]
  const behavioralRubric = rubrics.find((r) => r.category === "behavioral") ?? defaultRubrics[1]
  const technicalRubric = rubrics.find((r) => r.category === "technical") ?? defaultRubrics[2]

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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 text-blue-800 font-medium"
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
            <h1 className="text-2xl font-bold text-slate-900">Evaluation Rubrics</h1>
            <p className="text-slate-600 text-sm mt-1">Configure how interviews are scored</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} disabled={loading || saving}>
              Reset to Defaults
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 max-w-4xl">
          <Tabs defaultValue="programming" className="w-full">
            <TabsList className="w-full justify-start bg-white border-b border-slate-200">
              <TabsTrigger value="programming">Programming Interview</TabsTrigger>
              <TabsTrigger value="behavioral">Behavioral Interview</TabsTrigger>
              <TabsTrigger value="technical">Technical Interview</TabsTrigger>
            </TabsList>

            <TabsContent value="programming" className="mt-6 space-y-8">
              <Card className="p-6 bg-white border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Scoring Weights (Total: 100%)</h3>
                <div className="space-y-6">
                  {programmingRubric.criteria.map((item) => (
                    <div key={item.key}>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-semibold text-slate-900">{item.label}</Label>
                        <span className="text-lg font-bold text-blue-800">{item.value}%</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{item.description}</p>
                      <Slider
                        value={[item.value]}
                        max={100}
                        step={5}
                        disabled={loading}
                        onValueChange={(value) => handleWeightChange("programming", item.key, value[0] ?? 0)}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-white border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Passing Threshold</h3>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[settings.passingThresholdCoding]}
                    max={100}
                    step={5}
                    disabled={loading}
                    onValueChange={(value) => handleThresholdChange("passingThresholdCoding", value[0] ?? 0)}
                    className="flex-1"
                  />
                  <span className="text-2xl font-bold text-slate-900 w-16">{settings.passingThresholdCoding}%</span>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="behavioral" className="mt-6 space-y-8">
              <Card className="p-6 bg-white border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Scoring Weights (Total: 100%)</h3>
                <div className="space-y-6">
                  {behavioralRubric.criteria.map((item) => (
                    <div key={item.key}>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-semibold text-slate-900">{item.label}</Label>
                        <span className="text-lg font-bold text-blue-800">{item.value}%</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{item.description}</p>
                      <Slider
                        value={[item.value]}
                        max={100}
                        step={5}
                        disabled={loading}
                        onValueChange={(value) => handleWeightChange("behavioral", item.key, value[0] ?? 0)}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-white border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Passing Threshold</h3>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[settings.passingThresholdBehavioral]}
                    max={100}
                    step={5}
                    disabled={loading}
                    onValueChange={(value) => handleThresholdChange("passingThresholdBehavioral", value[0] ?? 0)}
                    className="flex-1"
                  />
                  <span className="text-2xl font-bold text-slate-900 w-16">{settings.passingThresholdBehavioral}%</span>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="technical" className="mt-6 space-y-8">
              <Card className="p-6 bg-white border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Scoring Weights (Total: 100%)</h3>
                <div className="space-y-6">
                  {technicalRubric.criteria.map((item) => (
                    <div key={item.key}>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-semibold text-slate-900">{item.label}</Label>
                        <span className="text-lg font-bold text-blue-800">{item.value}%</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{item.description}</p>
                      <Slider
                        value={[item.value]}
                        max={100}
                        step={5}
                        disabled={loading}
                        onValueChange={(value) => handleWeightChange("technical", item.key, value[0] ?? 0)}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-white border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Passing Threshold</h3>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[settings.passingThresholdTechnical]}
                    max={100}
                    step={5}
                    disabled={loading}
                    onValueChange={(value) => handleThresholdChange("passingThresholdTechnical", value[0] ?? 0)}
                    className="flex-1"
                  />
                  <span className="text-2xl font-bold text-slate-900 w-16">{settings.passingThresholdTechnical}%</span>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
