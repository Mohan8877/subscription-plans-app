"use client"

import { CheckCircleIcon, XCircleIcon } from "lucide-react"

interface ToastProps {
  message: string
  type: "success" | "error"
}

export function Toast({ message, type }: ToastProps) {
  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500"
  const Icon = type === "success" ? CheckCircleIcon : XCircleIcon

  return (
    <div
      className={`${bgColor} text-white p-4 rounded-lg shadow-lg flex items-center space-x-2 animate-in slide-in-from-right duration-500`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}
