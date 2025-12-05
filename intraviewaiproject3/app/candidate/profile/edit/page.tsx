"use client"

import { useRouter } from "next/navigation"
import { EditCandidateProfile } from "@/components/pages/EditCandidateProfile"
import { handleLogout } from "@/lib/auth"
import { useUserName } from "@/hooks/useUserName"

export default function EditCandidateProfilePage() {
  const router = useRouter()
  const userName = useUserName()

  const handleNavigate = (page: string) => {
    const routes: { [key: string]: string } = {
      "candidate-dashboard": "/candidate/dashboard",
      "candidate-profile": "/candidate/profile",
      "candidate-interviews": "/candidate/interviews",
      "candidate-reports": "/candidate/reports",
      "candidate-progress": "/candidate/progress",
      "candidate-recommendations": "/candidate/recommendations",
      "candidate-settings": "/candidate/settings",
    }
    router.push(routes[page] || "/candidate/dashboard")
  }

  const handleLogoutClick = () => {
    handleLogout("/login")
  }

  return <EditCandidateProfile userName={userName} onNavigate={handleNavigate} onLogout={handleLogoutClick} />
}

