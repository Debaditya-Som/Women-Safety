"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

export function CtaSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 border-t">
      <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Join Our Community for Updates</h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Stay informed about safety resources, workshops, and community events.
          </p>
        </motion.div>
        <motion.div
          className="mx-auto w-full max-w-sm space-y-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form className="flex gap-2">
            <Input type="email" placeholder="Enter your email" className="max-w-lg flex-1" />
            <Button type="submit">Sign Up</Button>
          </form>
          <p className="text-xs text-muted-foreground">
            We respect your privacy. Unsubscribe at any time.{" "}
            <Link href="/terms" className="underline underline-offset-2">
              Terms &amp; Conditions
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

