"use client"

import type React from "react"

import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet-routing-machine"


declare module "leaflet" {
  namespace Routing {
    function control(options: any): any;
  }
}
import "leaflet"

interface RouteProps {
  start: [number, number]
  end: [number, number]
}

interface RoutingMachineProps {
  route: RouteProps
}

const RoutingMachine: React.FC<RoutingMachineProps> = ({ route }) => {
  const map = useMap()

  useEffect(() => {
    if (!map || !route) return

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(route.start[0], route.start[1]), L.latLng(route.end[0], route.end[1])],
      routeWhileDragging: false,
      showAlternatives: true,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [
          { color: "#6366f1", opacity: 0.8, weight: 6 },
          { color: "#4f46e5", opacity: 0.9, weight: 4 },
        ],
      },
      altLineOptions: {
        styles: [
          { color: "#9ca3af", opacity: 0.6, weight: 4 },
          { color: "#6b7280", opacity: 0.7, weight: 2 },
        ],
      },
      createMarker: () => {
        return null 
      },
    }).addTo(map)

    return () => {
      map.removeControl(routingControl)
    }
  }, [map, route])

  return null
}

export default RoutingMachine

