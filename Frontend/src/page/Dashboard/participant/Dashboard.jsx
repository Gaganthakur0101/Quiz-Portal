// src/page/Dashboard/participant/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../api";

import {
  FiAward,
  FiCalendar,
  FiBarChart2,
  FiLogOut,
  FiCheckCircle,
  FiTrendingUp,
  FiBook,
} from "react-icons/fi";

import JoinQuiz from "./Joinquiz";
import MyResults from "./MyResult";
import UpcomingQuizzes from "./UpcomingQuiz";
import ProfileSettings from "./Settings";
import StatCard from "./StatsCard";
import formatDate from "./FromateDate";
import ParticipantSidebar from "./Sidebar";

// ------------------- DASHBOARD PAGE -------------------
function ParticipantDashboard({ data, userData }) {
  console.log("Participant Dashboard Data:", data);

  const stats = data?.stats || {};
  const recentQuizzes = data?.recentAttempts || [];

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Welcome back, {userData?.user?.name || "Learner"}! 👋
        </h2>
        <p className="text-gray-400">Your learning progress and activities</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Quizzes" value={stats.totalQuizzes || 0} icon={FiBook} gradient="from-blue-500 to-cyan-500" />
        <StatCard label="Attempted" value={stats.attempted || 0} icon={FiCheckCircle} gradient="from-green-500 to-emerald-500" />
        <StatCard label="Average Score" value={`${stats.averageScore || 0}%`} icon={FiTrendingUp} gradient="from-purple-500 to-pink-500" />
        <StatCard label="Rank" value={stats.rank ? `#${stats.rank}` : "-"} icon={FiAward} gradient="from-orange-500 to-red-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-700 pb-2">
            <FiBarChart2 className="text-blue-400" />
            <h3 className="text-white font-semibold">Recent Performance</h3>
          </div>

          {recentQuizzes.length === 0 ? (
            <p className="text-gray-500">No attempts found.</p>
          ) : (
            recentQuizzes.map((item, i) => (
              <div key={i} className="flex justify-between py-3 border-b border-gray-700">
                <div>
                  <p className="text-white">{item.quizTitle}</p>
                  <p className="text-gray-500 text-sm">{formatDate(item.attemptedAt)}</p>
                </div>
                <p className="text-blue-400 font-semibold">{item.score}%</p>
              </div>
            ))
          )}
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-700 pb-2">
            <FiCalendar className="text-green-400" />
            <h3 className="text-white font-semibold">Upcoming Quizzes</h3>
          </div>

          {!data?.upcoming || data.upcoming.length === 0 ? (
            <p className="text-gray-500">No upcoming quizzes.</p>
          ) : (
            data.upcoming.map((quiz) => (
              <div key={quiz._id || quiz.id} className="py-3 border-b border-gray-700">
                <p className="text-white">{quiz.title}</p>
                <p className="text-gray-500 text-sm">{formatDate(quiz.startAt || quiz.startTime || quiz.date)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------- MAIN WRAPPER -------------------
export default function Participant() {
  const navigate = useNavigate();

  // CRITICAL: Initialize with default values - NEVER null/undefined
  const [userData, setUserData] = useState({ user: { name: "User", email: "", role: "participant" } });
  const [data, setData] = useState({ stats: {}, recentAttempts: [], upcoming: [] });
  const [activePage, setActivePage] = useState("dashboard");
  const [loadingData, setLoadingData] = useState(false);

  // 1) Fetch user data - NON-BLOCKING, runs in background
  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        console.log("✅ Participant: Fetching user data (non-blocking)...");
        const res = await API.get("/auth/me", {
          withCredentials: true,
          timeout: 5000
        });

        if (!mounted) return;
        
        if (res.data?.user) {
          console.log("✅ Participant: User loaded:", res.data.user);
          setUserData({ user: res.data.user });
        }
      } catch (err) {
        console.error("⚠️ Participant: User fetch error (non-blocking):", err);
        // Don't block - use default user data
      }
    };

    // Fetch immediately, don't wait
    fetchUser();
    return () => { mounted = false; };
  }, []);

  // 2) Fetch dashboard data - NON-BLOCKING, runs in background
  useEffect(() => {
    let mounted = true;

    const fetchDash = async () => {
      setLoadingData(true);
      try {
        console.log("✅ Participant: Fetching dashboard data (non-blocking)...");
        const res = await API.get("/participant/dashboard", {
          withCredentials: true,
          timeout: 5000
        });

        if (!mounted) return;
        if (res?.data) {
          console.log("✅ Participant: Dashboard data loaded");
          setData(res.data);
        }
      } catch (err) {
        console.error("⚠️ Participant: Dashboard fetch error (non-blocking):", err);
        // Don't block - use default empty data
      } finally {
        if (mounted) {
          setLoadingData(false);
        }
      }
    };

    // Fetch immediately - don't wait for userData
    fetchDash();
    return () => { mounted = false; };
  }, []);

  // logout
  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) { }
    navigate("/login");
  };

  const renderPage = () => {
    // NEVER block - always render immediately
    // Show subtle loading indicator if loading, but still render content
    switch (activePage) {
      case "dashboard":
        return (
          <div className="relative">
            {loadingData && (
              <div className="absolute top-4 right-4 bg-black/80 px-3 py-1 rounded text-xs text-gray-400 z-10">
                Loading data...
              </div>
            )}
            <ParticipantDashboard data={data} userData={userData} />
          </div>
        );
      case "join":
        return <JoinQuiz userData={userData} />;
      case "results":
        return <MyResults userData={userData} />;
      case "upcoming":
        return <UpcomingQuizzes userData={userData} />;
      case "settings":
        return <ProfileSettings data={data} userData={userData} />;
      case "logout":
        return (
          <div className="flex items-center justify-center h-full">
            <button onClick={handleLogout} className="bg-red-600 px-6 py-2 rounded-lg text-white">
              Confirm Logout
            </button>
          </div>
        );
      default:
        return <ParticipantDashboard data={data} userData={userData} />;
    }
  };

  // CRITICAL: ALWAYS render immediately - no conditions, no blocking
  console.log("✅ Participant: Rendering dashboard IMMEDIATELY (non-blocking)");
  
  return (
    <div className="min-h-screen flex bg-black">
      <ParticipantSidebar 
        onNavigate={setActivePage} 
        activePage={activePage} 
        userData={userData} 
      />
      <main className="flex-1 bg-black overflow-hidden relative">
        {renderPage()}
      </main>
    </div>
  );
}
