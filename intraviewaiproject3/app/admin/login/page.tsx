"use client"

import { useState, useEffect } from "react"
import { AdminLogin } from "@/components/pages/AdminLogin"
import { AdminDashboard } from "@/components/pages/AdminDashboard"
import { AdminQuestions } from "@/components/pages/AdminQuestions"
import { AdminTestCases } from "@/components/pages/AdminTestCases"
import { AdminCandidates } from "@/components/pages/AdminCandidates"
import { AdminSessions } from "@/components/pages/AdminSessions"
import { AdminRubrics } from "@/components/pages/AdminRubrics"
import { AdminAnalytics } from "@/components/pages/AdminAnalytics"
import { AdminSettings } from "@/components/pages/AdminSettings"
import { useRouter } from "next/navigation"
import { handleLogout } from "@/lib/auth"

type Page =
  | "login"
  | "dashboard"
  | "questions"
  | "testcases"
  | "candidates"
  | "sessions"
  | "rubrics"
  | "analytics"
  | "settings"

type UserRole = "admin" | null

export default function AdminLoginPage() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState<Page>("login")
  const [userRole, setUserRole] = useState<UserRole>(null)

  // Prevent back navigation after logout (only when not authenticated)
  useEffect(() => {
    if (userRole) return // Don't add listener if user is authenticated

    // Check if user is logged out (no auth token)
    const authToken = localStorage.getItem("authToken")
    if (!authToken && typeof window !== 'undefined') {
      // Push a new state to prevent back navigation
      window.history.pushState(null, '', window.location.pathname)
      
      const handlePopState = (event: PopStateEvent) => {
        // If user tries to go back, prevent it and redirect to login
        const currentAuthToken = localStorage.getItem("authToken")
        if (!currentAuthToken) {
          // Push state again to prevent navigation
          window.history.pushState(null, '', window.location.pathname)
          // Use replace to ensure we stay on login page
          window.location.replace(window.location.pathname)
        }
      }

      window.addEventListener('popstate', handlePopState)

      return () => {
        window.removeEventListener('popstate', handlePopState)
      }
    }
  }, [userRole])

  const handleLogin = (role: "admin") => {
    setUserRole(role)
    setCurrentPage("dashboard")
    router.replace("/admin/dashboard")
  }

  const handleLogoutClick = () => {
    setUserRole(null)
    setCurrentPage("login")
    handleLogout("/admin/login")
  }

  const handleNavigate = (page: Page | string) => {
    const pageRoutes: { [key: string]: string } = {
      login: "/admin/login",
      dashboard: "/admin/dashboard",
      "admin-dashboard": "/admin/dashboard",
      questions: "/admin/questions",
      "admin-questions": "/admin/questions",
      testcases: "/admin/testcases",
      "admin-testcases": "/admin/testcases",
      candidates: "/admin/candidates",
      "admin-candidates": "/admin/candidates",
      sessions: "/admin/sessions",
      "admin-sessions": "/admin/sessions",
      rubrics: "/admin/rubrics",
      "admin-rubrics": "/admin/rubrics",
      analytics: "/admin/analytics",
      "admin-analytics": "/admin/analytics",
      settings: "/admin/settings",
      "admin-settings": "/admin/settings",
    }
    setCurrentPage(page as Page)
    router.push(pageRoutes[page] || "/admin/dashboard")
  }

  // Render pages based on currentPage
  if (!userRole) {
    return (
      <AdminLogin onLogin={handleLogin} onBack={() => router.push("/")} />
    )
  }

  if (userRole === "admin") {
    switch (currentPage) {
      case "dashboard":
        return <AdminDashboard onNavigate={handleNavigate} onLogout={handleLogoutClick} />
      case "questions":
        return <AdminQuestions onNavigate={handleNavigate} onLogout={handleLogoutClick} />
      case "testcases":
        return <AdminTestCases onNavigate={handleNavigate} onLogout={handleLogoutClick} />
      case "candidates":
        return <AdminCandidates onNavigate={handleNavigate} onLogout={handleLogoutClick} />
      case "sessions":
        return <AdminSessions onNavigate={handleNavigate} onLogout={handleLogoutClick} />
      case "rubrics":
        return <AdminRubrics onNavigate={handleNavigate} onLogout={handleLogoutClick} />
      case "analytics":
        return <AdminAnalytics onNavigate={handleNavigate} onLogout={handleLogoutClick} />
      case "settings":
        return <AdminSettings onNavigate={handleNavigate} onLogout={handleLogoutClick} />
      default:
        return <AdminDashboard onNavigate={handleNavigate} onLogout={handleLogoutClick} />
    }
  }

  return null
}
