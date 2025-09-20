"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Plan {
  id: string
  name: string
  price: number
  limit: number
  features: string[]
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  plan: Plan | undefined
}

export function PaymentModal({ isOpen, onClose, onConfirm, plan }: PaymentModalProps) {
  if (!plan) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Upgrade to {plan.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">Confirm your payment to proceed.</p>
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Plan Name:</span>
              <span className="font-bold">{plan.name}</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between items-center">
              <span className="font-medium">Amount:</span>
              <span className="font-bold text-indigo-600">₹{plan.price}</span>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onConfirm}>Confirm Payment</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
