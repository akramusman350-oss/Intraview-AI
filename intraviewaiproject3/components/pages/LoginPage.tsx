"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Eye, EyeOff, AlertCircle, Loader } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { API_URL } from "@/lib/api"

interface LoginPageProps {
  onLogin: (role: "candidate" | "admin") => void
  onBack: () => void
  onSignup: () => void
}

export function LoginPage({ onLogin, onBack, onSignup }: LoginPageProps) {
  const [role, setRole] = useState<"candidate" | "admin">("candidate")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
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
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Login failed")
        return
      }

      // Store user data in localStorage
      localStorage.setItem("userName", data.user.name)
      localStorage.setItem("userEmail", data.user.email)
      localStorage.setItem("userId", data.user.id)

      // Call onLogin with the role
      onLogin(role)
    } catch (err) {
      setError("An error occurred during login")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
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
        setForgotPasswordOpen(false)
        setError("Password reset successfully! Please login with your new password.")
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-slate-200">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <Image src="/logo-01.png" alt="IntraView AI" width={32} height={32} className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg text-slate-900">IntraView AI</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Sign In</h1>
        <p className="text-slate-600 mb-6">Access your IntraView account</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <RadioGroup value={role} onValueChange={(value) => setRole(value as "candidate" | "admin")}>
              <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <RadioGroupItem value="candidate" id="candidate" />
                <Label htmlFor="candidate" className="font-medium flex-1 text-slate-900">
                  Candidate
                </Label>
              </div>
              <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <RadioGroupItem value="admin" id="admin" />
                <Label htmlFor="admin" className="font-medium flex-1 text-slate-900">
                  Administrator
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-slate-700 font-medium mb-2 block">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-slate-700 font-medium mb-2 block">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300" />
            <Label htmlFor="remember" className="text-slate-600">
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
          <Button type="submit" className="w-full h-10" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-slate-600">
            Don't have an account?{" "}
            <button onClick={onSignup} className="text-blue-800 hover:text-blue-900 font-medium">
              Sign up
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
