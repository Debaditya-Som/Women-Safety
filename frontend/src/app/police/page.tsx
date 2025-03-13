"use client"
import React, { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

interface PoliceStation {
  name: string
  location: {
    coordinates: [number, number]
  }
}

const PolicePage: React.FC = () => {
  const [myLocation, setMyLocation] = useState<[number, number] | null>(null)
  const [showMyLocation, setShowMyLocation] = useState(false)
  const [policeStations, setPoliceStations] = useState<PoliceStation[]>([])
  const [showPoliceStations, setShowPoliceStations] = useState(false)
  const mapRef = useRef<L.Map>(null)

  useEffect(() => {
    const fetchPoliceStations = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/receive')
        if (!response.ok) {
          throw new Error('Failed to fetch police station data.')
        }
        const data = await response.json()
        setPoliceStations(data)
      } catch (error) {
        console.error('Error fetching police station data:', error)
      }
    }

    fetchPoliceStations()
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

  const handleShowPoliceStations = () => {
    setShowPoliceStations(true)
  }

  return (
    <div className="container mx-auto p-4 shadow-lg rounded-lg bg-white" style={{ maxWidth: '800px' }}>
      <h1 className="text-2xl font-bold mb-4">Police Stations Near You</h1>
      <p className=" mb-4">
        Find the nearest police stations to your location. Click the buttons below to get your location and show the nearest police stations.
      </p>
      <div className="map-container bg-gray-100 rounded-lg overflow-hidden mb-4" style={{ width: '100%', maxWidth: '100%' }}>
        <div className="get-my-location mb-4">
          <button
            className="p-3 bg-blue-600 w-full text-white rounded-lg mb-2"
            onClick={handleGetMyLocation}
          >
            Get My Location
          </button>
          <button
            className="p-3 bg-green-600 w-full text-white rounded-lg"
            onClick={handleShowPoliceStations}
          >
            Show Nearest Police Stations
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
          {showPoliceStations && policeStations.map((station, index) => (
            <Marker
              key={index}
              position={[station.location.coordinates[1], station.location.coordinates[0]]}
              icon={redIcon}
            >
              <Popup>{station.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

export default PolicePage