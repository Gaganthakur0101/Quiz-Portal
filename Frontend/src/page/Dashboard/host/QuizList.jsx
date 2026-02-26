"use client";
import React, { useState, useEffect } from "react";
import {
  FiList, FiPlay, FiPause, FiEdit, FiTrash2,
  FiSearch, FiCopy
} from "react-icons/fi";
import API from "../../../api";

export default function QuizList({ onEditQuiz, onCreateQuiz }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ---------------------------
  // FETCH QUIZZES (Only once)
  // ---------------------------
  const loadQuizzes = async () => {
    try {
      setLoading(true);

      const res = await API.get("/quizzes/host", {
        withCredentials: true,
      });

      setQuizzes(res.data?.quizzes || []);
    } catch (err) {
      console.error("Error loading quizzes", err);
      setQuizzes([]); // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes(); // run once
  }, []);

  // ---------------------------
  // DELETE QUIZ
  // ---------------------------
  const deleteQuiz = async (id) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    try {
      await API.delete(`/quizzes/${id}`, { withCredentials: true });
      loadQuizzes(); // refresh once after delete
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete quiz");
    }
  };

  // ---------------------------
  // TOGGLE QUIZ STATUS
  // ---------------------------
  const toggleActive = async (quiz) => {
    try {
      const route = quiz.status === "live" ? "finish" : "start";

      if (route === "start" && (!quiz.questions || quiz.questions.length === 0)) {
        return alert("Cannot start quiz: No questions added yet!");
      }

      if (!confirm(`${route === "start" ? "Start" : "Finish"} "${quiz.title}"?`))
        return;

      await API.post(
        `/quizzes/${quiz._id}/${route}`,
        { durationMinutes: quiz.durationMinutes },
        { withCredentials: true }
      );

      loadQuizzes(); // refresh once
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update quiz status");
    }
  };

  // ---------------------------
  // SEARCH FILTER
  // ---------------------------
  const filtered = quizzes.filter((q) =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ---------------------------
  // LOADING STATE
  // ---------------------------
  if (loading) {
    return (
      <div className="text-center text-white p-10">Loading quizzes...</div>
    );
  }

  return (
    <div className="p-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <FiList /> Quiz List
        </h2>

      </div>

      {/* SEARCH */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search quizzes..."
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 pl-10 pr-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LIST */}
      {filtered.length === 0 ? (
        <p className="text-gray-400 text-center py-6">No quizzes found.</p>
      ) : (
        filtered.map((quiz) => (
          <div
            key={quiz._id}
            className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-4"
          >
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{quiz.title}</h3>

                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      quiz.status === "live"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : quiz.status === "finished"
                        ? "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    }`}
                  >
                    {quiz.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-gray-400 text-sm">
                  {quiz.questions?.length || 0} Questions •{" "}
                  {quiz.maxParticipants || "Unlimited"} max participants
                  {quiz.durationMinutes && ` • ${quiz.durationMinutes} mins`}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <code className="bg-zinc-800 px-3 py-1 rounded-lg border border-zinc-600 font-mono">
                    {quiz.joinCode}
                  </code>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(quiz.joinCode);
                      alert("Quiz code copied!");
                    }}
                    className="text-gray-400 hover:text-white transition"
                  >
                    <FiCopy />
                  </button>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2">

                <button
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700"
                  onClick={() => toggleActive(quiz)}
                >
                  {quiz.status === "live" ? (
                    <FiPause className="text-red-400" />
                  ) : (
                    <FiPlay className="text-green-400" />
                  )}
                </button>

                <button
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700"
                  onClick={() => onEditQuiz(quiz)}
                >
                  <FiEdit className="text-yellow-400" />
                </button>

                <button
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-red-700"
                  onClick={() => deleteQuiz(quiz._id)}
                >
                  <FiTrash2 className="text-red-400" />
                </button>

              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
