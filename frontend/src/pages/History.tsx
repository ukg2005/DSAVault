import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProblems } from '../api/problems';
import type { Problem } from '../types';
import { difficultyBadge, statusBadge } from '../components/Badge';

export default function History() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    getAllProblems()
      .then((res) => setProblems(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === 'ALL' ? problems : problems.filter((p) => p.difficulty === filter);

  if (loading) return <div className="loading">Loading…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">History</h1>
          <p className="page-subtitle">{problems.length} problems total</p>
        </div>
        <div className="flex-row">
          {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((d) => (
            <button
              key={d}
              className={`btn btn-sm ${filter === d ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No problems found</div>
        </div>
      ) : (
        <div className="problem-list">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="problem-row"
              onClick={() => navigate(`/patterns/${p.pattern}/problems/${p.id}`)}
            >
              <div className="problem-name">{p.problem_name}</div>
              <div className="flex-row" style={{ gap: 8 }}>
                {difficultyBadge(p.difficulty)}
                {p.latest_attempt
                  ? statusBadge(p.latest_attempt.status)
                  : <span className="badge badge-neutral">No attempts</span>}
              </div>
              <div className="problem-actions" onClick={(e) => e.stopPropagation()}>
                <a
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
