import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../../api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [message, setMessage] = useState("Verifying...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setMessage("Invalid verification link.");
      setLoading(false);
      return;
    }

    async function verify() {
      try {
        const res = await API.get(`auth/verify-email?token=${token}`);
        setMessage(res.data.message);
      } catch (err) {
        setMessage(err.response?.data?.message || "Verification failed.");
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [token]);

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>Email Verification</h1>
      <p>{loading ? "Please wait..." : message}</p>
    </div>
  );
}
