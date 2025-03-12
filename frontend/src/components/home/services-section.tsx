"use client"

import Link from "next/link"
import { MapPin, Hospital, BadgeIcon as Police } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function ServicesSection() {
  const services = [
    {
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: "Interactive Map",
      description: "Find nearby hospitals, police stations, and women's safety services with our interactive map.",
      link: "/map",
      linkText: "Explore Map",
    },
    {
      icon: <Hospital className="h-6 w-6 text-primary" />,
      title: "Hospitals & Clinics",
      description: "Find information about nearby hospitals and clinics for medical assistance.",
      link: "/hospitals",
      linkText: "View Hospitals",
    },
    {
      icon: <Police className="h-6 w-6 text-primary" />,
      title: "Police Stations",
      description: "Locate nearby police stations and get contact information for emergencies.",
      link: "/police",
      linkText: "View Police Stations",
    },
  ]

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
              Find the support and resources you need with our comprehensive services.
            </p>
          </div>
        </motion.div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="rounded-full bg-primary/20 p-4">{service.icon}</div>
              <h3 className="text-xl font-bold">{service.title}</h3>
              <p className="text-center text-muted-foreground">{service.description}</p>
              <Link href={service.link}>
                <Button variant="outline" size="sm">
                  {service.linkText}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

