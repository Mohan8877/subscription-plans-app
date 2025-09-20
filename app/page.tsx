"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckIcon, StarIcon } from "lucide-react"
import { WelcomeModal } from "@/components/welcome-modal"
import { UserInfoModal } from "@/components/user-info-modal"
import { PaymentModal } from "@/components/payment-modal"
import { InvoiceModal } from "@/components/invoice-modal"
import { Toast } from "@/components/toast"

interface Plan {
  id: string
  name: string
  price: number
  limit: number
  features: string[]
}

interface AppState {
  currentPlanId: string
  selectedPlanId: string | null
  timeWatched: number
  userName: string
  userEmail: string
  planExpiry: Date | null
}

interface ToastMessage {
  id: string
  message: string
  type: "success" | "error"
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    limit: 300,
    features: ["5 mins video/day", "Basic quality", "Access to free content"],
  },
  {
    id: "bronze",
    name: "Bronze",
    price: 10,
    limit: 420,
    features: ["7 mins video/day", "Standard quality (720p)", "Email support"],
  },
  {
    id: "silver",
    name: "Silver",
    price: 50,
    limit: 600,
    features: ["10 mins video/day", "Full HD (1080p)", "Priority email support"],
  },
  {
    id: "gold",
    name: "Gold",
    price: 100,
    limit: Number.POSITIVE_INFINITY,
    features: ["Unlimited viewing", "4K Ultra HD", "24/7 priority support"],
  },
]

export default function SubscriptionPlansApp() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(true)
  const [showUserInfoModal, setShowUserInfoModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState("")
  const [showVideoMessage, setShowVideoMessage] = useState(false)
  const [videoMessage, setVideoMessage] = useState("")
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const [state, setState] = useState<AppState>({
    currentPlanId: "free",
    selectedPlanId: null,
    timeWatched: 0,
    userName: "",
    userEmail: "",
    planExpiry: null,
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const dateTimeString = now.toLocaleString("en-IN", {
        dateStyle: "full",
        timeStyle: "medium",
      })
      setCurrentDateTime(dateTimeString)
    }

    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 5000)
  }

  const checkTimeLimit = () => {
    const plan = plans.find((p) => p.id === state.currentPlanId)!
    if (state.timeWatched >= plan.limit) {
      if (videoRef.current) {
        videoRef.current.pause()
      }
      setVideoMessage(`You've reached your ${plan.name} plan's viewing limit. Please upgrade for more.`)
      setShowVideoMessage(true)
    }
  }

  const handleVideoPlay = () => {
    setShowVideoMessage(false)
    checkTimeLimit()

    if (videoRef.current?.paused) return

    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current)
    }

    timeIntervalRef.current = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setState((prev) => ({ ...prev, timeWatched: prev.timeWatched + 1 }))
        checkTimeLimit()
      }
    }, 1000)
  }

  const handleVideoPause = () => {
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current)
    }
  }

  const handleVideoEnded = () => {
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current)
    }
  }

  const selectPlan = (planId: string) => {
    setState((prev) => ({ ...prev, selectedPlanId: planId }))
    setShowUserInfoModal(true)
  }

  const handleWelcomeSubmit = (email: string) => {
    setState((prev) => ({ ...prev, userEmail: email }))
    setShowWelcomeModal(false)
  }

  const handleUserInfoSubmit = (name: string, email: string) => {
    setState((prev) => ({ ...prev, userName: name, userEmail: email }))
    setShowUserInfoModal(false)
    setShowPaymentModal(true)
  }

  const processPayment = async () => {
    const plan = plans.find((p) => p.id === state.selectedPlanId)!

    const invoiceNumber = Math.floor(Math.random() * 900000) + 100000
    const invoiceDate = new Date().toLocaleDateString()

    const invoiceData = {
      userName: state.userName,
      userEmail: state.userEmail,
      planName: plan.name,
      planPrice: plan.price,
      invoiceNumber: invoiceNumber.toString(),
      invoiceDate: invoiceDate,
    }

    setTimeout(async () => {
      setState((prev) => {
        const newState = {
          ...prev,
          currentPlanId: prev.selectedPlanId!,
          timeWatched: 0,
          planExpiry: plan.id !== "free" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
        }
        return newState
      })

      setShowPaymentModal(false)

      if (plan.price > 0) {
        try {
          console.log("[v0] Sending invoice email request...")
          const response = await fetch("/api/send-invoice", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(invoiceData),
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const contentType = response.headers.get("content-type")
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Response is not JSON")
          }

          const result = await response.json()
          console.log("[v0] Email API response:", result)

          if (result.success) {
            showToast(
              `Successfully upgraded to ${plan.name} plan! Invoice has been sent to ${state.userEmail}.`,
              "success",
            )
          } else {
            showToast(
              `Successfully upgraded to ${plan.name} plan! However, there was an issue sending the invoice email: ${result.message || "Unknown error"}`,
              "error",
            )
          }
        } catch (error) {
          console.error("[v0] Error sending invoice email:", error)
          showToast(
            `Successfully upgraded to ${plan.name} plan! However, there was an issue sending the invoice email.`,
            "error",
          )
        }
      } else {
        showToast(`Successfully upgraded to ${plan.name} plan!`, "success")
      }

      setTimeout(() => setShowInvoiceModal(true), 500)
    }, 1000)
  }

  const cancelSubscription = () => {
    setState((prev) => ({
      ...prev,
      currentPlanId: "free",
      planExpiry: null,
      timeWatched: 0,
    }))
    showToast("Your subscription has been canceled.", "success")
  }

  const currentPlan = plans.find((p) => p.id === state.currentPlanId)!
  const selectedPlan = plans.find((p) => p.id === state.selectedPlanId)

  if (showWelcomeModal) {
    return <WelcomeModal onSubmit={handleWelcomeSubmit} showToast={showToast} />
  }

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Video Player Section */}
      <Card className="mb-12">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Video Content</CardTitle>
            <p className="text-sm text-muted-foreground font-medium">{currentDateTime}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              className="w-full h-full"
              controls
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              onEnded={handleVideoEnded}
            >
              <source
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>

          {showVideoMessage && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
              <p>{videoMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <p>
              Current Plan: <span className="font-semibold text-indigo-600">{currentPlan.name}</span>
            </p>
            <p>
              Profile Status:
              {currentPlan.id !== "free" ? (
                <Badge variant="secondary" className="ml-1">
                  <StarIcon className="w-3 h-3 mr-1" />
                  Premium User
                </Badge>
              ) : (
                <span className="font-semibold text-foreground ml-1">Standard User</span>
              )}
            </p>
            <p>
              Time Watched: <span className="font-semibold">{Math.floor(state.timeWatched)}</span>s
            </p>
            <p>
              Viewing Limit:{" "}
              <span className="font-semibold">
                {currentPlan.limit === Number.POSITIVE_INFINITY ? "Unlimited" : `${currentPlan.limit}s`}
              </span>
            </p>
            {state.planExpiry && state.currentPlanId !== "free" && (
              <p className="col-span-2">
                Expires on: <span className="font-semibold">{state.planExpiry.toLocaleDateString()}</span>
              </p>
            )}
          </div>

          {state.planExpiry && state.currentPlanId !== "free" && (
            <div className="mt-4">
              <Button onClick={cancelSubscription} variant="destructive" size="sm">
                Cancel Subscription
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Plans Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Upgrade to unlock more features and enjoy unlimited content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {plans.map((plan) => {
          const isCurrentPlan = state.currentPlanId === plan.id
          const isDowngrade = currentPlan.id !== "free" && plan.price < currentPlan.price

          return (
            <Card
              key={plan.id}
              className={`transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                isCurrentPlan ? "border-indigo-500" : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="my-4">
                  <span className="text-4xl font-extrabold">₹{plan.price}</span>
                  {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => selectPlan(plan.id)}
                  disabled={isCurrentPlan || isDowngrade}
                  className="w-full"
                  variant={isCurrentPlan || isDowngrade ? "secondary" : "default"}
                >
                  {isCurrentPlan ? "Current Plan" : isDowngrade ? "Downgrade Unavailable" : "Choose Plan"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Modals */}
      <UserInfoModal
        isOpen={showUserInfoModal}
        onClose={() => setShowUserInfoModal(false)}
        onSubmit={handleUserInfoSubmit}
        initialName={state.userName}
        initialEmail={state.userEmail}
        showToast={showToast}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={processPayment}
        plan={selectedPlan}
      />

      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        plan={selectedPlan}
        userName={state.userName}
        userEmail={state.userEmail}
      />

      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} />
        ))}
      </div>
    </div>
  )
}
