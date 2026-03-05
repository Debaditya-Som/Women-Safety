 "use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MapPin, Check, AlertTriangle, Navigation, Shield, Ambulance } from "lucide-react"
import { Capacitor } from "@capacitor/core"

export function ServicesSection() {
  const emergencyNumber = "+919007226977"
  const isAndroidNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android"

  const services = [
    { icon: <MapPin className="h-6 w-6 text-primary" />, title: "Map", link: "/map" },
    { icon: <Check className="h-6 w-6 text-primary" />, title: "Safe arrival", link: "/safe-arrival" },
    { icon: <AlertTriangle className="h-6 w-6 text-primary" />, title: "Report Incident", link: "/report" },
    { icon: <Navigation className="h-6 w-6 text-primary" />, title: "Walk With Me", link: "/walk-with-me" },
    { icon: <Shield className="h-6 w-6 text-primary" />, title: "Police", link: "/police", callOnAndroid: true },
    { icon: <Ambulance className="h-6 w-6 text-primary" />, title: "Medical", link: "/hospitals", callOnAndroid: true },
  ]

  const triggerEmergencyCall = () => {
    window.location.href = `tel:${emergencyNumber}`
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Our Services</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl">
              Find the support and resources you need with our services.
            </p>
          </div>
        </motion.div>

        <div className="mx-auto grid max-w-4xl grid-cols-2 sm:grid-cols-3 sm:grid-rows-2 gap-6 py-8 items-center justify-center">
          {services.map((service, index) => (
            service.callOnAndroid && isAndroidNative ? (
              <button
                key={index}
                type="button"
                onClick={triggerEmergencyCall}
                className="flex items-center gap-3 rounded-md border p-3 hover:shadow-sm transition text-left"
              >
                <div className="rounded-full bg-primary/10 p-3 text-2xl">{service.icon}</div>
                <span className="font-medium">{service.title}</span>
              </button>
            ) : (
              <Link key={index} href={service.link} className="flex items-center gap-3 rounded-md border p-3 hover:shadow-sm transition">
                <div className="rounded-full bg-primary/10 p-3 text-2xl">{service.icon}</div>
                <span className="font-medium">{service.title}</span>
              </Link>
            )
          ))}
        </div>
      </div>
    </section>
  )
}

