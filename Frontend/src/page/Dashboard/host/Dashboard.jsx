"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";

import CreateQuiz from "./CreateQuiz";
import { ListCard, StatCard } from "./Cards";
import Sidebar from "./Sidebar";
import Results from "./Result";
import Settings from "./Settings";
import QuizList from "./QuizList";
import API from "../../../api";

import {
  FiList,
  FiBarChart2,
  FiLogOut,
  FiUsers,
  FiActivity,
  FiCheckCircle,
} from "react-icons/fi";


// ============================================================================
// DASHBOARD COMPONENT (Now uses REAL BACKEND data)
// ============================================================================
function Dashboard({ quizzes }) {
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [mode, setMode] = useState("list");

  const handleCreateQuiz = () => {
    setSelectedQuiz(null);
    setMode("create");
  };

  const handleEditQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setMode("edit");
  };

  const stats = useMemo(() => {
    const totalQuestions = quizzes.reduce(
      (sum, q) => sum + (q.questions?.length || 0),
      0
    );

    const totalParticipants = quizzes.reduce(
      (sum, q) => sum + (q.maxParticipants || 0),
      0
    );

    return {
      totalQuizzes: quizzes.length,
      totalParticipants,
      totalQuestions,
      totalActiveQuizzes: quizzes.filter((q) => q.status === "live").length,
    };
  }, [quizzes]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="p-8 flex-1 overflow-y-auto text-white">
      <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
      <p className="text-gray-400 mb-8">Welcome back! Here's your quiz overview</p>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Quizzes" value={stats.totalQuizzes} icon={FiList} gradient="from-blue-500 to-cyan-500" />
        <StatCard label="Total Participants" value={stats.totalParticipants} icon={FiUsers} gradient="from-purple-500 to-pink-500" />
        <StatCard label="Total Questions" value={stats.totalQuestions} icon={FiActivity} gradient="from-orange-500 to-red-500" />
        <StatCard label="Active Quizzes" value={stats.totalActiveQuizzes} icon={FiCheckCircle} gradient="from-green-500 to-emerald-500" />
      </div>

      {/* RECENT QUIZZES + ACTIVE QUIZZES */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <ListCard title="Recent Quizzes" icon={FiList}>
          {quizzes.slice(0, 3).map((quiz) => (
            <div key={quiz._id} className="py-3 flex justify-between border-b border-gray-800 px-2">
              <span>{quiz.title}</span>
              <span className="text-gray-400">{formatDate(quiz.createdAt)}</span>
            </div>
          ))}
        </ListCard>

        <ListCard title="Active Quizzes" icon={FiActivity}>
          {quizzes.filter((q) => q.status === "live").length > 0 ? (
            quizzes
              .filter((q) => q.status === "live")
              .map((quiz) => (
                <div key={quiz._id} className="py-3 flex justify-between border-b border-gray-800 px-2">
                  <span>{quiz.title}</span>
                  <span className="text-green-400 text-sm bg-green-400/10 px-3 py-1 rounded-full">Active</span>
                </div>
              ))
          ) : (
            <p className="text-gray-500 text-center py-4">No active quizzes</p>
          )}
        </ListCard>
      </div>

      {/* AVERAGE SCORES */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ListCard title="Average Scores" icon={FiBarChart2}>
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="py-3 px-2 flex justify-between border-b border-gray-800">
              <span>{quiz.title}</span>
              <span className="text-gray-300">0%</span>
            </div>
          ))}
        </ListCard>
      </div>
    </div>
  );
}


// ============================================================================
// MAIN HOST COMPONENT
// ============================================================================
export default function Host() {
  const [quizzes, setQuizzes] = useState([]);
  const [activePage, setActivePage] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH REAL QUIZZES FROM BACKEND
  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/quizzes/host", {
        withCredentials: true,
      });

      if (res.data?.quizzes) {
        setQuizzes(res.data.quizzes);
      } else {
        console.error("No quizzes in response:", res.data);
        setQuizzes([]);
      }
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      alert(err.response?.data?.error || "Failed to load quizzes");
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // When a quiz is created → refresh list
  const handleQuizCreated = useCallback(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);


  // PAGE SWITCHING
  const renderPage = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">Loading...</p>
        </div>
      );
    }

    switch (activePage) {
      case "dashboard":
        return <Dashboard quizzes={quizzes} />;
      case "create":
        return <CreateQuiz onQuizCreated={handleQuizCreated} />;
      case "results":
        return <Results />;
      case "settings":
        return <Settings />;
      case "list":
        return <QuizList quizzes={quizzes} onRefresh={fetchQuizzes} />;
      case "logout":
        return (
          <div className="flex flex-col items-center mt-20 text-gray-300">
            <FiLogOut className="text-5xl mb-3" />
            <p>Logout feature pending</p>
          </div>
        );
      default:
        return <Dashboard quizzes={quizzes} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-black">
      <Sidebar onNavigate={setActivePage} activePage={activePage} />
      <main className="flex-1 bg-zinc-950">{renderPage()}</main>
    </div>
  );
}
