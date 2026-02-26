import React, { useState } from "react";
import API from "./api";

export default function TestConnection() {
  const [result, setResult] = useState(null);

  const testBackend = async () => {
    try {
      const res = await API.get("/");
      setResult(res.data);
    } catch (err) {
      setResult("Error connecting");
      console.log(err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <button
        onClick={testBackend}
        style={{ padding: "10px 20px", background: "black", color: "white" }}
      >
        Test Backend Connection
      </button>

      <pre style={{ marginTop: 20, color: "green" }}>
        {result ? JSON.stringify(result, null, 2) : "No response yet"}
      </pre>
    </div>
  );
}
