"use client"

import Link from "next/link"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion } from "framer-motion"

export function SafetySection() {
  const safetyItems = [
    "24/7 Helpline Services",
    "Self-Defense Workshops",
    "Legal Aid & Counseling",
    "Community Support Groups",
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-t from-primary/20 to-background">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[400px_1fr] lg:gap-12 xl:grid-cols-[600px_1fr]">
          <motion.div
            className="mx-auto flex w-full items-center justify-center"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="https://images.unsplash.com/photo-1522543558187-768b6df7c25c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              width={550}
              height={550}
              alt="Women's Safety Resources"
              className="rounded-lg object-cover shadow-lg"
            />
          </motion.div>
          <motion.div
            className="flex flex-col justify-center space-y-4"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Women's Safety & Empowerment</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Access resources, support services, and educational materials designed to empower women and ensure their
                safety.
              </p>
            </div>
            <ul className="grid gap-2">
              {safetyItems.map((item, index) => (
                <motion.li
                  key={index}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                >
                  <div className="rounded-full bg-primary/20 p-1">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
            <div>
              <Link href="/safety">
                <Button size="lg" className="gap-1">
                  <Shield className="h-4 w-4" />
                  Explore Resources
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

