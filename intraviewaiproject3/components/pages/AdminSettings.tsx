"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, FileText, Code, Users, Video, Sliders, BarChart3, Settings, LogOut, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"

interface AdminSettingsProps {
  onNavigate: (page: string) => void
  onLogout: () => void
}

export function AdminSettings({ onNavigate, onLogout }: AdminSettingsProps) {
  const { toast } = useToast()
  const [adminEmail, setAdminEmail] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Interview settings state
  const [behavioralSettings, setBehavioralSettings] = useState({
    defaultQuestionCount: 10,
    timeLimitPerQuestion: 5,
  })
  const [codingSettings, setCodingSettings] = useState({
    defaultTimeLimit: 45,
    codeExecutionTimeout: 10,
  })
  const [savingBehavioral, setSavingBehavioral] = useState(false)
  const [savingCoding, setSavingCoding] = useState(false)

  useEffect(() => {
    fetchAdminProfile()
    fetchSettings()
  }, [])

  const fetchAdminProfile = async () => {
    try {
      setLoadingProfile(true)
      const profile = await api.get<{ email: string; role: string; name: string }>("/admin/profile")
      setAdminEmail(profile.email || "")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load admin profile",
        description: error.message,
      })
    } finally {
      setLoadingProfile(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const settings = await api.get<any>("/admin/settings")
      if (settings.behavioral) {
        setBehavioralSettings({
          defaultQuestionCount: settings.behavioral.defaultQuestionCount || 10,
          timeLimitPerQuestion: settings.behavioral.timeLimitPerQuestion || 5,
        })
      }
      if (settings.coding) {
        setCodingSettings({
          defaultTimeLimit: settings.coding.defaultTimeLimit || 45,
          codeExecutionTimeout: settings.coding.codeExecutionTimeout || 10,
        })
      }
    } catch (error: any) {
      // Settings might not exist yet, that's okay
      console.log("Settings not found, using defaults")
    }
  }

  const handleSaveBehavioral = async () => {
    try {
      setSavingBehavioral(true)
      await api.post("/admin/settings", {
        behavioral: behavioralSettings,
      })
      toast({
        title: "Settings saved",
        description: "Behavioral interview settings have been updated",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to save settings",
        description: error.message,
      })
    } finally {
      setSavingBehavioral(false)
    }
  }

  const handleSaveCoding = async () => {
    try {
      setSavingCoding(true)
      await api.post("/admin/settings", {
        coding: codingSettings,
      })
      toast({
        title: "Settings saved",
        description: "Coding interview settings have been updated",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to save settings",
        description: error.message,
      })
    } finally {
      setSavingCoding(false)
    }
  }


  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        variant: "destructive",
        title: "All fields required",
        description: "Please fill in all password fields",
      })
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password mismatch",
        description: "New password and confirm password do not match",
      })
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 8 characters long",
      })
      return
    }

    try {
      setLoading(true)
      await api.post("/admin/change-password", {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        confirm_password: passwordForm.confirmPassword,
      })
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully",
      })
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to change password",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col h-full overflow-y-auto">
        <div className="flex items-center gap-2 mb-8">
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 text-blue-800 font-medium"
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
        <div className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
          <p className="text-slate-600 text-sm mt-1">Configure platform settings and preferences</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 max-w-4xl">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full justify-start bg-white border-b border-slate-200">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="interview">Interview Config</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-6 space-y-6">
              <Card className="p-6 bg-white border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Admin Account</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-700 font-medium mb-2 block">Email Address</Label>
                    <Input 
                      value={loadingProfile ? "Loading..." : adminEmail || "No email found"} 
                      disabled 
                      className="bg-slate-50 cursor-not-allowed"
                      type="email"
                    />
                    <p className="text-slate-500 text-xs mt-1">Admin email cannot be changed</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-700 font-medium mb-2 block">Current Password</Label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                        }
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showCurrentPassword ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium mb-2 block">New Password</Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                        }
                        placeholder="Enter new password (min 8 characters)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showNewPassword ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium mb-2 block">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                        }
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showConfirmPassword ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button onClick={handlePasswordChange} disabled={loading}>
                    {loading ? "Changing Password..." : "Change Password"}
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="interview" className="mt-6 space-y-6">
              <Card className="p-6 bg-white border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Behavioral Interview Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-700 font-medium mb-2 block">Default Question Count</Label>
                    <Input
                      type="number"
                      value={behavioralSettings.defaultQuestionCount}
                      onChange={(e) =>
                        setBehavioralSettings((prev) => ({
                          ...prev,
                          defaultQuestionCount: parseInt(e.target.value) || 0,
                        }))
                      }
                      min="1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium mb-2 block">Time Limit per Question (minutes)</Label>
                    <Input
                      type="number"
                      value={behavioralSettings.timeLimitPerQuestion}
                      onChange={(e) =>
                        setBehavioralSettings((prev) => ({
                          ...prev,
                          timeLimitPerQuestion: parseInt(e.target.value) || 0,
                        }))
                      }
                      min="1"
                    />
                  </div>
                  <Button onClick={handleSaveBehavioral} disabled={savingBehavioral}>
                    {savingBehavioral ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-white border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Coding Interview Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-700 font-medium mb-2 block">Default Time Limit (minutes)</Label>
                    <Input
                      type="number"
                      value={codingSettings.defaultTimeLimit}
                      onChange={(e) =>
                        setCodingSettings((prev) => ({
                          ...prev,
                          defaultTimeLimit: parseInt(e.target.value) || 0,
                        }))
                      }
                      min="1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium mb-2 block">Code Execution Timeout (seconds)</Label>
                    <Input
                      type="number"
                      value={codingSettings.codeExecutionTimeout}
                      onChange={(e) =>
                        setCodingSettings((prev) => ({
                          ...prev,
                          codeExecutionTimeout: parseInt(e.target.value) || 0,
                        }))
                      }
                      min="1"
                    />
                  </div>
                  <Button onClick={handleSaveCoding} disabled={savingCoding}>
                    {savingCoding ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
