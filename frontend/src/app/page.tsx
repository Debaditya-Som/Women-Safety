import { HeroSection } from "@/components/home/hero-section"
import { ServicesSection } from "@/components/home/services-section"
import { SafetySection } from "@/components/home/safety-section"
import { StatisticsSection } from "@/components/home/statistics-section"
import { TestimonialsSection } from "@/components/home/testimonials-section"
import { NewsSection } from "@/components/home/news-section"
// import { AppDownloadSection } from "@/components/home/app-download-section"
// import { PartnersSection } from "@/components/home/partners-section"
import { FaqSection } from "@/components/home/faq-section"
import { CtaSection } from "@/components/home/cta-section"
import Link from "next/link"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="inline-block font-bold">SafetyNet</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                Home
              </Link>
              <Link href="/map" className="text-sm font-medium transition-colors hover:text-primary">
                Map
              </Link>
              <Link href="/report" className="text-sm font-medium transition-colors hover:text-primary">
                Report Incidents
              </Link>
              <Link href="/hospitals" className="text-sm font-medium transition-colors hover:text-primary">
                Hospitals
              </Link>
              <Link href="/police" className="text-sm font-medium transition-colors hover:text-primary">
                Police Stations
              </Link>
              <Link href="/self-defense" className="text-sm font-medium transition-colors hover:text-primary">
                Self-Defense
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="hidden md:inline-block">
                <form className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[300px]"
                  />
                </form>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <SafetySection />
        <StatisticsSection />
        <TestimonialsSection />
        <FaqSection />
        <NewsSection />
        {/* <AppDownloadSection />
        <PartnersSection /> */}
        <CtaSection />
      </main>
      <footer className="w-full border-t bg-background py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold">SafetyNet</span>
            </div>
            <p className="text-center text-sm text-muted-foreground md:text-left">
              © {new Date().getFullYear()} SafetyNet. All rights reserved.
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

function ThemeToggle() {
  return (
    <Button variant="outline" size="icon" className="rounded-full">
      <span className="sr-only">Toggle theme</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
      >
        <circle cx="12" cy="12" r="4"></circle>
        <path d="M12 2v2"></path>
        <path d="M12 20v2"></path>
        <path d="m4.93 4.93 1.41 1.41"></path>
        <path d="m17.66 17.66 1.41 1.41"></path>
        <path d="M2 12h2"></path>
        <path d="M20 12h2"></path>
        <path d="m6.34 17.66-1.41 1.41"></path>
        <path d="m19.07 4.93-1.41 1.41"></path>
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
      </svg>
    </Button>
  )
}

