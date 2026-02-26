const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String }],    // index-based options
  correctIndex: { type: Number }, // index of correct option
  marks: { type: Number, default: 1 }
});

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  joinCode: { type: String, required: true, unique: true },

  questions: [QuestionSchema],
  maxParticipants: { type: Number, default: 0 },
  durationMinutes: { type: Number },
  status: { type: String, enum: ['draft', 'live', 'finished'], default: 'draft' },
  createdAt: { type: Date, default: Date.now },
  startAt: { type: Date },
  endAt: { type: Date }
});


module.exports = mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);

