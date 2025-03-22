import harassmentData from "../../../public/harassment_reports.json";
import { severityConfig } from "./MapComponent";

export interface RouteSegment {
  path: [number, number][]; // Array of [lat, lng] points
  risk: "safe" | "moderate" | "unsafe";
  distance: number; // in meters
  safetyScore: number; // 0-100
}

export interface RouteSafetyAnalysis {
  overallScore: number; // Overall safety score 0-100
  riskLevel: "Low" | "Moderate" | "High";
  segments: RouteSegment[];
  totalDistance: number;
  safePercentage: number;
  moderatePercentage: number;
  unsafePercentage: number;
  highRiskZoneCount: number;
}

// Constants
const RISK_THRESHOLD = {
    SAFE: 75, // Score >= 75 is safe
    MODERATE: 50, // Score >= 50 but < 75 is moderate
    // Below 50 is unsafe - Increased threshold to mark more segments as unsafe (red)
  };

const SEGMENT_LENGTH = 5; // Split route into segments of this many points

const INCIDENT_IMPACT_RADIUS = {
    low: 300, // meters
    medium: 500,
    high: 1000, // Increased from 800m to better detect routes passing through heat zones
    critical: 1200, // Increased from 1000m to better detect routes passing through heat zones
  };

// Helper function to calculate distance between two points in meters (Haversine formula)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Function to calculate safety score for a single point based on nearby incidents
function calculatePointSafetyScore(lat: number, lng: number): number {
    let score = 100; // Start with perfect score
    let incidentCount = 0;
    let highSeverityNearby = false;
  
    harassmentData.reports.forEach((incident) => {
      const distance = calculateDistance(lat, lng, incident.latitude, incident.longitude);
      const severityKey = incident.severity as keyof typeof INCIDENT_IMPACT_RADIUS;
      const impactRadius = INCIDENT_IMPACT_RADIUS[severityKey];
  
      // If point is within impact radius of an incident
      if (distance <= impactRadius) {
        // Calculate impact based on distance and severity
        // The closer to the incident and the more severe, the higher the impact
        const severityWeight = severityConfig[severityKey].weight;
        const distanceRatio = 1 - distance / impactRadius; // 0 when at edge, 1 when at center
        
        // Increase impact for heat zones (high and critical severity)
        const impact = severityKey === 'high' || severityKey === 'critical' 
          ? severityWeight * distanceRatio * 8  // Increased multiplier for heat zones
          : severityWeight * distanceRatio * 5; // Regular multiplier for other areas
        
        // Identify high severity incidents (high and critical) that are very close
        if ((severityKey === 'high' || severityKey === 'critical') && distance < impactRadius * 0.6) {
          highSeverityNearby = true;
          // Apply stronger penalty for very close high-severity incidents
          score -= Math.min(impact * 1.5, 40);
        } else {
          score -= Math.min(impact, 25); // Cap the impact per incident
        }
        
        incidentCount++;
      }
    });
  
    // If there are a lot of nearby incidents, further reduce the score
    if (incidentCount > 3) {
      score -= Math.min(incidentCount * 2, 20); // Additional penalty for high concentration
    }
    
    // Additional penalty for high severity incidents nearby - ensures route is marked RED
    if (highSeverityNearby) {
      score = Math.max(0, score - 20); // Ensure a significant reduction for heat zones
    }
  
    return Math.max(0, Math.min(100, score)); // Clamp between 0-100
  }

// Function to determine risk level of a segment based on safety score
function determineRiskLevel(safetyScore: number): "safe" | "moderate" | "unsafe" {
  if (safetyScore >= RISK_THRESHOLD.SAFE) return "safe";
  if (safetyScore >= RISK_THRESHOLD.MODERATE) return "moderate";
  return "unsafe";
}

// Function to calculate the total distance of a route segment
function calculateSegmentDistance(segment: [number, number][]): number {
  let totalDistance = 0;
  for (let i = 1; i < segment.length; i++) {
    totalDistance += calculateDistance(
      segment[i-1][0], segment[i-1][1], 
      segment[i][0], segment[i][1]
    );
  }
  return totalDistance;
}

// Main function to analyze a route for safety
export function analyzeRouteSafety(route: [number, number][]): RouteSafetyAnalysis {
  // Initialize result
  const result: RouteSafetyAnalysis = {
    overallScore: 0,
    riskLevel: "Low",
    segments: [],
    totalDistance: 0,
    safePercentage: 0,
    moderatePercentage: 0,
    unsafePercentage: 0,
    highRiskZoneCount: 0,
  };
  
  if (!route || route.length < 2) {
    return result; // Return empty result for invalid routes
  }
  
  // Calculate total route distance
  let totalDistance = 0;
  for (let i = 1; i < route.length; i++) {
    totalDistance += calculateDistance(
      route[i-1][0], route[i-1][1], 
      route[i][0], route[i][1]
    );
  }
  result.totalDistance = totalDistance;
  
  // Split route into segments and analyze each segment
  let currentSegment: [number, number][] = [];
  let totalScore = 0;
  
  for (let i = 0; i < route.length; i++) {
    currentSegment.push(route[i]);
    
    // When we reach the segment size (or end of route), analyze the segment
    if (currentSegment.length >= SEGMENT_LENGTH || i === route.length - 1) {
      // Calculate segment's safety score by averaging the scores of its points
      let segmentScore = 0;
      currentSegment.forEach(point => {
        segmentScore += calculatePointSafetyScore(point[0], point[1]);
      });
      segmentScore /= currentSegment.length;
      
      // Determine risk level
      const risk = determineRiskLevel(segmentScore);
      const segmentDistance = calculateSegmentDistance(currentSegment);
      
      // Add to result
      result.segments.push({
        path: [...currentSegment], // Clone the array
        risk,
        distance: segmentDistance,
        safetyScore: segmentScore,
      });
      
      // Update high risk zone count
      if (risk === "unsafe") {
        result.highRiskZoneCount++;
      }
      
      // Contribute to overall score (weighted by distance)
      totalScore += segmentScore * segmentDistance;
      
      // Start a new segment, but overlap with the last point for continuity
      currentSegment = [currentSegment[currentSegment.length - 1]];
    }
  }
  
  // Calculate overall score (weighted average by segment distance)
  result.overallScore = Math.round(totalScore / totalDistance);
  
  // Determine overall risk level
  if (result.overallScore >= 75) result.riskLevel = "Low";
  else if (result.overallScore >= 50) result.riskLevel = "Moderate";
  else result.riskLevel = "High";
  
  // Calculate percentages
  let safeDistance = 0;
  let moderateDistance = 0;
  let unsafeDistance = 0;
  
  result.segments.forEach(segment => {
    if (segment.risk === "safe") safeDistance += segment.distance;
    else if (segment.risk === "moderate") moderateDistance += segment.distance;
    else unsafeDistance += segment.distance;
  });
  
  result.safePercentage = Math.round((safeDistance / totalDistance) * 100);
  result.moderatePercentage = Math.round((moderateDistance / totalDistance) * 100);
  result.unsafePercentage = Math.round((unsafeDistance / totalDistance) * 100);
  
  // Ensure percentages add up to 100%
  const adjustmentNeeded = 100 - (result.safePercentage + result.moderatePercentage + result.unsafePercentage);
  if (adjustmentNeeded !== 0) {
    // Add to the largest category
    if (safeDistance >= moderateDistance && safeDistance >= unsafeDistance) {
      result.safePercentage += adjustmentNeeded;
    } else if (moderateDistance >= safeDistance && moderateDistance >= unsafeDistance) {
      result.moderatePercentage += adjustmentNeeded;
    } else {
      result.unsafePercentage += adjustmentNeeded;
    }
  }
  
  return result;
}

// Function to get color for a route segment based on risk level
export function getRouteSegmentColor(risk: "safe" | "moderate" | "unsafe"): string {
  switch (risk) {
    case "safe": return "#10b981"; // Green
    case "moderate": return "#f59e0b"; // Amber/Orange
    case "unsafe": return "#ef4444"; // Red
    default: return "#10b981"; // Default to safe (green)
  }
}

// Function to format distance in a human-readable way
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
}
