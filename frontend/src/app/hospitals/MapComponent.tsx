import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

interface Hospital {
  name: string
  location: {
    coordinates: [number, number]
  }
}

interface MapComponentProps {
  myLocation: [number, number] | null
  showMyLocation: boolean
  hospitals: Hospital[]
  showHospitals: boolean
}

const MapComponent: React.FC<MapComponentProps> = ({ myLocation, showMyLocation, hospitals, showHospitals }) => {
  const mapRef = useRef<L.Map>(null)

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

  useEffect(() => {
    if (myLocation && mapRef.current) {
      mapRef.current.setView(new L.LatLng(myLocation[0], myLocation[1]), mapRef.current.getZoom())
    }
  }, [myLocation])

  return (
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
      {showHospitals &&
        hospitals.map((hospital, index) => (
          <Marker
            key={index}
            position={[hospital.location.coordinates[1], hospital.location.coordinates[0]]}
            icon={redIcon}
          >
            <Popup>{hospital.name}</Popup>
          </Marker>
        ))}
    </MapContainer>
  )
}

export default MapComponent