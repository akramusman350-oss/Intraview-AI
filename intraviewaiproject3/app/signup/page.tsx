"use client"

import { useState } from "react"
import { SignupPage } from "@/components/pages/SignupPage"
import { useRouter } from "next/navigation"

export default function SignupPageWrapper() {
  const router = useRouter()

  const handleSignup = (name: string) => {
    // After successful signup and login, redirect to candidate dashboard
    // Use window.location for reliable redirect after signup
    window.location.href = "/candidate/dashboard"
  }

  const handleBack = () => {
    router.replace("/login")
  }

  return <SignupPage onSignup={handleSignup} onBack={handleBack} />
}
