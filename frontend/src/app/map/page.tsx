"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from "react-leaflet"
import axios from "axios"
import { Search, Navigation, MapPin, Compass, Info, X, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

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

const safeColor = "#10b981" // Safe route 🟢
const midColor = "#f59e0b" // Moderate route 🟠
const unsafeColor = "#ef4444" // Unsafe route 🔴

export default function SafetyMap() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [destination, setDestination] = useState<[number, number] | null>(null)
  const [routes, setRoutes] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null)

  // Get user location
  const getUserLocation = () => {
    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude])
        setIsLoading(false)
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
        setRoutes(
          res.data.routes.map((route: any) =>
            route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]),
          ),
        )
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
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Map */}
      <MapContainer center={userLocation || [51.505, -0.09]} zoom={13} className="h-full w-full z-0">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {userLocation && <Marker position={userLocation} icon={createIcon("#3b82f6")} />}

        {destination && <Marker position={destination} icon={createIcon("#ef4444")} />}

        {routes.map((route, index) => (
          <Polyline
            key={index}
            positions={route}
            color={[safeColor, midColor, unsafeColor][index % 3]}
            weight={5}
            opacity={0.7}
          />
        ))}

        <MapClickHandler setDestination={setDestination} />

        {userLocation && <CenterMapOnUser position={userLocation} />}
      </MapContainer>

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
                        {searchResults.map((result: any, index) => (
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
                        <div className="text-xs font-medium">Available Routes:</div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-[#10b981]">Safe Route</Badge>
                          <Badge className="bg-[#f59e0b]">Moderate Route</Badge>
                          <Badge className="bg-[#ef4444]">Unsafe Route</Badge>
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
                      SafetyMap helps you navigate safely by providing route options with different safety levels:
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#10b981] mr-2"></div>
                        <span>Safe Route - Recommended for all times</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#f59e0b] mr-2"></div>
                        <span>Moderate Route - Use with caution</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#ef4444] mr-2"></div>
                        <span>Unsafe Route - Not recommended</span>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          ) : (
            // Collapsed sidebar with icons only
            <div className="flex flex-col items-center gap-4 pt-4">
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={getUserLocation}>
                <Compass className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                <Search className="h-5 w-5" />
              </Button>
              {destination && (
                <Button variant="ghost" size="icon" onClick={getDirections}>
                  <Navigation className="h-5 w-5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MapClickHandler({ setDestination }: { setDestination: (coords: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setDestination([e.latlng.lat, e.latlng.lng])
    },
  })
  return null
}

// Center map on user component
function CenterMapOnUser({ position }: { position: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    map.setView(position, map.getZoom())
  }, [map, position])

  return null
}

