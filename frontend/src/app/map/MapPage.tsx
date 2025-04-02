"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from "react-leaflet"
import axios from "axios"
import { Search, Navigation, MapPin, Compass, Info, X, Menu, Shield, Locate } from "lucide-react"
import { Button } from "@/components/ui/button"
import "leaflet/dist/leaflet.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import L from "leaflet"
import "leaflet.heat"
import HeatmapLayer from "@/components/map/MapComponent"
import RouteSafetyAnalysis from "@/components/map/RouteSafetyAnalysis"
import SafetyAlert from "@/components/map/SafetyAlert"
import { analyzeRouteSafety, getRouteSegmentColor, formatDistance, RouteSafetyAnalysis as RouteSafetyType } from "@/components/map/routeSafety"

// Custom marker icons
const createIcon = (color: string) => {
  return L.divIcon({
    className: "custom-icon",
    html: `<div style="background-color: white; border-radius: 50%; padding: 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            <div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%;"></div>
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

// Route colors
const safeColor = "#10b981" // Safe route 🟢
const midColor = "#f59e0b" // Moderate route 🟠
const unsafeColor = "#ef4444" // Unsafe route 🔴

// Center map on user component - only when recenter is true
function CenterMapOnUser({ position, recenter }: { position: [number, number], recenter: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (recenter && position) {
      map.flyTo(position, map.getZoom())
    }
  }, [map, position, recenter])
  return null
}

// Map click handler component
function MapClickHandler({ setDestination }: { setDestination: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setDestination([e.latlng.lat, e.latlng.lng])
    },
  })
  return null
}

export default function SafetyMap() {
  const mapRef = useRef<L.Map | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [destination, setDestination] = useState<[number, number] | null>(null)
  const [routes, setRoutes] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<{ label: string; value: [number, number] }[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null)
  const [showRouteAnalysis, setShowRouteAnalysis] = useState(true)
  const [routeSafety, setRouteSafety] = useState<RouteSafetyType | null>(null)
  const [recenterMap, setRecenterMap] = useState(false)
  
  // Get user location
  const getUserLocation = () => {
    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude])
        setIsLoading(false)
        // Enable recenter when getting location manually
        setRecenterMap(true)
      },
      (err) => {
        console.error("Geolocation Error:", err)
        setIsLoading(false)
      },
      { enableHighAccuracy: true },
    )
  }

  // Watch user location
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error("Geolocation Error:", err),
      { enableHighAccuracy: true },
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  // Fetch routes when destination is selected
  useEffect(() => {
    if (!userLocation || !destination) return
    fetchMultipleRoutes(userLocation, destination)
  }, [userLocation, destination])

  // Fetch multiple routes from OSRM
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
        
        // Analyze the first route for safety
        if (routeCoordinates.length > 0) {
          const safetyAnalysis = analyzeRouteSafety(routeCoordinates[0])
          setRouteSafety(safetyAnalysis)
        }
      }
    } catch (error) {
      console.error("Error fetching routes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle destination search
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

  // Handle search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 2) {
        handleSearch()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Get directions
  const getDirections = () => {
    if (!userLocation || !destination) return
    fetchMultipleRoutes(userLocation, destination)
  }

  // Reset map
  const resetMap = () => {
    setDestination(null)
    setRoutes([])
    setSelectedPlace(null)
    setRouteSafety(null)
  }

  // Handle recenter map
  const handleRecenter = () => {
    setRecenterMap(true)
    // Reset after a short delay to avoid continuous recentering
    setTimeout(() => {
      setRecenterMap(false)
    }, 1000)
  }

  // Generate route segments with safety coloring
  const renderRoutesWithSafety = () => {
    if (!routeSafety || routeSafety.segments.length === 0) {
      // If no safety analysis, render original routes with default colors
      return routes.map((route, index) => (
        <Polyline
          key={index}
          positions={route}
          color={[safeColor, midColor, unsafeColor][index % 3]}
          weight={5}
          opacity={0.7}
        />
      ))
    }
    
    // Otherwise, render the first route with safety segments
    return routeSafety.segments.map((segment, index) => (
      <Polyline
        key={`segment-${index}`}
        positions={segment.path}
        color={getRouteSegmentColor(segment.risk)}
        weight={5}
        opacity={0.7}
        className={segment.risk === "unsafe" ? "animate-pulse" : ""}
      />
    ))
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <MapContainer center={userLocation || [24.5, 87.5]} zoom={13} className="h-full w-full z-0" ref={mapRef}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {userLocation && <Marker position={userLocation} icon={createIcon("#3b82f6")} />}
        {destination && <Marker position={destination} icon={createIcon("#ef4444")} />}
        
        {/* Render safety-aware route segments */}
        {renderRoutesWithSafety()}
        
        {mapRef.current && <HeatmapLayer map={mapRef.current} />}
        <MapClickHandler setDestination={setDestination} />

        {/* Only recenter when recenterMap is true */}
        {userLocation && <CenterMapOnUser position={userLocation} recenter={recenterMap} />}
      </MapContainer>

      {/* Recenter Button - Floating button on map */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute bottom-24 right-4 z-50 rounded-full shadow-lg"
        onClick={handleRecenter}
      >
        <Locate className="h-5 w-5" />
      </Button>

      {/* Safety Alert for high-risk areas */}
      <SafetyAlert routeSafety={routeSafety} />

      {/* Mobile Toggle Button */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute top-4 right-4 z-50 md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "absolute top-0 left-0 h-full bg-white/95 dark:bg-gray-900/95 shadow-lg transition-all duration-300 z-10",
          isSidebarOpen ? "w-80" : "w-0 -translate-x-full md:translate-x-0 md:w-16",
        )}
      >
        <div className="p-4 h-full overflow-y-auto">
          {isSidebarOpen ? (
            <>
              <h1 className="text-2xl font-bold mb-6 flex items-center">
                <Navigation className="mr-2 h-6 w-6 text-primary" />
                SafetyMap
              </h1>

              {/* Search */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium">Find a destination</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for a place..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="icon" onClick={handleSearch} disabled={isLoading}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <Card className="mt-2">
                    <CardContent className="p-2">
                      <ul className="space-y-1 max-h-40 overflow-y-auto">
                        {searchResults.map((result, index) => (
                          <li key={index}>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-left text-xs h-auto py-2"
                              onClick={() => {
                                setDestination(result.value)
                                setSelectedPlace(result.label)
                                setSearchResults([])
                              }}
                            >
                              <MapPin className="h-3 w-3 mr-2 flex-shrink-0" />
                              <span className="truncate">{result.label}</span>
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Route Safety Analysis Component */}
              <RouteSafetyAnalysis routeSafety={routeSafety} showAnalysis={showRouteAnalysis} />

              {/* Location Info */}
              <Card className="mb-4">
                <CardHeader className="p-3">
                  <CardTitle className="text-sm flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Your Location:</span>{" "}
                      {userLocation ? `${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)}` : "Not available"}
                    </div>

                    {selectedPlace && (
                      <div>
                        <span className="font-medium">Destination:</span>{" "}
                        <span className="text-xs">{selectedPlace}</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={getUserLocation} disabled={isLoading} className="flex-1">
                        <Compass className="h-4 w-4 mr-2" />
                        My Location
                      </Button>

                      {destination && (
                        <Button size="sm" onClick={resetMap} variant="outline" className="flex-1">
                          <X className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Route Controls */}
              {destination && (
                <Card className="mb-4">
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm flex items-center">
                      <Navigation className="h-4 w-4 mr-2" />
                      Route Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <Button
                      onClick={getDirections}
                      disabled={!userLocation || !destination || isLoading}
                      className="w-full mb-3"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>

                    {routes.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <label htmlFor="route-analysis">Show Route Safety Analysis</label>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox"
                              id="route-analysis"
                              checked={showRouteAnalysis}
                              onChange={(e) => setShowRouteAnalysis(e.target.checked)}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </div>
                        </div>
                        
                        <div className="text-xs font-medium mt-3">Route Safety Legend:</div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-[#10b981]">Safe Route</Badge>
                          <Badge className="bg-[#f59e0b]">Moderate Risk</Badge>
                          <Badge className="bg-[#ef4444]">High Risk</Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Legend */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Info className="h-4 w-4 mr-2" />
                    About SafetyMap
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h3 className="font-medium">SafetyMap Legend</h3>
                    <p className="text-sm text-muted-foreground">
                      SafetyMap helps you navigate safely by identifying routes with different safety levels:
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#10b981] mr-2"></div>
                        <span>Safe Route - Low risk areas</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#f59e0b] mr-2"></div>
                        <span>Moderate Risk - Some caution advised</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#ef4444] mr-2"></div>
                        <span>High Risk - Areas with harassment reports</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Route segments are colored based on proximity to reported harassment incidents. 
                      The heat map shows areas with higher concentration of incidents.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-4 py-4">
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Route Details Overlay */}
      {routeSafety && routes.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 md:left-80 p-4 z-30 transition-all duration-300">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center">
            {/* Safety Indicator */}
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                routeSafety.overallScore >= 75 
                  ? "bg-green-100 text-green-700" 
                  : routeSafety.overallScore >= 50 
                    ? "bg-amber-100 text-amber-700" 
                    : "bg-red-100 text-red-700"
              }`}>
                {routeSafety.overallScore}
              </div>
              <div>
                <h3 className="font-medium text-sm">Safety Score</h3>
                <p className={`text-xs ${
                  routeSafety.overallScore >= 75 
                    ? "text-green-600" 
                    : routeSafety.overallScore >= 50 
                      ? "text-amber-600" 
                      : "text-red-600"
                }`}>
                  {routeSafety.riskLevel} Risk
                </p>
              </div>
            </div>
            
            {/* Route Details */}
            <div className="flex-1">
              <h3 className="font-medium text-sm">Route Summary</h3>
              <div className="flex flex-wrap gap-x-4 mt-1 text-xs">
                <span className="flex items-center">
                  <Navigation className="h-3 w-3 mr-1 text-primary" /> 
                  {formatDistance(routeSafety.totalDistance)}
                </span>
                {routeSafety.unsafePercentage > 0 && (
                  <span className="flex items-center text-red-500">
                    <Shield className="h-3 w-3 mr-1" /> 
                    Passes through high-risk areas
                  </span>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="default" size="sm">
                Start Navigation
              </Button>
              <Button variant="outline" size="icon" onClick={resetMap}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}