"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts"
import { Home, FileText, Code, Users, Video, Sliders, BarChart3, Settings, LogOut, Download, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"

interface AdminAnalyticsProps {
  onNavigate: (page: string) => void
  onLogout: () => void
}

interface ScoreDistribution {
  range: string
  count: number
}

interface SkillPerformance {
  skill: string
  avgScore: number
  attempts: number
  passRate: number
}

export function AdminAnalytics({ onNavigate, onLogout }: AdminAnalyticsProps) {
  const { toast } = useToast()
  const [performanceData, setPerformanceData] = useState<ScoreDistribution[]>([
    { range: "0-10", count: 0 },
    { range: "10-20", count: 0 },
    { range: "20-30", count: 0 },
    { range: "30-40", count: 0 },
    { range: "40-50", count: 0 },
    { range: "50-60", count: 0 },
    { range: "60-70", count: 0 },
    { range: "70-80", count: 0 },
    { range: "80-90", count: 0 },
    { range: "90-100", count: 0 },
  ])
  const [loading, setLoading] = useState(true)
  const [skillData, setSkillData] = useState<SkillPerformance[]>([])
  const [skillLoading, setSkillLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const fetchScoreDistribution = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.get<ScoreDistribution[]>("/admin/analytics/score-distribution")
      setPerformanceData(data)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load score distribution",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchSkillPerformance = useCallback(async () => {
    try {
      setSkillLoading(true)
      const data = await api.get<SkillPerformance[]>("/admin/analytics/skill-performance")
      setSkillData(data)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load skill performance",
        description: error.message,
      })
    } finally {
      setSkillLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchScoreDistribution()
    fetchSkillPerformance()
  }, [fetchScoreDistribution, fetchSkillPerformance])

  // Color scheme for each category
  const COLORS: Record<string, string> = {
    Technical: "#8b5cf6",      // Purple
    Behavioral: "#10b981",     // Green
    Programming: "#3b82f6",    // Blue
    Architecture: "#f59e0b",   // Amber/Orange
  }
  
  // Ensure data is sorted in the correct order
  const sortedSkillData = [...skillData].sort((a, b) => {
    const order = ["Technical", "Behavioral", "Programming", "Architecture"]
    return order.indexOf(a.skill) - order.indexOf(b.skill)
  })

  const handleExportPDF = useCallback(async () => {
    if (typeof window === "undefined") {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "PDF export is only available in the browser",
      })
      return
    }

    if (!contentRef.current) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Content not found",
      })
      return
    }

    try {
      setExporting(true)
      
      // Dynamically import client-side only libraries
      let jspdfModule, html2canvasModule
      try {
        jspdfModule = await import("jspdf")
        html2canvasModule = await import("html2canvas")
      } catch (importError: any) {
        throw new Error(`Failed to load PDF libraries: ${importError.message}. Please ensure jspdf and html2canvas are installed.`)
      }
      
      // Extract jsPDF class - jspdf 3.x exports it as a named export
      const jsPDF = (jspdfModule.jsPDF || (jspdfModule.default && jspdfModule.default.jsPDF) || jspdfModule.default) as any
      const html2canvas = (html2canvasModule.default || html2canvasModule) as any
      
      if (!jsPDF) {
        throw new Error("jsPDF class not found in jspdf module")
      }
      if (!html2canvas) {
        throw new Error("html2canvas function not found")
      }
      
      // Suppress console errors for unsupported CSS functions BEFORE html2canvas runs
      const originalError = console.error
      const originalWarn = console.warn
      const originalLog = console.log
      
      const shouldSuppress = (msg: string): boolean => {
        const lowerMsg = msg.toLowerCase()
        return lowerMsg.includes("unsupported color function") || 
               lowerMsg.includes("attempting to parse") ||
               lowerMsg.includes("lab(") ||
               lowerMsg.includes("lch(") ||
               lowerMsg.includes("oklch(") ||
               (lowerMsg.includes("lab") && lowerMsg.includes("color"))
      }
      
      console.error = (...args: any[]) => {
        const msg = args.map(a => String(a)).join(" ")
        if (shouldSuppress(msg)) return
        originalError.apply(console, args)
      }
      
      console.warn = (...args: any[]) => {
        const msg = args.map(a => String(a)).join(" ")
        if (shouldSuppress(msg)) return
        originalWarn.apply(console, args)
      }
      
      console.log = (...args: any[]) => {
        const msg = args.map(a => String(a)).join(" ")
        if (shouldSuppress(msg)) return
        originalLog.apply(console, args)
      }

      // Create a temporary container for the PDF content
      const tempContainer = document.createElement("div")
      tempContainer.style.position = "absolute"
      tempContainer.style.left = "-9999px"
      tempContainer.style.width = "800px"
      tempContainer.style.backgroundColor = "#f8fafc"
      tempContainer.style.padding = "40px"
      document.body.appendChild(tempContainer)

      // Clone the content
      const clonedContent = contentRef.current.cloneNode(true) as HTMLElement
      tempContainer.appendChild(clonedContent)

      // Wait for charts to render
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Capture the content as canvas
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#f8fafc",
        allowTaint: true,
        foreignObjectRendering: false,
      })
      
      // Restore console functions before proceeding
      console.error = originalError
      console.warn = originalWarn
      console.log = originalLog

      // Validate canvas
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        document.body.removeChild(tempContainer)
        throw new Error("Failed to capture page content. Canvas is empty.")
      }

      console.log("Canvas captured:", { width: canvas.width, height: canvas.height })

      // Clean up temp container
      document.body.removeChild(tempContainer)

      // Create PDF
      const imgData = canvas.toDataURL("image/png")
      
      if (!imgData || imgData === "data:," || imgData.length < 100) {
        throw new Error("Failed to convert canvas to image data.")
      }

      console.log("Image data generated, length:", imgData.length)

      const pdf = new jsPDF("p", "mm", "a4")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      
      if (imgWidth === 0 || imgHeight === 0) {
        throw new Error("Invalid image dimensions.")
      }

      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgScaledWidth = imgWidth * ratio
      const imgScaledHeight = imgHeight * ratio

      console.log("PDF dimensions:", { pdfWidth, pdfHeight, imgScaledWidth, imgScaledHeight })

      // Add title
      pdf.setFontSize(20)
      pdf.text("Analytics & Insights Report", pdfWidth / 2, 20, { align: "center" })
      pdf.setFontSize(12)
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, pdfWidth / 2, 28, { align: "center" })

      // Add content
      const yOffset = 35
      
      try {
        pdf.addImage(imgData, "PNG", (pdfWidth - imgScaledWidth) / 2, yOffset, imgScaledWidth, imgScaledHeight)
        console.log("Image added to PDF successfully")
      } catch (imgError: any) {
        console.error("Error adding image to PDF:", imgError)
        throw new Error(`Failed to add image to PDF: ${imgError.message}`)
      }

      // If content is too tall, add new pages
      let heightLeft = imgScaledHeight
      let position = yOffset

      while (heightLeft >= pdfHeight - yOffset) {
        position = heightLeft - pdfHeight + yOffset
        pdf.addPage()
        pdf.addImage(imgData, "PNG", (pdfWidth - imgScaledWidth) / 2, -position, imgScaledWidth, imgScaledHeight)
        heightLeft -= pdfHeight - yOffset
      }

      // Save the PDF
      const fileName = `analytics-report-${new Date().toISOString().split("T")[0]}.pdf`
      
      try {
        console.log("Attempting to save PDF:", fileName)
        
        // Try the standard save method first
        try {
          pdf.save(fileName)
          console.log("PDF saved successfully using pdf.save()")
        } catch (saveError: any) {
          console.warn("pdf.save() failed, trying blob download method:", saveError)
          
          // Fallback: Use blob URL method
          const pdfBlob = pdf.output("blob")
          const url = URL.createObjectURL(pdfBlob)
          const link = document.createElement("a")
          link.href = url
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          console.log("PDF saved successfully using blob method")
        }
      } catch (saveError: any) {
        console.error("Error saving PDF:", saveError)
        throw new Error(`Failed to save PDF: ${saveError.message}`)
      }

      toast({
        title: "Report exported",
        description: `Analytics report has been downloaded as ${fileName}`,
      })
    } catch (error: any) {
      console.error("Error exporting PDF:", error)
      toast({
        variant: "destructive",
        title: "Export failed",
        description: error.message || "Failed to export PDF. Please try again.",
      })
    } finally {
      setExporting(false)
    }
  }, [toast])

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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <Sliders className="w-5 h-5" />
            Rubrics
          </button>
          <button
            onClick={() => onNavigate("admin-analytics")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 text-blue-800 font-medium"
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
            <h1 className="text-2xl font-bold text-slate-900">Analytics & Insights</h1>
            <p className="text-slate-600 text-sm mt-1">System-wide performance metrics</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={() => {
                fetchScoreDistribution()
                fetchSkillPerformance()
              }} 
              disabled={loading || skillLoading}
            >
              <RefreshCw className={`w-4 h-4 ${loading || skillLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button 
              className="gap-2" 
              onClick={handleExportPDF}
              disabled={exporting || loading || skillLoading}
            >
              <Download className={`w-4 h-4 ${exporting ? "animate-pulse" : ""}`} />
              {exporting ? "Exporting..." : "Export Report"}
          </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8" ref={contentRef}>
          {/* Performance Distribution */}
          <Card className="p-6 bg-white border-slate-200 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Score Distribution</h3>
              <p className="text-sm text-slate-600">
                Total Interviews: {performanceData.reduce((sum, item) => sum + item.count, 0)}
              </p>
            </div>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                Loading score distribution...
              </div>
            ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
            )}
          </Card>

          {/* Skill Performance */}
          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Skill Performance</h3>
              <p className="text-sm text-slate-600">
                Total Attempts: {skillData.reduce((sum, item) => sum + item.attempts, 0)}
              </p>
            </div>
            {skillLoading ? (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                Loading skill performance...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sortedSkillData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="skill" />
                  <YAxis domain={[0, 100]} label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === "avgScore") return [`${value}%`, "Average Score"]
                      if (name === "passRate") return [`${value}%`, "Pass Rate"]
                      return [`${value}%`, name]
                    }}
                    labelFormatter={(label) => `Category: ${label}`}
                  />
                  <Bar dataKey="avgScore" name="Average Score" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                    {sortedSkillData.map((entry, index) => (
                      <Cell key={`cell-avg-${index}`} fill="#3b82f6" />
                    ))}
                  </Bar>
                  <Bar dataKey="passRate" name="Pass Rate" fill="#10b981" radius={[8, 8, 0, 0]}>
                    {sortedSkillData.map((entry, index) => (
                      <Cell key={`cell-pass-${index}`} fill="#10b981" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            {/* Custom Legend with Colors */}
            {!skillLoading && sortedSkillData.length > 0 && (
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "#3b82f6" }} />
                  <span className="text-sm text-slate-700">Average Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded opacity-70" style={{ backgroundColor: "#10b981" }} />
                  <span className="text-sm text-slate-700">Pass Rate</span>
                </div>
              </div>
            )}
            {/* Summary Stats */}
            {!skillLoading && sortedSkillData.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {sortedSkillData.map((skill) => (
                  <div key={skill.skill} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[skill.skill] || "#2563eb" }}
                      />
                      <h4 className="font-semibold text-slate-900">{skill.skill}</h4>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-slate-600">
                        <span className="font-medium">Avg Score:</span> {skill.avgScore}%
                      </p>
                      <p className="text-slate-600">
                        <span className="font-medium">Attempts:</span> {skill.attempts}
                      </p>
                      <p className="text-slate-600">
                        <span className="font-medium">Pass Rate:</span> {skill.passRate}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
