"use client";
import { useState } from "react";
import { Backdrop } from "@/components/Backdrop";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  return (
    <>
      <Backdrop />
      <main className="auth-page">
        <div className="auth-card">
          <a className="brand" href="/" style={{ marginBottom: 28 }}>
            <span className="mark" /> StarSource
          </a>

          {status === "sent" ? (
            <>
              <h1 className="auth-h1">Check your email</h1>
              <p className="lede" style={{ margin: "10px 0 0" }}>
                If {email} has access, a sign-in link just landed in that inbox. It expires in 15
                minutes.
              </p>
            </>
          ) : (
            <>
              <h1 className="auth-h1">Sign in</h1>
              <p className="lede" style={{ margin: "10px 0 24px" }}>
                Enter your email and we&rsquo;ll send you a link — no password to remember.
              </p>
              <form onSubmit={submit} className="auth-form">
                <input
                  type="email"
                  required
                  placeholder="you@yourcompany.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Send sign-in link"}
                </button>
              </form>
              {error && <p className="discovery-error" style={{ marginTop: 14 }}>{error}</p>}
            </>
          )}
        </div>
      </main>
    </>
  );
}
