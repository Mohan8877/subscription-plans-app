"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface WelcomeModalProps {
  onSubmit: (email: string) => void
  showToast: (message: string, type?: "success" | "error") => void
}

export function WelcomeModal({ onSubmit, showToast }: WelcomeModalProps) {
  const [email, setEmail] = useState("")

  const handleSubmit = () => {
    const trimmedEmail = email.trim()

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      showToast("Please enter a valid email address.", "error")
      return
    }

    onSubmit(trimmedEmail)
  }

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome!</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">Please enter your email to access the content.</p>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Enter Site
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
