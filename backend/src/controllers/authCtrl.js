const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendVerificationEmail = require("../utils/sendVerificationEmail");

// ------------------------- SIGNUP -------------------------
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      passwordHash: hashed,
      role,
      verified: false,
      verificationToken,
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return res.status(201).json({
      message: "Account created! Please verify your email.",
    });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Signup failed" });
  }
};

// ------------------------- VERIFY EMAIL -------------------------
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    console.log("TOKEN RECEIVED:", token);

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      console.log("Token already used or user already verified.");
      return res.json({ message: "Email already verified." });
    }

    console.log("USER FOUND:", user.email);

    user.verified = true;
    user.verificationToken = null;

    await user.save();

    return res.json({ message: "Email verified! You can log in now." });

  } catch (err) {
    return res.status(500).json({ message: "Verification failed" });
  }
};

// ------------------------- LOGIN -------------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    if (!user.verified)
      return res.status(400).json({ message: "Please verify your email" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(400).json({ message: "Incorrect password" });

    // ⭐⭐ VERY VERY IMPORTANT — this was missing ⭐⭐
    req.session.userId = user._id;
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, // ⭐ THIS FIXES HOST ERROR
    };

    return res.json({
      message: "Logged in",
      user: req.session.user, // send session user
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

// ------------------------- LOGOUT -------------------------
exports.logout = async (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    return res.json({ message: "Logged out" });
  });
};

// ------------------------- GET ME -------------------------
exports.getMe = async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "Not authenticated" });

  const user = await User.findById(req.session.userId).select("-passwordHash");
  return res.json({ user });
};
