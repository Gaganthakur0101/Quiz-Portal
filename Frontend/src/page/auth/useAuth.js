import { useEffect, useState } from "react";
import API from "../api";

export default function useAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser]     = useState(null);

  useEffect(() => {
    API.get("/auth/me")
      .then(res => {
        setUser(res.data.user);   // logged in user
      })
      .catch(() => {
        setUser(null);            // NOT logged in
      })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
