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

const toRad = (degrees) => {
  return degrees * (Math.PI/180);
};

const ipToNumber = (ip) => {
  return ip.split('.')
    .reduce((total, octet) => (total << 8) + parseInt(octet, 10), 0) >>> 0;
};

const isIPInRange = (ip, range) => {
  const [start, end] = range.split('-');
  const ipNum = ipToNumber(ip);
  const startNum = ipToNumber(start);
  const endNum = ipToNumber(end);
  return ipNum >= startNum && ipNum <= endNum;
};

const verifyLocation = async (req, res, next) => {
  // Skip location verification for admin routes
  if (req.path.startsWith('/api/admin')) {
    return next();
  }

  const { latitude, longitude } = req.body;
  const clientIP = req.ip || req.connection.remoteAddress;

  // Get allowed IP ranges from environment
  const allowedRanges = process.env.ADELEKE_IP_RANGES.split(',');

  // Check IP range
  const isIPValid = allowedRanges.some(range => isIPInRange(clientIP, range.trim()));

  // Check GPS coordinates if provided
  let isGPSValid = false;
  if (latitude && longitude) {
    const distance = calculateDistance(
      latitude,
      longitude,
      parseFloat(process.env.ADELEKE_LATITUDE),
      parseFloat(process.env.ADELEKE_LONGITUDE)
    );
    isGPSValid = distance <= parseFloat(process.env.MAX_DISTANCE_KM);
  }

  // Allow access if either IP or GPS validation passes
  if (isIPValid || isGPSValid) {
    next();
  } else {
    res.status(403).json({
      message: 'Access restricted to Adeleke University campus',
      details: {
        ip: clientIP,
        gps: latitude && longitude ? { latitude, longitude } : null,
        timestamp: new Date().toISOString()
      }
    });
  }
};

module.exports = verifyLocation; 