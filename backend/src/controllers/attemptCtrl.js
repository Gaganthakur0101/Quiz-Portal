const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');

exports.joinQuiz = async (req, res) => {
  const { quizId } = req.body;
  const quiz = await Quiz.findById(quizId);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  if (quiz.status !== 'live') return res.status(400).json({ error: 'Quiz not live' });

  // check if already attempted (or allow multiple attempts as needed)
  const existing = await Attempt.findOne({ quiz: quizId, user: req.session.userId });
  if (existing) return res.json({ attemptId: existing._id, message: 'Resuming attempt' });

  const attempt = new Attempt({ quiz: quizId, user: req.session.userId, answers: [] });
  await attempt.save();
  res.json({ attemptId: attempt._id });
};

exports.submitAttempt = async (req, res) => {
  const { attemptId, answers } = req.body; // answers: [{ questionId, selectedIndex }]
  const attempt = await Attempt.findById(attemptId);
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
  if (String(attempt.user) !== String(req.session.userId)) return res.status(403).json({ error: 'Forbidden' });

  const quiz = await Quiz.findById(attempt.quiz);
  // calculate score
  let score = 0;
  const qMap = {};
  quiz.questions.forEach(q => { qMap[String(q._id)] = q; });
  for (const a of answers) {
    const q = qMap[a.questionId];
    if (!q) continue;
    if (a.selectedIndex === q.correctIndex) score += (q.marks || 1);
  }
  attempt.answers = answers;
  attempt.score = score;
  attempt.submittedAt = new Date();
  await attempt.save();
  res.json({ score });
};
