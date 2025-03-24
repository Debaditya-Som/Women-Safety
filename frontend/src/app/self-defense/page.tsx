"use client"

import { useState } from "react"
import { Shield, Search, Filter, Play, Clock, MapPin, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

// Import the PDF download functionality
import { downloadSelfDefenseGuide } from "@/lib/pdf-generator"
// Import the PDF preview component
import { PDFPreviewButton } from "./pdf-preview"

export default function SelfDefensePage() {
  const [activeTab, setActiveTab] = useState("techniques")

  const techniques = [
    {
      id: 1,
      name: "Basic Stance and Movement",
      level: "Beginner",
      description: "Learn the proper stance and movement techniques that form the foundation of self-defense.",
      image: "https://images.unsplash.com/photo-1517438476312-10d79c077509?q=80&w=2070&auto=format&fit=crop",
      duration: "10 min",
      videoUrl: "https://www.youtube.com/watch?v=T7aNSRoDCmg",
    },
    {
      id: 2,
      name: "Wrist Grab Escapes",
      level: "Beginner",
      description: "Techniques to escape when someone grabs your wrist or arm.",
      image: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?q=80&w=2069&auto=format&fit=crop",
      duration: "15 min",
      videoUrl: "https://www.youtube.com/watch?v=02FG3iQO4Qo",
    },
    {
      id: 3,
      name: "Front Attack Defense",
      level: "Intermediate",
      description: "Defend yourself from frontal attacks with these effective techniques.",
      image: "https://images.unsplash.com/photo-1549824506-bfeba88865d6?q=80&w=2070&auto=format&fit=crop",
      duration: "20 min",
      videoUrl: "https://www.youtube.com/watch?v=KVpxP3ZZtAc",
    },
    {
      id: 4,
      name: "Rear Attack Defense",
      level: "Intermediate",
      description: "Learn how to respond when attacked from behind.",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop",
      duration: "20 min",
      videoUrl: "https://www.youtube.com/watch?v=WjRpTNWv7dY",
    },
    {
      id: 5,
      name: "Ground Defense",
      level: "Advanced",
      description: "Techniques for defending yourself when on the ground.",
      image: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?q=80&w=2069&auto=format&fit=crop",
      duration: "25 min",
      videoUrl: "https://www.youtube.com/watch?v=JN0VtHez9xI",
    },
    {
      id: 6,
      name: "Using Everyday Objects",
      level: "Advanced",
      description: "How to use common items as improvised self-defense tools.",
      image: "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?q=80&w=2070&auto=format&fit=crop",
      duration: "15 min",
      videoUrl: "https://www.youtube.com/watch?v=MHAo9D3Mz-o",
    },
  ]

  const workshops = [
    {
      id: 1,
      name: "Women&apos;s Self-Defense Basics",
      location: "Community Center, 123 Main St",
      date: "Every Saturday, 10:00 AM - 12:00 PM",
      instructor: "Sarah Johnson",
      price: "Free",
      image: "https://images.unsplash.com/photo-1470468969717-61d5d54fd036?q=80&w=2044&auto=format&fit=crop",
    },
    {
      id: 2,
      name: "Krav Maga for Women",
      location: "Fitness Studio, 456 Oak Ave",
      date: "Tuesdays & Thursdays, 6:00 PM - 7:30 PM",
      instructor: "Maya Rodriguez",
      price: "$15 per class",
      image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=2069&auto=format&fit=crop",
    },
    {
      id: 3,
      name: "Campus Safety Workshop",
      location: "University Center, Room 201",
      date: "First Monday of each month, 5:00 PM - 7:00 PM",
      instructor: "Officer James Wilson",
      price: "Free for students",
      image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop",
    },
  ]

  const safetyTips = [
    {
      question: "How can I be more aware of my surroundings?",
      answer:
        "Stay alert and minimize distractions like phone use when walking. Scan your environment regularly, especially when entering or exiting buildings or vehicles. Trust your instincts - if something feels wrong, it probably is. Consider using the buddy system when possible, especially at night.",
    },
    {
      question: "What should I do if I&apos;m being followed?",
      answer:
        "Change your direction or cross the street to see if they follow. Head toward populated areas, open businesses, or public places. Call someone on your phone (or pretend to) and loudly mention your location. If you feel threatened, do not hesitate to call emergency services. Never lead someone following you to your home.",
    },
    {
      question: "How should I respond to verbal harassment?",
      answer:
        "Maintain confident body language and avoid engaging with the harasser. Use a firm, loud voice to tell them to stop if you feel safe doing so. Move to a populated area or enter a business if possible. Document the incident if you can do so safely, and report it to authorities if appropriate.",
    },
    {
      question: "What are some safety tips for using rideshare services?",
      answer:
        "Always verify the identity and car details of driver before entering. Share your trip details with a trusted friend. Sit in the back seat rather than the front. Keep your phone accessible and track the route to ensure you're heading to your destination. Trust your instincts - if something feels wrong, ask to be let out in a safe, populated area.",
    },
    {
      question: "How can I make my home more secure?",
      answer:
        "Install quality locks on all doors and windows and use them consistently. Consider adding a security system or camera doorbell. Keep entrances well-lit and maintain visibility by trimming bushes near windows and doors. Never hide keys outside. Be careful about who you allow into your home and what information you share about your schedule.",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="mb-8 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Self-Defense for Women</h1>
        <p className="text-muted-foreground">
          Learn essential self-defense techniques, find local workshops, and access safety resources designed
          specifically for women.
        </p>
      </motion.div>

      <Tabs defaultValue="techniques" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="techniques">Techniques</TabsTrigger>
          <TabsTrigger value="workshops">Local Workshops</TabsTrigger>
          <TabsTrigger value="safety">Safety Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="techniques" className="mt-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search techniques..." className="pl-8" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {techniques.map((technique, index) => (
              <motion.div
                key={technique.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="overflow-hidden h-full">
                  <div className="relative h-48 w-full">
                    <Image
                      src={technique.image || "/placeholder.svg"}
                      alt={technique.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute right-2 top-2">
                      <Badge
                        className={
                          technique.level === "Beginner"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : technique.level === "Intermediate"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                        }
                      >
                        {technique.level}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle>{technique.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {technique.duration}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{technique.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Link href={technique.videoUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                      <Button variant="default" size="sm" className="w-full gap-1">
                        <Play className="h-4 w-4" />
                        Watch Tutorial
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workshops" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workshops.map((workshop, index) => (
              <motion.div
                key={workshop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="overflow-hidden h-full">
                  <div className="relative h-48 w-full">
                    <Image
                      src={workshop.image || "/placeholder.svg"}
                      alt={workshop.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{workshop.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Instructor: {workshop.instructor}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{workshop.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{workshop.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>{workshop.price}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button variant="default" size="sm" className="w-full gap-1">
                      Register Now
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-8 p-6 border rounded-lg bg-muted/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="md:w-2/3">
                <h3 className="text-xl font-bold mb-2">Host a Workshop at Your Organization</h3>
                <p className="text-muted-foreground mb-4">
                  We offer customized self-defense workshops for schools, businesses, community centers, and other
                  organizations.
                </p>
                <Button className="gap-1">
                  <Shield className="h-4 w-4" />
                  Request Information
                </Button>
              </div>
              <div className="md:w-1/3">
                <Image
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop"
                  alt="Group workshop"
                  width={300}
                  height={200}
                  className="rounded-lg object-cover"
                />
              </div>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="safety" className="mt-6">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Accordion type="single" collapsible className="w-full mb-8">
              {safetyTips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                >
                  <AccordionItem value={`item-${index}`}>
                    <AccordionTrigger>{tip.question}</AccordionTrigger>
                    <AccordionContent>{tip.answer}</AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>

            <motion.div
              className="grid gap-6 md:grid-cols-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Essential Safety Apps</CardTitle>
                  <CardDescription>Mobile applications that can help enhance your safety</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">SHEild App</p>
                        <p className="text-sm text-muted-foreground">
                          Our official app with emergency features and location sharing
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Circle of 6</p>
                        <p className="text-sm text-muted-foreground">
                          Quickly contact your six trusted friends in emergencies
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">bSafe</p>
                        <p className="text-sm text-muted-foreground">
                          Features include SOS button, fake calls, and location tracking
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contacts</CardTitle>
                  <CardDescription>Important numbers to have on hand</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Emergency Services</p>
                        <p className="text-sm text-muted-foreground">100</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">National Domestic Violence Hotline</p>
                        <p className="text-sm text-muted-foreground">7827-170-170
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Women Crisis Center</p>
                        <p className="text-sm text-muted-foreground">+91 (555) 123-4567</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>
      </Tabs>

      <motion.div
        className="mt-12 p-8 border rounded-lg bg-gradient-to-r from-primary/10 to-background"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold mb-4">Download Our Self-Defense Guide</h2>
            <p className="text-muted-foreground mb-6">
              Our comprehensive guide includes detailed techniques, safety tips, and resources for self-defense.
              Download it for free and have it available even when offline.
            </p>
            {/* Update the Button in the bottom section to use the download function */}
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="gap-1" onClick={downloadSelfDefenseGuide}>
                Download Free Guide
              </Button>
              <PDFPreviewButton />
            </div>
          </div>
          <div className="md:w-1/2">
            <Image
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop"
              alt="Self-defense guide"
              width={500}
              height={300}
              className="rounded-lg object-cover shadow-lg"
            />
          </div>
        </div>
      </motion.div>
      <footer className="w-full border-t bg-background py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold">SHEild</span>
            </div>
            <p className="text-center text-sm text-muted-foreground md:text-left">
              © {new Date().getFullYear()} SHEild. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
                Terms
              </Link>
              <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
                Privacy
              </Link>
              <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}