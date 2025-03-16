export function determineRouteSafety(route: any[], hospitals: any[], policeStations: any[]) {
    const safetyThreshold = 1000; // 1 km radius
  
    for (let point of route) {
      for (let hospital of hospitals) {
        if (getDistance(point, [hospital.latitude, hospital.longitude]) < safetyThreshold) return "safe";
      }
      for (let policeStation of policeStations) {
        if (getDistance(point, [policeStation.latitude, policeStation.longitude]) < safetyThreshold) return "safe";
      }
    }
    return "unsafe";
  }
  
  export function getDistance(coord1: [number, number], coord2: [number, number]) {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180,
      φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  