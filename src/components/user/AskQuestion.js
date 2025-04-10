import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { addQuestion } from "../../utils/supabaseData";

export default function AskQuestion() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    user_email: "",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Use pre-filled data if available from navigation state
  useEffect(() => {
    if (location.state) {
      setFormData({
        title: location.state.title || "",
        content: location.state.content || "",
        user_email: location.state.user_email || "",
      });
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.user_email.trim()) {
      setError("Please provide your email address");
      return;
    }

    if (!formData.content.trim()) {
      setError("Please provide your question");
      return;
    }

    try {
      setSubmitting(true);
      const question = await addQuestion({
        title: formData.title || "Question",
        content: formData.content,
        user_email: formData.user_email,
      });
      navigate(`/forum/question/${question.id}`);
    } catch (err) {
      console.error("Error posting question:", err);
      setError("Failed to post question. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="text-2xl font-bold text-gray-900">Ask a Question</h1>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700"
              >
                Your Question <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <textarea
                  id="content"
                  name="content"
                  rows={4}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  placeholder="Type your question here..."
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="user_email"
                className="block text-sm font-medium text-gray-700"
              >
                Your Email <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="user_email"
                  id="user_email"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.user_email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email address"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Required to submit a question. We'll use this to notify you when
                your question is answered.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/forum")}
                className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Question"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
