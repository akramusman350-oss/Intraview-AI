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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CandidateLoginProps {
  onLogin: () => void
  onBack: () => void
  onSignup: () => void
}

export function CandidateLogin({ onLogin, onBack, onSignup }: CandidateLoginProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [forgotPasswordStep, setForgotPasswordStep] = useState<"email" | "otp" | "newPassword">("email")
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [forgotPasswordError, setForgotPasswordError] = useState("")
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Use FastAPI backend for login
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Check if user is banned
        if (data.detail && (data.detail.includes("banned") || data.detail.includes("Banned"))) {
          setError("Your account has been banned. Please contact the administrator.")
          setLoading(false)
          // Clear any existing auth data
          localStorage.clear()
          // Redirect to login after a delay
          setTimeout(() => {
            window.location.replace("/login?banned=true")
          }, 2000)
          return
        }
        setError(data.detail || data.error || "Login failed")
        setLoading(false)
        return
      }

      // Store user info in localStorage
      localStorage.setItem("authToken", data.access_token)
      localStorage.setItem("userRole", "candidate")
      localStorage.setItem("userEmail", email)

      // Call onLogin callback
      onLogin()
    } catch (err) {
      setError("Network error. Please try again.")
      console.error(err)
      setLoading(false)
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
  }

  const handleAdminLogin = () => {
    router.push("/admin/login")
  }

  const handleForgotPassword = async () => {
    if (forgotPasswordStep === "email") {
      setForgotPasswordError("")
      setForgotPasswordLoading(true)
      try {
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotPasswordEmail }),
        })
        const data = await response.json()
        if (!response.ok) {
          setForgotPasswordError(data.detail || "Failed to send OTP")
          return
        }
        setForgotPasswordStep("otp")
      } catch (err) {
        setForgotPasswordError("Network error. Please try again.")
      } finally {
        setForgotPasswordLoading(false)
      }
    } else if (forgotPasswordStep === "otp") {
      setForgotPasswordError("")
      setForgotPasswordLoading(true)
      try {
        const response = await fetch(`${API_URL}/auth/verify-reset-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotPasswordEmail, otp: forgotPasswordOtp }),
        })
        const data = await response.json()
        if (!response.ok) {
          setForgotPasswordError(data.detail || "Invalid OTP")
          return
        }
        setForgotPasswordStep("newPassword")
      } catch (err) {
        setForgotPasswordError("Network error. Please try again.")
      } finally {
        setForgotPasswordLoading(false)
      }
    } else if (forgotPasswordStep === "newPassword") {
      if (newPassword !== confirmNewPassword) {
        setForgotPasswordError("Passwords do not match")
        return
      }
      setForgotPasswordError("")
      setForgotPasswordLoading(true)
      try {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: forgotPasswordEmail,
            otp: forgotPasswordOtp,
            new_password: newPassword,
          }),
        })
        const data = await response.json()
        if (!response.ok) {
          setForgotPasswordError(data.detail || "Failed to reset password")
          return
        }
        // Success - close dialog and show success message
        setForgotPasswordOpen(false)
        setError("Password reset successfully! Please login with your new password.")
        // Reset all states
        setForgotPasswordEmail("")
        setForgotPasswordOtp("")
        setNewPassword("")
        setConfirmNewPassword("")
        setForgotPasswordStep("email")
      } catch (err) {
        setForgotPasswordError("Network error. Please try again.")
      } finally {
        setForgotPasswordLoading(false)
      }
    }
  }

  const handleCloseForgotPassword = () => {
    setForgotPasswordOpen(false)
    setForgotPasswordEmail("")
    setForgotPasswordOtp("")
    setNewPassword("")
    setConfirmNewPassword("")
    setForgotPasswordStep("email")
    setForgotPasswordError("")
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

        <h1 className="text-xl font-bold text-slate-900 mb-1 text-center">Candidate Sign In</h1>
        <p className="text-slate-600 mb-4 text-center text-sm">Access your interview dashboard</p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-slate-700 font-medium mb-1 block text-sm">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
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
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="w-full pr-10 h-9"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 transition"
              >
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" className="w-3.5 h-3.5 rounded border-slate-300" />
            <Label htmlFor="remember" className="text-slate-600 text-sm">
              Remember me
            </Label>
          </div>

          {/* Forgot Password */}
          <button
            type="button"
            onClick={() => setForgotPasswordOpen(true)}
            className="text-blue-800 hover:text-blue-900 font-medium text-sm"
          >
            Forgot password?
          </button>

          {/* Submit */}
          <Button type="submit" className="w-full h-9" disabled={loading || !email || !password}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-4 text-center">
          <p className="text-slate-600 text-sm">
            Don't have an account?{" "}
            <button onClick={onSignup} className="text-blue-800 hover:text-blue-900 font-medium">
              Sign up
            </button>
          </p>
        </div>

        {/* Admin Link */}
        <div className="mt-3 pt-3 border-t border-slate-200 text-center">
          <p className="text-slate-600 text-xs">
            Are you an administrator?{" "}
            <button onClick={handleAdminLogin} className="text-blue-800 hover:text-blue-900 font-medium">
              Admin Login
            </button>
          </p>
        </div>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={handleCloseForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              {forgotPasswordStep === "email" && "Enter your email address to receive a password reset OTP"}
              {forgotPasswordStep === "otp" && "Enter the OTP sent to your email"}
              {forgotPasswordStep === "newPassword" && "Enter your new password"}
            </DialogDescription>
          </DialogHeader>

          {forgotPasswordError && (
            <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700">{forgotPasswordError}</p>
            </div>
          )}

          <div className="space-y-4">
            {forgotPasswordStep === "email" && (
              <div>
                <Label htmlFor="forgot-email" className="text-slate-700 font-medium mb-1 block text-sm">
                  Email Address
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="you@example.com"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="w-full h-9"
                />
              </div>
            )}

            {forgotPasswordStep === "otp" && (
              <div>
                <Label htmlFor="forgot-otp" className="text-slate-700 font-medium mb-1 block text-sm">
                  OTP Code
                </Label>
                <Input
                  id="forgot-otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={forgotPasswordOtp}
                  onChange={(e) => setForgotPasswordOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full h-9"
                  maxLength={6}
                />
              </div>
            )}

            {forgotPasswordStep === "newPassword" && (
              <>
                <div>
                  <Label htmlFor="new-password" className="text-slate-700 font-medium mb-1 block text-sm">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pr-10 h-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 transition"
                    >
                      {showNewPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirm-new-password" className="text-slate-700 font-medium mb-1 block text-sm">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-new-password"
                      type={showConfirmNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full pr-10 h-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 transition"
                    >
                      {showConfirmNewPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseForgotPassword}
              disabled={forgotPasswordLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleForgotPassword}
              disabled={
                forgotPasswordLoading ||
                (forgotPasswordStep === "email" && !forgotPasswordEmail) ||
                (forgotPasswordStep === "otp" && forgotPasswordOtp.length !== 6) ||
                (forgotPasswordStep === "newPassword" && (!newPassword || !confirmNewPassword))
              }
            >
              {forgotPasswordLoading
                ? "Processing..."
                : forgotPasswordStep === "email"
                  ? "Send OTP"
                  : forgotPasswordStep === "otp"
                    ? "Verify OTP"
                    : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
