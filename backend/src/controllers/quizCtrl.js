const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');
const parser = require('../utils/parser');

function genCode(len = 6) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // avoid ambiguous chars
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

exports.createQuiz = async (req, res) => {
  const { title, description, questions = [], maxParticipants, durationMinutes } = req.body;
  let joinCode = genCode();
  // ensure uniqueness - try a few times
  for (let i = 0; i < 5; i++) {
    const exists = await Quiz.findOne({ joinCode });
    if (!exists) break;
    joinCode = genCode();
  }

  const quiz = new Quiz({
    title,
    description,
    questions,
    maxParticipants,
    durationMinutes,
    host: req.session.userId,
    joinCode
  });

  // optionally set start/end if duration provided and startAt in body
  if (req.body.startAt && durationMinutes) {
    quiz.startAt = new Date(req.body.startAt);
    quiz.endAt = new Date(new Date(req.body.startAt).getTime() + durationMinutes * 60000);
  } else if (durationMinutes) {
    // will set when host starts
    quiz.endAt = null;
  }

  await quiz.save();
  res.json({ quiz });
};

// import questions from raw CSV / XML / JSON
exports.importQuestions = async (req, res) => {
  const { quizId } = req.params;
  const { type, content, marksDefault = 1 } = req.body; // type: csv|xml|json
  const quiz = await Quiz.findOne({ _id: quizId, host: req.session.userId });
  if (!quiz) return res.status(404).json({ error: 'No quiz' });

  let qlist;
  try {
    qlist = await parser.parse(content, type, { marksDefault });
  } catch (err) {
    return res.status(400).json({ error: 'Parse error', details: err.message });
  }

  // append or replace? here we append
  quiz.questions = quiz.questions.concat(qlist);
  await quiz.save();
  res.json({ quiz });
};

exports.listHostQuizzes = async (req, res) => {
  const quizzes = await Quiz.find({ host: req.session.userId }).lean();
  res.json({ quizzes });
};

exports.getQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).lean();
  if (!quiz) return res.status(404).json({ error: 'Not found' });
  res.json({ quiz });
};

exports.startQuiz = async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, host: req.session.userId });
  if (!quiz) return res.status(404).json({ error: 'No quiz' });

  quiz.status = 'live';
  // set startAt if not set
  if (!quiz.startAt) quiz.startAt = new Date();
  
  // Calculate endAt: use durationMinutes from body, or quiz.durationMinutes, or default to 60 minutes
  const durationMinutes = req.body.durationMinutes || quiz.durationMinutes || 60;
  quiz.endAt = new Date(new Date(quiz.startAt).getTime() + durationMinutes * 60000);
  
  await quiz.save();
  res.json({ quiz });
};

exports.finishQuiz = async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, host: req.session.userId });
  if (!quiz) return res.status(404).json({ error: 'No quiz' });

  quiz.status = 'finished';
  quiz.endAt = quiz.endAt || new Date();
  await quiz.save();

  // auto-submit any in_progress attempts
  await Attempt.updateMany(
    { quiz: quiz._id, status: 'in_progress' },
    { $set: { status: 'submitted', submittedAt: new Date() } }
  );

  res.json({ quiz });
};

exports.getAttemptsForQuiz = async (req, res) => {
  const attempts = await Attempt.find({ quiz: req.params.id }).populate('participant', 'name email');
  res.json({ attempts });
};

// schedule quiz (host) - set startAt and durationMinutes
exports.scheduleQuiz = async (req, res) => {
  const { id } = req.params;
  const { startAt, durationMinutes } = req.body;
  const quiz = await Quiz.findOne({ _id: id, host: req.session.userId });
  if (!quiz) return res.status(404).json({ error: 'No quiz' });

  quiz.startAt = new Date(startAt);
  quiz.endAt = new Date(new Date(startAt).getTime() + durationMinutes * 60000);
  quiz.status = 'draft';
  await quiz.save();
  res.json({ quiz });
};

// delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, host: req.session.userId });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    // Delete all attempts for this quiz
    await Attempt.deleteMany({ quiz: quiz._id });
    
    // Delete the quiz
    await Quiz.deleteOne({ _id: quiz._id });
    
    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (err) {
    console.error("Delete quiz error:", err);
    res.status(500).json({ error: 'Server error while deleting quiz' });
  }
};


exports.updateQuestion = async (req, res) => {
  try {
    const quizId = req.params.id;
    const index = parseInt(req.params.qIndex);

    const { text, options, correctIndex, marks } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    if (!quiz.questions[index]) {
      return res.status(400).json({ error: "Invalid question index" });
    }

    quiz.questions[index] = {
      text,
      options,
      correctIndex,
      marks
    };

    await quiz.save();

    res.json({
      message: "Question updated",
      questions: quiz.questions
    });

  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ⭐ DELETE SINGLE QUESTION BY INDEX
exports.deleteQuestion = async (req, res) => {
  try {
    const quizId = req.params.id;
    const index = parseInt(req.params.qIndex, 10);

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    if (!Array.isArray(quiz.questions) || index < 0 || index >= quiz.questions.length) {
      return res.status(400).json({ error: "Invalid question index" });
    }

    // Remove question from array
    quiz.questions.splice(index, 1);

    await quiz.save();

    return res.json({
      message: "Question deleted",
      questions: quiz.questions,
    });
  } catch (err) {
    console.error("deleteQuestion error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};