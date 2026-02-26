import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../../api";

const QuizPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get("attemptId");

  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedIndex }
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [userData, setUserData] = useState(null);

  // Fetch quiz data
  useEffect(() => {
    if (!attemptId) {
      setError("No attempt ID provided");
      setLoading(false);
      return;
    }

    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/participant/attempt/${attemptId}`, {
          withCredentials: true,
        });

        if (res.data) {
          setQuizData(res.data);
          
          // Initialize answers from existing attempt if any
          if (res.data.attempt?.answers) {
            const existingAnswers = {};
            res.data.attempt.answers.forEach((ans) => {
              existingAnswers[ans.questionId?.toString() || ans.questionId] = ans.selectedIndex;
            });
            setAnswers(existingAnswers);
          }

          // Check if already submitted
          if (res.data.attempt?.status !== "in_progress") {
            // Redirect to results page
            navigate(`/dashboard/participant/quiz/result?attemptId=${attemptId}`);
            return;
          }

          // Calculate time remaining
          if (res.data.quiz.endAt) {
            const endTime = new Date(res.data.quiz.endAt).getTime();
            const now = Date.now();
            const remaining = Math.max(0, endTime - now);
            setTimeRemaining(remaining);
          }
        }
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError(
          err.response?.data?.error || "Failed to load quiz. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [attemptId, navigate]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/auth/me", { withCredentials: true });
        if (res.data?.user) {
          setUserData(res.data.user);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1000) {
          // Auto-submit when time runs out
          handleSubmit(true);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleAnswer = (questionId, selectedIndex) => {
    const qId = questionId?.toString() || questionId;
    setAnswers((prev) => ({
      ...prev,
      [qId]: selectedIndex,
    }));
  };

  const markForReview = () => {
    const question = quizData?.quiz?.questions[currentQuestionIndex];
    if (!question) return;
    const questionId = question._id?.toString() || question._id || question.id;

    setReviews((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const goToQuestion = (index) => {
    if (index >= 0 && index < (quizData?.quiz?.questions?.length || 0)) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (submitting) return;

    // Convert answers to array format expected by backend
    const answersArray = Object.entries(answers).map(([questionId, selectedIndex]) => ({
      questionId: questionId.toString(),
      selectedIndex: typeof selectedIndex === 'number' ? selectedIndex : parseInt(selectedIndex),
    }));

    if (!autoSubmit) {
      const confirmSubmit = window.confirm(
        "Are you sure you want to submit? You cannot change your answers after submission."
      );
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    try {
      const res = await API.post(
        `/participant/attempt/${attemptId}/submit`,
        { answers: answersArray },
        { withCredentials: true }
      );

      if (res.data.success) {
        // Redirect to results page
        navigate(`/dashboard/participant/quiz/result?attemptId=${attemptId}`);
      } else {
        setError("Failed to submit quiz. Please try again.");
        setSubmitting(false);
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError(
        err.response?.data?.error || "Failed to submit quiz. Please try again."
      );
      setSubmitting(false);
    }
  }, [answers, attemptId, navigate, submitting]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error && !quizData) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate("/dashboard/participant")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const questions = quizData?.quiz?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const reviewedCount = reviews.length;
  const notAnsweredCount = totalQuestions - answeredCount;

  if (!currentQuestion) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
        <p>No questions available</p>
      </div>
    );
  }

  const currentQuestionId = currentQuestion._id?.toString() || currentQuestion._id || currentQuestion.id;
  const isCurrentQuestionAnswered = answers[currentQuestionId] !== undefined;
  const isCurrentQuestionReviewed = reviews.includes(currentQuestionId);

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col">
      <nav className="w-full bg-zinc-900 text-white px-6 md:px-16 py-4 flex justify-between items-center border-b border-zinc-800">
        <div className="text-2xl font-bold">Quizzy</div>
        <div className="flex items-center gap-4">
          {timeRemaining !== null && (
            <div className={`text-lg font-mono ${
              timeRemaining < 300000 ? "text-red-400" : "text-white"
            }`}>
              ⏱ {formatTime(timeRemaining)}
            </div>
          )}
          <div className="text-sm text-gray-400">
            {quizData?.quiz?.title || "Quiz"}
          </div>
        </div>
      </nav>

      <main className="flex flex-grow px-4 py-6 gap-4 flex-col md:flex-row">
        {/* Left: Quiz Section */}
        <section className="w-full md:w-3/4 bg-zinc-900 p-6 rounded-lg shadow-lg flex flex-col">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="text-lg font-semibold mb-4">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </div>

          <div className="text-xl font-semibold mb-6">
            {currentQuestion.text}
          </div>

          <div className="space-y-3 mb-6 flex-1">
            {currentQuestion.options.map((opt, idx) => (
              <label
                key={idx}
                className={`flex items-center space-x-3 cursor-pointer p-4 rounded-lg border-2 transition-all ${
                  answers[currentQuestionId] === idx
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-zinc-700 hover:border-zinc-600"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestionId}`}
                  value={idx}
                  checked={answers[currentQuestionId] === idx}
                  onChange={() => handleAnswer(currentQuestionId, idx)}
                  className="accent-blue-500 w-5 h-5"
                />
                <span className="flex-1">{opt}</span>
              </label>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-auto pt-4 border-t border-zinc-800">
            <button
              onClick={markForReview}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                isCurrentQuestionReviewed
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-white hover:bg-zinc-700"
              }`}
            >
              {isCurrentQuestionReviewed ? "Unmark Review" : "Mark for Review"}
            </button>
            <button
              onClick={() => goToQuestion(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 bg-zinc-800 text-white rounded-lg font-semibold hover:bg-zinc-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => goToQuestion(currentQuestionIndex + 1)}
              disabled={currentQuestionIndex >= totalQuestions - 1}
              className="px-6 py-2 bg-zinc-800 text-white rounded-lg font-semibold hover:bg-zinc-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </section>

        {/* Right: Sidebar */}
        <aside className="w-full md:w-1/4 bg-zinc-900 p-6 rounded-lg shadow-lg flex flex-col gap-4">
          {/* User Info */}
          {userData && (
            <div className="bg-zinc-800 p-4 rounded-lg text-sm">
              <p className="text-gray-400 mb-1">Participant</p>
              <p className="text-white font-semibold">{userData.name || "User"}</p>
              <p className="text-gray-400 text-xs mt-1">{userData.email}</p>
            </div>
          )}

          <hr className="border-zinc-700" />

          {/* Question Grid */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-md font-bold mb-3">Questions</h3>
            <div className="grid grid-cols-5 gap-2 mb-6 overflow-y-auto max-h-64">
              {questions.map((q, i) => {
                const qId = q._id?.toString() || q._id || q.id;
                const isAnswered = answers[qId] !== undefined;
                const isReview = reviews.includes(qId);
                const isCurrent = i === currentQuestionIndex;

                let bgClass = "bg-yellow-400";
                if (isAnswered) bgClass = "bg-green-500";
                if (isReview) bgClass = "bg-blue-500";

                return (
                  <button
                    key={q._id}
                    onClick={() => goToQuestion(i)}
                    className={`w-12 h-12 font-semibold rounded text-black hover:scale-105 transition-transform ${
                      isCurrent ? "ring-2 ring-white" : ""
                    } ${bgClass}`}
                    title={`Question ${i + 1}${isAnswered ? " (Answered)" : ""}${isReview ? " (Review)" : ""}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <hr className="border-zinc-700 mb-4" />

            {/* Legend */}
            <div className="text-sm space-y-2 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-400 rounded" />
                <span>Not Answered ({notAnsweredCount})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded" />
                <span>Marked for Review ({reviewedCount})</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default QuizPage;
