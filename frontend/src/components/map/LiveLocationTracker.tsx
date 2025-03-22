'use client';

import { useState, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import { calculateDistance } from './routeSafety';

interface LiveLocationTrackerProps {
  onLocationUpdate: (position: [number, number]) => void;
  destination: [number, number] | null;
  onSignificantMove?: (newPosition: [number, number], distance: number) => void;
  followUser?: boolean;
  updateFrequency?: number; // How often to update the map in ms
  significantMoveDistance?: number; // Distance in meters that constitutes a significant move
}

/**
 * Component that tracks user's live location and updates the map
 * It also triggers route recalculation when significant movement is detected
 */
export default function LiveLocationTracker({ 
  onLocationUpdate,
  destination,
  onSignificantMove,
  followUser = true,
  updateFrequency = 5000, // 5 seconds by default
  significantMoveDistance = 50 // 50 meters by default
}: LiveLocationTrackerProps) {
  const map = useMap();
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastReportedPositionRef = useRef<[number, number] | null>(null);
  
  useEffect(() => {
    // Only start tracking if we have a destination
    if (!destination) return;
    
    const handlePositionSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const newPosition: [number, number] = [latitude, longitude];
      
      setPosition(newPosition);
      onLocationUpdate(newPosition);
      
      // Center map on user if followUser is true
      if (followUser && map) {
        map.setView(newPosition, map.getZoom());
      }
      
      // Check if this movement is significant enough to recalculate the route
      if (onSignificantMove && lastReportedPositionRef.current) {
        const distanceMoved = calculateDistance(
          lastReportedPositionRef.current[0],
          lastReportedPositionRef.current[1],
          newPosition[0],
          newPosition[1]
        );
        
        if (distanceMoved > significantMoveDistance) {
          console.log(`Significant movement detected: ${distanceMoved.toFixed(2)}m`);
          onSignificantMove(newPosition, distanceMoved);
          lastReportedPositionRef.current = newPosition;
        }
      } else if (!lastReportedPositionRef.current) {
        lastReportedPositionRef.current = newPosition;
      }
    };
    
    const handlePositionError = (error: GeolocationPositionError) => {
      let errorMessage = "Unknown location error";
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location permission denied. Please enable location services.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information is unavailable.";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timed out.";
          break;
      }
      
      setError(errorMessage);
      console.error("Location error:", errorMessage);
    };
    
    // Watch position with high accuracy
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };
      
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePositionSuccess,
        handlePositionError,
        options
      );
      
      // Also get position immediately
      navigator.geolocation.getCurrentPosition(
        handlePositionSuccess,
        handlePositionError,
        options
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
    
    // Cleanup function
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [map, destination, followUser, onLocationUpdate, onSignificantMove, significantMoveDistance, updateFrequency]);
  
  return null; // This component doesn't render anything visible
}