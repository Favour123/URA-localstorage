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
              <th className="px-4 py-2 border-b">Latitude</th>
              <th className="px-4 py-2 border-b">Longitude</th>
              <th className="px-4 py-2 border-b">Distance (km)</th>
              <th className="px-4 py-2 border-b">Allowed</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-2 border-b">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-2 border-b">{log.latitude}</td>
                <td className="px-4 py-2 border-b">{log.longitude}</td>
                <td className="px-4 py-2 border-b">{log.distance_km}</td>
                <td className="px-4 py-2 border-b">
                  {log.allowed ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
