import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";

export default function ManageChats() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responses, setResponses] = useState({});
  const [submitting, setSubmitting] = useState({});
  const { user } = useAuth();

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

    const answersSubscription = supabase
      .channel("public:answers")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "answers",
        },
        () => {
          fetchQuestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
      supabase.removeChannel(answersSubscription);
    };
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);

      // Direct query to get questions with their answers
      const { data, error } = await supabase
        .from("questions")
        .select(
          `
          *,
          answers(*)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmitResponse = async (questionId) => {
    if (!responses[questionId]?.trim()) return;

    try {
      setSubmitting((prev) => ({ ...prev, [questionId]: true }));

      // Direct insert to answers table
      const { error } = await supabase.from("answers").insert([
        {
          question_id: questionId,
          content: responses[questionId],
          admin_id: user?.id,
          admin_email: user?.email || "Admin",
        },
      ]);

      if (error) throw error;

      // Clear the response field
      setResponses((prev) => ({
        ...prev,
        [questionId]: "",
      }));

      // Refresh questions to show the new answer
      fetchQuestions();
    } catch (err) {
      console.error("Error submitting response:", err);
      alert("Failed to submit response. Please try again.");
    } finally {
      setSubmitting((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-bold">Error</p>
          <p>{error}</p>
          <button
            onClick={fetchQuestions}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Manage Forum Questions
      </h1>

      {questions.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
          <p className="text-gray-500">No questions have been submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((question) => (
            <div
              key={question.id}
              className="bg-white shadow overflow-hidden sm:rounded-lg"
            >
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {question.title || question.question}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Posted by {question.user_email || question.email} on{" "}
                  {new Date(
                    question.created_at || question.timestamp
                  ).toLocaleString()}
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <p className="text-gray-900">
                  {question.content || question.question}
                </p>

                {question.answers && question.answers.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-3">
                      Answers:
                    </h4>
                    <div className="space-y-4">
                      {question.answers.map((answer) => (
                        <div
                          key={answer.id}
                          className="bg-gray-50 p-4 rounded-md"
                        >
                          <p className="text-gray-800">{answer.content}</p>
                          <p className="mt-2 text-xs text-gray-500">
                            Answered by {answer.user_email} on{" "}
                            {new Date(answer.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <label
                    htmlFor={`response-${question.id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Add Answer
                  </label>
                  <div className="mt-1">
                    <textarea
                      id={`response-${question.id}`}
                      rows={3}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={responses[question.id] || ""}
                      onChange={(e) =>
                        handleResponseChange(question.id, e.target.value)
                      }
                    />
                  </div>
                  <div className="mt-2">
                    <button
                      onClick={() => handleSubmitResponse(question.id)}
                      disabled={
                        submitting[question.id] ||
                        !responses[question.id]?.trim()
                      }
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {submitting[question.id]
                        ? "Submitting..."
                        : "Submit Answer"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
