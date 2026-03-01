"use client"

import { useEffect, useMemo, useState } from "react"
import { Marker, Popup } from "react-leaflet"
import L from "leaflet"
import { calculateDistance, formatDistance } from "./routeSafety"

interface SafetyPlace {
  id: string
  name: string
  coordinates: { latitude: number; longitude: number }
  /** Distance in metres from user — populated after userLocation is known */
  dist?: number
}

export interface NearestPlace {
  name: string
  coords: [number, number]
  dist: number   // metres
}

// ── Icons ────────────────────────────────────────────────────────────────────
// Nearest ones are larger with a soft glow ring so they stand out at a glance.

const makeHospitalIcon = (nearest: boolean) =>
  L.divIcon({
    className: "",
    html: nearest
      ? `<div style="width:36px;height:36px;background:white;border:2.5px solid #dc2626;border-radius:10px;
                     display:flex;align-items:center;justify-content:center;
                     box-shadow:0 0 0 6px rgba(220,38,38,0.15),0 2px 10px rgba(0,0,0,0.2);">
           <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#dc2626"
                stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
             <rect x="3" y="3" width="18" height="18" rx="2"/>
             <path d="M12 8v8M8 12h8"/>
           </svg>
         </div>`
      : `<div style="width:28px;height:28px;background:white;border:2px solid #dc2626;border-radius:8px;
                     display:flex;align-items:center;justify-content:center;
                     box-shadow:0 2px 8px rgba(0,0,0,0.15);">
           <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626"
                stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
             <rect x="3" y="3" width="18" height="18" rx="2"/>
             <path d="M12 8v8M8 12h8"/>
           </svg>
         </div>`,
    iconSize:    nearest ? [36, 36] : [28, 28],
    iconAnchor:  nearest ? [18, 18] : [14, 14],
    popupAnchor: [0, nearest ? -22 : -18],
  })

const makePoliceIcon = (nearest: boolean) =>
  L.divIcon({
    className: "",
    html: nearest
      ? `<div style="width:36px;height:36px;background:#1d4ed8;border-radius:10px;
                     display:flex;align-items:center;justify-content:center;
                     box-shadow:0 0 0 6px rgba(29,78,216,0.18),0 2px 10px rgba(0,0,0,0.2);">
           <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
             <path d="M12 2L4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3z"/>
           </svg>
         </div>`
      : `<div style="width:28px;height:28px;background:#1d4ed8;border-radius:8px;
                     display:flex;align-items:center;justify-content:center;
                     box-shadow:0 2px 8px rgba(0,0,0,0.15);">
           <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
             <path d="M12 2L4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3z"/>
           </svg>
         </div>`,
    iconSize:    nearest ? [36, 36] : [28, 28],
    iconAnchor:  nearest ? [18, 18] : [14, 14],
    popupAnchor: [0, nearest ? -22 : -18],
  })

// ── Component ────────────────────────────────────────────────────────────────

interface SafetyMarkersProps {
  showHospitals: boolean
  showPolice: boolean
  userLocation: [number, number] | null
  onNearestHospital?: (p: NearestPlace | null) => void
  onNearestPolice?: (p: NearestPlace | null) => void
}

export default function SafetyMarkers({
  showHospitals,
  showPolice,
  userLocation,
  onNearestHospital,
  onNearestPolice,
}: SafetyMarkersProps) {
  const [hospitals, setHospitals] = useState<SafetyPlace[]>([])
  const [police, setPolice]       = useState<SafetyPlace[]>([])

  // Fetch once per session
  useEffect(() => {
    if (!showHospitals || hospitals.length > 0) return
    fetch("http://localhost:8000/api/hospitals")
      .then((r) => r.json())
      .then((data: any[]) =>
        setHospitals(data.filter((h) => h.coordinates?.latitude && h.coordinates?.longitude))
      )
      .catch(() => {})
  }, [showHospitals])

  useEffect(() => {
    if (!showPolice || police.length > 0) return
    fetch("http://localhost:8000/api/police")
      .then((r) => r.json())
      .then((data: any[]) =>
        setPolice(data.filter((p) => p.coordinates?.latitude && p.coordinates?.longitude))
      )
      .catch(() => {})
  }, [showPolice])

  // Sort hospitals + police by distance whenever userLocation or data changes
  const hospitalsWithDist = useMemo(() => {
    if (!userLocation || !hospitals.length) return hospitals
    return [...hospitals]
      .map((h) => ({
        ...h,
        dist: calculateDistance(
          userLocation[0], userLocation[1],
          h.coordinates.latitude, h.coordinates.longitude,
        ),
      }))
      .sort((a, b) => (a.dist ?? Infinity) - (b.dist ?? Infinity))
  }, [hospitals, userLocation])

  const policeWithDist = useMemo(() => {
    if (!userLocation || !police.length) return police
    return [...police]
      .map((p) => ({
        ...p,
        dist: calculateDistance(
          userLocation[0], userLocation[1],
          p.coordinates.latitude, p.coordinates.longitude,
        ),
      }))
      .sort((a, b) => (a.dist ?? Infinity) - (b.dist ?? Infinity))
  }, [police, userLocation])

  // Report nearest back to MapPage for the sidebar summary
  useEffect(() => {
    const nearest = hospitalsWithDist[0]
    onNearestHospital?.(
      nearest && nearest.dist !== undefined
        ? { name: nearest.name, coords: [nearest.coordinates.latitude, nearest.coordinates.longitude], dist: nearest.dist }
        : null
    )
  }, [hospitalsWithDist])

  useEffect(() => {
    const nearest = policeWithDist[0]
    onNearestPolice?.(
      nearest && nearest.dist !== undefined
        ? { name: nearest.name, coords: [nearest.coordinates.latitude, nearest.coordinates.longitude], dist: nearest.dist }
        : null
    )
  }, [policeWithDist])

  // Clear nearest when layer is toggled off
  useEffect(() => { if (!showHospitals) onNearestHospital?.(null) }, [showHospitals])
  useEffect(() => { if (!showPolice)    onNearestPolice?.(null)    }, [showPolice])

  return (
    <>
      {showHospitals &&
        hospitalsWithDist.map((h, idx) => {
          const isNearest = idx === 0 && h.dist !== undefined
          return (
            <Marker
              key={`hospital-${h.id}`}
              position={[h.coordinates.latitude, h.coordinates.longitude]}
              icon={makeHospitalIcon(isNearest)}
              zIndexOffset={isNearest ? 1000 : 0}
            >
              <Popup>
                <div style={{ minWidth: "150px", fontFamily: "inherit" }}>
                  <p style={{ fontWeight: 700, fontSize: "12px", color: "#dc2626", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                    🏥 Hospital
                    {isNearest && (
                      <span style={{ fontSize: "10px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "999px", padding: "1px 6px", fontWeight: 600 }}>
                        Nearest
                      </span>
                    )}
                  </p>
                  <p style={{ fontSize: "11px", color: "#374151", lineHeight: "1.5", marginBottom: "4px" }}>{h.name}</p>
                  {h.dist !== undefined && (
                    <p style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500 }}>
                      📍 {formatDistance(h.dist)} from you
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}

      {showPolice &&
        policeWithDist.map((p, idx) => {
          const isNearest = idx === 0 && p.dist !== undefined
          return (
            <Marker
              key={`police-${p.id}`}
              position={[p.coordinates.latitude, p.coordinates.longitude]}
              icon={makePoliceIcon(isNearest)}
              zIndexOffset={isNearest ? 1000 : 0}
            >
              <Popup>
                <div style={{ minWidth: "150px", fontFamily: "inherit" }}>
                  <p style={{ fontWeight: 700, fontSize: "12px", color: "#1d4ed8", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                    🚔 Police Station
                    {isNearest && (
                      <span style={{ fontSize: "10px", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: "999px", padding: "1px 6px", fontWeight: 600 }}>
                        Nearest
                      </span>
                    )}
                  </p>
                  <p style={{ fontSize: "11px", color: "#374151", lineHeight: "1.5", marginBottom: "4px" }}>{p.name}</p>
                  {p.dist !== undefined && (
                    <p style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500 }}>
                      📍 {formatDistance(p.dist)} from you
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
    </>
  )
}
