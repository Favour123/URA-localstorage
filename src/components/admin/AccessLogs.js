import React, { useState, useEffect } from "react";
import { fetchAccessLogs } from "../../utils/locationVerification";

export default function AccessLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAccessLogs();
  }, []);

  const loadAccessLogs = async () => {
    try {
      setLoading(true);
      const data = await fetchAccessLogs();
      setLogs(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error loading access logs:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading access logs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Access Logs</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Time</th>
              <th className="px-4 py-2 border-b">Location</th>
              <th className="px-4 py-2 border-b">Distance (km)</th>
              <th className="px-4 py-2 border-b">Status</th>
              <th className="px-4 py-2 border-b">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr
                key={log.id}
                className={log.allowed ? "bg-green-50" : "bg-red-50"}
              >
                <td className="px-4 py-2 border-b">
                  {new Date(log.log_timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-2 border-b">
                  {log.latitude.toFixed(6)}, {log.longitude.toFixed(6)}
                </td>
                <td className="px-4 py-2 border-b">{log.distance_km}</td>
                <td className="px-4 py-2 border-b">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      log.allowed
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {log.allowed ? "Allowed" : "Denied"}
                  </span>
                </td>
                <td className="px-4 py-2 border-b">
                  <button
                    onClick={() => {
                      const details = log.details || {};
                      alert(JSON.stringify(details, null, 2));
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
