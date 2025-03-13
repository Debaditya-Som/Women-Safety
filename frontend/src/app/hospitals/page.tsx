"use client"
import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Search, Ambulance } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface Hospital {
  name: string
  location: {
    coordinates: [number, number]
  }
}

const HospitalPage: React.FC = () => {
  const [myLocation, setMyLocation] = useState<[number, number] | null>(null)
  const [showMyLocation, setShowMyLocation] = useState(false)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [showHospitals, setShowHospitals] = useState(false)
  const mapRef = useRef<L.Map>(null)
  const [facilityType, setFacilityType] = useState<string | undefined>(undefined)

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/receive')
        if (!response.ok) {
          throw new Error('Failed to fetch hospital data.')
        }
        const data = await response.json()
        setHospitals(data)
      } catch (error) {
        console.error('Error fetching hospital data:', error)
      }
    }

    fetchHospitals()
  }, [])

  const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })

  const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })

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
          console.error('Error getting location:', error)
        }
      )
    } else {
      console.log('Geolocation is not supported by this browser.')
    }
  }

  const handleShowHospitals = () => {
    setShowHospitals(true)
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
                  <Input id="search" placeholder="Search for facilities..." />
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
                <Button onClick={handleShowHospitals} className="w-full">
                  Show Nearest Hospitals
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
        </div>
        <motion.div
          className="space-y-6 lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <MapContainer
            ref={mapRef}
            style={{ height: '500px', width: '100%' }}
            center={[51.505, -0.09] as L.LatLngExpression}
            zoom={13}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {showMyLocation && myLocation && (
              <Marker position={myLocation} icon={blueIcon}>
                <Popup>Your Location</Popup>
              </Marker>
            )}
            {showHospitals && hospitals.map((hospital, index) => (
              <Marker
                key={index}
                position={[hospital.location.coordinates[1], hospital.location.coordinates[0]]}
                icon={redIcon}
              >
                <Popup>{hospital.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </motion.div>
      </div>
    </div>
  )
}

export default HospitalPage