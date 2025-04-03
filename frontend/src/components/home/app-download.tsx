"use client"

import { Shield, MapPin, Users, Clock, Download } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"

export function AppDownloadSection() {
  const features = [
    { icon: <Shield className="h-4 w-4 text-primary" />, text: "One-touch emergency contact" },
    { icon: <MapPin className="h-4 w-4 text-primary" />, text: "Location sharing with trusted contacts" },
    { icon: <Users className="h-4 w-4 text-primary" />, text: "Community support and resources" },
    { icon: <Clock className="h-4 w-4 text-primary" />, text: "24/7 access to safety information" },
  ]

  const handleDownloadApp = () => {
    // Create an anchor element
    const link = document.createElement("a")
    // Set the href to the path of the APK file in the public folder
    link.href = "/ams_android_651717_live.apk"
    // Set the download attribute to suggest a filename
    link.download = "ams_android_651717_live.apk"
    // Append to the document
    document.body.appendChild(link)
    // Trigger the download
    link.click()
    // Clean up
    document.body.removeChild(link)
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-t from-primary/20 to-background">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <motion.div
            className="flex flex-col justify-center space-y-4"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Download Our Mobile App</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Access safety resources, emergency contacts, and location services on the go with our mobile app.
              </p>
            </div>
            <ul className="grid gap-2">
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                >
                  <div className="rounded-full bg-primary/20 p-1">{feature.icon}</div>
                  <span>{feature.text}</span>
                </motion.li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 sm:flex-row pt-2">
              <div className="flex gap-2">
                <motion.button
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  onClick={handleDownloadApp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Android App
                </motion.button>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="mx-auto flex w-full items-center justify-center"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-gray-800 dark:bg-gray-800 rounded-b-xl"></div>
              <Image
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"
                width={300}
                height={600}
                alt="Safety app on smartphone"
                className="rounded-[2.5rem] shadow-xl border-8 border-gray-800 dark:border-gray-800"
              />
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-gray-800 dark:bg-gray-800 rounded-full"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

