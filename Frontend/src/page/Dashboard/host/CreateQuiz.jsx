"use client";
import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import API from "../../../api";

export default function CreateQuiz({ onQuizCreated, editingQuiz }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(10);
  const [maxParticipants, setMaxParticipants] = useState(0);

  const [quizId, setQuizId] = useState(null);
  const [questions, setQuestions] = useState([]);

  // Manual Question State
  const [manual, setManual] = useState({
    text: "",
    options: ["", "", "", ""],
    correctOption: 1,
    marks: 1,
  });

  // Editing State
  const [editingIndex, setEditingIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(false);

  // ==================================================
  // LOAD EXISTING QUIZ (EDIT MODE)
  // ==================================================
  useEffect(() => {
    if (editingQuiz) {
      setTitle(editingQuiz.title || "");
      setDescription(editingQuiz.description || "");
      setDuration(editingQuiz.durationMinutes || 10);
      setMaxParticipants(editingQuiz.maxParticipants || 0);
      setQuizId(editingQuiz._id || editingQuiz.id);
      setQuestions(editingQuiz.questions || []);
    }
  }, [editingQuiz]);

  // ==================================================
  // CREATE BLANK QUIZ
  // ==================================================
  const createBlankQuiz = async () => {
    if (!title.trim()) return alert("Title required!");

    setLoading(true);
    try {
      const res = await API.post(
        "/quizzes",
        {
          title,
          description,
          maxParticipants,
          durationMinutes: duration,
          questions: [],
        },
        { withCredentials: true }
      );

      const data = res.data;

      const id =
        data.quiz?._id ||
        data.quiz?.id ||
        data.quizId ||
        data.id ||
        null;

      if (!id) return alert("Quiz ID not returned");

      setQuizId(id);
      alert("Quiz Created! Now add questions.");
    } catch (e) {
      alert("Error: " + e.message);
    }
    setLoading(false);
  };

  // ==================================================
  // UPDATE ENTIRE QUIZ BASIC INFO
  // ==================================================
  const updateQuiz = async () => {
    if (!quizId) return;

    try {
      await API.put(
        `/quizzes/${quizId}`,
        {
          title,
          description,
          maxParticipants,
          durationMinutes: duration,
        },
        { withCredentials: true }
      );
      onQuizCreated();
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
    }
  };

  // ==================================================
  // UPLOAD QUESTION FILES
  // ==================================================
  const uploadQuestionsToBackend = async (type, content) => {
    if (!quizId) return alert("Create or load quiz first!");

    try {
      const res = await API.post(
        `/quizzes/${quizId}/import`,
        {
          type,
          content,
          marksDefault: 1,
        },
        { withCredentials: true }
      );

      if (res.data?.quiz) setQuestions(res.data.quiz.questions);
    } catch (err) {
      alert(err.response?.data?.error || "Import failed");
    }
  };

  const handleCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!quizId) return alert("Create or load quiz first!");

    Papa.parse(file, {
      complete: async (result) => {
        const csvText = result.data.map((row) => row).join("\n");
        await uploadQuestionsToBackend("csv", csvText);
      },
    });
  };

  const handleXLSX = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!quizId) return alert("Create or load quiz first!");

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      await uploadQuestionsToBackend("json", JSON.stringify(json));
    };
    reader.readAsBinaryString(file);
  };

  // ==================================================
  // MANUAL QUESTION ADD
  // ==================================================
  const addManualQuestion = async () => {
    if (!quizId) return alert("Create quiz first!");

    const q = [
      {
        text: manual.text,
        options: manual.options,
        correctIndex: manual.correctOption - 1,
        marks: manual.marks,
      },
    ];

    await uploadQuestionsToBackend("json", JSON.stringify(q));

    setManual({
      text: "",
      options: ["", "", "", ""],
      correctOption: 1,
      marks: 1,
    });
  };

  // ==================================================
  // START EDITING QUESTION
  // ==================================================
  const startEditing = (index) => {
    const q = questions[index];

    setManual({
      text: q.text,
      options: [...q.options],
      correctOption: (q.correctIndex || 0) + 1,
      marks: q.marks || 1,
    });

    setEditingIndex(index);
    setIsEditing(true);
  };

  // ==================================================
  // UPDATE (EDIT) QUESTION
  // ==================================================
  const updateQuestion = async () => {
    if (editingIndex === null) return alert("Select a question to edit");

    try {
      await API.put(
        `/quizzes/${quizId}/questions/${editingIndex}`,
        {
          text: manual.text,
          options: manual.options,
          correctIndex: manual.correctOption - 1,
          marks: manual.marks,
        },
        { withCredentials: true }
      );

      // update frontend list
      const updated = [...questions];
      updated[editingIndex] = {
        text: manual.text,
        options: manual.options,
        correctIndex: manual.correctOption - 1,
        marks: manual.marks,
      };
      setQuestions(updated);

      // reset
      setManual({
        text: "",
        options: ["", "", "", ""],
        correctOption: 1,
        marks: 1,
      });

      setEditingIndex(null);
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
    }
  };

  const deleteQuestion = async (index) => {
    if (!confirm("Delete this question?")) return;

    try {
      await API.delete(`/quizzes/${quizId}/questions/${index}`, {
        withCredentials: true,
      });

      // Update frontend
      const newList = [...questions];
      newList.splice(index, 1);
      setQuestions(newList);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete question");
    }
  };

  // ==================================================
  // FINALIZE QUIZ
  // ==================================================
  const finalizeQuiz = () => {
    if (!quizId) return alert("Create quiz first!");
    alert("Quiz Completed!");
    onQuizCreated();
  };

  return (
    <div className="p-8 text-white">
      <h2 className="text-3xl font-bold mb-4">
        {editingQuiz ? "Edit Quiz" : "Create Quiz"}
      </h2>

      {/* BASIC INPUTS */}
      <input
        className="w-full p-3 bg-gray-900 mb-3 rounded"
        placeholder="Quiz title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="w-full p-3 bg-gray-900 mb-4 rounded"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="flex gap-4 mb-4">
        <input
          type="number"
          className="p-3 bg-gray-900 rounded"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          placeholder="Duration"
        />
        <input
          type="number"
          className="p-3 bg-gray-900 rounded"
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(Number(e.target.value))}
          placeholder="Max participants"
        />
      </div>

      {/* CREATE / UPDATE BUTTON */}
      {!editingQuiz && !quizId && (
        <button
          onClick={createBlankQuiz}
          className="px-6 py-3 bg-blue-600 rounded-lg mb-6"
        >
          {loading ? "Creating..." : "Create Quiz"}
        </button>
      )}

      {editingQuiz && (
        <button
          onClick={updateQuiz}
          className="px-6 py-3 bg-yellow-500 rounded-lg mb-6"
        >
          Update Quiz
        </button>
      )}

      {quizId && (
        <>
          {/* FILE UPLOAD */}
          <div className="border border-gray-700 p-4 rounded mb-4">
            <h3 className="text-xl mb-2">Upload Questions</h3>
            <input type="file" accept=".csv" onChange={handleCSV} className="mb-2" />
            <input type="file" accept=".xlsx" onChange={handleXLSX} />
          </div>

          {/* MANUAL QUESTION INPUT */}
          <div className="border border-gray-700 p-4 rounded mb-4">
            <h3 className="text-xl mb-2">
              {isEditing ? "Edit Question" : "Add Manual Question"}
            </h3>

            <input
              className="w-full p-2 bg-gray-900 mb-2 rounded"
              placeholder="Question text"
              value={manual.text}
              onChange={(e) => setManual({ ...manual, text: e.target.value })}
            />

            {manual.options.map((opt, i) => (
              <input
                key={i}
                className="w-full p-2 bg-gray-800 mb-2 rounded"
                placeholder={`Option ${i + 1}`}
                value={manual.options[i]}
                onChange={(e) => {
                  const newOpts = [...manual.options];
                  newOpts[i] = e.target.value;
                  setManual({ ...manual, options: newOpts });
                }}
              />
            ))}

            <label>
              Correct Option
              <input
                type="number"
                min="1"
                max="4"
                className="ml-3 w-16 bg-gray-800 rounded p-2"
                value={manual.correctOption}
                onChange={(e) =>
                  setManual({ ...manual, correctOption: Number(e.target.value) })
                }
              />
            </label>

            {!isEditing ? (
              <button
                onClick={addManualQuestion}
                className="px-4 py-2 bg-green-600 mt-3 rounded"
              >
                Add Question
              </button>
            ) : (
              <button
                onClick={updateQuestion}
                className="px-4 py-2 bg-blue-600 mt-3 rounded"
              >
                Update Question
              </button>
            )}
          </div>

          {/* QUESTION LIST */}
          {/* QUESTION LIST */}
          <h3 className="text-xl mb-2">Added Questions ({questions.length})</h3>
          <div className="max-h-60 overflow-y-auto bg-gray-900 p-3 rounded mb-6">
            {questions.map((q, i) => (
              <div
                key={i}
                className="p-2 border-b border-gray-700 flex justify-between items-center"
              >
                <b>
                  {i + 1}. {q.text}
                </b>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEditing(i)}
                    className="px-3 py-1 bg-yellow-600 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteQuestion(i)}
                    className="px-3 py-1 bg-red-600 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* FINALIZE */}
          {!editingQuiz && (
            <button
              onClick={finalizeQuiz}
              className="px-6 py-3 bg-purple-600 rounded-lg"
            >
              Finalize Quiz
            </button>
          )}
        </>
      )}
    </div>
  );
}
