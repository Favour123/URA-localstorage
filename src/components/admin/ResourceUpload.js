import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../utils/supabaseClient";

const RESOURCE_CATEGORIES = [
  { value: "conference-videos", label: "Conference Videos" },
  { value: "lecture-notes", label: "Lecture Notes" },
  { value: "past-questions", label: "Past Questions" },
  { value: "research-papers", label: "Research Papers" },
  { value: "journal-papers", label: "Journal Papers" },
  { value: "textbooks", label: "Textbooks" },
  { value: "other-resources", label: "Other Resources" },
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function ResourceUpload() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(RESOURCE_CATEGORIES[0].value);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [newlyAddedId, setNewlyAddedId] = useState(null);
  const resourcesRef = useRef(null);

  // Subscribe to changes in the resources table
  useEffect(() => {
    const subscription = supabase
      .channel("public:resources")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "resources",
        },
        () => {
          fetchResources();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);

      // Direct query to resources table - this works now that the RLS policies are fixed
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("upload_date", { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
      setMessage({
        type: "error",
        text: "Failed to load resources. Please refresh the page.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Scroll to resources table after successful upload
  useEffect(() => {
    if (newlyAddedId && resourcesRef.current) {
      resourcesRef.current.scrollIntoView({ behavior: "smooth" });

      // Clear the highlight after 5 seconds
      const timer = setTimeout(() => {
        setNewlyAddedId(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [newlyAddedId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setMessage({
          type: "error",
          text: `File size exceeds the limit of ${formatFileSize(
            MAX_FILE_SIZE
          )}`,
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setMessage({
        type: "error",
        text: "You must be logged in to upload resources.",
      });
      return;
    }

    if (!file) {
      setMessage({ type: "error", text: "Please select a file to upload." });
      return;
    }

    if (!title) {
      setMessage({ type: "error", text: "Please enter a title." });
      return;
    }

    setUploading(true);
    setMessage({ type: "", text: "" });

    try {
      // Determine file type
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const fileType = getFileType(fileExtension);

      // Create a unique filename
      const fileName = `${category}/${Date.now()}_${file.name.replace(
        /\s+/g,
        "_"
      )}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("resources")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL for the file
      const { data: urlData } = supabase.storage
        .from("resources")
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error("Failed to get public URL for the file");
      }

      console.log("Uploading resource with category:", category);

      // Add record to resources table directly
      const { data: insertData, error: insertError } = await supabase
        .from("resources")
        .insert([
          {
            title,
            description,
            category,
            type: fileType,
            download_url: urlData.publicUrl,
            file_path: fileName,
            file_size: file.size,
            created_by: user.id,
            upload_date: new Date().toISOString(),
          },
        ])
        .select();

      if (insertError) throw insertError;

      // Set the newly added ID for highlighting
      if (insertData && insertData[0]) {
        setNewlyAddedId(insertData[0].id);
      }

      // Reset form
      setFile(null);
      setTitle("");
      setDescription("");
      setCategory(RESOURCE_CATEGORIES[0].value);

      // Show success message
      setMessage({
        type: "success",
        text: "Resource uploaded successfully!",
      });

      // Refresh resources list
      await fetchResources();

      // Scroll to the resources section
      if (resourcesRef.current) {
        resourcesRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error uploading resource:", error);
      setMessage({
        type: "error",
        text:
          "Failed to upload resource: " +
          (error.message || "Please try again."),
      });
    } finally {
      setUploading(false);
    }
  };

  const getFileType = (extension) => {
    const documentTypes = ["pdf", "doc", "docx", "txt", "rtf"];
    const imageTypes = ["jpg", "jpeg", "png", "gif", "bmp"];
    const videoTypes = ["mp4", "avi", "mov", "wmv"];
    const audioTypes = ["mp3", "wav", "ogg"];

    if (documentTypes.includes(extension)) return "document";
    if (imageTypes.includes(extension)) return "image";
    if (videoTypes.includes(extension)) return "video";
    if (audioTypes.includes(extension)) return "audio";
    return "other";
  };

  // Show delete confirmation dialog instead of using window.confirm
  const handleDeleteClick = (id, filePath) => {
    setResourceToDelete({ id, filePath });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!resourceToDelete) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("resources")
        .remove([resourceToDelete.filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("resources")
        .delete()
        .eq("id", resourceToDelete.id);

      if (dbError) throw dbError;

      // Refresh list
      fetchResources();

      setMessage({
        type: "success",
        text: "Resource deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting resource:", error);
      setMessage({
        type: "error",
        text: "Failed to delete resource. Please try again.",
      });
    } finally {
      setShowDeleteConfirm(false);
      setResourceToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setResourceToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirm Deletion
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete this resource? This action
                cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-medium text-gray-900">
              Upload Resource
            </h2>
          </div>

          {message.text && (
            <div
              className={`px-6 py-4 ${
                message.type === "success" ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <p
                className={`text-sm ${
                  message.type === "success" ? "text-green-700" : "text-red-700"
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {/* Title Field */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            {/* Description Field */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Category Field */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                {RESOURCE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                File
              </label>
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        required
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, XLS, PPT, MP4, MP3, JPG, PNG up to{" "}
                    {formatFileSize(MAX_FILE_SIZE)}
                  </p>
                  {file && (
                    <p className="text-sm text-indigo-600 font-medium">
                      Selected: {file.name} ({formatFileSize(file.size)})
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-5">
              <button
                type="submit"
                disabled={uploading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload Resource"}
              </button>
            </div>
          </form>
        </div>

        {/* Resources List */}
        <div ref={resourcesRef} className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-medium text-gray-900">
              Manage Resources
            </h2>
          </div>

          <div className="px-6 py-4">
            {loading ? (
              <p className="text-center text-gray-500">Loading resources...</p>
            ) : resources.length === 0 ? (
              <p className="text-center text-gray-500">
                No resources available.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Title
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Category
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Size
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Downloads
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Uploaded
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {resources.map((resource) => (
                      <tr
                        key={resource.id}
                        className={
                          newlyAddedId === resource.id
                            ? "bg-green-50 transition-colors duration-1000"
                            : ""
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {resource.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {RESOURCE_CATEGORIES.find(
                            (cat) => cat.value === resource.category
                          )?.label || resource.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {resource.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatFileSize(resource.file_size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {resource.downloads}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(resource.upload_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a
                            href={resource.download_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            View
                          </a>
                          <button
                            onClick={() =>
                              handleDeleteClick(resource.id, resource.file_path)
                            }
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
