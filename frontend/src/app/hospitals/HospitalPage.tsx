"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Search, Ambulance, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import HospitalHeatmap from "@/components/map/HospitalHeatmap"
import RoutingMachine from "@/app/hospitals/RoutingMachine"

interface Hospital {
  id: string
  name: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  distance?: number
}

interface RouteProps {
  start: [number, number]
  end: [number, number]
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180)
}

const HospitalPage: React.FC = () => {
  const [myLocation, setMyLocation] = useState<[number, number] | null>(null)
  const [showMyLocation, setShowMyLocation] = useState(false)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [showHospitals, setShowHospitals] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const mapRef = useRef<L.Map>(null)
  const [facilityType, setFacilityType] = useState<string | undefined>(undefined)
  const [nearestHospitals, setNearestHospitals] = useState<Hospital[]>([])
  const markerRef = useRef<L.Marker | null>(null)
  const [searchMarkerPosition, setSearchMarkerPosition] = useState<[number, number] | null>(null)
  const [searchMarkerName, setSearchMarkerName] = useState<string>("")
  const [routePoints, setRoutePoints] = useState<RouteProps | null>(null)
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)

  const showNotification = (message: string, type: "success" | "error" | "info") => {
    const bgColor = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"
    const notification = document.createElement("div")
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out z-50`
    notification.textContent = message
    document.body.appendChild(notification)
    setTimeout(() => {
      notification.style.opacity = "0"
      setTimeout(() => notification.remove(), 500)
    }, 3000)
  }

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/hospitals")
        if (!response.ok) {
          throw new Error("Failed to fetch hospital data.")
        }
        const data = await response.json()
        console.log("Hospital Data:", data)
        setHospitals(data)
      } catch (error) {
        console.error("Error fetching hospital data:", error)
      }
    }

    fetchHospitals()
  }, [])

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      showNotification("Searching for hospital...", "info")
      const response = await fetch(`http://localhost:8000/api/hospitals/search?name=${encodeURIComponent(searchQuery)}`)

      if (!response.ok) {
        showNotification("Hospital not found", "error")
        return
      }

      const data = await response.json()
      setSearchQuery(data)
      showNotification("Hospital found successfully!", "success")

      if (data.coordinates) {
        const { latitude, longitude } = data.coordinates
        mapRef.current?.flyTo([latitude, longitude], 15)

        setSearchMarkerPosition([latitude, longitude])
        setSearchMarkerName(data.name)

        setSelectedHospital({
          id: data.id || "search-result",
          name: data.name,
          coordinates: {
            latitude,
            longitude,
          },
        })
      }
    } catch (error) {
      console.error("Error searching for hospital:", error)
      showNotification("Error searching for hospital", "error")
    }
  }

  const handleGetMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: [number, number] = [position.coords.latitude, position.coords.longitude]
          setMyLocation(newLocation)
          setShowMyLocation(true)
          mapRef.current?.setView(newLocation, mapRef.current.getZoom())
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    } else {
      console.log("Geolocation is not supported by this browser.")
    }
  }

  const handleShowHospitals = () => {
    if (!myLocation) return

    const hospitalsWithDistance = hospitals
      .filter((hospital) => hospital.coordinates)
      .map((hospital) => ({
        ...hospital,
        distance: calculateDistance(
          myLocation[0],
          myLocation[1],
          hospital.coordinates!.latitude,
          hospital.coordinates!.longitude,
        ),
      }))
      .sort((a, b) => (a.distance || Number.POSITIVE_INFINITY) - (b.distance || Number.POSITIVE_INFINITY))

    const nearest = hospitalsWithDistance.slice(0, 5)
    setNearestHospitals(nearest)
    setShowHospitals(true)

    if (mapRef.current) {
      mapRef.current.setView(myLocation, 12)
    }
  }

  const handleShowRoute = (hospital: Hospital) => {
    if (!myLocation || !hospital.coordinates) {
      showNotification("Your location is needed to show the route", "info")
      return
    }

    setSelectedHospital(hospital)
    setRoutePoints({
      start: myLocation,
      end: [hospital.coordinates.latitude, hospital.coordinates.longitude],
    })

    showNotification(`Showing route to ${hospital.name}`, "success")
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        className="mb-8 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold py-4">Hospitals & Medical Facilities</h1>
        <p className="text-muted-foreground">
          Find nearby hospitals, clinics, and medical facilities for emergency and routine healthcare services.
        </p>
      </motion.div>
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="space-y-6 lg:col-span-1">
          <Card className="shadow-md border-t-4 border-t-primary">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Search className="h-5 w-5" />
                Search for Hospitals
              </CardTitle>
              <CardDescription>Find the medical facility you need</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="search"
                      className="pl-10 pr-4"
                      placeholder="Search for facilities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90 transition-colors">
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={handleGetMyLocation}
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-map-pin"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Get My Location
                </Button>
                <Button
                  onClick={handleShowHospitals}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  disabled={!myLocation}
                >
                  <Ambulance className="h-4 w-4" />
                  Show Nearest Hospitals
                </Button>
              </div>
            </CardContent>
          </Card>

          {showHospitals && nearestHospitals.length > 0 && (
            <Card className="mt-4 border-t-4 border-t-blue-500 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Ambulance className="h-5 w-5 text-blue-500" />
                  Nearest Hospitals
                </CardTitle>
                <CardDescription>Top 5 closest medical facilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {nearestHospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    className="flex items-start justify-between p-3 rounded-md hover:bg-blue-50 cursor-pointer transition-colors border border-transparent hover:border-blue-200"
                  >
                    <div
                      className="flex-1"
                      onClick={() => {
                        if (mapRef.current && hospital.coordinates) {
                          mapRef.current.setView([hospital.coordinates.latitude, hospital.coordinates.longitude], 15)
                          setSelectedHospital(hospital)
                        }
                      }}
                    >
                      <div className="font-medium">{hospital.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {hospital.distance !== undefined
                          ? `${hospital.distance.toFixed(2)} km away`
                          : "Distance unknown"}
                      </div>
                    </div>
                    {myLocation && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-2 flex items-center gap-1"
                        onClick={() => handleShowRoute(hospital)}
                      >
                        <Navigation className="h-3 w-3" />
                        <span className="text-xs">Route</span>
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {selectedHospital && (
            <Card className="mt-4 border-t-4 border-t-red-500 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-red-500" />
                  Selected Hospital
                </CardTitle>
                <CardDescription>Details and directions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-3 rounded-md bg-red-50 border border-red-200">
                  <div className="font-medium">{selectedHospital.name}</div>
                  {selectedHospital.distance && (
                    <div className="text-sm text-muted-foreground">{selectedHospital.distance.toFixed(2)} km away</div>
                  )}
                  {myLocation && selectedHospital.coordinates && (
                    <Button
                      className="mt-2 w-full bg-red-600 hover:bg-red-700"
                      onClick={() => handleShowRoute(selectedHospital)}
                    >
                      Show Directions
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <motion.div
          className="space-y-6 lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-0 overflow-hidden shadow-lg border-0">
            <MapContainer
              ref={mapRef}
              style={{ height: "600px", width: "100%" }}
              center={[22.5727398, 88.3600196]}
              zoom={13}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {searchMarkerPosition && (
                <Marker
                  position={searchMarkerPosition}
                  icon={createIcon("#ff0000")}
                  eventHandlers={{
                    click: () => {
                      if (myLocation && searchMarkerPosition) {
                        setRoutePoints({
                          start: myLocation,
                          end: searchMarkerPosition,
                        })
                      }
                    },
                  }}
                >
                  <Popup>
                    <div className="font-medium">{searchMarkerName}</div>
                    <div className="text-sm">Search Result</div>
                    {myLocation && (
                      <Button
                        className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white text-xs py-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (myLocation && searchMarkerPosition) {
                            setRoutePoints({
                              start: myLocation,
                              end: searchMarkerPosition,
                            })
                          }
                        }}
                      >
                        Show Route
                      </Button>
                    )}
                  </Popup>
                </Marker>
              )}
              {showMyLocation && myLocation && (
                <Marker position={myLocation} icon={createIcon("#10b981")}>
                  <Popup>Your Location</Popup>
                </Marker>
              )}
              {showHospitals &&
                nearestHospitals.map((hospital) =>
                  hospital.coordinates ? (
                    <Marker
                      key={hospital.id}
                      position={[hospital.coordinates.latitude, hospital.coordinates.longitude]}
                      icon={createIcon("#3b82f6")}
                      eventHandlers={{
                        click: () => {
                          setSelectedHospital(hospital)
                          if (myLocation) {
                            setRoutePoints({
                              start: myLocation,
                              end: [hospital.coordinates!.latitude, hospital.coordinates!.longitude],
                            })
                          }
                        },
                      }}
                    >
                      <Popup>
                        <div className="font-medium">{hospital.name}</div>
                        {hospital.distance !== undefined && (
                          <div className="text-sm">{hospital.distance.toFixed(2)} km away</div>
                        )}
                        {myLocation && (
                          <Button
                            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (myLocation && hospital.coordinates) {
                                setRoutePoints({
                                  start: myLocation,
                                  end: [hospital.coordinates.latitude, hospital.coordinates.longitude],
                                })
                              }
                            }}
                          >
                            Show Route
                          </Button>
                        )}
                      </Popup>
                    </Marker>
                  ) : null,
                )}
              <HospitalHeatmap />
              {routePoints && <RoutingMachine route={routePoints} />}
            </MapContainer>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default HospitalPage

