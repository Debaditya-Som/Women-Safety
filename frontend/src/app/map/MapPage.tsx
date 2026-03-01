"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from "react-leaflet"
import axios from "axios"
import { Search, Navigation, MapPin, X, Shield, Locate, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import "leaflet/dist/leaflet.css"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import L from "leaflet"
import "leaflet.heat"
import HeatmapLayer from "@/components/map/MapComponent"
import SafetyMarkers, { type NearestPlace } from "@/components/map/SafetyMarkers"
import SafetyAlert from "@/components/map/SafetyAlert"
import { analyzeRouteSafety, getRouteSegmentColor, formatDistance, RouteSafetyAnalysis as RouteSafetyType } from "@/components/map/routeSafety"

const createIcon = (color: string) =>
  L.divIcon({
    className: "custom-icon",
    html: `<div style="background:white;border-radius:50%;padding:2px;box-shadow:0 2px 8px rgba(0,0,0,0.25);">
             <div style="background:${color};width:16px;height:16px;border-radius:50%;"></div>
           </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })

const safeColor = "#10b981"
const midColor  = "#f59e0b"
const unsafeColor = "#ef4444"

function CenterMapOnUser({ position, recenter }: { position: [number, number]; recenter: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (recenter && position) map.flyTo(position, map.getZoom())
  }, [map, position, recenter])
  return null
}

function MapClickHandler({ setDestination }: { setDestination: (pos: [number, number]) => void }) {
  useMapEvents({ click(e) { setDestination([e.latlng.lat, e.latlng.lng]) } })
  return null
}

export default function SafetyMap() {
  const mapRef = useRef<L.Map | null>(null)
  const [userLocation, setUserLocation]   = useState<[number, number] | null>(null)
  const [destination, setDestination]     = useState<[number, number] | null>(null)
  const [routes, setRoutes]               = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<{ label: string; value: [number, number] }[]>([])
  const [searchQuery, setSearchQuery]     = useState("")
  const [isLoading, setIsLoading]         = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null)
  const [routeSafety, setRouteSafety]     = useState<RouteSafetyType | null>(null)
  const [recenterMap, setRecenterMap]     = useState(false)
  const [isMobile, setIsMobile]           = useState(false)
  // Map layer visibility
  const [showIncidents, setShowIncidents] = useState(true)
  const [showHospitals, setShowHospitals] = useState(false)
  const [showPolice, setShowPolice]       = useState(false)
  // Nearest safety resources (reported back from SafetyMarkers)
  const [nearestHospital, setNearestHospital] = useState<NearestPlace | null>(null)
  const [nearestPolice, setNearestPolice]     = useState<NearestPlace | null>(null)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    setIsMobile(mq.matches)
    const handler = () => setIsMobile(mq.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const getUserLocation = () => {
    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude])
        setIsLoading(false)
        setRecenterMap(true)
      },
      (err) => { console.error("Geolocation Error:", err); setIsLoading(false) },
      { enableHighAccuracy: true },
    )
  }

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error("Geolocation Error:", err),
      { enableHighAccuracy: true },
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  useEffect(() => {
    if (!userLocation || !destination) return
    fetchMultipleRoutes(userLocation, destination)
  }, [userLocation, destination])

  async function fetchMultipleRoutes(start: [number, number], end: [number, number]) {
    setIsLoading(true)
    try {
      const res = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&alternatives=true&geometries=geojson`,
      )
      if (res.data.routes) {
        const routeCoordinates = res.data.routes.map((route: any) =>
          route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]),
        )
        setRoutes(routeCoordinates)
        if (routeCoordinates.length > 0) {
          setRouteSafety(analyzeRouteSafety(routeCoordinates[0]))
        }
      }
    } catch (error) {
      console.error("Error fetching routes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSearch() {
    if (!searchQuery) return
    setIsLoading(true)
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`)
      setSearchResults(
        res.data.map((place: any) => ({
          label: place.display_name,
          value: [Number.parseFloat(place.lat), Number.parseFloat(place.lon)],
        })),
      )
    } catch (error) {
      console.error("Error fetching location:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 2) handleSearch()
      else setSearchResults([])
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const getDirections = () => {
    if (!userLocation || !destination) return
    fetchMultipleRoutes(userLocation, destination)
  }

  const resetMap = () => {
    setDestination(null)
    setRoutes([])
    setSelectedPlace(null)
    setRouteSafety(null)
    setSearchQuery("")
    setSearchResults([])
  }

  const handleRecenter = () => {
    setRecenterMap(true)
    setTimeout(() => setRecenterMap(false), 1000)
  }

  const renderRoutesWithSafety = () => {
    if (!routeSafety || routeSafety.segments.length === 0) {
      return routes.map((route, index) => (
        <Polyline key={index} positions={route} color={[safeColor, midColor, unsafeColor][index % 3]} weight={5} opacity={0.85} />
      ))
    }
    return routeSafety.segments.map((segment, index) => (
      <Polyline key={`seg-${index}`} positions={segment.path} color={getRouteSegmentColor(segment.risk)} weight={5} opacity={0.85} />
    ))
  }

  const scoreColor = (score: number) =>
    score >= 75 ? { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", pill: "bg-emerald-100 text-emerald-700" }
    : score >= 50 ? { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", pill: "bg-amber-100 text-amber-700" }
    : { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200", pill: "bg-red-100 text-red-700" }

  // ── Sidebar / Sheet content ──────────────────────────────────────────────
  const controlsContent = (
    <div className="flex flex-col gap-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Where to?"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="pl-9 pr-8 h-11 rounded-xl border-border/60 bg-muted/40 focus-visible:ring-1 focus-visible:bg-background transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(""); setSearchResults([]) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Search results dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-background rounded-xl shadow-xl border border-border overflow-hidden">
            <ul className="max-h-52 overflow-y-auto divide-y divide-border/40">
              {searchResults.slice(0, 6).map((result, i) => (
                <li key={i}>
                  <button
                    className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-muted/60 transition-colors"
                    onClick={() => {
                      setDestination(result.value)
                      setSelectedPlace(result.label)
                      setSearchResults([])
                      if (isMobile) setIsSidebarOpen(false)
                    }}
                  >
                    <MapPin className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                    <span className="text-xs leading-snug line-clamp-2 text-foreground/85">{result.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* My location status row */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/40 border border-border/40">
        <div className={cn(
          "w-2 h-2 rounded-full shrink-0 transition-colors",
          userLocation ? "bg-emerald-500" : "bg-amber-400 animate-pulse"
        )} />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-none mb-0.5">Your Location</p>
          <p className="text-xs font-mono text-foreground/75 truncate">
            {userLocation ? `${userLocation[0].toFixed(5)}, ${userLocation[1].toFixed(5)}` : "Not detected"}
          </p>
        </div>
        <button
          onClick={getUserLocation}
          disabled={isLoading}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted disabled:opacity-50 transition-colors shrink-0"
          title="Re-detect location"
        >
          <Locate className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* ── Map layer toggles ─────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Map Layers</p>
        <div className="space-y-1">
          {([
            { label: "Incidents",       color: "#ef4444", state: showIncidents, toggle: () => setShowIncidents(v => !v) },
            { label: "Hospitals",       color: "#dc2626", state: showHospitals, toggle: () => setShowHospitals(v => !v) },
            { label: "Police Stations", color: "#1d4ed8", state: showPolice,    toggle: () => setShowPolice(v => !v)    },
          ] as const).map(({ label, color, state, toggle }) => (
            <button
              key={label}
              onClick={toggle}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors text-left",
                state ? "bg-muted/50" : "hover:bg-muted/30"
              )}
            >
              <div className="w-2.5 h-2.5 rounded-full shrink-0 transition-opacity" style={{ backgroundColor: color, opacity: state ? 1 : 0.3 }} />
              <span className={cn("flex-1 text-xs", state ? "text-foreground font-medium" : "text-muted-foreground")}>
                {label}
              </span>
              {/* Toggle pill */}
              <div className={cn("w-8 h-[18px] rounded-full flex items-center px-0.5 transition-colors duration-200 shrink-0", state ? "bg-primary" : "bg-muted-foreground/25")}>
                <div className={cn("w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200", state ? "translate-x-[14px]" : "translate-x-0")} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Nearest help — shown when a layer is on and user location is known */}
      {userLocation && (nearestHospital || nearestPolice) && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Nearest Help</p>

          {nearestHospital && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-red-50/70 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
              <div className="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 flex items-center justify-center shrink-0">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{nearestHospital.name}</p>
                <p className="text-[10px] text-red-600 font-medium">{formatDistance(nearestHospital.dist)} away</p>
              </div>
              <button
                onClick={() => { setDestination(nearestHospital.coords); setSelectedPlace(nearestHospital.name) }}
                className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center hover:bg-red-700 transition-colors shrink-0"
                title="Navigate to hospital"
              >
                <Navigation className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          )}

          {nearestPolice && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2L4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{nearestPolice.name}</p>
                <p className="text-[10px] text-blue-600 font-medium">{formatDistance(nearestPolice.dist)} away</p>
              </div>
              <button
                onClick={() => { setDestination(nearestPolice.coords); setSelectedPlace(nearestPolice.name) }}
                className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors shrink-0"
                title="Navigate to police station"
              >
                <Navigation className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Destination chip */}
      {selectedPlace && (
        <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/15">
          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="h-3 w-3 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider leading-none mb-0.5">Destination</p>
            <p className="text-xs leading-snug text-foreground/80 line-clamp-2">{selectedPlace}</p>
          </div>
          <button
            onClick={resetMap}
            className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-muted transition-colors shrink-0 mt-0.5"
            title="Clear destination"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Get Directions button */}
      {destination && !routeSafety && (
        <Button
          onClick={getDirections}
          disabled={!userLocation || isLoading}
          className="w-full h-10 rounded-xl"
        >
          <Navigation className="h-4 w-4 mr-2" />
          {isLoading ? "Finding route…" : "Get Directions"}
        </Button>
      )}

      {/* Route active hint */}
      {routeSafety && (
        <p className="text-xs text-muted-foreground text-center py-1">
          Route details shown below ↓
        </p>
      )}
    </div>
  )

  const sc = routeSafety ? scoreColor(routeSafety.overallScore) : null

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* ── Map ─────────────────────────────────────────────────── */}
      <MapContainer center={userLocation || [24.5, 87.5]} zoom={13} className="h-full w-full z-0" ref={mapRef}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {userLocation  && <Marker position={userLocation}  icon={createIcon("#3b82f6")} />}
        {destination   && <Marker position={destination}   icon={createIcon("#ef4444")} />}
        {renderRoutesWithSafety()}
        {mapRef.current && <HeatmapLayer map={mapRef.current} visible={showIncidents} />}
        <SafetyMarkers
          showHospitals={showHospitals}
          showPolice={showPolice}
          userLocation={userLocation}
          onNearestHospital={setNearestHospital}
          onNearestPolice={setNearestPolice}
        />
        <MapClickHandler setDestination={setDestination} />
        {userLocation && <CenterMapOnUser position={userLocation} recenter={recenterMap} />}
      </MapContainer>

      {/* ── Recenter button ──────────────────────────────────────── */}
      <button
        onClick={handleRecenter}
        className={cn(
          "absolute right-4 z-30 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-border/50 flex items-center justify-center hover:bg-muted/60 transition-colors",
          routeSafety && routes.length > 0 ? "bottom-[7.5rem] md:bottom-28" : "bottom-4"
        )}
        title="Re-center map"
      >
        <Locate className="h-4 w-4 text-foreground/70" />
      </button>

      {/* ── Safety alert ─────────────────────────────────────────── */}
      <SafetyAlert routeSafety={routeSafety} />

      {/* ── MOBILE: search pill + bottom sheet ──────────────────── */}
      {isMobile && (
        <div className="absolute top-3 left-3 right-3 z-20">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <button className="flex items-center gap-2.5 w-full h-12 px-4 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-border/50 text-left active:scale-[0.99] transition-transform">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="flex-1 text-sm text-muted-foreground truncate">
                  {selectedPlace || "Where to?"}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {userLocation && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            </SheetTrigger>

            <SheetContent side="bottom" className="h-[82vh] rounded-t-3xl px-4 pt-2 pb-6 [&>button]:top-3 [&>button]:right-4">
              <SheetHeader className="sr-only">
                <SheetTitle>SafetyMap</SheetTitle>
              </SheetHeader>
              {/* Handle bar */}
              <div className="mx-auto w-10 h-1 rounded-full bg-muted-foreground/20 mb-5" />
              {/* Sheet header */}
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <h1 className="text-base font-bold leading-none">SafetyMap</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">Navigate safely</p>
                </div>
              </div>
              <div className="overflow-y-auto h-[calc(100%-7rem)]">
                {controlsContent}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* ── DESKTOP: collapsible sidebar ─────────────────────────── */}
      {!isMobile && (
        <div className={cn(
          "absolute top-0 left-0 h-full bg-white/96 dark:bg-gray-900/97 backdrop-blur-sm border-r border-border/40 transition-all duration-300 z-10 flex flex-col shadow-sm",
          isSidebarOpen ? "w-[288px]" : "w-14"
        )}>
          {isSidebarOpen ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-border/40 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold leading-none">SafetyMap</h1>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Navigate safely</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {controlsContent}
              </div>
            </>
          ) : (
            /* Collapsed icon strip */
            <div className="flex flex-col items-center pt-3 gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                title="Open panel"
              >
                <ChevronRight className="h-4 w-4 text-primary" />
              </button>
              <div className="w-6 h-px bg-border/60" />
              <button
                onClick={getUserLocation}
                disabled={isLoading}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted disabled:opacity-50 transition-colors"
                title="My location"
              >
                <Locate className="h-4 w-4 text-muted-foreground" />
              </button>
              {userLocation && (
                <div className="w-2 h-2 rounded-full bg-emerald-500" title="Location active" />
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Route summary card ───────────────────────────────────── */}
      {routeSafety && routes.length > 0 && (
        <div className={cn(
          "absolute bottom-4 left-4 right-4 z-20 transition-all duration-300",
          !isMobile && isSidebarOpen ? "md:left-[304px]" : !isMobile ? "md:left-[72px]" : ""
        )}>
          <div className="bg-white/96 dark:bg-gray-900/97 backdrop-blur-sm rounded-2xl shadow-xl border border-border/40 p-4">
            {/* Top row */}
            <div className="flex items-center gap-3">
              {/* Score badge */}
              <div className={cn(
                "w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 ring-2",
                sc?.bg, sc?.text, sc?.ring
              )}>
                <span className="text-base font-bold leading-none">{routeSafety.overallScore}</span>
                <span className="text-[9px] font-medium opacity-60">/ 100</span>
              </div>

              {/* Labels */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">Safety Score</span>
                  <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", sc?.pill)}>
                    {routeSafety.riskLevel} Risk
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{formatDistance(routeSafety.totalDistance)} total</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" className="h-9 rounded-xl px-3 text-xs">
                  <Navigation className="h-3.5 w-3.5 mr-1.5" />
                  Start
                </Button>
                <button
                  onClick={resetMap}
                  className="w-9 h-9 rounded-xl border border-border/60 flex items-center justify-center hover:bg-muted transition-colors"
                  title="Clear route"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Route breakdown bar */}
            <div className="mt-3.5">
              <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                {routeSafety.safePercentage > 0 && (
                  <div className="bg-emerald-500 rounded-full transition-all" style={{ width: `${routeSafety.safePercentage}%` }} />
                )}
                {routeSafety.moderatePercentage > 0 && (
                  <div className="bg-amber-400 rounded-full transition-all" style={{ width: `${routeSafety.moderatePercentage}%` }} />
                )}
                {routeSafety.unsafePercentage > 0 && (
                  <div className="bg-red-500 rounded-full transition-all" style={{ width: `${routeSafety.unsafePercentage}%` }} />
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                {routeSafety.safePercentage > 0 && (
                  <span className="text-[10px] text-emerald-600 font-medium">{routeSafety.safePercentage}% safe</span>
                )}
                {routeSafety.moderatePercentage > 0 && (
                  <span className="text-[10px] text-amber-600 font-medium">{routeSafety.moderatePercentage}% moderate</span>
                )}
                {routeSafety.unsafePercentage > 0 && (
                  <span className="text-[10px] text-red-600 font-medium">{routeSafety.unsafePercentage}% high risk</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
