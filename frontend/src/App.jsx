import { useMemo, useState } from "react";
import "./App.css";

function apiBase() {
  const base = import.meta.env.VITE_API_URL?.trim();
  return base ? base.replace(/\/$/, "") : "";
}

export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const base = useMemo(() => apiBase(), []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setAnswer("");

    const q = question.trim();
    if (!q) {
      setError("Please enter a question.");
      return;
    }

    setLoading(true);
    try {
      const url = `${base}/ask`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      setAnswer(String(data.answer || ""));
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="header">
        <div className="brand">CognitIA</div>
        <div className="subtitle">
          Single-question assistant (no chat history stored in the browser)
        </div>
      </header>

      <main className="card">
        <form className="form" onSubmit={onSubmit}>
          <label className="label" htmlFor="q">
            Your question
          </label>
          <textarea
            id="q"
            className="input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask one clear question…"
            rows={5}
            disabled={loading}
          />

          <div className="row">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Thinking…" : "Get answer"}
            </button>
          </div>
        </form>

        {error ? <div className="alert error">{error}</div> : null}

        {answer ? (
          <section className="answer" aria-live="polite">
            <h2 className="answerTitle">Answer</h2>
            <div className="answerBody">{answer}</div>
          </section>
        ) : null}
      </main>

      <footer className="footer">
        Each submission calls the backend once and stores the pair in MongoDB
        Atlas (question + answer). The UI does not keep prior turns.
      </footer>
    </div>
  );
}
