import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiCheckCircle, FiXCircle, FiAward, FiArrowLeft, FiDownload } from "react-icons/fi";
import API from "../../api";

const QuizResult = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get("attemptId");

  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!attemptId) {
      setError("No attempt ID provided");
      setLoading(false);
      return;
    }

    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/participant/attempt/${attemptId}`, {
          withCredentials: true,
        });

        if (res.data) {
          setQuizData(res.data);
          
          // If not submitted, redirect to quiz page
          if (res.data.attempt?.status === "in_progress") {
            navigate(`/quiz?attemptId=${attemptId}`);
            return;
          }
        }
      } catch (err) {
        console.error("Error fetching result:", err);
        setError(
          err.response?.data?.error || "Failed to load results. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId, navigate]);

  const downloadResult = () => {
    if (!quizData) return;

    const attempt = quizData.attempt;
    const quiz = quizData.quiz;
    const score = attempt.totalScore || 0;
    const maxScore = attempt.maxScore || 0;
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    const content = `
Quiz Result Report
==================

Quiz Title: ${quiz.title}
Date Submitted: ${new Date(attempt.submittedAt).toLocaleString()}
Score: ${score} / ${maxScore} (${percentage}%)

Question Breakdown:
${quiz.questions.map((q, i) => {
  const answer = attempt.answers.find(a => a.questionId === q._id);
  const isCorrect = answer?.correct || false;
  const selectedOption = answer?.selectedIndex !== undefined 
    ? q.options[answer.selectedIndex] 
    : "Not answered";
  const correctOption = q.options[q.correctIndex];
  
  return `
${i + 1}. ${q.text}
   Your Answer: ${selectedOption} ${isCorrect ? "✓" : "✗"}
   Correct Answer: ${correctOption}
   Marks: ${answer?.marksObtained || 0} / ${q.marks || 1}
`;
}).join("")}

Total Score: ${score} / ${maxScore}
Percentage: ${percentage}%
    `.trim();

    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `quiz_result_${quiz.title.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "No results found"}</p>
          <button
            onClick={() => navigate("/dashboard/participant")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const attempt = quizData.attempt;
  const quiz = quizData.quiz;
  const score = attempt.totalScore || 0;
  const maxScore = attempt.maxScore || 0;
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const correctCount = attempt.answers.filter(a => a.correct).length;
  const totalQuestions = quiz.questions.length;

  // Get score color
  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-400";
    if (percentage >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <nav className="w-full bg-zinc-900 text-white px-6 md:px-16 py-4 flex justify-between items-center border-b border-zinc-800">
        <div className="text-2xl font-bold">Quizzy</div>
        <button
          onClick={() => navigate("/dashboard/participant")}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full mb-4">
            <FiAward className="text-white text-4xl" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
          <p className="text-gray-400">
            Submitted on {new Date(attempt.submittedAt).toLocaleString()}
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-zinc-900 rounded-xl p-8 mb-8 border border-zinc-800">
          <div className="text-center">
            <div className={`text-6xl font-bold mb-2 ${getScoreColor()}`}>
              {percentage}%
            </div>
            <div className="text-2xl text-gray-400 mb-4">
              {score} / {maxScore} points
            </div>
            <div className="flex justify-center gap-8 text-sm">
              <div>
                <div className="text-gray-400">Correct</div>
                <div className="text-green-400 font-semibold text-lg">
                  {correctCount} / {totalQuestions}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Incorrect</div>
                <div className="text-red-400 font-semibold text-lg">
                  {totalQuestions - correctCount} / {totalQuestions}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={downloadResult}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FiDownload /> Download Result
          </button>
        </div>

        {/* Questions Review */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Question Review</h2>
          
          {quiz.questions.map((question, index) => {
            const answer = attempt.answers.find(
              (a) => a.questionId === question._id
            );
            const isCorrect = answer?.correct || false;
            const selectedIndex = answer?.selectedIndex;
            const selectedOption =
              selectedIndex !== undefined
                ? question.options[selectedIndex]
                : null;
            const correctOption = question.options[question.correctIndex];
            const marksObtained = answer?.marksObtained || 0;
            const questionMarks = question.marks || 1;

            return (
              <div
                key={question._id}
                className={`bg-zinc-900 rounded-xl p-6 border-2 ${
                  isCorrect
                    ? "border-green-500/50 bg-green-500/5"
                    : "border-red-500/50 bg-red-500/5"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect ? (
                        <FiCheckCircle className="text-green-400 text-xl" />
                      ) : (
                        <FiXCircle className="text-red-400 text-xl" />
                      )}
                      <span className="font-semibold text-lg">
                        Question {index + 1}
                      </span>
                      <span className="text-gray-400 text-sm">
                        ({marksObtained} / {questionMarks} marks)
                      </span>
                    </div>
                    <p className="text-white text-lg">{question.text}</p>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  {question.options.map((option, optIdx) => {
                    const isSelected = selectedIndex === optIdx;
                    const isCorrectAnswer = optIdx === question.correctIndex;

                    let bgClass = "bg-zinc-800";
                    if (isCorrectAnswer) bgClass = "bg-green-500/20 border-green-500";
                    if (isSelected && !isCorrectAnswer) bgClass = "bg-red-500/20 border-red-500";

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-lg border-2 ${bgClass} ${
                          isSelected || isCorrectAnswer ? "border-2" : "border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isCorrectAnswer && (
                            <FiCheckCircle className="text-green-400" />
                          )}
                          {isSelected && !isCorrectAnswer && (
                            <FiXCircle className="text-red-400" />
                          )}
                          <span className={isSelected || isCorrectAnswer ? "font-semibold" : ""}>
                            {option}
                          </span>
                          {isCorrectAnswer && (
                            <span className="ml-auto text-green-400 text-sm">
                              Correct Answer
                            </span>
                          )}
                          {isSelected && !isCorrectAnswer && (
                            <span className="ml-auto text-red-400 text-sm">
                              Your Answer
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedIndex === undefined && (
                  <div className="mt-2 text-yellow-400 text-sm">
                    ⚠ Not answered
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default QuizResult;

