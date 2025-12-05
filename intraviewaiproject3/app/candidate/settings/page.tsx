"use client"

import { useRouter } from "next/navigation"
import { CandidateSettings } from "@/components/pages/CandidateSettings"
import { handleLogout } from "@/lib/auth"

export default function CandidateSettingsPage() {
  const router = useRouter()

  const handleNavigate = (page: string, data?: any) => {
    const routes: { [key: string]: string } = {
      "candidate-dashboard": "/candidate/dashboard",
      "candidate-profile": "/candidate/profile",
      "candidate-interviews": "/candidate/interviews",
      "candidate-reports": "/candidate/reports",
      "candidate-progress": "/candidate/progress",
      "candidate-settings": "/candidate/settings",
      "candidate-recommendations": "/candidate/progress",
    }
    router.push(routes[page] || "/candidate/dashboard")
  }

  const handleLogoutClick = () => {
    handleLogout("/login")
  }

  return <CandidateSettings onNavigate={handleNavigate} onLogout={handleLogoutClick} />
}
