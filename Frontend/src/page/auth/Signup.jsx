import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api"; // <-- FIXED (use your axios API instance)
import Prism from "../components/Prism";
import Footer from "../components/Footer";
import Navbar from "../components/NavAuth";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // ---------- STEP 1 FORM ----------
  const {
    register: registerUser,
    handleSubmit: handleSubmitUser,
    formState: { errors: errorsUser, isValid: isValidUser },
    watch: watchUser,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // ---------- STEP 2 FORM ----------
  const {
    register: registerRole,
    handleSubmit: handleSubmitRole,
    formState: { errors: errorsRole, isValid: isValidRole },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      role: "",
    },
  });

  useEffect(() => {
    setError("");
    setSuccess("");
  }, [step]);

  const handleUserDetailsNext = (data) => {
    setUserDetails(data);
    setStep(2);
    window.scrollTo(0, 0);
  };

  // ---------- FINAL SUBMIT ----------
  const handleFinalSubmit = async (roleData) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const signupData = {
        ...userDetails,
        role: roleData.role,
      };

      const response = await API.post("/auth/signup", signupData);

      if (response.status === 200 || response.status === 201) {
        setSuccess("Account created! Please verify your email.");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Signup failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- PASSWORD STRENGTH ----------
  const password = watchUser("password", "");
  const getPasswordStrength = (pass) => {
    if (!pass) return { strength: 0, text: "", color: "gray" };
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[@$!%*?&]/.test(pass)) strength++;

    const levels = [
      { text: "Very Weak", color: "red" },
      { text: "Weak", color: "orange" },
      { text: "Fair", color: "yellow" },
      { text: "Good", color: "lightgreen" },
      { text: "Strong", color: "green" },
    ];

    return levels[Math.min(strength, 4)];
  };

  const passwordStrength = getPasswordStrength(password);

  // ---------- PRISM ANIMATION ----------
  const prismAttributes = {
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <Navbar isRequired={false} />
      <div className="w-full h-full fixed top-0 left-0 -z-10 opacity-50">
        <Prism {...prismAttributes} />
      </div>

      <div className="flex flex-col lg:flex-row w-full max-w-4xl bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden mt-16">

        {/* LEFT SIDE */}
        <div className="flex-1 p-10 border-r border-gray-800">
          <div className="flex space-x-2 mb-5">
            {[1, 2].map((n) => (
              <div
                key={n}
                className={`w-3 h-3 rounded-full ${step === n ? "bg-white scale-110" : "bg-gray-600"}`}
              />
            ))}
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            {step === 1 ? "Create Account" : "Choose Your Role"}
          </h2>

          {step === 1 ? (
            <Link to="/login" className="text-white text-base">
              Already registered?{" "}
              <span className="text-blue-400 underline">Log In</span>
            </Link>
          ) : (
            <button onClick={() => setStep(1)} className="text-white text-base">
              ← Back to previous step
            </button>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 p-10">

          {error && (
            <div className="p-4 mb-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 mb-4 bg-green-500/10 border border-green-500/50 text-green-400 rounded-lg">
              {success}
            </div>
          )}

          {/* STEP 1 FORM */}
          {step === 1 && (
            <form onSubmit={handleSubmitUser(handleUserDetailsNext)} className="space-y-6">

              {/* Name */}
              <div>
                <label className="text-white">Full Name</label>
                <input
                  type="text"
                  className="w-full p-4 bg-zinc-900 border border-zinc-700 text-white rounded-lg mt-1"
                  {...registerUser("name", {
                    required: "Full Name is required",
                  })}
                />
                {errorsUser.name && (
                  <p className="text-red-400 text-sm">{errorsUser.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-white">Email</label>
                <input
                  type="email"
                  className="w-full p-4 bg-zinc-900 border border-zinc-700 text-white rounded-lg mt-1"
                  {...registerUser("email", {
                    required: "Email is required",
                  })}
                />
                {errorsUser.email && (
                  <p className="text-red-400 text-sm">{errorsUser.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-white">Password</label>
                <input
                  type="password"
                  className="w-full p-4 bg-zinc-900 border border-zinc-700 text-white rounded-lg mt-1"
                  {...registerUser("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Minimum 8 characters" },
                  })}
                />

                {password && (
                  <p className="text-sm mt-1 text-gray-300">
                    Strength:{" "}
                    <span style={{ color: passwordStrength.color }}>
                      {passwordStrength.text}
                    </span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!isValidUser || isLoading}
                className="w-full p-4 bg-blue-600 text-white rounded-xl disabled:opacity-50"
              >
                Continue
              </button>
            </form>
          )}

          {/* STEP 2 FORM */}
          {step === 2 && (
            <form onSubmit={handleSubmitRole(handleFinalSubmit)} className="space-y-6">

              <label className="text-white text-sm font-medium">Select Role</label>

              <div className="flex space-x-5 mt-2">
                <label className="text-white flex items-center space-x-2">
                  <input
                    type="radio"
                    value="host"
                    {...registerRole("role", { required: "Select a role" })}
                  />
                  <span>Host</span>
                </label>

                <label className="text-white flex items-center space-x-2">
                  <input
                    type="radio"
                    value="participant"
                    {...registerRole("role", { required: "Select a role" })}
                  />
                  <span>Participant</span>
                </label>
              </div>

              {errorsRole.role && (
                <p className="text-red-400">{errorsRole.role.message}</p>
              )}

              <button
                type="submit"
                disabled={!isValidRole || isLoading}
                className="w-full p-4 bg-green-600 text-white rounded-xl disabled:opacity-50"
              >
                Create Account
              </button>

            </form>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Signup;
