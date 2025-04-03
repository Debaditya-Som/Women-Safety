"use client"
import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet.heat"

interface Hospital {
  id: string
  name?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

const HospitalHeatmap: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const map = useMap()
  const heatLayerRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)


  useEffect(() => {
    const fetchHospitals = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("http://localhost:8000/api/hospitals")
        if (!response.ok) throw new Error("Failed to fetch hospital data.")
        const data = await response.json()

        const formattedData = data
          .filter((hospital: any) => hospital.coordinates?.latitude && hospital.coordinates?.longitude)
          .map((hospital: any) => ({
            id: hospital.id,
            name: hospital.name,
            coordinates: {
              latitude: hospital.coordinates.latitude,
              longitude: hospital.coordinates.longitude,
            },
          }))

        setHospitals(formattedData)
      } catch (error) {
        console.error("Error fetching hospital data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHospitals()
  }, [])

  useEffect(() => {
    if (hospitals.length === 0 || isLoading) return

    if (heatLayerRef.current) {
      heatLayerRef.current.remove()
    }


    const severityConfig = {
        low: { weight: 2, color: "#3b82f6", label: "Low" },
        medium: { weight: 4, color: "#10b981", label: "Medium" },
        high: { weight: 8, color: "#f59e0b", label: "High" },    
        critical: { weight: 12, color: "#ef4444", label: "Critical" }, 
      }

    const gradient = {
            0.2: severityConfig.low.color,
            0.5: severityConfig.medium.color,
            0.8: severityConfig.high.color,
            1.0: severityConfig.critical.color,
      };
      
    // Create heat layer with enhanced options
    heatLayerRef.current = (L as any).heatLayer(
      hospitals.map((hospital) => [
        hospital.coordinates!.latitude,
        hospital.coordinates!.longitude,
        0.8, 
      ]),
      {
        radius: 40, 
        blur: 15, 
        maxZoom: 18, 
        gradient, 
        minOpacity: 0.5, 
        max: 1.0,
        zIndex: 500,  
        useWorker: true, 
      },
    )

    heatLayerRef.current.addTo(map)

    const handleZoom = () => {
      const currentZoom = map.getZoom()
      const scaleFactor = Math.max(0.5, Math.min(1.5, 18 / (currentZoom + 5)))

      if (heatLayerRef.current) {
        heatLayerRef.current.setOptions({
          radius: Math.round(25 * scaleFactor),
          blur: Math.round(20 * scaleFactor),
        })
      }
    }

    map.on("zoomend", handleZoom)

    return () => {
      if (heatLayerRef.current) {
        heatLayerRef.current.remove()
      }
      map.off("zoomend", handleZoom)
    }
  }, [hospitals, map, isLoading])

  useEffect(() => {
    if (!heatLayerRef.current || isLoading) return

    let increasing = true
    let opacity = 0.4

    const pulseInterval = setInterval(() => {
      if (!heatLayerRef.current) return

      if (increasing) {
        opacity += 0.01
        if (opacity >= 0.8) increasing = false
      } else {
        opacity -= 0.01
        if (opacity <= 0.4) increasing = true
      }

      heatLayerRef.current.setOptions({ minOpacity: opacity })
    }, 100)

    return () => clearInterval(pulseInterval)
  }, [hospitals, isLoading])

  return null
}

export default HospitalHeatmap