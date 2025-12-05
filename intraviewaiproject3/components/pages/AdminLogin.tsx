"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { API_URL } from "@/lib/api"
import { setAuthToken } from "@/lib/auth"

interface AdminLoginProps {
  onLogin: (role: "admin") => void
  onBack: () => void
}

export function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.detail || data.error || "Invalid credentials")
      }
      if (!data.access_token) {
        throw new Error("Missing token in response")
      }
      setAuthToken(data.access_token, "admin", email)
      onLogin("admin")
      router.replace("/admin/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to login")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCandidateLogin = () => {
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 border-slate-200">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <Image src="/logo-01.png" alt="IntraView AI" width={28} height={28} className="w-7 h-7 object-contain" />
            <span className="font-bold text-base text-slate-900">IntraView AI</span>
          </div>
        </div>

        <h1 className="text-xl font-bold text-slate-900 mb-1 text-center">Admin Sign In</h1>
        <p className="text-slate-600 mb-4 text-center text-sm">Access the admin management panel</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-slate-700 font-medium mb-1 block text-sm">
              Admin Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-9"
              required
            />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-slate-700 font-medium mb-1 block text-sm">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pr-10 h-9 ${error ? "border-red-500" : ""}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 transition"
              >
                {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <div className="mt-1 flex items-start gap-2 text-red-600 text-xs">
                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" className="w-3.5 h-3.5 rounded border-slate-300" />
            <Label htmlFor="remember" className="text-slate-600 text-sm">
              Remember me
            </Label>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full h-9" disabled={!email || !password || submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Candidate Link */}
        <div className="mt-3 pt-3 border-t border-slate-200 text-center">
          <p className="text-slate-600 text-xs">
            Are you a candidate?{" "}
            <button onClick={handleCandidateLogin} className="text-blue-800 hover:text-blue-900 font-medium">
              Candidate Login
            </button>
          </p>
        </div>
      </Card>
    </div>
  )
}
