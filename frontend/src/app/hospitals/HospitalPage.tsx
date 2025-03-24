"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Search, Ambulance } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import HospitalHeatmap from "@/components/map/HospitalHeatmap"

interface Hospital {
  id: string
  name: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  distance?: number
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in km
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

  // const sortedHospitals = useMemo(() => {
  //   if (!myLocation || !showHospitals) return []

  //   return hospitals
  //     .filter((hospital) => hospital.coordinates)
  //     .map((hospital) => ({
  //       ...hospital,
  //       distance: calculateDistance(
  //         myLocation[0],
  //         myLocation[1],
  //         hospital.coordinates!.latitude,
  //         hospital.coordinates!.longitude,
  //       ),
  //     }))
  //     .sort((a, b) => (a.distance || Number.POSITIVE_INFINITY) - (b.distance || Number.POSITIVE_INFINITY))
  // }, [hospitals, myLocation, showHospitals])

  // const nearestHospitalsMemo = useMemo(() => {
  //   return sortedHospitals.slice(0, 5)
  // }, [sortedHospitals])

  // const heatMapData = useMemo(() => {
  //   return sortedHospitals.slice(5).map((hospital) => ({
  //     lat: hospital.coordinates!.latitude,
  //     lng: hospital.coordinates!.longitude,
  //     intensity: 1 / (hospital.distance || 1), 
  //   }))
  // }, [sortedHospitals])

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

    // Calculate distance for each hospital
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

    // Get the nearest 5 hospitals
    const nearest = hospitalsWithDistance.slice(0, 5)
    setNearestHospitals(nearest)
    setShowHospitals(true)

    if (mapRef.current) {
      mapRef.current.setView(myLocation, 12)
    }
  }

  // Filter hospitals based on search and facility type
  // const filteredNearestHospitals = nearestHospitals.filter((hospital) => {
  //   const matchesSearch = searchQuery === "" || hospital.name.toLowerCase().includes(searchQuery.toLowerCase())

  //   const matchesType = !facilityType || facilityType === "all" || (hospital as any).type === facilityType // Assuming hospitals have a type property

  //   return matchesSearch && matchesType
  // })

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
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="space-y-6 lg:col-span-1">
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
                  <Input
                    id="search"
                    placeholder="Search for facilities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Select value={facilityType} onValueChange={setFacilityType}>
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
              <div className="flex flex-col gap-2 pt-2">
                <Button onClick={handleGetMyLocation} className="w-full">
                  Get My Location
                </Button>
                <Button onClick={handleShowHospitals} className="w-full" disabled={!myLocation}>
                  Show Nearest Hospitals
                </Button>
              </div>
            </CardContent>
          </Card>

          {showHospitals && nearestHospitals.length > 0 && (
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Ambulance className="h-5 w-5" />
                  Nearest Hospitals
                </CardTitle>
                <CardDescription>Top 5 closest medical facilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {nearestHospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    className="flex items-start justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => {
                      if (mapRef.current && hospital.coordinates) {
                        mapRef.current.setView([hospital.coordinates.latitude, hospital.coordinates.longitude], 15)
                      }
                    }}
                  >
                    <div>
                      <div className="font-medium">{hospital.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {hospital.distance !== undefined
                          ? `${hospital.distance.toFixed(2)} km away`
                          : "Distance unknown"}
                      </div>
                    </div>
                  </div>
                ))}
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
          <MapContainer
            ref={mapRef}
            style={{ height: "600px", width: "100%", borderRadius: "0.5rem" }}
            center={[22.5727398, 88.3600196]}
            zoom={13}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

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
                  >
                    <Popup>
                      <div className="font-medium">{hospital.name}</div>
                      {hospital.distance !== undefined && (
                        <div className="text-sm">{hospital.distance.toFixed(2)} km away</div>
                      )}
                    </Popup>
                  </Marker>
                ) : null,
              )}
            <HospitalHeatmap/>
          </MapContainer>
        </motion.div>
      </div>
    </div>
  )
}

export default HospitalPage

