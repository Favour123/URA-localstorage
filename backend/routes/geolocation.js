const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const verifyLocation = require('../middleware/locationVerification');

// Validation middleware
const validateCoordinates = [
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 })
];

// Verify location
router.post('/verify', validateCoordinates, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { latitude, longitude } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;

    // Get allowed IP ranges from environment
    const allowedRanges = process.env.ADELEKE_IP_RANGES.split(',');

    // Check IP range
    const isIPValid = allowedRanges.some(range => isIPInRange(clientIP, range.trim()));

    // Check GPS coordinates
    const distance = calculateDistance(
      latitude,
      longitude,
      parseFloat(process.env.ADELEKE_LATITUDE),
      parseFloat(process.env.ADELEKE_LONGITUDE)
    );
    const isGPSValid = distance <= parseFloat(process.env.MAX_DISTANCE_KM);

    // Generate verification token if either check passes
    if (isIPValid || isGPSValid) {
      const verificationToken = jwt.sign(
        {
          verified: true,
          ip: clientIP,
          coordinates: { latitude, longitude },
          timestamp: Date.now()
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        verified: true,
        verificationToken,
        details: {
          ip: clientIP,
          coordinates: { latitude, longitude },
          distance: isGPSValid ? distance : null,
          verificationMethod: isIPValid ? 'ip' : 'gps'
        }
      });
    } else {
      res.status(403).json({
        verified: false,
        message: 'Location verification failed',
        details: {
          ip: clientIP,
          coordinates: { latitude, longitude },
          distance,
          maxAllowedDistance: process.env.MAX_DISTANCE_KM,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Location verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper functions
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

module.exports = router; 