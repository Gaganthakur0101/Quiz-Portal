const express = require("express");
const cors = require("cors");
const sessionMiddleware = require("./config/session");
const authRoutes = require("./routes/auth");
const quizzes = require('./routes/quizzes');
const participant = require('./routes/participant');
const settingsRoutes = require("./routes/settings");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// Sessions
app.use(sessionMiddleware);

// Routes
app.use("/api/auth", authRoutes);

app.use('/api/quizzes', quizzes);
app.use('/api/participant', participant);
app.use("/api/settings", settingsRoutes);

// ⭐ HEALTH CHECK ROUTE ⭐
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    backend: true,
    mongo: "connected",
    sessions: true,
    corsAllowed: process.env.CLIENT_URL,
    message: "Backend is running properly."
  });
});

module.exports = app;
