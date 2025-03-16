import type { Incident, SafetyPoint } from "../../../data/schema";
import { calculateSafetyScore } from "./safetyScore";

export async function fetchSafetyPoints(bounds: L.LatLngBounds): Promise<SafetyPoint[]> {
  const response = await fetch(`https://overpass-api.de/api/interpreter`, {
    method: 'POST',
    body: `
      [out:json];
      (
        way["amenity"="hospital"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
        way["amenity"="police"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      );
      out center;
    `
  });

  const data = await response.json();
  
  return data.elements.map((element: any) => ({
    id: element.id,
    type: element.tags.amenity,
    name: element.tags.name || 'Unnamed',
    latitude: element.center.lat,
    longitude: element.center.lon
  }));
}

export function generateHeatmapData(incidents: Incident[]): number[][] {
  return incidents.map(incident => [
    incident.latitude,
    incident.longitude,
    getIntensity(incident.severity)
  ]);
}

function getIntensity(severity: string): number {
  switch (severity.toLowerCase()) {
    case 'critical': return 1.0;
    case 'high': return 0.75;
    case 'medium': return 0.5;
    case 'low': return 0.25;
    default: return 0.25;
  }
}

export function calculateAreaSafety(
  bounds: L.LatLngBounds,
  incidents: Incident[],
  safetyPoints: SafetyPoint[],
  gridSize: number = 10
): { lat: number; lng: number; score: number; }[] {
  const safetyGrid = [];
  const latStep = (bounds.getNorth() - bounds.getSouth()) / gridSize;
  const lngStep = (bounds.getEast() - bounds.getWest()) / gridSize;

  for (let lat = bounds.getSouth(); lat <= bounds.getNorth(); lat += latStep) {
    for (let lng = bounds.getWest(); lng <= bounds.getEast(); lng += lngStep) {
      const { score } = calculateSafetyScore(lat, lng, incidents, safetyPoints);
      safetyGrid.push({ lat, lng, score });
    }
  }

  return safetyGrid;
}
