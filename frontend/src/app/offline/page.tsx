"use client";

import { Shield, WifiOff, MapPin, Phone, BookOpen } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="mb-6 rounded-full bg-primary/10 p-6">
        <WifiOff className="h-12 w-12 text-primary" />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-6 w-6 text-primary" />
        <span className="font-bold text-xl">SHEild</span>
      </div>

      <h1 className="text-2xl font-bold mb-3 text-foreground">
        You&apos;re Currently Offline
      </h1>
      <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
        SHEild works best with an internet connection. Previously visited pages
        and cached data are still available below.
      </p>

      <div className="w-full max-w-sm space-y-3 mb-8">
        <p className="text-sm font-semibold text-foreground text-left mb-3">
          Available offline:
        </p>

        <Link
          href="/"
          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left w-full"
        >
          <Shield className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium">Home &amp; Emergency Contact</p>
            <p className="text-xs text-muted-foreground">
              Saved contacts available locally
            </p>
          </div>
        </Link>

        <Link
          href="/map"
          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left w-full"
        >
          <MapPin className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium">Safety Map</p>
            <p className="text-xs text-muted-foreground">
              Previously viewed map tiles cached
            </p>
          </div>
        </Link>

        <Link
          href="/self-defense"
          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left w-full"
        >
          <BookOpen className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium">Self-Defense Resources</p>
            <p className="text-xs text-muted-foreground">
              Guides available if previously loaded
            </p>
          </div>
        </Link>

        <Link
          href="/hospitals"
          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left w-full"
        >
          <Phone className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium">Hospitals &amp; Police</p>
            <p className="text-xs text-muted-foreground">
              Cached locations if previously visited
            </p>
          </div>
        </Link>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
