"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion } from "framer-motion"

export function FaqSection() {
  const faqs = [
    {
      question: "What should I do if I feel unsafe?",
      answer:
        "If you're in immediate danger, call emergency services (911). If you feel unsafe but not in immediate danger, move to a public place, contact a trusted friend or family member, or call a crisis hotline. Trust your instincts and prioritize your safety.",
    },
    {
      question: "How can I create a personal safety plan?",
      answer:
        "A personal safety plan should include emergency contacts, safe locations, essential documents, and escape routes. Identify trusted people you can contact, memorize important phone numbers, keep emergency cash accessible, and practice your plan regularly.",
    },
    {
      question: "What resources are available for domestic violence victims?",
      answer:
        "Resources include emergency shelters, crisis hotlines, legal advocacy, counseling services, and support groups. Many organizations offer confidential services at no cost, including safety planning, emergency housing, and assistance with protective orders.",
    },
    {
      question: "How can I help a friend who may be in an unsafe situation?",
      answer:
        "Listen without judgment, believe them, and offer support without pressure. Provide information about available resources, help them create a safety plan if needed, and respect their decisions. Remember that the most dangerous time for someone in an abusive relationship is when they're trying to leave.",
    },
    {
      question: "What should I include in an emergency kit?",
      answer:
        "An emergency kit should include identification documents, birth certificates, financial information, medication, a change of clothes, cash, a prepaid phone, and important contact information. Keep this kit in a safe, accessible location or with a trusted friend.",
    },
    {
      question: "How can I learn self-defense techniques?",
      answer:
        "You can join self-defense classes specifically designed for women, attend workshops offered by community centers, or explore online resources. Our self-defense page provides information about techniques and local training opportunities.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-primary/10 to-background">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Frequently Asked Questions</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl">
              Find answers to common questions about women's safety and resources.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              >
                <AccordionItem value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}

