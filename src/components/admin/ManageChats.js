import { useState, useEffect } from 'react';
import { getQuestions, saveQuestions } from '../../utils/localStorage';

export default function ManageChats() {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load questions from localStorage
  useEffect(() => {
    const storedQuestions = getQuestions();
    setQuestions(storedQuestions);
  }, []);

  const handleSubmitResponse = (e) => {
    e.preventDefault();
    if (!selectedQuestion || !response.trim()) return;

    setSubmitting(true);
    try {
      // Update the question with response
      const updatedQuestions = questions.map(q => 
        q.id === selectedQuestion.id
          ? { ...q, response: response.trim(), isAnswered: true }
          : q
      );
      
      // Save to localStorage and update state
      saveQuestions(updatedQuestions);
      setQuestions(updatedQuestions);
      
      setSelectedQuestion(null);
      setResponse('');
    } catch (error) {
      console.error('Failed to submit response:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = (questionId) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    saveQuestions(updatedQuestions);
    setQuestions(updatedQuestions);
    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion(null);
      setResponse('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Questions List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-medium text-gray-900">Forum Questions</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {questions.length === 0 ? (
                  <div className="px-6 py-4 text-center text-gray-500">
                    No questions yet
                  </div>
                ) : (
                  questions.map((q) => (
                    <div
                      key={q.id}
                      className={`px-6 py-4 cursor-pointer hover:bg-gray-50 ${
                        selectedQuestion?.id === q.id ? 'bg-gray-50' : ''
                      }`}
                      onClick={() => {
                        setSelectedQuestion(q);
                        setResponse(q.response || '');
                      }}
                    >
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
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              q.isAnswered
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {q.isAnswered ? 'Answered' : 'Pending'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuestion(q.id);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-900">{q.question}</p>
                        {q.response && (
                          <div className="mt-2 bg-gray-50 rounded p-3">
                            <p className="text-sm text-gray-700">{q.response}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Response Form */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg sticky top-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Respond to Question</h3>
              </div>
              {selectedQuestion ? (
                <form onSubmit={handleSubmitResponse} className="p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Selected Question
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{selectedQuestion.question}</p>
                    <p className="mt-1 text-sm text-gray-500">From: {selectedQuestion.email}</p>
                  </div>
                  <div>
                    <label htmlFor="response" className="block text-sm font-medium text-gray-700">
                      Your Response
                    </label>
                    <textarea
                      id="response"
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedQuestion(null);
                        setResponse('');
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Response'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  Select a question to respond
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 