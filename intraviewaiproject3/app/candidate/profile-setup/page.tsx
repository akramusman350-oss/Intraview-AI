"use client"

import { useRouter } from "next/navigation"
import { ProfileSetup } from "@/components/pages/ProfileSetup"

export default function ProfileSetupPage() {
  const router = useRouter()

  const handleStartInterview = (profileData: any) => {
    // Save profile data and navigate to interview
    router.push("/candidate/combined-interview")
  }

  return <ProfileSetup onStartInterview={handleStartInterview} />
}
