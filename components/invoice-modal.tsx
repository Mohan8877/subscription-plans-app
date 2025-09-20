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

interface InvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  plan: Plan | undefined
  userName: string
  userEmail: string
}

export function InvoiceModal({ isOpen, onClose, plan, userName, userEmail }: InvoiceModalProps) {
  if (!plan) return null

  const invoiceNumber = Math.floor(Math.random() * 900000) + 100000
  const invoiceDate = new Date().toLocaleDateString()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Invoice</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground">Invoice #: {invoiceNumber}</p>
              <p className="text-muted-foreground">Date: {invoiceDate}</p>
            </div>
            <div className="text-right">
              <h3 className="text-xl font-semibold">Your Company Inc.</h3>
              <p className="text-muted-foreground">123 Your Street, City, Country</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-muted-foreground mb-2">Bill To:</h4>
            <p className="font-medium">{userName}</p>
            <p className="text-muted-foreground">{userEmail}</p>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left font-semibold p-3">Description</th>
                  <th className="text-right font-semibold p-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3">{plan.name} Plan - Subscription</td>
                  <td className="text-right font-medium p-3">₹{plan.price.toFixed(2)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="font-bold border-t-2">
                  <td className="text-right p-3">Total</td>
                  <td className="text-right p-3">₹{plan.price.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="text-center text-sm text-muted-foreground">Thank you for your business!</p>

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
