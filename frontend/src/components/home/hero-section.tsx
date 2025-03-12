"use client"

import Link from "next/link"
import { MapPin, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section className="relative w-full pt-12 md:pt-16 lg:pt-20 py-8 md:py-12 lg:py-16 overflow-hidden">
      {/* Simple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background" />

      <div className="container relative px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          <motion.div
            className="flex flex-col justify-center space-y-5"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl xl:text-5xl">Your Safety Matters</h1>
              <p className="text-muted-foreground md:text-lg">
                Find nearby hospitals, police stations, and women's safety services with our interactive map and
                resources. We are dedicated to ensuring the safety and well-being of women everywhere. Our platform
                provides real-time updates and alerts to keep you aware of any potential dangers in your area.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-fit"
            >
              <div className="px-3 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full border border-primary/20 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Always Available 24/7
              </div>
            </motion.div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/map">
                <Button size="lg" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  Find Nearby Services
                </Button>
              </Link>
              <Link href="/safety">
                <Button size="lg" variant="outline" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Safety Resources
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          >
            <div className="relative max-w-[500px] w-full">
              <div className="rounded-lg overflow-hidden border border-border/30 shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1522543558187-768b6df7c25c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  width={500}
                  height={600}
                  alt="Women's safety and empowerment"
                  className="object-cover w-full"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

