"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface UserInfoModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string, email: string) => void
  initialName: string
  initialEmail: string
  showToast: (message: string, type?: "success" | "error") => void
}

export function UserInfoModal({ isOpen, onClose, onSubmit, initialName, initialEmail, showToast }: UserInfoModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (isOpen) {
      setName(initialName)
      setEmail(initialEmail)
    }
  }, [isOpen, initialName, initialEmail])

  const handleSubmit = () => {
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName || !trimmedEmail) {
      showToast("Please enter both your name and email.", "error")
      return
    }
    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      showToast("Please enter a valid email address.", "error")
      return
    }

    onSubmit(trimmedName, trimmedEmail)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Subscriber Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">Please enter your name and email to continue.</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Continue to Payment</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
