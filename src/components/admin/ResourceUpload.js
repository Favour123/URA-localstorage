import { useState } from 'react';
import { addResource } from '../../utils/localStorage';

const RESOURCE_CATEGORIES = {
  'lecture-notes': {
    title: 'Lecture Notes',
    allowedTypes: ['.pdf', '.docx', '.ppt', '.pptx']
  },
  'research-papers': {
    title: 'Research Papers',
    allowedTypes: ['.pdf']
  },
  'past-questions': {
    title: 'Past Questions',
    allowedTypes: ['.pdf', '.docx']
  },
  'journal-papers': {
    title: 'Journal Papers',
    allowedTypes: ['.pdf']
  },
  'conference-videos': {
    title: 'Conference Videos',
    allowedTypes: ['.mp4', '.webm']
  },
  'other-resources': {
    title: 'Other Resources',
    allowedTypes: ['.pdf', '.docx', '.mp4', '.zip']
  }
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function ResourceUpload() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    courseCode: '',
    author: '',
    department: '',
    level: '',
    semester: '',
    academicYear: '',
    tags: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateFile = (file) => {
    if (!file) return 'Please select a file';
    if (file.size > MAX_FILE_SIZE) return 'File size exceeds 50MB limit';
    
    const category = RESOURCE_CATEGORIES[formData.category];
    if (!category) return 'Please select a valid category';

    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!category.allowedTypes.includes(fileExtension)) {
      return `Invalid file type. Allowed types for ${category.title}: ${category.allowedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setMessage({ type: 'error', text: error });
        return;
      }
      setFormData(prev => ({
        ...prev,
        file
      }));
      setMessage({ type: '', text: '' });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setMessage({ type: 'error', text: error });
        return;
      }
      setFormData(prev => ({
        ...prev,
        file
      }));
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      setMessage({ type: 'error', text: 'Please select a category' });
      return;
    }

    const error = validateFile(formData.file);
    if (error) {
      setMessage({ type: 'error', text: error });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      // Create resource object
      const resource = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        courseCode: formData.courseCode,
        author: formData.author,
        department: formData.department,
        level: formData.level,
        semester: formData.semester,
        academicYear: formData.academicYear,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        fileType: formData.file.name.split('.').pop().toUpperCase(),
        fileSize: formData.file.size,
        uploadDate: new Date().toISOString(),
        downloads: 0,
        fileUrl: URL.createObjectURL(formData.file) // Temporary URL for demo
      };

      // Add resource to localStorage
      addResource(resource);

      setMessage({
        type: 'success',
        text: 'Resource uploaded successfully!'
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        courseCode: '',
        author: '',
        department: '',
        level: '',
        semester: '',
        academicYear: '',
        tags: '',
        file: null
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to upload resource. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-medium text-gray-900">Upload Resource</h2>
          </div>

          {message.text && (
            <div
              className={`px-6 py-4 ${
                message.type === 'success' ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <p
                className={`text-sm ${
                  message.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select a category</option>
                  {Object.entries(RESOURCE_CATEGORIES).map(([key, { title }]) => (
                    <option key={key} value={key}>
                      {title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            {/* Course Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700">
                  Course Code
                </label>
                <input
                  type="text"
                  id="courseCode"
                  name="courseCode"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={formData.courseCode}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                  Author/Lecturer
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={formData.author}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Academic Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={formData.department}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                  Level
                </label>
                <select
                  id="level"
                  name="level"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={formData.level}
                  onChange={handleInputChange}
                >
                  <option value="">Select level</option>
                  <option value="100">100 Level</option>
                  <option value="200">200 Level</option>
                  <option value="300">300 Level</option>
                  <option value="400">400 Level</option>
                  <option value="500">500 Level</option>
                  <option value="postgraduate">Postgraduate</option>
                </select>
              </div>

              <div>
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                  Semester
                </label>
                <select
                  id="semester"
                  name="semester"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={formData.semester}
                  onChange={handleInputChange}
                >
                  <option value="">Select semester</option>
                  <option value="first">First Semester</option>
                  <option value="second">Second Semester</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700">
                  Academic Year
                </label>
                <input
                  type="text"
                  id="academicYear"
                  name="academicYear"
                  placeholder="e.g., 2023/2024"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  placeholder="Separate tags with commas"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={formData.tags}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">File *</label>
              <div
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md ${
                  dragActive ? 'border-primary-500 bg-primary-50' : ''
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
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
                      className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
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
                    {formData.category
                      ? `Allowed types: ${RESOURCE_CATEGORIES[formData.category].allowedTypes.join(
                          ', '
                        )}`
                      : 'Please select a category first'}
                  </p>
                  <p className="text-xs text-gray-500">Maximum file size: 50MB</p>
                </div>
              </div>
              {formData.file && (
                <p className="mt-2 text-sm text-gray-500">
                  Selected file: {formData.file.name} ({(formData.file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {uploading ? (
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
                    Uploading...
                  </>
                ) : (
                  'Upload Resource'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 