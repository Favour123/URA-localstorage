// Adeleke University coordinates
const ADELEKE_COORDINATES = {
    Latitude: 6.5244,
    Longitude: 3.3792
};

// Maximum allowed distance from campus in kilometers
const MAX_DISTANCE_KM = 5;

// Adeleke University IP ranges (replace with actual ranges)
const ADELEKE_IP_RANGES = [
    { start: '197.211.52.176', end: '197.211.52.255' }, // Example range
  // Add more IP ranges for Adeleke University
];

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Convert degrees to radians
const toRad = (degrees) => {
  return degrees * (Math.PI/180);
};

// Convert IP to number for comparison
const ipToNumber = (ip) => {
  return ip.split('.')
    .reduce((total, octet) => (total << 8) + parseInt(octet, 10), 0) >>> 0;
};

// Check if IP is within allowed ranges
const isIPInRange = (ip, range) => {
  const ipNum = ipToNumber(ip);
  const startNum = ipToNumber(range.start);
  const endNum = ipToNumber(range.end);
  return ipNum >= startNum && ipNum <= endNum;
};

// Check GPS location
const checkGPSLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      resolve(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const distance = calculateDistance(
          position.coords.latitude,
          position.coords.longitude,
          ADELEKE_COORDINATES.latitude,
          ADELEKE_COORDINATES.longitude
        );
        resolve(distance <= MAX_DISTANCE_KM);
      },
      (error) => {
        console.error('Error getting location:', error);
        resolve(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
};

// Check IP address
const checkIPAddress = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    const userIP = data.ip;
    
    return ADELEKE_IP_RANGES.some(range => isIPInRange(userIP, range));
  } catch (error) {
    console.error('Error checking IP:', error);
    return false;
  }
};

// Main verification function that combines both checks
export const verifyLocationAccess = async () => {
  // Check if user has a valid session token
  const sessionToken = localStorage.getItem('adeleke_session');
  if (sessionToken) {
    const tokenData = JSON.parse(sessionToken);
    const oneHour = 60 * 60 * 1000; // Session expires after 1 hour
    
    if (Date.now() - tokenData.timestamp < oneHour) {
      return true;
    }
    localStorage.removeItem('adeleke_session');
  }

  try {
    // Perform both GPS and IP checks
    const [isGPSValid, isIPValid] = await Promise.all([
      checkGPSLocation(),
      checkIPAddress()
    ]);

    // User must pass at least one verification method
    const isLocationValid = isGPSValid || isIPValid;

    if (isLocationValid) {
      // Store session token with timestamp
      localStorage.setItem('adeleke_session', JSON.stringify({
        timestamp: Date.now(),
        gpsValid: isGPSValid,
        ipValid: isIPValid
      }));
      return true;
    }

    return false;
  } catch (error) {
    console.error('Location verification failed:', error);
    return false;
  }
};

// Get user's location details for debugging
export const getLocationDetails = async () => {
  const gpsLocation = await new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      () => resolve(null)
    );
  });

  const ipResponse = await fetch('https://api.ipify.org?format=json');
  const ipData = await ipResponse.json();

  return {
    gps: gpsLocation,
    ip: ipData.ip,
    timestamp: new Date().toISOString()
  };
}; 