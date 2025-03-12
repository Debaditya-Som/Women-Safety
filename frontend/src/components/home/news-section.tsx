"use client"

import Link from "next/link"
import { ChevronRight, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { motion } from "framer-motion"

export function NewsSection() {
  const articles = [
    {
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop",
      category: "Workshop",
      date: "June 15, 2023",
      title: "New Safety Workshop Series Launching Next Month",
      excerpt: "Join our new series of safety workshops designed to empower women with practical skills and knowledge.",
    },
    {
      image: "https://images.unsplash.com/photo-1590402494610-2c378a9114c6?q=80&w=2070&auto=format&fit=crop",
      category: "Technology",
      date: "June 10, 2023",
      title: "Mobile Safety App Update Includes New Features",
      excerpt:
        "Our mobile app has been updated with new safety features, including improved location sharing and emergency contacts.",
    },
    {
      image: "https://images.unsplash.com/photo-1573164574511-73c773193279?q=80&w=2069&auto=format&fit=crop",
      category: "Community",
      date: "June 5, 2023",
      title: "New Community Support Groups Forming in Your Area",
      excerpt:
        "Join one of our new community support groups designed to provide a safe space for sharing experiences and resources.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Latest News & Resources</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl">
              Stay informed with the latest updates, articles, and resources.
            </p>
          </div>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="overflow-hidden h-full">
                <div className="relative h-48 w-full">
                  <Image src={article.image || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
                </div>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{article.date}</span>
                    </div>
                    <h3 className="font-semibold text-lg">{article.title}</h3>
                    <p className="text-muted-foreground line-clamp-2">{article.excerpt}</p>
                    <Link href="#" className="flex items-center text-primary text-sm font-medium mt-2">
                      Read More <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <motion.div
          className="flex justify-center mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href="#">
            <Button variant="outline" className="gap-1">
              View All Articles <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

