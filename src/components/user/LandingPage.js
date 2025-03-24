import { useState } from 'react';
import { Link } from 'react-router-dom';

const RESOURCE_CATEGORIES = [
  {
    id: 'lecture-notes',
    title: 'Lecture Notes',
    description: 'Access comprehensive lecture notes and study materials',
    image: 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    icon: '📚'
  },
  {
    id: 'research-papers',
    title: 'Research Papers',
    description: 'Browse through academic research papers and publications',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    icon: '📑'
  },
  {
    id: 'past-questions',
    title: 'Past Questions',
    description: 'Practice with previous exam questions and solutions',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    icon: '❓'
  },
  {
    id: 'journal-papers',
    title: 'Journal Papers',
    description: 'Access academic journals and scholarly articles',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    icon: '📰'
  },
  {
    id: 'conference-videos',
    title: 'Conference Videos',
    description: 'Watch recordings of academic conferences and presentations',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    icon: '🎥'
  },
  {
    id: 'other-resources',
    title: 'Other Resources',
    description: 'Additional learning materials and resources',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    icon: '📌'
  }
];

export default function LandingPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Learning Resources</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full max-w-2xl rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Resource Categories Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCE_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              to={`/resources/${category.id}`}
              className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div className="aspect-w-16 aspect-h-9 relative">
                <img
                  src={category.image}
                  alt={category.title}
                  className="object-cover w-full h-48"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <span className="text-4xl">{category.icon}</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.title}
                </h3>
                <p className="text-gray-600">{category.description}</p>
                <div className="mt-4 flex justify-end">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                    View Resources
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}