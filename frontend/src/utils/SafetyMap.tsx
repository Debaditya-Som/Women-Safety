import axios from "axios";

export async function fetchNearbyPlaces(lat: number, lon: number, radius = 5000) {
  const query = `
    [out:json];
    (
      node["amenity"="hospital"](around:${radius}, ${lat}, ${lon});
      node["amenity"="police"](around:${radius}, ${lat}, ${lon});
    );
    out body;
  `;

  const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  try {
    const response = await axios.get(overpassUrl); // ✅ Use GET request instead of POST
    if (response.data.elements) {
      return response.data.elements.map((place: any) => ({
        name: place.tags.name || "Unknown",
        type: place.tags.amenity,
        latitude: place.lat,
        longitude: place.lon,
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching places:", error);
    return [];
  }
}
