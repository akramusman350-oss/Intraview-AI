"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Mail, Lock, Eye, EyeOff, Trash2 } from "lucide-react"
import { SidebarLayout } from "@/components/SidebarLayout"
import { useUserName } from "@/hooks/useUserName"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { handleLogout } from "@/lib/auth"

interface CandidateSettingsProps {
  onNavigate: (page: string) => void
  onLogout: () => void
}

export function CandidateSettings({ onNavigate, onLogout }: CandidateSettingsProps) {
  const { toast } = useToast()
  const userName = useUserName()
  
  // Profile photo state
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [removingPhoto, setRemovingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Email state
  const [currentEmail, setCurrentEmail] = useState("")
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [updatingEmail, setUpdatingEmail] = useState(false)
  
  // Delete account state
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false)
  const [deleteReason, setDeleteReason] = useState("")
  const [deletingAccount, setDeletingAccount] = useState(false)
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Fetch user profile on mount
  useEffect(() => {
    // Check if we have a token before making API calls
    const token = localStorage.getItem("authToken")
    if (!token) {
      return // Don't fetch if no token
    }

    const fetchProfile = async () => {
      try {
        const data = await api.get("/users/me")
        setCurrentEmail(data?.email || "")
        
        // Load profile photo if exists
        if (data?.profile_info?.photo_filename) {
          const photoUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/users/me/photo`
          const token = localStorage.getItem("authToken")
          try {
            const response = await fetch(photoUrl, {
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            })
            if (response.ok) {
              const blob = await response.blob()
              const url = URL.createObjectURL(blob)
              setProfilePhoto(url)
            }
          } catch (error) {
            console.error("Failed to load photo:", error)
          }
        } else {
          // Show initials if no photo
          setProfilePhoto(null)
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      }
    }
    fetchProfile()
  }, [])

  // Get user initials for avatar
  const getUserInitials = () => {
    if (userName) {
      const parts = userName.split(" ")
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase()
      }
      return userName.substring(0, 2).toUpperCase()
    }
    return "JD"
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG, PNG, GIF, or WEBP image",
          variant: "destructive",
        })
        return
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size must be less than 5MB",
          variant: "destructive",
        })
        return
      }
      
      setPhotoFile(file)
      // Preview image
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadPhoto = async () => {
    if (!photoFile) return
    
    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append("file", photoFile)
      
      const token = localStorage.getItem("authToken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/users/me/upload-photo`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to upload photo")
      }
      
      toast({
        title: "Success",
        description: "Profile photo uploaded successfully",
      })
      
      setPhotoFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error: any) {
      console.error("Failed to upload photo:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload photo",
        variant: "destructive",
      })
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleRemovePhoto = async () => {
    setRemovingPhoto(true)
    try {
      await api.post("/users/me/remove-photo")
      
      toast({
        title: "Success",
        description: "Profile photo removed successfully",
      })
      
      setProfilePhoto(null)
      setPhotoFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error: any) {
      console.error("Failed to remove photo:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to remove photo",
        variant: "destructive",
      })
    } finally {
      setRemovingPhoto(false)
    }
  }

  const handleOpenEmailDialog = () => {
    setNewEmail(currentEmail)
    setEmailDialogOpen(true)
  }

  const handleUpdateEmail = async () => {
    if (!newEmail || newEmail === currentEmail) {
      toast({
        title: "No changes",
        description: "Please enter a new email address",
        variant: "destructive",
      })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setUpdatingEmail(true)
    try {
      await api.post("/users/me/update-email", {
        new_email: newEmail,
      })
      
      toast({
        title: "Success",
        description: "Email updated successfully",
      })
      
      setCurrentEmail(newEmail)
      setEmailDialogOpen(false)
    } catch (error: any) {
      console.error("Failed to update email:", error)
      toast({
        title: "Error",
        description: error?.response?.data?.detail || error.message || "Failed to update email",
        variant: "destructive",
      })
    } finally {
      setUpdatingEmail(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deleteReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for deleting your account",
        variant: "destructive",
      })
      return
    }

    setDeletingAccount(true)
    try {
      await api.post("/users/me/delete-account", {
        reason: deleteReason,
      })
      
      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully",
      })
      
      // Logout and redirect
      setTimeout(() => {
        handleLogout("/login")
      }, 1000)
    } catch (error: any) {
      console.error("Failed to delete account:", error)
      toast({
        title: "Error",
        description: error?.response?.data?.detail || error.message || "Failed to delete account",
        variant: "destructive",
      })
      setDeletingAccount(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "All fields required",
        description: "Please fill in all password fields",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirm password do not match",
        variant: "destructive",
      })
      return
    }

    setChangingPassword(true)
    try {
      await api.post("/users/me/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
      
      toast({
        title: "Success",
        description: "Password changed successfully",
      })
      
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      console.error("Failed to change password:", error)
      toast({
        title: "Error",
        description: error?.response?.data?.detail || error.message || "Failed to change password",
        variant: "destructive",
      })
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <SidebarLayout userName={userName} onNavigate={onNavigate} onLogout={onLogout}>
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Sticky Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 text-sm mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="photo" className="w-full">
              <TabsList className="w-full justify-start bg-white border-b border-slate-200">
                <TabsTrigger value="photo">Profile Photo</TabsTrigger>
                <TabsTrigger value="email">Email Address</TabsTrigger>
                <TabsTrigger value="password">Change Password</TabsTrigger>
              </TabsList>

              {/* Profile Photo Tab */}
              <TabsContent value="photo" className="mt-6">
                <Card className="p-8 bg-white border-slate-200">
                  <div className="max-w-2xl mx-auto">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6 text-center">Profile Photo</h3>
                    <div className="flex flex-col items-center gap-6">
                      <div className="relative">
                        {profilePhoto ? (
                          <img
                            src={profilePhoto}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border-2 border-slate-200"
                          />
                        ) : (
                          <div className="w-32 h-32 bg-blue-800 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                            {getUserInitials()}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handlePhotoSelect}
                          className="hidden"
                        />
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingPhoto}
                          className="gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                        </Button>
                        {photoFile && (
                          <Button
                            onClick={handleUploadPhoto}
                            disabled={uploadingPhoto}
                          >
                            Save
                          </Button>
                        )}
                        {profilePhoto && (
                          <Button
                            variant="outline"
                            onClick={handleRemovePhoto}
                            disabled={removingPhoto}
                          >
                            {removingPhoto ? "Removing..." : "Remove"}
                          </Button>
                        )}
                      </div>
                      {photoFile && (
                        <p className="text-sm text-slate-600 text-center">
                          Selected: {photoFile.name} ({(photoFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Email Address Tab */}
              <TabsContent value="email" className="mt-6">
                <Card className="p-8 bg-white border-slate-200">
                  <div className="max-w-2xl mx-auto">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center justify-center gap-2">
                      <Mail className="w-5 h-5" />
                      Email Address
                    </h3>
                    <div className="space-y-6">
                      <div className="text-center">
                        <Label className="text-slate-700 font-medium mb-2 block">Email</Label>
                        <Input
                          type="email"
                          value={currentEmail}
                          disabled
                          className="bg-slate-50 text-center"
                        />
                        <p className="text-slate-500 text-xs mt-2">Current email address</p>
                      </div>
                      <div className="flex justify-center">
                        <Button onClick={handleOpenEmailDialog}>Update Email</Button>
                      </div>
                      
                      {/* Delete Account Section */}
                      <div className="pt-6 border-t border-slate-200">
                        <div className="text-center space-y-4">
                          <div>
                            <h4 className="text-md font-semibold text-slate-900 mb-2">Delete My Account</h4>
                            <p className="text-sm text-slate-600 mb-4">
                              Once you delete your account, there is no going back. Please be certain.
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            onClick={() => setDeleteAccountDialogOpen(true)}
                            className="gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete My Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Change Password Tab */}
              <TabsContent value="password" className="mt-6">
                <Card className="p-8 bg-white border-slate-200">
                  <div className="max-w-2xl mx-auto">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center justify-center gap-2">
                      <Lock className="w-5 h-5" />
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-slate-700 font-medium mb-2 block">Current Password</Label>
                        <div className="relative">
                          <Input
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="pr-10"
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
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pr-10"
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
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pr-10"
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
                      <div className="flex justify-center pt-4">
                        <Button
                          onClick={handleChangePassword}
                          disabled={changingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
                        >
                          {changingPassword ? "Changing..." : "Change Password"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Email Update Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Email Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-slate-700 font-medium mb-2 block">New Email</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEmailDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateEmail}
              disabled={updatingEmail || !newEmail || newEmail === currentEmail}
            >
              {updatingEmail ? "Updating..." : "Update Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete My Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-slate-700 font-medium mb-2 block">
                Reason for deletion <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Please tell us why you're deleting your account..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">This helps us improve our service</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteAccountDialogOpen(false)
                setDeleteReason("")
              }}
              disabled={deletingAccount}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deletingAccount || !deleteReason.trim()}
            >
              {deletingAccount ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  )
}
