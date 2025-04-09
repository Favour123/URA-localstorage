import { supabase } from "./supabaseClient";

// Adeleke University coordinates
const ADELEKE_COORDINATES = {
  latitude: 7.6921403,
  longitude: 4.420958,
  //   latitude: 9.060352,

  // longitude: 7.448166
};

// Maximum allowed distance from campus in kilometers
const MAX_DISTANCE_KM = 200;

// Convert degrees to radians
const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

let cachedLocation = null;

export const verifyLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          console.log("User coordinates:", {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          console.log("Adeleke coordinates:", ADELEKE_COORDINATES);

        const distance = calculateDistance(
          position.coords.latitude,
          position.coords.longitude,
          ADELEKE_COORDINATES.latitude,
          ADELEKE_COORDINATES.longitude
        );

          console.log("Distance from Adeleke:", distance, "km");

          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            distance: distance.toFixed(2),
            allowed: distance <= MAX_DISTANCE_KM,
          };

          cachedLocation = locationData;
          await logAccessAttempt(locationData);

          resolve({
            allowed: distance <= MAX_DISTANCE_KM,
            distance: distance.toFixed(2),
            location: {
              latitude: position.coords.latitude.toFixed(6),
              longitude: position.coords.longitude.toFixed(6),
            },
            error:
              distance <= MAX_DISTANCE_KM
                ? null
                : `You are ${distance.toFixed(
                    2
                  )}km away from Adeleke University. Access is restricted to within ${MAX_DISTANCE_KM}km.`,
          });
        } catch (error) {
          console.error("Location verification error:", error);
          reject(error);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        reject(
          new Error("Please enable location services to access this content")
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

const logAccessAttempt = async (locationData) => {
  try {
    const { error } = await supabase.from("access_logs").insert([
      {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        distance_km: locationData.distance,
        allowed: locationData.allowed,
        timestamp: new Date().toISOString(),
      },
    ]);

    if (error) throw error;
  } catch (error) {
    console.error("Error logging access attempt:", error);
  }
};

export const clearLocationCache = () => {
  cachedLocation = null;
};

export const getLocationDetails = async () => {
  if (!cachedLocation) {
    try {
      await verifyLocation();
    } catch (error) {
      console.error("Error getting location:", error);
      return null;
    }
  }

  return {
    ...cachedLocation,
    timestamp: new Date().toISOString(),
  };
};
