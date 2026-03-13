import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProblem, updateProblem, deleteProblem } from '../api/problems';
import { getAttempts, createAttempt } from '../api/attempts';
import type { Problem, Attempt } from '../types';
import { difficultyBadge, statusBadge } from '../components/Badge';
import Modal from '../components/Modal';

export default function ProblemDetail() {
  const { patternId, problemId } = useParams<{ patternId: string; problemId: string }>();
  const pid = Number(patternId);
  const probId = Number(problemId);
  const navigate = useNavigate();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  const [showEditProblem, setShowEditProblem] = useState(false);
  const [showLogAttempt, setShowLogAttempt] = useState(false);

  const [editForm, setEditForm] = useState({
    problem_name: '',
    difficulty: 'MEDIUM',
    link: '',
    reminder: '',
    notes: '',
  });
  const [editSaving, setEditSaving] = useState(false);

  const [attemptForm, setAttemptForm] = useState({ status: 'OWN', when: 'now', customDate: '', notes: '' });
  const [attemptSaving, setAttemptSaving] = useState(false);

  const load = async () => {
    const [probRes, attRes] = await Promise.all([
      getProblem(pid, probId),
      getAttempts(pid, probId),
    ]);
    setProblem(probRes.data);
    setAttempts(attRes.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [probId]);

  const openEdit = () => {
    if (problem) {
      setEditForm({
        problem_name: problem.problem_name,
        difficulty: problem.difficulty,
        link: problem.link,
        reminder: problem.reminder ? new Date(problem.reminder).toISOString().slice(0, 16) : '',
        notes: problem.notes ?? '',
      });
      setShowEditProblem(true);
    }
  };

  const handleEditProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      await updateProblem(pid, probId, {
        problem_name: editForm.problem_name,
        difficulty: editForm.difficulty as Problem['difficulty'],
        link: editForm.link,
        reminder: editForm.reminder ? editForm.reminder + ':00Z' : null,
        notes: editForm.notes || null,
      });
      setShowEditProblem(false);
      load();
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete problem "${problem?.problem_name}"?`)) return;
    await deleteProblem(pid, probId);
    navigate(`/patterns/${pid}`);
  };

  const handleLogAttempt = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptSaving(true);
    try {
      let solvedAt: string | undefined = undefined;
      if (attemptForm.when === 'custom' && attemptForm.customDate) {
        solvedAt = attemptForm.customDate;
      }
      await createAttempt(pid, probId, {
        status: attemptForm.status as Attempt['status'],
        solved_at: solvedAt,
        notes: attemptForm.notes || null,
      });
      setShowLogAttempt(false);
      setAttemptForm({ status: 'OWN', when: 'now', customDate: '', notes: '' });
      load();
    } finally {
      setAttemptSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading…</div>;
  if (!problem) return <div className="error-msg">Problem not found.</div>;

  const isDue = problem.reminder && new Date(problem.reminder) <= new Date();

  return (
    <div>
      <Link to={`/patterns/${pid}`} className="back-btn">← Pattern</Link>

      <div className="detail-header">
        <div>
          <div className="detail-title-row">
            <h1 className="detail-title">{problem.problem_name}</h1>
            {difficultyBadge(problem.difficulty)}
            {problem.latest_attempt && statusBadge(problem.latest_attempt.status)}
          </div>
          <div className="flex-row" style={{ marginTop: 8, gap: 16 }}>
            <a
              href={problem.link}
              target="_blank"
              rel="noopener noreferrer"
              className="external-link"
            >
              Open Problem ↗
            </a>
            {problem.reminder && (
              <span
                style={{
                  fontSize: 13,
                  color: isDue ? 'var(--hard)' : 'var(--text-muted)',
                }}
              >
                {isDue ? '⚠ Due: ' : 'Reminder: '}
                {new Date(problem.reminder).toLocaleDateString('en-GB')}
              </span>
            )}
          </div>
        </div>
        <div className="detail-actions">
          <button className="btn btn-ghost btn-sm" onClick={openEdit}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      {problem.notes && <div className="detail-notes">{problem.notes}</div>}

      <div className="page-header" style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Attempts ({attempts.length})</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowLogAttempt(true)}>
          + Log Attempt
        </button>
      </div>

      {attempts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No attempts yet</div>
          <div className="empty-state-desc">Log your first attempt for this problem</div>
        </div>
      ) : (
        <div className="attempt-list">
          {attempts.map((att) => (
            <div key={att.id} className="attempt-row">
              <div className="attempt-header">
                {statusBadge(att.status)}
                <span className="attempt-date">
                  {new Date(att.solved_at).toLocaleDateString('en-GB')}
                </span>
              </div>
              {att.notes && <div className="attempt-notes">{att.notes}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Edit Problem Modal */}
      {showEditProblem && (
        <Modal
          title="Edit Problem"
          onClose={() => setShowEditProblem(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowEditProblem(false)}>Cancel</button>
              <button className="btn btn-primary" form="edit-problem-form" type="submit" disabled={editSaving}>
                {editSaving ? 'Saving…' : 'Save'}
              </button>
            </>
          }
        >
          <form id="edit-problem-form" onSubmit={handleEditProblem}>
            <div className="form-group">
              <label className="form-label">Problem Name *</label>
              <input
                className="input"
                required
                value={editForm.problem_name}
                onChange={(e) => setEditForm({ ...editForm, problem_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select
                className="select"
                value={editForm.difficulty}
                onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Link *</label>
              <input
                className="input"
                required
                type="url"
                value={editForm.link}
                onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reminder</label>
              <input
                className="input"
                type="datetime-local"
                value={editForm.reminder}
                onChange={(e) => setEditForm({ ...editForm, reminder: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="textarea"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Log Attempt Modal */}
      {showLogAttempt && (
        <Modal
          title="Log Attempt"
          onClose={() => setShowLogAttempt(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowLogAttempt(false)}>Cancel</button>
              <button className="btn btn-primary" form="log-attempt-form" type="submit" disabled={attemptSaving}>
                {attemptSaving ? 'Saving…' : 'Log'}
              </button>
            </>
          }
        >
          <form id="log-attempt-form" onSubmit={handleLogAttempt}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="select"
                value={attemptForm.status}
                onChange={(e) => setAttemptForm({ ...attemptForm, status: e.target.value })}
              >
                <option value="OWN">Own — solved independently</option>
                <option value="PARTIAL">Partial — needed some help</option>
                <option value="HINT">Hint — used hints/editorial</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">When</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="when"
                    value="now"
                    checked={attemptForm.when === 'now'}
                    onChange={(e) => setAttemptForm({ ...attemptForm, when: e.target.value })}
                  />
                  Now
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="when"
                    value="custom"
                    checked={attemptForm.when === 'custom'}
                    onChange={(e) => setAttemptForm({ ...attemptForm, when: e.target.value })}
                  />
                  Custom date
                </label>
                {attemptForm.when === 'custom' && (
                  <input
                    type="date"
                    className="input"
                    value={attemptForm.customDate}
                    onChange={(e) => setAttemptForm({ ...attemptForm, customDate: e.target.value })}
                    style={{ marginLeft: '28px' }}
                  />
                )}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="textarea"
                value={attemptForm.notes}
                onChange={(e) => setAttemptForm({ ...attemptForm, notes: e.target.value })}
                placeholder="What did you learn? Where did you get stuck?"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
