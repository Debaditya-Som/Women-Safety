"use client"

import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { motion } from "framer-motion"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah J.",
      role: "Community Member",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop",
      text: "The SafetyNet app helped me locate a nearby women's crisis center when I needed it most. The resources and support I received were invaluable.",
    },
    {
      name: "Maya R.",
      role: "Workshop Participant",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop",
      text: "The self-defense workshop was empowering and practical. I now feel more confident navigating my daily life with the skills I learned.",
    },
    {
      name: "Priya K.",
      role: "Legal Aid Recipient",
      image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=1974&auto=format&fit=crop",
      text: "The legal aid services provided by SafetyNet were crucial in helping me navigate a difficult situation. The support was compassionate and professional.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-primary/20 to-background">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Testimonials</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl">
              Hear from women who have benefited from our services and resources.
            </p>
          </div>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm h-full">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-4 items-center">
                      <div className="relative h-12 w-12 overflow-hidden rounded-full">
                        <Image
                          src={testimonial.image || "/placeholder.svg"}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{testimonial.name}</h3>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-500" />
                      ))}
                    </div>
                    <p className="text-muted-foreground">"{testimonial.text}"</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

