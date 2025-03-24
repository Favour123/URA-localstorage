import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResources, initializeMockData } from '../../utils/localStorage';

const CATEGORY_INFO = {
  'lecture-notes': {
    title: 'Lecture Notes',
    icon: '📚',
    fileTypes: ['PDF', 'DOCX', 'PPT']
  },
  'research-papers': {
    title: 'Research Papers',
    icon: '📑',
    fileTypes: ['PDF']
  },
  'past-questions': {
    title: 'Past Questions',
    icon: '❓',
    fileTypes: ['PDF', 'DOCX']
  },
  'journal-papers': {
    title: 'Journal Papers',
    icon: '📰',
    fileTypes: ['PDF']
  },
  'conference-videos': {
    title: 'Conference Videos',
    icon: '🎥',
    fileTypes: ['MP4', 'WebM']
  },
  'other-resources': {
    title: 'Other Resources',
    icon: '📌',
    fileTypes: ['PDF', 'DOCX', 'MP4', 'ZIP']
  }
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'downloads', label: 'Most Downloads' },
  { value: 'title', label: 'Title (A-Z)' }
];

export default function ResourceCategory() {
  const { categoryId } = useParams();
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const category = CATEGORY_INFO[categoryId];

  useEffect(() => {
    initializeMockData();
    const allResources = getResources();
    const categoryResources = allResources.filter(resource => 
      resource.category === categoryId
    );
    setResources(categoryResources);
  }, [categoryId]);

  const handleDownload = async (resourceId) => {
    try {
      // This function is no longer used as we're using localStorage
    } catch (err) {
      console.error('Failed to increment download count:', err);
    }
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Category not found</div>
      </div>
    );
  }

  const filteredAndSortedResources = resources
    .filter(resource =>
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploadDate) - new Date(a.uploadDate);
        case 'oldest':
          return new Date(a.uploadDate) - new Date(b.uploadDate);
        case 'downloads':
          return b.downloads - a.downloads;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Link to="/" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <span className="text-2xl">{category.icon}</span>
            <h1 className="text-3xl font-bold text-gray-900">{category.title}</h1>
          </div>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search resources..."
              className="w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Resources List */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedResources.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No resources found in this category
            </div>
          ) : (
            filteredAndSortedResources.map((resource) => (
              <div
                key={resource._id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {resource.fileType}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(resource.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {resource.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-13" />
                        </svg>
                        {resource.downloads} downloads
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {(resource.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <a
                      href={resource.fileUrl}
                      onClick={(e) => {
                        e.preventDefault();
                        handleDownload(resource._id);
                        window.open(resource.fileUrl, '_blank');
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 