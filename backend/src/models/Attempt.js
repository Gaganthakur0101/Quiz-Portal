// models/Attempt.js
const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedIndex: { type: Number },
  correct: { type: Boolean, default: false },
  marksObtained: { type: Number, default: 0 }
});

const AttemptSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [AnswerSchema],
  totalScore: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  status: { type: String, enum: ['in_progress', 'submitted', 'evaluated'], default: 'in_progress' },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Attempt', AttemptSchema);
