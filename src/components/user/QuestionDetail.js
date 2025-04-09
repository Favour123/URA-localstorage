import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { getQuestionById, addAnswer } from "../../utils/supabaseData";
import { supabase } from "../../utils/supabaseClient";

export default function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answerContent, setAnswerContent] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [answerError, setAnswerError] = useState(null);

  // Wrap fetchQuestion in useCallback to avoid dependency changes on every render
  const fetchQuestion = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getQuestionById(id);
      setQuestion(data);
    } catch (err) {
      console.error("Error fetching question:", err);
      setError("Failed to load the question");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuestion();

    // Set up real-time subscription for answers
    const subscription = supabase
      .channel("public:answers")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "answers",
          filter: `question_id=eq.${id}`,
        },
        () => {
          fetchQuestion();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [id, fetchQuestion]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answerContent.trim()) return;
    if (!userEmail.trim()) {
      setAnswerError("Email is required to submit an answer");
      return;
    }

    // Check if user is trying to answer their own question
    if (
      question &&
      userEmail.trim().toLowerCase() === question.user_email.toLowerCase()
    ) {
      setAnswerError("You cannot answer your own question");
      return;
    }

    try {
      setSubmitting(true);
      setAnswerError(null);
      await addAnswer(id, {
        content: answerContent,
        user_email: userEmail,
      });
      setAnswerContent("");
      // Keep the email for convenience
      // The question will be refreshed by the subscription
    } catch (err) {
      console.error("Error adding answer:", err);
      setAnswerError("Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Question not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/forum"
            className="text-indigo-600 hover:text-indigo-900 flex items-center"
          >
            <svg
              className="h-5 w-5 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Forum
          </Link>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {question.title || question.question}
            </h1>
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <span>
                Posted by {question.user_email || question.email || "Anonymous"}
              </span>
              <span className="mx-2">•</span>
              <span>
                {new Date(
                  question.created_at || question.timestamp
                ).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="prose max-w-none">
              <p>{question.content || question.question}</p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
          Answers ({question.answers ? question.answers.length : 0})
        </h2>

        {question.answers && question.answers.length > 0 ? (
          <div className="space-y-4">
            {question.answers.map((answer) => (
              <div
                key={answer.id}
                className="bg-white shadow overflow-hidden sm:rounded-lg"
              >
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex justify-between">
                    <div className="text-sm text-gray-500">
                      <span>
                        Answered by {answer.user_email || "Anonymous"}
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        {new Date(answer.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 prose max-w-none">
                    <p>{answer.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
            <p className="text-gray-500">
              No answers yet. Be the first to answer!
            </p>
          </div>
        )}

        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Your Answer</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            {answerError && (
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
                    <p className="text-sm text-red-700">{answerError}</p>
                  </div>
                </div>
              </div>
            )}

            {question &&
            userEmail &&
            userEmail.trim().toLowerCase() ===
              question.user_email.toLowerCase() ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      You cannot answer your own question
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="answerContent"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Answer
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="answerContent"
                      name="answerContent"
                      rows={4}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={answerContent}
                      onChange={(e) => setAnswerContent(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="userEmail"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Your Email <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      id="userEmail"
                      name="userEmail"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Required to submit an answer.
                  </p>
                </div>

                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {submitting ? "Posting..." : "Post Answer"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
