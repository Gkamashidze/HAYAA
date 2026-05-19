"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        username, password, redirect: false,
      });
      if (result?.error) {
        setError("Invalid username or password.");
      } else {
        router.push("/admin");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--cream)",
    }}>
      <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border-color)", padding: "2.5rem", width: "100%", maxWidth: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 22, color: "white" }}>H</span>
          </div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "1.4rem", fontWeight: 600 }}>HAYAA Admin</h1>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>Sign in to manage your store</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Username</label>
            <input
              type="text" value={username}
              onChange={(e) => setUsername(e.target.value)}
              required autoFocus
              style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8, border: "1px solid var(--border-color)", fontSize: 14, background: "white" }}
              placeholder="admin"
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Password</label>
            <input
              type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8, border: "1px solid var(--border-color)", fontSize: 14, background: "white" }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{ background: "rgba(204,68,68,0.08)", border: "1px solid rgba(204,68,68,0.3)", color: "#cc4444", borderRadius: 8, padding: "0.625rem 0.875rem", fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              width: "100%", padding: "0.75rem",
              background: loading ? "#ccc" : "var(--primary)",
              color: "white", border: "none", borderRadius: 8,
              fontWeight: 600, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
