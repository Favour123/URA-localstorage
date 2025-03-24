import { useState, useEffect } from 'react';
import { verifyLocationAccess, getLocationDetails } from '../../utils/locationVerification';

export default function LocationRestriction({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [locationDetails, setLocationDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const access = await verifyLocationAccess();
    if (!access) {
      const details = await getLocationDetails();
      setLocationDetails(details);
    }
    setHasAccess(access);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your location...</p>
          <p className="mt-2 text-sm text-gray-500">Please allow location access if prompted</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>
            <p className="text-gray-600 mb-6">
              This resource is only accessible from within Adeleke University campus (within 5km radius).
            </p>
            <div className="text-sm text-gray-500 mb-4">
              <p>Please ensure:</p>
              <ul className="list-disc list-inside mt-2">
                <li>You are physically present on campus</li>
                <li>You have enabled location services</li>
                <li>You are connected to the university network</li>
              </ul>
            </div>
            
            {locationDetails && (
              <div className="mt-6">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
                {showDetails && (
                  <div className="mt-4 text-left bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600">
                      <strong>Your Location:</strong><br />
                      {locationDetails.gps ? (
                        <>
                          Latitude: {locationDetails.gps.latitude.toFixed(4)}<br />
                          Longitude: {locationDetails.gps.longitude.toFixed(4)}
                        </>
                      ) : (
                        'GPS location not available'
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>IP Address:</strong> {locationDetails.ip}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Time:</strong> {new Date(locationDetails.timestamp).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={checkAccess}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
} 