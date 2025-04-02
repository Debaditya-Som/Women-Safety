"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { CheckCircle, Heart, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import confetti from "canvas-confetti"

export default function ThankYouPage() {
  const router = useRouter()

  useEffect(() => {
    // Trigger confetti effect when the page loads
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container max-w-md mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Thank You for Your Donation!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Your generous contribution will help us improve healthcare accessibility and provide better information to
              those in need.
            </p>
            <div className="flex items-center justify-center gap-1 text-primary">
              <Heart className="h-5 w-5 fill-primary" />
              <span className="font-medium">You're making a difference</span>
              <Heart className="h-5 w-5 fill-primary" />
            </div>
            <div className="bg-muted/50 p-4 rounded-lg text-sm">
              <p className="font-medium mb-1">What happens next?</p>
              <p className="text-muted-foreground">
                You'll receive a confirmation email with your donation receipt shortly. We'll keep you updated on how
                your contribution is helping our project.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button onClick={() => router.push("/")} variant="default" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Homepage
            </Button>
            <Button onClick={() => router.push("/map")} variant="outline" className="w-full">
              Explore Map
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

