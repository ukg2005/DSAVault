import { useEffect, useState } from 'react';
import { getDashboard } from '../api/dashboard';
import type { DashboardData } from '../types';
import { difficultyBadge, confidenceBadge, statusBadge } from '../components/Badge';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (!data) return <div className="error-msg">Failed to load dashboard.</div>;

  const difficultyOrder = ['EASY', 'MEDIUM', 'HARD'];
  const difficultyColors: Record<string, string> = {
    EASY: 'var(--easy)',
    MEDIUM: 'var(--medium)',
    HARD: 'var(--hard)',
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your DSA practice overview</p>
        </div>
      </div>

      {/* Top stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Problems</div>
          <div className="stat-value">{data.total_problems}</div>
        </div>
        {difficultyOrder.map((diff) => {
          const item = data.by_difficulty.find((d) => d.difficulty === diff);
          return (
            <div className="stat-card" key={diff}>
              <div className="stat-label">{diff}</div>
              <div className="stat-value" style={{ color: difficultyColors[diff] }}>
                {item?.count ?? 0}
              </div>
            </div>
          );
        })}
      </div>

      {/* Attempt status breakdown */}
      <div className="dashboard-section">
        <h2 className="section-title">Attempt Status Breakdown</h2>
        <div className="flex-row">
          {data.by_status.map((s) => (
            <div className="card" key={s.status} style={{ padding: '12px 16px', minWidth: 100 }}>
              <div style={{ marginBottom: 6 }}>{statusBadge(s.status)}</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{s.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Due for revision */}
      {data.due_for_revision.length > 0 && (
        <div className="dashboard-section">
          <h2 className="section-title">Due for Revision</h2>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Problem</th>
                  <th>Difficulty</th>
                  <th>Due</th>
                </tr>
              </thead>
              <tbody>
                {data.due_for_revision.map((p) => (
                  <tr key={p.id}>
                    <td>{p.problem_name}</td>
                    <td>{difficultyBadge(p.difficulty)}</td>
                    <td style={{ color: 'var(--hard)', fontSize: 13 }}>
                      {new Date(p.reminder).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent attempts */}
      {data.recent_attempts.length > 0 && (
        <div className="dashboard-section">
          <h2 className="section-title">Recent Attempts (Last 7 Days)</h2>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Problem</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_attempts.map((a, i) => (
                  <tr key={i}>
                    <td>{a.problem__problem_name}</td>
                    <td>{statusBadge(a.status)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {new Date(a.solved_at).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Weak patterns */}
      {data.weak_patterns.length > 0 && (
        <div className="dashboard-section">
          <h2 className="section-title">Weak Patterns</h2>
          <div className="flex-row">
            {data.weak_patterns.map((p, i) => (
              <div key={i} className="card" style={{ padding: '10px 14px' }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{p.pattern}</div>
                {confidenceBadge(p.confidence)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By pattern table */}
      <div className="dashboard-section">
        <h2 className="section-title">By Pattern</h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Pattern</th>
                <th>Confidence</th>
                <th>Problems</th>
              </tr>
            </thead>
            <tbody>
              {data.by_pattern.map((p, i) => (
                <tr key={i}>
                  <td>{p.pattern}</td>
                  <td>{confidenceBadge(p.confidence)}</td>
                  <td>{p.problem_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
