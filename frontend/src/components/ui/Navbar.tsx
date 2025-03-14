import Link from "next/link";
import { Shield, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Navbar() {
  return (
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
  );
}
