const Quiz = require("../models/Quiz");

exports.importQuestions = async (req, res) => {
  try {
    const { type, content } = req.body;
    const quizId = req.params.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    let questions = [];

    // CSV parser
    if (type === "csv") {
      const rows = content.split("\n").slice(1); // skip header

      rows.forEach((row) => {
        const cols = row.split(",");

        questions.push({
          text: cols[0],
          options: [cols[1], cols[2], cols[3], cols[4]],
          correctIndex: Number(cols[5]) - 1,
          marks: Number(cols[6]) || 1,
        });
      });
    }

    // JSON import
    if (type === "json") {
      questions = JSON.parse(content).map((q) => ({
        text: q.text || q.question,
        options: [
          q.option1 || q.options?.[0],
          q.option2 || q.options?.[1],
          q.option3 || q.options?.[2],
          q.option4 || q.options?.[3],
        ],
        correctIndex: (q.correctOption || q.correctIndex) - 1,
        marks: q.marks || 1,
      }));
    }

    quiz.questions.push(...questions);
    await quiz.save();

    return res.json({ message: "Imported", quiz });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Import failed" });
  }
};
