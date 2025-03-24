"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Search, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import PoliceHeatmap from "@/components/map/PoliceHeatmap"
interface PoliceStation {
  id: string
  name: string
  coordinates: {
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

const PolicePage: React.FC = () => {
  const [myLocation, setMyLocation] = useState<[number, number] | null>(null)
  const [showMyLocation, setShowMyLocation] = useState(false)
  const [policeStations, setPoliceStations] = useState<PoliceStation[]>([])
  const [showPoliceStations, setShowPoliceStations] = useState(false)
  const mapRef = useRef<L.Map>(null)
  const [facilityType, setFacilityType] = useState<string | undefined>(undefined)
  const [allPoliceStations, setAllPoliceStations] = useState<PoliceStation[]>([])

  useEffect(() => {
    const fetchPoliceStations = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/police")
        if (!response.ok) {
          throw new Error("Failed to fetch police station data.")
        }
        const data = await response.json()

        // Transform data to match expected structure
        const formattedData = data.map((station: any) => ({
          id: station.id,
          name: station.name,
          coordinates: {
            latitude: station.coordinates.latitude,
            longitude: station.coordinates.longitude,
          },
        }))

        setPoliceStations(formattedData)
        setAllPoliceStations(formattedData)
      } catch (error) {
        console.error("Error fetching police station data:", error)
      }
    }

    fetchPoliceStations()
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

  const handleShowPoliceStations = () => {
    if (myLocation) {
      // Calculate distances to all police stations
      const stationsWithDistance = allPoliceStations.map((station) => {
        const distance = calculateDistance(
          myLocation[0],
          myLocation[1],
          station.coordinates.latitude,
          station.coordinates.longitude,
        )
        return { ...station, distance }
      })

      // Sort by distance and take the nearest 5
      const nearestStations = stationsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0)).slice(0, 5)

      setPoliceStations(nearestStations)
      setShowPoliceStations(true)
    } else {
      // If location is not available, show all stations
      setPoliceStations(allPoliceStations)
      setShowPoliceStations(true)
    }
  }

  const NearestStationsList = () => {
    if (!showPoliceStations || policeStations.length === 0) return null

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Nearest Police Stations</CardTitle>
          <CardDescription>
            {myLocation
              ? "Showing the 5 closest police stations to your location"
              : "Get your location to see distances"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {policeStations.map((station) => (
              <div key={station.id} className="flex justify-between items-center p-2 border-b">
                <div className="font-medium">{station.name}</div>
                {station.distance !== undefined && (
                  <div className="text-sm text-muted-foreground">{station.distance.toFixed(2)} km</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="mb-8 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Police Stations Near You</h1>
        <p className="text-muted-foreground">Find nearby police stations for assistance and emergency services.</p>
      </motion.div>
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter
              </CardTitle>
              <CardDescription>Find the police station you need</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Input id="search" placeholder="Search for police stations..." />
                </div>
              </div>

              <div className="space-y-2">
                <Select value={facilityType} onValueChange={setFacilityType}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="local">Local Police Station</SelectItem>
                    <SelectItem value="regional">Regional Police Station</SelectItem>
                    <SelectItem value="specialized">Specialized Unit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button onClick={handleGetMyLocation} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  Get My Location
                </Button>
                <Button onClick={handleShowPoliceStations} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  Show 5 Nearest Police Stations
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-500">
                <Shield className="h-5 w-5" />
                Emergency Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3 border border-blue-200 dark:border-blue-900">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold mb-1">
                  Emergency Services
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Call 100 for immediate police assistance</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <motion.div
          className="space-y-6 lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <MapContainer
            ref={mapRef}
            style={{ height: "500px", width: "100%" }}
            center={[51.505, -0.09] as L.LatLngExpression}
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
            {showPoliceStations &&
              policeStations.map((station, index) => (
                <Marker
                  key={index}
                  position={[station.coordinates.latitude, station.coordinates.longitude]}
                  icon={createIcon("#c30010")}
                >
                  <Popup>{station.name}</Popup>
                </Marker>
              ))}
                <PoliceHeatmap/>
          </MapContainer>
        
          <NearestStationsList />
        </motion.div>
      </div>
    </div>
  )
}

export default PolicePage