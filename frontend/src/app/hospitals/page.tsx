"use client"
import React, { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

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
    <div className="container p-4 shadow" style={{ maxWidth: '800px' }}>
      <div className="map-container bg-white rounded-lg overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
        <div className="get-my-location">
            
          <button
            className="p-3 bg-black w-full mt-5 text-white rounded-lg"
            style={{ marginBottom: '20px' }}
            onClick={handleGetMyLocation}
          >
            Get My Location
          </button>
          <button
            className="p-3 bg-black w-full mt-5 text-white rounded-lg"
            style={{ marginBottom: '20px' }}
            onClick={handleShowHospitals}
          >
            Show Nearest Hospitals
          </button>
        </div>
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
      </div>
    </div>
  )
}

export default HospitalPage