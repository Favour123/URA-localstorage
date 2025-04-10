import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getQuestions } from "../../utils/supabaseData";
import { supabase } from "../../utils/supabaseClient";

export default function Forum() {
  const [questions, setQuestions] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();

    // Set up real-time subscription
    const subscription = supabase
      .channel("public:questions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "questions",
        },
        () => {
          fetchQuestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await getQuestions();
      setQuestions(data);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = () => {
    navigate("/forum/ask");
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email && pendingQuestion) {
      navigate("/forum/ask", {
        state: {
          title: pendingQuestion.substring(0, 100),
          content: pendingQuestion,
          user_email: email,
        },
      });
      setShowEmailModal(false);
      setPendingQuestion(null);
    }
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Forum Discussions
          </h1>
          <button
            onClick={handleAskQuestion}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Ask a Question
          </button>
        </div>

        <div className="space-y-6">
          {questions.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">
                No questions have been asked yet. Be the first to ask a
                question!
              </p>
            </div>
          ) : (
            questions.map((q) => (
              <div
                key={q.id}
                className="bg-white shadow rounded-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {q.user_email && q.user_email.length > 0
                              ? q.user_email[0].toUpperCase()
                              : "?"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {q.user_email || "Anonymous"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(q.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        q.answers && q.answers.length > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {q.answers && q.answers.length > 0
                        ? "Answered"
                        : "Pending"}
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-gray-900">{q.title || q.content}</p>
                  </div>
                  <div className="mt-4 text-right">
                    <button
                      onClick={() => navigate(`/forum/question/${q.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
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
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email address <span className="text-red-500">*</span>
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
                  <p className="mt-1 text-xs text-gray-500">
                    Your email is required to submit a question.
                  </p>
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
