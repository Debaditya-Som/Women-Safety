import { HeroSection } from "@/components/home/hero-section"
import { ServicesSection } from "@/components/home/services-section"
import { SafetySection } from "@/components/home/safety-section"
import { StatisticsSection } from "@/components/home/statistics-section"
import { TestimonialsSection } from "@/components/home/testimonials-section"
// import { NewsSection } from "@/components/home/news-section"
// import { AppDownloadSection } from "@/components/home/app-download-section"
import { FaqSection } from "@/components/home/faq-section"
import { CtaSection } from "@/components/home/cta-section"
import Link from "next/link"
import { Shield } from "lucide-react"
import Chat from "@/components/home/chat"
import EmergencyContact from "@/components/home/emergency"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <SafetySection />
        <Chat/>
        <StatisticsSection />
        <EmergencyContact/>
        <TestimonialsSection />
        <FaqSection />
        {/* <AppDownloadSection />
        <PartnersSection /> */}
        <CtaSection />
      </main>
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

