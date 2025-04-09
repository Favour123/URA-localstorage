import React, { useState, useEffect } from "react";
import { verifyLocation } from "../../utils/locationVerification";

export default function LocationRestriction({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [locationInfo, setLocationInfo] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkLocation();
  }, []);

  const checkLocation = async () => {
    try {
      setLoading(true);
      const result = await verifyLocation();
      setIsAllowed(result.allowed);
      setLocationInfo(result);
    } catch (error) {
      console.error("Location check failed:", error);
      setIsAllowed(false);
      setLocationInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your location...</p>
          <p className="mt-2 text-sm text-gray-500">
            Please allow location access if prompted
          </p>
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Access Restricted
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {locationInfo?.error || "Unable to verify your location"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">
              This resource is only available within 10km of Adeleke University
            </p>
            {locationInfo?.distance && (
              <p className="mt-2 text-sm text-gray-500">
                You are currently {locationInfo.distance}km away
              </p>
            )}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-4 text-indigo-600 hover:text-indigo-500"
            >
              {showDetails ? "Hide Details" : "Show Details"}
            </button>
            {showDetails && locationInfo?.location && (
              <div className="mt-4 text-left bg-gray-100 p-4 rounded-md">
                <p className="text-sm">Your Location:</p>
                <p className="text-xs text-gray-500">
                  Latitude: {locationInfo.location.latitude}
                </p>
                <p className="text-xs text-gray-500">
                  Longitude: {locationInfo.location.longitude}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={checkLocation}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return children;
}
