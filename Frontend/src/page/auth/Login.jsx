import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import Prism from "../components/Prism";
import Footer from "../components/Footer";
import Navbar from "../components/NavAuth";
import API from "../../api"; // <-- FIXED: use axios instance

const Login = React.memo(() => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
  } = useForm({
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const response = await API.post("/auth/login", data);
      const result = response.data;
      console.log("Response from /auth/login:", result);

      if (response.status === 200 && result.user) {
        console.log("Login successful:", result);

        // ✔ Store session flags (optional)
        localStorage.setItem("sessionActive", "true");
        localStorage.setItem("role", result.user.role);

        // ✔ Redirect based on role
        console.log("User ", result.user);
        if (result.user.role === "host") {
          navigate("/dashboard/host", { state: { user: result.user } });
        } else {
          console.log("Navigating to participant dashboard");
          // navigate("/dashboard/participant", { state: { user: result.user } });
          navigate("/dashboard/participant");
        }
      } else {
        setError("root", {
          type: "server",
          message: result.message || "Login failed.",
        });
      }
    } catch (err) {
      console.error("Login error:", err);

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Network error. Try again.";

      setError("root", { type: "network", message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const prismConfig = {
    animationType: "rotate",
    timeScale: 0.5,
    height: 3.5,
    baseWidth: 5.5,
    scale: 3.6,
    hueShift: 0,
    colorFrequency: 1,
    noise: 0,
    glow: 1,
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center min-h-screen w-screen p-4 bg-black/20 backdrop-blur-sm">

      <Navbar isRequired={false} />

      {/* Background Animation */}
      <div className="w-full h-full absolute -z-10 opacity-50 md:flex hidden">
        <Prism {...prismConfig} />
      </div>

      {/* Main Card */}
      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-zinc-950 rounded-xl shadow-2xl overflow-hidden">

        {/* Left Section */}
        <div className="flex-1 p-10 border-r border-gray-800">
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
            Welcome Back!
          </h1>

          <p className="text-gray-300 text-base mb-6">
            Sign in to continue your quiz journey
          </p>

          <Link to="/signup" className="text-white text-base group">
            Don’t have an account?{" "}
            <span className="text-blue-400 group-hover:underline">
              Sign Up
            </span>
          </Link>
        </div>

        {/* Right Section – Form */}
        <div className="flex-1 p-10">

          {errors.root && (
            <div className="p-3 mb-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm text-center">
                {errors.root.message}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email"
                autoComplete="email"
                className={`w-full p-3 bg-transparent border-b-2 text-white placeholder-gray-400 focus:outline-none ${
                  errors.email ? "border-red-500" : "border-gray-600 focus:border-white"
                }`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email format",
                  },
                })}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                className={`w-full p-3 bg-transparent border-b-2 text-white placeholder-gray-400 focus:outline-none ${
                  errors.password ? "border-red-500" : "border-gray-600 focus:border-white"
                }`}
                {...register("password", { required: "Password is required" })}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-red-400 text-sm">{errors.password.message}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className={`w-full bg-white text-black rounded-full font-medium px-8 py-3 transition-all ${
                !isValid || isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>

        </div>
      </div>

      <Footer />
    </div>
  );
});

Login.displayName = "Login";

export default Login;
