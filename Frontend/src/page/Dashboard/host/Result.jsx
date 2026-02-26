"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  FiBarChart2,
  FiDownload,
  FiPrinter,
  FiEye,
  FiEyeOff,
  FiInfo,
} from "react-icons/fi";
import * as XLSX from "xlsx";

export default function Results() {
  const API = import.meta.env.VITE_BACKEND_URL;

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // --------------------------------------------
  // 1️⃣ LOAD ALL HOST QUIZZES
  // --------------------------------------------
  const loadQuizzes = async () => {
    try {
      const res = await fetch(`${API}/api/quizzes/host`, {
        credentials: "include",
      });

      const data = await res.json();
      setQuizzes(data.quizzes || []);
    } catch (err) {
      console.error("Error loading quizzes:", err);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  // --------------------------------------------
  // 2️⃣ LOAD ATTEMPTS FOR SELECTED QUIZ
  // --------------------------------------------
  const loadAttempts = async (quizId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/quizzes/${quizId}/attempts`, {
        credentials: "include",
      });

      const data = await res.json();
      setAttempts(data.attempts || []);
    } catch (err) {
      console.error("Error loading attempts:", err);
    }
    setLoading(false);
  };

  // --------------------------------------------
  // ON SELECT QUIZ
  // --------------------------------------------
  const handleSelectQuiz = (id) => {
    const quiz = quizzes.find((q) => q._id === id);
    setSelectedQuiz(quiz);
    loadAttempts(id);
  };

  // --------------------------------------------
  // FILTER LOGIC
  // --------------------------------------------
  const filteredAttempts = attempts.filter((a) => {
    if (filter === "passed") return a.score >= 60;
    if (filter === "failed") return a.score < 60;
    return true;
  });

  // --------------------------------------------
  // EXPORT CSV
  // --------------------------------------------
  const exportCSV = () => {
    if (attempts.length === 0) return;

    const sheet = XLSX.utils.json_to_sheet(attempts);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Results");

    XLSX.writeFile(book, `results-${selectedQuiz.title}.csv`);
  };

  // --------------------------------------------
  // PRINT RESULTS
  // --------------------------------------------
  const printResults = () => {
    const w = window.open("", "_blank");
    w.document.write(`
      <html>
        <head>
          <title>${selectedQuiz.title} - Results</title>
        </head>
        <body>
          ${document.getElementById("results-table").innerHTML}
        </body>
      </html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="p-8 text-white">

      <h2 className="text-3xl font-bold mb-2">Results</h2>
      <p className="text-gray-400 mb-6">
        View results of any quiz, filter participants and download reports
      </p>

      {/* QUIZ SELECT BOX */}
      <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl mb-6">
        <label className="text-gray-300 mb-2 block">Select Quiz</label>

        <select
          className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg"
          value={selectedQuiz?._id || ""}
          onChange={(e) => handleSelectQuiz(e.target.value)}
        >
          <option value="">Choose a quiz</option>
          {quizzes.map((q) => (
            <option key={q._id} value={q._id}>
              {q.title}
            </option>
          ))}
        </select>
      </div>

      {/* SHOW ONLY WHEN A QUIZ IS SELECTED */}
      {selectedQuiz && (
        <>

          {/* FILTERS + EXPORT */}
          <div className="flex gap-3 mb-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg"
            >
              <option value="all">All</option>
              <option value="passed">Passed (≥60%)</option>
              <option value="failed">Failed (&lt; 60%)</option>
            </select>

            <button
              onClick={exportCSV}
              className="px-6 py-3 bg-white text-black rounded-lg flex items-center gap-2"
            >
              <FiDownload /> Export
            </button>

            <button
              onClick={printResults}
              className="px-6 py-3 bg-white text-black rounded-lg flex items-center gap-2"
            >
              <FiPrinter /> Print
            </button>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="text-center py-10 text-gray-400">
              Loading results...
            </div>
          )}

          {/* RESULTS TABLE */}
          {!loading && (
            <div
              id="results-table"
              className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden"
            >
              <table className="w-full">
                <thead>
                  <tr className="bg-zinc-800 border-b border-zinc-700">
                    <th className="p-4 text-left">Student</th>
                    <th className="p-4 text-center">Score</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAttempts.map((a) => (
                    <tr
                      key={a._id}
                      className="border-b border-zinc-700 hover:bg-zinc-800"
                    >
                      <td className="p-4">{a.studentName}</td>

                      <td className="p-4 text-center">{a.score}%</td>

                      <td className="p-4 text-center">
                        {a.score >= 60 ? (
                          <span className="text-green-400">Passed</span>
                        ) : (
                          <span className="text-red-400">Failed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAttempts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No results found
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!selectedQuiz && (
        <div className="text-center py-10 text-gray-500">
          Select a quiz to view results
        </div>
      )}
    </div>
  );
}
