const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  hostName: { type: String, default: "Quiz Host" },
  email: { type: String, default: "host@example.com" },
  organization: { type: String, default: "" },

  passingPercentage: { type: Number, default: 60 },
  maxParticipants: { type: Number, default: 100 },
  defaultQuizDuration: { type: Number, default: 60 },

  timezone: { type: String, default: "UTC" },

  autoPublishResults: { type: Boolean, default: true },
  allowLateSubmissions: { type: Boolean, default: false },
  showCorrectAnswers: { type: Boolean, default: true },
});

module.exports =
  mongoose.models.Settings || mongoose.model("Settings", settingsSchema);
