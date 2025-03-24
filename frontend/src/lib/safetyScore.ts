import type { Incident, SafetyPoint } from "../../../data/schema";

const SAFETY_POINT_WEIGHT = 0.4;
const INCIDENT_WEIGHT = 0.6;
const MAX_SAFETY_DISTANCE = 2000; 

export interface SafetyScore {
  score: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  factors: string[];
}

export function calculateSafetyScore(
  lat: number,
  lng: number,
  incidents: Incident[],
  safetyPoints: SafetyPoint[],
  time?: string
): SafetyScore {
  const factors: string[] = [];
  let score = 100;

  const recentIncidents = incidents.filter(i => {
    const incidentDate = new Date(i.date);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return incidentDate >= sixMonthsAgo;
  });

  if (recentIncidents.length > 0) {
    const incidentImpact = recentIncidents.reduce((acc, incident) => {
      const distance = calculateDistance(lat, lng, incident.latitude, incident.longitude);
      const severity = getSeverityWeight(incident.severity);
      return acc + (severity / Math.max(distance, 100)) * 1000;
    }, 0);
    
    score -= Math.min(incidentImpact * INCIDENT_WEIGHT, 50);
    factors.push(`${recentIncidents.length} incidents reported nearby`);
  }

  const nearestPoints = safetyPoints.map(point => {
    const distance = calculateDistance(lat, lng, point.latitude, point.longitude);
    return { point, distance };
  }).sort((a, b) => a.distance - b.distance);

  if (nearestPoints.length > 0) {
    const safetyBonus = nearestPoints.reduce((acc, { point, distance }) => {
      if (distance <= MAX_SAFETY_DISTANCE) {
        return acc + (1 - distance / MAX_SAFETY_DISTANCE) * 10;
      }
      return acc;
    }, 0);
    
    score += Math.min(safetyBonus * SAFETY_POINT_WEIGHT, 20);
    factors.push(`${nearestPoints[0].point.type === 'hospital' ? 'Hospital' : 'Police station'} within ${Math.round(nearestPoints[0].distance)}m`);
  }

  // Time-based adjustment
  if (time) {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 22 || hour <= 4) {
      score *= 0.85;
      factors.push('Night time (higher risk)');
    }
  }

  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    riskLevel: getRiskLevel(score),
    factors
  };
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

function getSeverityWeight(severity: string): number {
  switch (severity.toLowerCase()) {
    case 'critical': return 1.0;
    case 'high': return 0.75;
    case 'medium': return 0.5;
    case 'low': return 0.25;
    default: return 0.25;
  }
}

function getRiskLevel(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (score >= 75) return 'Low';
  if (score >= 50) return 'Medium';
  if (score >= 25) return 'High';
  return 'Critical';
}
