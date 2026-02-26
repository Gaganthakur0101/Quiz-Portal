const cron = require('node-cron');
const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');

function evaluateAttempt(quiz, attempt) {
  let total = 0;
  const qmap = {};
  quiz.questions.forEach(q => { qmap[q._id?.toString() || q.id] = q; });
  attempt.answers.forEach(a => {
    const q = qmap[a.questionId?.toString()];
    if (!q) return;
    if (typeof a.selectedIndex === 'number' && a.selectedIndex === q.correctIndex) {
      a.correct = true;
      a.marksObtained = q.marks || 1;
      total += a.marksObtained;
    } else {
      a.correct = false;
      a.marksObtained = 0;
    }
  });
  return { total, answers: attempt.answers };
}

async function job() {
  const now = new Date();

  // start quizzes where startAt <= now and status draft
  const toStart = await Quiz.find({ status: 'draft', startAt: { $lte: now } });
  for (const q of toStart) {
    q.status = 'live';
    await q.save();
    // optionally notify host/participants via websocket - not implemented here
  }

  // finish quizzes where endAt <= now and status live
  const toFinish = await Quiz.find({ status: 'live', endAt: { $lte: now } });
  for (const quiz of toFinish) {
    quiz.status = 'finished';
    await quiz.save();

    // auto-submit attempts
    const inprogress = await Attempt.find({ quiz: quiz._id, status: 'in_progress' });
    for (const a of inprogress) {
      a.status = 'submitted';
      a.submittedAt = new Date();
      // evaluate
      const ev = evaluateAttempt(quiz, a);
      a.totalScore = ev.total;
      a.answers = ev.answers;
      await a.save();
    }
  }
}

let started = false;
module.exports.start = () => {
  if (started) return;
  // run every minute
  cron.schedule('* * * * *', () => {
    job().catch(err => console.error('Scheduler err', err));
  });
  started = true;
  console.log('Quiz scheduler started (runs every minute)');
};
