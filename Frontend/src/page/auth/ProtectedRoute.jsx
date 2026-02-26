import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../../api"; // axios instance

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timeoutId;
    let fallbackTimeoutId;

    const checkSession = async () => {
      console.log("🔍 ProtectedRoute: Starting session check...");
      
      // FALLBACK TIMEOUT - Always trigger after 6 seconds no matter what
      fallbackTimeoutId = setTimeout(() => {
        console.error("⏰ ProtectedRoute: Fallback timeout triggered - forcing redirect");
        if (isMounted) {
          setLoading(false);
          setAuthenticated(false);
        }
      }, 6000); // 6 second absolute maximum

      try {
        // Make the API call with a shorter timeout
        const res = await API.get("/auth/me", { 
          withCredentials: true,
          timeout: 4000 // 4 second axios timeout
        });

        // Clear fallback timeout if request succeeded
        if (fallbackTimeoutId) {
          clearTimeout(fallbackTimeoutId);
        }

        if (isMounted) {
          console.log("✅ ProtectedRoute: Session check successful", res.data);
          if (res.data?.user) {
            setAuthenticated(true);
          } else {
            console.warn("⚠️ ProtectedRoute: No user in response");
            setAuthenticated(false);
          }
          setLoading(false);
        }
      } catch (error) {
        // Clear fallback timeout if error occurred
        if (fallbackTimeoutId) {
          clearTimeout(fallbackTimeoutId);
        }

        if (isMounted) {
          console.error("❌ ProtectedRoute: Session check failed", error.message);
          console.error("❌ Error details:", {
            message: error.message,
            code: error.code,
            response: error.response?.status,
            config: error.config?.url
          });
          setAuthenticated(false);
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (fallbackTimeoutId) clearTimeout(fallbackTimeoutId);
    };
  }, []);

  // While checking → prevent redirect flicker
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl mb-2">Checking session...</p>
          <p className="text-sm text-gray-400">This should only take a moment</p>
          <p className="text-xs text-gray-500 mt-2">If this takes too long, the backend may be down</p>
        </div>
      </div>
    );
  }

  return authenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
