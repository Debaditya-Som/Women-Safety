"use client"
import Link from "next/link";
import { Shield, Menu, X } from "lucide-react";

import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between space-x-4 sm:space-x-0">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold">SHEild</span>
          </Link>
        </div>
      
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
          <Link href="/donate" className="text-sm font-medium transition-colors hover:text-primary">
            Donate
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:inline-block">
            <form className="relative">
            
            </form>
          </div>
         
          
          {/* Hamburger Menu Button - Moved to Corner */}
          <button 
            className="md:hidden p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ml-auto"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6 text-primary" /> : <Menu className="h-6 w-6 text-primary" />}
          </button>
        </div>
        
        {/* Navigation Links - Mobile */}
        {menuOpen && (
          <nav className="absolute top-16 left-0 w-full bg-background shadow-md md:hidden">
            <div className="flex flex-col items-center space-y-4 py-4">
              <Link href="/" className="text-sm font-medium transition-colors hover:text-primary" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
              <Link href="/map" className="text-sm font-medium transition-colors hover:text-primary" onClick={() => setMenuOpen(false)}>
                Map
              </Link>
              <Link href="/report" className="text-sm font-medium transition-colors hover:text-primary" onClick={() => setMenuOpen(false)}>
                Report Incidents
              </Link>
              <Link href="/hospitals" className="text-sm font-medium transition-colors hover:text-primary" onClick={() => setMenuOpen(false)}>
                Hospitals
              </Link>
              <Link href="/police" className="text-sm font-medium transition-colors hover:text-primary" onClick={() => setMenuOpen(false)}>
                Police Stations
              </Link>
              <Link href="/self-defense" className="text-sm font-medium transition-colors hover:text-primary" onClick={() => setMenuOpen(false)}>
                Self-Defense
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
