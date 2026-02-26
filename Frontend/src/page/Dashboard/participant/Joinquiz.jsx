import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAward, FiArrowRight, FiInfo } from "react-icons/fi";
import API from "../../../api";

export default function JoinQuiz() {
  const navigate = useNavigate();
  const [quizCode, setQuizCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinStatus, setJoinStatus] = useState({ type: "", message: "" });

  const handleJoinQuiz = async () => {
    if (!quizCode.trim()) {
      setJoinStatus({ type: "error", message: "Please enter a quiz code" });
      return;
    }

    setIsJoining(true);
    setJoinStatus({ type: "", message: "" });

    try {
      // REAL BACKEND CALL
      const res = await API.post(
        "/participant/join",
        { code: quizCode },
        { withCredentials: true }
      );

      if (res.data.success) {
        setJoinStatus({
          type: "success",
          message: `Successfully joined: ${res.data.quiz.title}. Redirecting...`,
        });

        setQuizCode("");

        // Redirect to quiz page with attemptId
        setTimeout(() => {
          navigate(`/dashboard/participant/quiz?attemptId=${res.data.attemptId}`);
        }, 1500);

      } else {
        setJoinStatus({
          type: "error",
          message: res.data.message || "Could not join quiz.",
        });
      }
    } catch (err) {
      console.error("Join quiz error:", err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Invalid quiz code. Try again.";
      
      // Provide more helpful error messages
      let displayMessage = errorMessage;
      if (err.response?.data?.status === "draft") {
        displayMessage = "This quiz hasn't been started yet. Please ask the host to start the quiz first.";
      } else if (err.response?.data?.status === "finished") {
        displayMessage = "This quiz has already ended.";
      }
      
      setJoinStatus({
        type: "error",
        message: displayMessage,
      });
    }

    setIsJoining(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Join a Quiz
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Enter the quiz code provided by your instructor to participate
          </p>
        </div>

        <div className="bg-zinc-900 rounded-xl p-6 sm:p-8 border border-zinc-800 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FiAward className="text-white text-xl sm:text-2xl" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
              Enter Quiz Code
            </h3>
            <p className="text-gray-400 text-sm">Get the code from your quiz host</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2 font-medium text-sm sm:text-base">
                Quiz Code
              </label>
              <input
                type="text"
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                placeholder="e.g., QZ12AB"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white text-center text-lg sm:text-xl font-mono focus:outline-none focus:border-blue-500 transition-colors"
                maxLength={10}
              />
            </div>

            <button
              onClick={handleJoinQuiz}
              disabled={isJoining}
              className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isJoining ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                  Joining Quiz...
                </>
              ) : (
                <>
                  <FiArrowRight className="text-lg" />
                  Join Quiz
                </>
              )}
            </button>

            {joinStatus.message && (
              <div
                className={`p-3 sm:p-4 rounded-lg border text-sm ${
                  joinStatus.type === "success"
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                {joinStatus.message}
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-zinc-800">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
              <FiInfo className="text-blue-400" />
              Quick Tips
            </h4>
            <ul className="text-gray-400 text-xs sm:text-sm space-y-2">
              <li>• Make sure you have a stable internet connection</li>
              <li>• The quiz will start immediately after joining</li>
              <li>• You cannot leave once the quiz has started</li>
              <li>• Results will be available after the quiz ends</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
