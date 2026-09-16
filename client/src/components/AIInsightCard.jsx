import { useState } from "react";
import { api } from "../api";

export default function AIInsightCard({ month }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAIInsight(month);
      setInsight(res.insight);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card ai-card">
      <h3>AI Insight</h3>

      {!insight && !loading && (
        <button className="ai-button" onClick={handleAnalyze}>
          ✨ Analyze my spending
        </button>
      )}

      {loading && <p className="muted">Analyzing your spending...</p>}

      {error && <p className="alert-line alert-danger">{error}</p>}

      {insight && (
        <>
          <p className="insight-line">{insight}</p>
          <button className="ai-button-secondary" onClick={handleAnalyze}>
            Re-analyze
          </button>
        </>
      )}
    </div>
  );
}
