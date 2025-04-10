import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import {
  getResources,
  updateResourceDownloads,
  formatFileSize,
} from "../../utils/supabaseData";

export default function ResourceDetail() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const loadResource = async () => {
    try {
      const resources = await getResources();
      const found = resources.find((r) => r.id === id);
      if (!found) throw new Error("Resource not found");
      setResource(found);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchResource = async () => {
      await loadResource();
    };
    fetchResource();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async () => {
    try {
      setDownloading(true);

      // Download the file
      const { data, error } = await supabase.storage
        .from("resources")
        .download(resource.file_path);

      if (error) throw error;

      // Create download link
      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = resource.title; // or use original filename if stored
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Update download count
      await updateResourceDownloads(resource.id);

      // Refresh resource data to show updated download count
      await loadResource();
    } catch (error) {
      console.error("Download error:", error);
      setError("Failed to download file. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!resource) return <div>Resource not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4">{resource.title}</h1>
        <div className="mb-6">
          <p className="text-gray-700">{resource.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium">{resource.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">File Type</p>
            <p className="font-medium">{resource.type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">File Size</p>
            <p className="font-medium">{resource.file_size}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Downloads</p>
            <p className="font-medium">{resource.downloads}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Upload Date</p>
            <p className="font-medium">
              {new Date(resource.upload_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {downloading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Downloading...
            </>
          ) : (
            "Download Resource"
          )}
        </button>
      </div>
    </div>
  );
}
