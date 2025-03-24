"use client"

import Link from "next/link"
import { MapPin, Shield, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion } from "framer-motion"
import { useState } from "react"

export function HeroSection() {
  const [isSending, setIsSending] = useState(false)

  const sendSOS = async () => {
    if (navigator.geolocation) {
      setIsSending(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          const emergencyContact = localStorage.getItem("emergencyContact") || "+919330703381" // +918617795062

          try {
            const response = await fetch("/api/send-sos", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ latitude, longitude, emergencyContact }),
            })

            const data = await response.json()

            if (response.ok) {
              alert(data.message || "SOS Sent Successfully!")
            } else {
              alert(data.error || "Failed to send SOS.")
            }
          } catch (error) {
            console.error("Error sending SOS:", error)
            alert("Error sending SOS.")
          } finally {
            setIsSending(false)
          }
        },
        (error) => {
          console.error("Geolocation error:", error)
          alert("Could not access your location. Please enable location services.")
          setIsSending(false)
        },
      )
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }

  return (
    <section className="relative w-full pt-12 md:pt-16 lg:pt-20 py-8 md:py-12 lg:py-16 overflow-hidden">
      {/* Background gradient with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-background" />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="container relative px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          <motion.div
            className="flex flex-col justify-center space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
               <motion.div
              className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm w-fit"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              24/7 Assistance
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-black to-black/70">
                Your Safety Matters
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
                Find nearby hospitals, police stations, and women's safety services with our interactive map and
                resources. Our platform provides real-time updates and alerts to keep you aware of any potential dangers
                in your area.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/map">
                <Button
                  size="lg"
                  className="gap-2 rounded-full bg-black shadow-lg hover:shadow-black/30 transition-all duration-300 text-base px-6"
                >
                  <MapPin className="h-5 w-5" />
                  Find Nearby Services
                </Button>
              </Link>
              <Link href="/self-defense">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 rounded-full border-primary/20 hover:bg-primary/5 transition-all duration-300 text-base px-6"
                >
                  <Shield className="h-5 w-5" />
                  Safety Resources
                </Button>
              </Link>
            </div>

            {/* SOS Button - Made more prominent and emergency-like */}
            <motion.div
              className="mt-6 pt-4 border-t border-border/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Button
                onClick={sendSOS}
                disabled={isSending}
                size="lg"
                variant="destructive"
                className="relative group w-full sm:w-auto rounded-xl h-16 px-8 text-lg font-bold shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 border-2 border-red-400"
              >
                <span className="absolute inset-0 rounded-xl overflow-hidden">
                  <span className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent group-hover:opacity-30 transition-opacity duration-300"></span>
                </span>
                <span className="relative flex items-center gap-3">
                  {isSending ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending SOS...
                    </>
                  ) : (
                    <>
                      <span className="relative flex h-6 w-6">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <AlertTriangle className="relative h-6 w-6" />
                      </span>
                      EMERGENCY SOS ALERT
                    </>
                  )}
                </span>
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center sm:text-left">
                Press only in case of emergency. This will send your location to emergency contacts.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          >
            <div className="relative max-w-[500px] w-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/40 rounded-lg blur-lg opacity-70"></div>
              <div className="relative rounded-lg overflow-hidden border border-border/30 shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  width={500}
                  height={600}
                  alt="Women's safety and empowerment"
                  className="object-cover w-full transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Safety Resources Available
                  </div>
                </div>
              </div>
              <motion.div
                className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-full shadow-lg p-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3, type: "spring" }}
              >
                <Shield className="h-6 w-6 text-primary" />
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-full shadow-lg p-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, duration: 0.3, type: "spring" }}
              >
                <MapPin className="h-6 w-6 text-primary" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}