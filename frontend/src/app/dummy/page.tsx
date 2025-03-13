"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { Hospital, MapPin, Phone, Clock, Star, Search, Locate, X, Ambulance, BadgeAlert, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import L from "leaflet"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })

const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })

const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

interface Hospital {
  id: number
  name: string
  type: string
  address: string
  phone: string
  hours: string
  rating: number
  services: string[]
  location: {
    coordinates: [number, number]
  }
  distance?: number
  image?: string
  emergency: boolean
}

interface MapRef extends L.Map {
  setView: (center: L.LatLngExpression, zoom?: number) => this
}

const HospitalPage: React.FC = () => {
  const [myLocation, setMyLocation] = useState<[number, number] | null>(null)
  const [showMyLocation, setShowMyLocation] = useState(false)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([])
  const [showHospitals, setShowHospitals] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [emergencyOnly, setEmergencyOnly] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [view, setView] = useState<"map" | "list">("list")
  const mapRef = useRef<MapRef | null>(null)

  useEffect(() => {
    const fetchHospitals = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("http://localhost:8080/api/receive")
        if (!response.ok) {
          throw new Error("Failed to fetch hospital data.")
        }
        const data = await response.json()

        const processedData = data.map((hospital: any) => ({
          ...hospital,
          emergency: hospital.emergency || false,
          services: hospital.services || [],
          rating: hospital.rating || 4.0,
          hours: hospital.hours || "Unknown",
          type: hospital.type || "Hospital",
        }))

        setHospitals(processedData)
        setFilteredHospitals(processedData)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching hospital data:", error)
        setIsLoading(false)
       
      }
    }

    fetchHospitals()
  }, )

  // Filter hospitals based on search and filters
  useEffect(() => {
    if (hospitals.length === 0) return

    let filtered = [...hospitals]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (hospital) =>
          hospital.name.toLowerCase().includes(query) ||
          hospital.type.toLowerCase().includes(query) ||
          hospital.services.some((service) => service.toLowerCase().includes(query)),
      )
    }

    if (filterType !== "all") {
      filtered = filtered.filter((hospital) => hospital.type.toLowerCase().includes(filterType.toLowerCase()))
    }

    if (emergencyOnly) {
      filtered = filtered.filter((hospital) => hospital.emergency)
    }

    if (myLocation) {
      filtered = filtered.map((hospital) => {
        const distance = calculateDistance(
          myLocation[0],
          myLocation[1],
          hospital.location.coordinates[1],
          hospital.location.coordinates[0],
        )
        return { ...hospital, distance }
      })

      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0))
    }

    setFilteredHospitals(filtered)
  }, [searchQuery, filterType, emergencyOnly, hospitals, myLocation])

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in km
    return Number.parseFloat(d.toFixed(1))
  }

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180)
  }

  // Get user's current location
  const handleGetMyLocation = () => {
    setIsLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: [number, number] = [position.coords.latitude, position.coords.longitude]
          setMyLocation(newLocation)
          setShowMyLocation(true)
          setShowHospitals(true)

          if (mapRef.current) {
            mapRef.current.setView(newLocation, 13)
          }

          setIsLoading(false)
      
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsLoading(false)
         
        },
      )
    } else {
      setIsLoading(false)
    
    }
  }

  // Handle hospital selection
  const handleHospitalSelect = (hospital: Hospital) => {
    setSelectedHospital(hospital)

    if (mapRef.current && hospital.location) {
      const coordinates: [number, number] = [hospital.location.coordinates[1], hospital.location.coordinates[0]]
      mapRef.current.setView(coordinates, 15)
    }
  }

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("")
    setFilterType("all")
    setEmergencyOnly(false)
  }

  // Create icons for map markers
  const createIcon = (color: string) => {
    // This will be created on the client side
    if (typeof window !== "undefined" && typeof L !== "undefined") {
      return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
    }
    return undefined
  }

  const getHospitalIcon = (hospital: Hospital) => {
    if (typeof window === "undefined" || typeof L === "undefined") return undefined

    if (hospital.emergency) {
      return createIcon("red")
    } else {
      return createIcon("blue")
    }
  }

  const getUserLocationIcon = (): L.Icon | L.DivIcon | undefined => {
    if (typeof window === "undefined" || typeof L === "undefined") return undefined
    return createIcon("gold")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="mb-8 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Hospitals & Medical Facilities</h1>
        <p className="text-muted-foreground">
          Find nearby hospitals, clinics, and medical facilities for emergency and routine healthcare services.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter
              </CardTitle>
              <CardDescription>Find the medical facility you need</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    type="search"
                    placeholder="Search hospitals, services..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Facility Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="general">General Hospital</SelectItem>
                    <SelectItem value="clinic">Clinic</SelectItem>
                    <SelectItem value="medical">Medical Center</SelectItem>
                    <SelectItem value="specialized">Specialized</SelectItem>
                    <SelectItem value="urgent">Urgent Care</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="emergency" checked={emergencyOnly} onCheckedChange={setEmergencyOnly} />
                <Label htmlFor="emergency" className="flex items-center gap-1">
                  <BadgeAlert className="h-4 w-4 text-red-500" />
                  Emergency Services Only
                </Label>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button variant="default" className="w-full gap-1" onClick={handleGetMyLocation} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Locate className="h-4 w-4" />}
                  {myLocation ? "Update My Location" : "Get My Location"}
                </Button>
                <Button variant="outline" className="w-full gap-1" onClick={resetFilters}>
                  <X className="h-4 w-4" />
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-500">
                <Ambulance className="h-5 w-5" />
                Emergency Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-red-50 dark:bg-red-950 p-3 border border-red-200 dark:border-red-900">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold mb-1">
                  Emergency Services
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">Call 911 for immediate medical emergencies</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Area */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* View Toggle */}
          <div className="flex justify-between items-center">
            <Tabs value={view} onValueChange={(v) => setView(v as "map" | "list")} className="w-[400px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="map">Map View</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="text-sm text-muted-foreground">
              {filteredHospitals.length} {filteredHospitals.length === 1 ? "facility" : "facilities"} found
            </div>
          </div>

          {/* Views */}
          <div className="min-h-[600px]">
            <AnimatePresence mode="wait">
              {view === "list" ? (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[600px]">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground">Loading hospitals...</p>
                    </div>
                  ) : filteredHospitals.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                      {filteredHospitals.map((hospital) => (
                        <motion.div
                          key={hospital.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ y: -5 }}
                          onClick={() => handleHospitalSelect(hospital)}
                          className="cursor-pointer"
                        >
                          <Card
                            className={`overflow-hidden h-full transition-all hover:shadow-md ${selectedHospital?.id === hospital.id ? "ring-2 ring-primary" : ""}`}
                          >
                            <div className="relative h-[200px] bg-muted">
                              <img
                                src={
                                  hospital.image ||
                                  `/placeholder.svg?height=200&width=400&text=${encodeURIComponent(hospital.name)}`
                                }
                                alt={hospital.name}
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute right-2 top-2">
                                <Badge
                                  className={
                                    hospital.emergency
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                  }
                                >
                                  <span className="flex items-center gap-1">
                                    <Hospital className="h-3 w-3" />
                                    {hospital.type}
                                  </span>
                                </Badge>
                              </div>
                              {hospital.emergency && (
                                <div className="absolute left-2 top-2">
                                  <Badge variant="destructive" className="flex items-center gap-1">
                                    <Ambulance className="h-3 w-3" />
                                    24/7 Emergency
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <CardHeader>
                              <CardTitle>{hospital.name}</CardTitle>
                              <CardDescription className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {hospital.address}
                                {hospital.distance && (
                                  <Badge variant="outline" className="ml-2 font-normal">
                                    {hospital.distance} km
                                  </Badge>
                                )}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <span>{hospital.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>{hospital.hours}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span>{hospital.rating} / 5</span>
                                </div>
                                {hospital.services && hospital.services.length > 0 && (
                                  <div className="mt-4">
                                    <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Services</p>
                                    <div className="flex flex-wrap gap-1">
                                      {hospital.services.map((service, index) => (
                                        <Badge key={index} variant="outline" className="font-normal">
                                          {service}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter className="flex gap-2">
                              <Button variant="default" size="sm" className="flex-1 gap-1">
                                <Phone className="h-4 w-4" />
                                Call
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1 gap-1">
                                <MapPin className="h-4 w-4" />
                                Directions
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[600px] text-center">
                      <div className="rounded-full bg-muted p-6 mb-4">
                        <Hospital className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No hospitals found</h3>
                      <p className="text-muted-foreground max-w-md">
                        Try adjusting your search criteria or filters to find medical facilities in your area.
                      </p>
                      <Button variant="outline" className="mt-4" onClick={resetFilters}>
                        Reset Filters
                      </Button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="map"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-[600px] rounded-lg overflow-hidden border"
                >
                  {typeof window !== "undefined" && (
                    <MapContainer
                      ref={mapRef}
                      center={myLocation || [51.505, -0.09]}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      {showMyLocation && myLocation && (
                        <Marker position={myLocation} icon={getUserLocationIcon()}>
                          <Popup>
                            <div className="text-center">
                              <strong>Your Location</strong>
                            </div>
                          </Popup>
                        </Marker>
                      )}

                      {filteredHospitals.map((hospital) => (
                        <Marker
                          key={hospital.id}
                          position={[hospital.location.coordinates[1], hospital.location.coordinates[0]]}
                          icon={getHospitalIcon(hospital)}
                        >
                          <Popup>
                            <div className="p-1">
                              <h3 className="font-semibold">{hospital.name}</h3>
                              <p className="text-sm text-muted-foreground">{hospital.type}</p>
                              <div className="text-sm mt-1">
                                <div className="flex items-center gap-1 text-xs">
                                  <MapPin className="h-3 w-3" />
                                  {hospital.address}
                                </div>
                                <div className="flex items-center gap-1 text-xs mt-1">
                                  <Phone className="h-3 w-3" />
                                  {hospital.phone}
                                </div>
                                {hospital.distance && (
                                  <div className="mt-1 font-medium">Distance: {hospital.distance} km</div>
                                )}
                              </div>
                              <div className="mt-2 flex gap-1">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="w-full text-xs"
                                  onClick={() => handleHospitalSelect(hospital)}
                                >
                                  Details
                                </Button>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hospital Details */}
          {selectedHospital && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Hospital className="h-5 w-5 text-primary" />
                        {selectedHospital.name}
                        {selectedHospital.emergency && (
                          <Badge variant="destructive" className="ml-2">
                            24/7 Emergency
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{selectedHospital.type}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{selectedHospital.rating}</span>
                      <span className="text-muted-foreground text-sm">/5</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Contact Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedHospital.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedHospital.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedHospital.hours}</span>
                        </div>
                      </div>
                    </div>

                    {selectedHospital.services && selectedHospital.services.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">Services</h3>
                        <div className="flex flex-wrap gap-1">
                          {selectedHospital.services.map((service, index) => (
                            <Badge key={index} variant="outline" className="font-normal">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedHospital.distance && (
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          <span className="font-medium">Distance from you</span>
                        </div>
                        <Badge variant="secondary" className="text-lg font-semibold">
                          {selectedHospital.distance} km
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button className="flex-1 gap-1">
                    <Phone className="h-4 w-4" />
                    Call Now
                  </Button>
                  <Button variant="outline" className="flex-1 gap-1">
                    <MapPin className="h-4 w-4" />
                    Get Directions
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default HospitalPage