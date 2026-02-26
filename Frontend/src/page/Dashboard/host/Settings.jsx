"use client";
import {
  FiSettings,
  FiCheck,
  FiSave,
  FiUsers,
  FiCheckCircle,
} from "react-icons/fi";
import React, { useState, useEffect } from "react";

export default function Settings() {
  const API = import.meta.env.VITE_BACKEND_URL;

  const [settings, setSettings] = useState(null);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // NEW STATES FOR PASSWORD CONFIRMATION
  const [requirePassword, setRequirePassword] = useState(false);
  const [password, setPassword] = useState("");

  // ----------------------------------------------------------
  // FETCH REAL USER + SETTINGS
  // ----------------------------------------------------------
  const loadSettings = async () => {
    try {
      const [settingsRes, userRes] = await Promise.all([
        fetch(`${API}/api/settings`, { credentials: "include" }),
        fetch(`${API}/api/auth/me`, { credentials: "include" }),
      ]);

      const settingsData = await settingsRes.json();
      const userData = await userRes.json();

      setSettings({
        ...settingsData.settings,
        hostName: userData.user?.name || "",
        email: userData.user?.email || "",
      });

      setLoading(false);
    } catch (err) {
      console.error("Error loading settings:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // ----------------------------------------------------------
  // UPDATE FIELD
  // ----------------------------------------------------------
  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: null }));
    setSaved(false);

    // critical changes → password required
    if (
      key === "email" ||
      key === "passingPercentage" ||
      key === "maxParticipants" ||
      key === "defaultQuizDuration"
    ) {
      setRequirePassword(true);
    }
  };

  // ----------------------------------------------------------
  // VALIDATE FIELDS
  // ----------------------------------------------------------
  const validateSettings = () => {
    const newErrors = {};

    if (!settings.hostName.trim())
      newErrors.hostName = "Host name is required";

    if (!settings.email.trim())
      newErrors.email = "Email is required";

    if (settings.passingPercentage < 0 || settings.passingPercentage > 100)
      newErrors.passingPercentage = "Passing % must be between 0 and 100";

    if (settings.maxParticipants < 1)
      newErrors.maxParticipants = "Minimum is 1";

    if (settings.defaultQuizDuration < 1)
      newErrors.defaultQuizDuration = "Minimum is 1 minute";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ----------------------------------------------------------
  // SAVE SETTINGS
  // ----------------------------------------------------------
  const handleSave = async () => {
    if (!validateSettings()) return;

    if (requirePassword && !password.trim()) {
      alert("Please enter your password to confirm changes.");
      return;
    }

    try {
      const res = await fetch(`${API}/api/settings`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          password: requirePassword ? password : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to save settings");
        return;
      }

      setSaved(true);
      setPassword("");        // reset password field
      setRequirePassword(false);

      setTimeout(() => setSaved(false), 3000);

    } catch (err) {
      alert("Server error: " + err.message);
    }
  };

  // ----------------------------------------------------------
  // LOADING UI
  // ----------------------------------------------------------
  if (loading || !settings)
    return (
      <div className="p-8 text-white">
        <p>Loading settings...</p>
      </div>
    );

  return (
    <div className="p-4 md:p-8 flex-1 overflow-y-auto bg-zinc-950 text-white">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Settings</h2>
        <p className="text-zinc-400">Manage platform preferences</p>
      </div>

      <div className="max-w-4xl space-y-6">

        {/* PROFILE SECTION */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiUsers /> Profile Information
          </h3>

          {/* HOST NAME */}
          <div className="mb-4">
            <label className="block mb-2 text-zinc-300">Host Name *</label>
            <input
              type="text"
              value={settings.hostName}
              onChange={(e) => updateSetting("hostName", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3"
            />
            {errors.hostName && <p className="text-red-400 text-sm">{errors.hostName}</p>}
          </div>

          {/* EMAIL */}
          <div className="mb-4">
            <label className="block mb-2 text-zinc-300">Email *</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => updateSetting("email", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3"
            />
            {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
          </div>

          {/* ORG */}
          <div>
            <label className="block mb-2 text-zinc-300">Organization</label>
            <input
              type="text"
              value={settings.organization}
              onChange={(e) => updateSetting("organization", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3"
            />
          </div>
        </div>
        {/* PASSWORD REQUIRED BOX */}
        {requirePassword && (
          <div className="bg-red-900/20 border border-red-600 p-4 rounded-lg mb-6">
            <label className="block mb-2 text-red-300">
              Enter Password to Confirm Changes *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 p-3 rounded-lg"
              placeholder="Enter your password"
            />
          </div>
        )}

        {/* PREFERENCES */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiCheckCircle /> Preferences
          </h3>

          <div className="space-y-3">
            {[
              { key: "autoPublishResults", label: "Auto-publish results" },
              { key: "allowLateSubmissions", label: "Allow late submissions" },
              { key: "showCorrectAnswers", label: "Show correct answers" },
            ].map((item) => (
              <label
                key={item.key}
                className="flex justify-between bg-zinc-800 p-4 rounded-lg cursor-pointer"
              >
                <span>{item.label}</span>
                <input
                  type="checkbox"
                  checked={settings[item.key]}
                  onChange={(e) =>
                    updateSetting(item.key, e.target.checked)
                  }
                />
              </label>
            ))}
          </div>
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          className="w-full py-4 bg-white text-black rounded-lg font-semibold flex justify-center gap-2"
        >
          {saved ? <FiCheck /> : <FiSave />}
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
