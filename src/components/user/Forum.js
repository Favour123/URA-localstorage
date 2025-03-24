import { useState, useEffect } from 'react';
import {
  getQuestions,
  addQuestion,
  getUserEmail,
  saveUserEmail
} from '../../utils/localStorage';

export default function Forum() {
  const [question, setQuestion] = useState('');
  const [questions, setQuestions] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [pendingQuestion, setPendingQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial data from localStorage
  useEffect(() => {
    const storedQuestions = getQuestions();
    const storedEmail = getUserEmail();
    
    if (storedQuestions.length > 0) {
      setQuestions(storedQuestions);
    } else {
      // Initial mock data if no questions exist
      const initialQuestions = [
        {
          id: 1,
          question: 'How do I access the course materials?',
          email: 'user@example.com',
          timestamp: '2024-01-27T10:00:00',
          response: 'You can find all course materials on the home page. Use the search and filter options to locate specific resources.',
          isAnswered: true
        },
        {
          id: 2,
          question: 'When will the next batch of resources be uploaded?',
          email: 'student@example.com',
          timestamp: '2024-01-27T11:30:00',
          isAnswered: false
        }
      ];
      setQuestions(initialQuestions);
      addQuestion(initialQuestions[0]);
      addQuestion(initialQuestions[1]);
    }

    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    if (question.trim()) {
      if (!email) {
        setPendingQuestion(question.trim());
        setShowEmailModal(true);
      } else {
        submitQuestion(question.trim(), email);
      }
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email && pendingQuestion) {
      saveUserEmail(email);
      submitQuestion(pendingQuestion, email);
      setShowEmailModal(false);
      setPendingQuestion(null);
    }
  };

  const submitQuestion = (questionText, userEmail) => {
    const newQuestion = {
      id: Date.now(),
      question: questionText,
      email: userEmail,
      timestamp: new Date().toISOString(),
      isAnswered: false
    };
    
    addQuestion(newQuestion);
    setQuestions(prevQuestions => [newQuestion, ...prevQuestions]);
    setQuestion('');
  };

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Question Form */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <form onSubmit={handleQuestionSubmit} className="p-6">
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700">
                Ask a Question
              </label>
              <div className="mt-1">
                <textarea
                  id="question"
                  rows={3}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What would you like to know?"
                  required
                />
              </div>
            </div>
            <div className="mt-3">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Submit Question
              </button>
            </div>
          </form>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {q.email[0].toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{q.email}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(q.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      q.isAnswered
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {q.isAnswered ? 'Answered' : 'Pending'}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-gray-900">{q.question}</p>
                  {q.response && (
                    <div className="mt-4 bg-gray-50 rounded-md p-4">
                      <p className="text-sm text-gray-700">{q.response}</p>
                      {q.respondedBy && (
                        <p className="mt-2 text-xs text-gray-500">
                          Answered by {q.respondedBy.name} on {new Date(q.responseDate).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Please provide your email
              </h3>
              <form onSubmit={handleEmailSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmailModal(false);
                      setPendingQuestion(null);
                    }}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 