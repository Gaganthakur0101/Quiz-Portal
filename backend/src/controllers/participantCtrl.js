const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');

function computeMaxScore(quiz) {
  return (quiz.questions || []).reduce((s, q) => s + (q.marks || 1), 0);
}

function evaluate(quiz, attempt) {
  let total = 0;
  const qmap = {};
  quiz.questions.forEach(q => { qmap[q._id?.toString() || q.id] = q; });
  attempt.answers.forEach(a => {
    const q = qmap[a.questionId?.toString()];
    if (!q) return;
    const correctIndex = q.correctIndex;
    if (typeof a.selectedIndex === 'number' && a.selectedIndex === correctIndex) {
      a.correct = true;
      const m = q.marks || 1;
      a.marksObtained = m;
      total += m;
    } else {
      a.correct = false;
      a.marksObtained = 0;
    }
  });
  return { total, answers: attempt.answers };
}

exports.joinByCode = async (req, res) => {
  try {
    console.log("JOIN BODY:", req.body); // 🔥 Debug line

    // Accept any key: code OR joinCode
    const joinCode = (req.body.code || req.body.joinCode || "").toUpperCase();

    if (!joinCode) {
      return res.status(400).json({ error: "Quiz code is required" });
    }

    const quiz = await Quiz.findOne({ joinCode });

    if (!quiz) {
      return res.status(404).json({ error: "Invalid quiz code" });
    }

    // Time validations
    const now = new Date();
    
    // Check quiz status and provide helpful error messages
    if (quiz.status === "draft") {
      return res.status(400).json({ 
        error: "Quiz not started yet. The host needs to start the quiz before participants can join.",
        status: "draft"
      });
    }
    
    if (quiz.status === "finished") {
      return res.status(400).json({ 
        error: "This quiz has already ended.",
        status: "finished"
      });
    }
    
    if (quiz.status !== "live") {
      return res.status(400).json({ 
        error: `Quiz is not available. Current status: ${quiz.status}`,
        status: quiz.status
      });
    }

    if (quiz.startAt && now < new Date(quiz.startAt))
      return res.status(400).json({ 
        error: `Quiz not started yet. It will start at ${new Date(quiz.startAt).toLocaleString()}`,
        startAt: quiz.startAt
      });

    if (quiz.endAt && now > new Date(quiz.endAt))
      return res.status(400).json({ 
        error: `Quiz has ended. It ended at ${new Date(quiz.endAt).toLocaleString()}`,
        endAt: quiz.endAt
      });

    // Max participant limit
    if (quiz.maxParticipants && quiz.maxParticipants > 0) {
      const count = await Attempt.countDocuments({ quiz: quiz._id });
      if (count >= quiz.maxParticipants)
        return res.status(400).json({ error: "Quiz full" });
    }

    // Create attempt
    const attempt = new Attempt({
      quiz: quiz._id,
      participant: req.session.userId,
      answers: [],
      maxScore: computeMaxScore(quiz),
      status: "in_progress",
      startedAt: new Date()
    });

    await attempt.save();

    return res.json({
      success: true,
      attemptId: attempt._id,
      quiz: {
        _id: quiz._id,
        id: quiz._id,
        title: quiz.title,
        durationMinutes: quiz.durationMinutes,
        questions: quiz.questions.map(q => ({
          _id: q._id,
          id: q._id,
          text: q.text,
          options: q.options
        }))
      }
    });

  } catch (err) {
    console.error("JOIN ERROR:", err);
    return res.status(500).json({ error: "Server error while joining quiz" });
  }
};



exports.getAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    if (!attemptId) return res.status(400).json({ error: 'attemptId required' });

    const attempt = await Attempt.findById(attemptId).populate('quiz');
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
    if (attempt.participant.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'Not your attempt' });
    }

    // Check if quiz is still live
    const quiz = attempt.quiz;
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    // Return attempt with quiz details (without correct answers if not submitted)
    const response = {
      attempt: {
        _id: attempt._id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        totalScore: attempt.totalScore,
        maxScore: attempt.maxScore,
        answers: attempt.answers
      },
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        durationMinutes: quiz.durationMinutes,
        startAt: quiz.startAt,
        endAt: quiz.endAt,
        status: quiz.status,
        questions: quiz.questions.map(q => ({
          _id: q._id,
          text: q.text,
          options: q.options,
          marks: q.marks || 1
          // Don't send correctIndex if not submitted
        }))
      }
    };

    // If submitted, include correct answers for result page
    if (attempt.status === 'submitted' || attempt.status === 'evaluated') {
      response.quiz.questions = quiz.questions.map(q => ({
        ...response.quiz.questions.find(rq => rq._id.toString() === q._id.toString()),
        correctIndex: q.correctIndex
      }));
    }

    res.json(response);
  } catch (err) {
    console.error("Get attempt error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.submitAttempt = async (req, res) => {
  const { attemptId } = req.params;
  const { answers } = req.body; // array of { questionId, selectedIndex }
  if (!attemptId) return res.status(400).json({ error: 'attemptId required' });

  const attempt = await Attempt.findById(attemptId);
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
  if (attempt.participant.toString() !== req.session.userId) return res.status(403).json({ error: 'Not your attempt' });

  if (attempt.status !== 'in_progress') return res.status(400).json({ error: 'Already submitted' });

  // load quiz
  const quiz = await Quiz.findById(attempt.quiz);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  // Check if quiz is still live
  if (quiz.status !== 'live') {
    return res.status(400).json({ error: 'Quiz is not live' });
  }

  attempt.answers = answers.map(a => ({ questionId: a.questionId, selectedIndex: a.selectedIndex }));
  attempt.submittedAt = new Date();
  attempt.status = 'submitted';

  // evaluate immediately
  const ev = evaluate(quiz, attempt);
  attempt.totalScore = ev.total;
  attempt.maxScore = computeMaxScore(quiz);
  await attempt.save();

  res.json({ 
    success: true,
    attempt: {
      _id: attempt._id,
      totalScore: attempt.totalScore,
      maxScore: attempt.maxScore,
      status: attempt.status,
      submittedAt: attempt.submittedAt,
      answers: attempt.answers
    }
  });
};

// fetch my attempts
exports.myAttempts = async (req, res) => {
  const attempts = await Attempt.find({ participant: req.session.userId }).populate('quiz', 'title startAt endAt status');
  res.json({ attempts });
};


exports.dashboardData = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      console.error("Dashboard data: No userId in session");
      return res.status(401).json({ error: "Not authenticated" });
    }

    console.log("Fetching dashboard data for user:", userId);

    // 1) TOTAL QUIZZES
    const totalQuizzes = await Quiz.countDocuments();

    // 2) USER ATTEMPTS
    const attempts = await Attempt.find({ participant: userId })
      .sort({ submittedAt: -1 })
      .limit(5)
      .populate("quiz", "title startAt");

    const attempted = attempts.length;

    let averageScore = 0;
    if (attempted > 0) {
      averageScore =
        attempts.reduce(
          (sum, a) => sum + (a.totalScore || 0),
          0
        ) / attempted;
    }

    // RECENT ATTEMPTS (for frontend UI)
    const recentAttempts = attempts.map((a) => ({
      quizTitle: a.quiz?.title || "Unknown Quiz",
      score: a.totalScore || 0,
      attemptedAt: a.submittedAt || a.createdAt,
    }));

    // 3) UPCOMING QUIZZES - Check for draft quizzes with future startAt or live quizzes
    // Note: Quiz model only has status: 'draft', 'live', 'finished'
    const upcoming = await Quiz.find({
      $or: [
        { startAt: { $gte: new Date() }, status: "draft" }, // Draft quizzes scheduled for future
        { startAt: { $gte: new Date() }, status: "live" }    // Live quizzes that haven't ended
      ]
    }).select("title startAt").limit(10);

    const response = {
      stats: {
        totalQuizzes,
        attempted,
        averageScore: Math.round(averageScore),
        rank: "-", // not implementing ranking yet
      },
      recentAttempts,
      upcoming: upcoming.map(q => ({
        title: q.title,
        startAt: q.startAt,
        _id: q._id
      })),
    };

    console.log("Dashboard data sent successfully");
    return res.json(response);
  } catch (err) {
    console.error("Error in dashboardData:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const User = require('../models/User');
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { name, email, rollNo, organization, program, semester } = req.body;

    // Update user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (rollNo !== undefined) user.rollNo = rollNo;
    if (organization !== undefined) user.organization = organization;
    if (program !== undefined) user.program = program;
    if (semester !== undefined) user.semester = semester;

    await user.save();

    res.json({ 
      success: true, 
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
        organization: user.organization,
        program: user.program,
        semester: user.semester,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Server error while updating profile" });
  }
};
