import React, { useState, useEffect } from "react";
import { FiCalendar, FiClock, FiArrowRight } from "react-icons/fi";
import formatDate from "./FromateDate";
import API from "../../../api";

export default function UpcomingQuizzes({ userData }) {
  const [upcomingQuizzes, setUpcomingQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        setLoading(true);
        const res = await API.get("/participant/dashboard", {
          withCredentials: true,
        });

        if (res.data?.upcoming) {
          // Transform backend data to match component format
          const transformed = res.data.upcoming.map((quiz) => ({
            id: quiz._id || quiz.id,
            title: quiz.title,
            host: "Quiz Host", // Backend doesn't provide host name in upcoming
            date: quiz.startAt,
            time: new Date(quiz.startAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            duration: quiz.durationMinutes || 60,
            totalQuestions: 0, // Not provided in upcoming list
            category: "General",
            difficulty: "Medium",
          }));
          setUpcomingQuizzes(transformed);
        }
      } catch (err) {
        console.error("Error fetching upcoming quizzes:", err);
        setError("Failed to load upcoming quizzes");
      } finally {
        setLoading(false);
      }
    };

    fetchUpcoming();
  }, []);

  const joinQuiz = (quizId) => {
    // For upcoming quizzes, user needs to join with code when it goes live
    alert(
      "This quiz is scheduled for the future. Please wait until it starts, then use the 'Join Quiz' page to enter the quiz code."
    );
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading upcoming quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Upcoming Quizzes
        </h2>
        <p className="text-gray-400 text-sm sm:text-base">
          Browse and join upcoming quizzes
        </p>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {upcomingQuizzes.length === 0 ? (
          <div className="col-span-full text-center py-8 sm:py-12">
            <FiCalendar className="text-4xl sm:text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-base sm:text-lg">
              No upcoming quizzes available
            </p>
          </div>
        ) : (
          upcomingQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-zinc-900 rounded-xl p-4 sm:p-6 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 mr-2">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2 line-clamp-2">
                    {quiz.title}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm">By {quiz.host}</p>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3 mb-4">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-400">Date & Time</span>
                  <span className="text-white text-right">
                    {formatDate(quiz.date)}
                    <br className="sm:hidden" /> at {quiz.time}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-400">Duration</span>
                  <span className="text-white">{quiz.duration} mins</span>
                </div>
              </div>

              <button
                onClick={() => joinQuiz(quiz.id)}
                className="w-full py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <FiCalendar className="text-sm" />
                View Details
              </button>

              {/* Countdown Timer */}
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-zinc-800">
                <div className="flex items-center gap-2 text-orange-400 text-xs sm:text-sm">
                  <FiClock className="text-sm" />
                  <span>
                    Starts {new Date(quiz.date) > new Date() 
                      ? `in ${Math.ceil((new Date(quiz.date) - new Date()) / (1000 * 60 * 60 * 24))} day(s)`
                      : "soon"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
