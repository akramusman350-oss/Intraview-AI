"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AdminAnalytics } from "@/components/pages/AdminAnalytics"
import { handleLogout } from "@/lib/auth"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(false)

  const handleNavigate = (page: string) => {
    // Show dialog for Sessions and Analytics
    if (page === "admin-sessions" || page === "admin-analytics" || page === "sessions" || page === "analytics") {
      setShowDialog(true)
      return
    }

    const routes: { [key: string]: string } = {
      "admin-dashboard": "/admin/dashboard",
      dashboard: "/admin/dashboard",
      "admin-questions": "/admin/questions",
      questions: "/admin/questions",
      "admin-testcases": "/admin/testcases",
      testcases: "/admin/testcases",
      "admin-candidates": "/admin/candidates",
      candidates: "/admin/candidates",
      "admin-rubrics": "/admin/rubrics",
      rubrics: "/admin/rubrics",
      "admin-settings": "/admin/settings",
      settings: "/admin/settings",
    }
    router.push(routes[page] || "/admin/dashboard")
  }

  const handleLogoutClick = () => {
    handleLogout("/admin/login")
  }

  return (
    <>
      <AdminAnalytics onNavigate={handleNavigate} onLogout={handleLogoutClick} />
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feature Coming Soon</DialogTitle>
            <DialogDescription>
              This feature will be implemented in the 8th Semester.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowDialog(false)}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
