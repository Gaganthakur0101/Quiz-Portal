import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./page/Home";
import Login from "./page/auth/Login";
import Signup from "./page/auth/Signup";
import HostDashboard from "./page/Dashboard/host/Dashboard";
import Participant from "./page/Dashboard/participant/Dashboard";
import QuizPage from "./page/Dashboard/QuizPage";
import QuizResult from "./page/Dashboard/QuizResult";
import { Navigate } from "react-router-dom";
import VerifyEmail from "./page/auth/VerifyEmail";
import ProtectedRoute from ".././src/page/auth/ProtectedRoute";

import TestConnection from "./TestConnection";

// Protected Route Component
// const ProtectedRoute = ({ children }) => {
//   const isAuthenticated = localStorage.getItem("sessionId");  // <-- better for your logic

//   if (!isAuthenticated) {
//     return <Navigate to="/login" />;
//   }
//   return children;
// };

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 🔥 BACKEND TESTING PAGE */}
          <Route path="/test" element={<TestConnection />} />

          {/* verify email */}
          <Route path="/verify-email" element={<VerifyEmail />} />
          {/* Protected Routes */}
          <Route
            path="/dashboard/host"
            element={
              <ProtectedRoute>
                <HostDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/participant"
            element={
              <ProtectedRoute>
                <Participant />
              </ProtectedRoute>
            }
          />

          <Route
            path="/quiz"
            element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/participant/quiz"
            element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/result"
            element={
              <ProtectedRoute>
                <QuizResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/participant/quiz/result"
            element={
              <ProtectedRoute>
                <QuizResult />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
