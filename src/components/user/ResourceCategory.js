import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getResources,
  formatFileSize,
  getCategoryLabel,
} from "../../utils/resources";
import { supabase } from "../../utils/supabaseClient";

const CATEGORY_INFO = {
  "lecture-notes": {
    title: "Lecture Notes",
    icon: "📚",
    fileTypes: ["PDF", "DOCX", "PPT"],
  },
  "research-papers": {
    title: "Research Papers",
    icon: "📑",
    fileTypes: ["PDF"],
  },
  "past-questions": {
    title: "Past Questions",
    icon: "❓",
    fileTypes: ["PDF", "DOCX"],
  },
  "journal-papers": {
    title: "Journal Papers",
    icon: "📰",
    fileTypes: ["PDF"],
  },
  "conference-videos": {
    title: "Conference Videos",
    icon: "🎥",
    fileTypes: ["MP4", "WebM"],
  },
  "other-resources": {
    title: "Other Resources",
    icon: "📌",
    fileTypes: ["PDF", "DOCX", "MP4", "ZIP"],
  },
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "downloads", label: "Most Downloads" },
  { value: "title", label: "Title (A-Z)" },
];

export default function ResourceCategory() {
  const { category } = useParams();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const categoryInfo = CATEGORY_INFO[category] || {
    title: getCategoryLabel(category),
    icon: "📁",
    fileTypes: ["Various"],
  };

  useEffect(() => {
    const fetchCategoryResources = async () => {
      try {
        setLoading(true);
        console.log("Fetching resources for category:", category); // Debug log

        // Use the category from URL params to fetch resources
        const data = await getResources(category);
        console.log("Fetched resources:", data); // Debug log
        setResources(data);
    } catch (err) {
        console.error("Error fetching resources:", err);
        setError("Failed to load resources. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryResources();

    // Subscribe to changes in the resources table
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
          fetchCategoryResources();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [category]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const incrementDownloadCount = async (id) => {
    try {
      await supabase.rpc("increment_resource_downloads", { resource_id: id });
    } catch (error) {
      console.error("Error incrementing download count:", error);
    }
  };

  const filteredAndSortedResources = resources
    .filter(
      (resource) =>
        resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.upload_date) - new Date(a.upload_date);
        case "oldest":
          return new Date(a.upload_date) - new Date(b.upload_date);
        case "downloads":
          return b.downloads - a.downloads;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const getIconForType = (type) => {
    switch (type) {
      case "document":
        return (
          <svg
            className="w-8 h-8 text-indigo-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "image":
        return (
          <svg
            className="w-8 h-8 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "video":
        return (
          <svg
            className="w-8 h-8 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        );
      case "audio":
        return (
          <svg
            className="w-8 h-8 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-8 h-8 text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {categoryInfo.icon} {categoryInfo.title}
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Browse and download resources in this category
          </p>
      </div>

        {/* Search and Sort Controls */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="w-full md:w-1/2">
              <label htmlFor="search" className="sr-only">
                Search resources
              </label>
          <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
            <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search resources"
                  type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
              </div>
            </div>
            <div className="w-full md:w-auto">
              <label htmlFor="sort" className="sr-only">
                Sort by
              </label>
              <select
                id="sort"
                name="sort"
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredAndSortedResources.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No resources found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "No results match your search criteria. Try different keywords."
                : "There are currently no resources available in this category."}
            </p>
            </div>
          ) : (
          <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
            {filteredAndSortedResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getIconForType(resource.type)}
                  </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                    {resource.title}
                  </h3>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(resource.file_size)} •{" "}
                        {resource.downloads} downloads
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    {resource.description && (
                      <p className="text-sm text-gray-500 mb-4">
                        {resource.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(resource.upload_date).toLocaleDateString()}
                      </span>
                      <a
                        href={resource.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                        onClick={() => incrementDownloadCount(resource.id)}
                    >
                      Download
                    </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
      </div>
    </div>
  );
} 
