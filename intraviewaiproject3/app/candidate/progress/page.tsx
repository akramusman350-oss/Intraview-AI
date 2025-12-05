"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function CandidateProgressPage() {
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(true)

  useEffect(() => {
    setShowDialog(true)
  }, [])

  const handleClose = () => {
    setShowDialog(false)
    router.push("/candidate/dashboard")
  }

  return (
    <Dialog open={showDialog} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feature Coming Soon</DialogTitle>
          <DialogDescription>
            This feature will be implemented in the 8th Semester.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleClose}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
