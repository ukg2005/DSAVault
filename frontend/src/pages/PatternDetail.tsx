import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getPattern, updatePattern, deletePattern } from '../api/patterns';
import { getProblems, createProblem, deleteProblem } from '../api/problems';
import type { Pattern, Problem } from '../types';
import { confidenceBadge, difficultyBadge, statusBadge } from '../components/Badge';
import Modal from '../components/Modal';

export default function PatternDetail() {
  const { patternId } = useParams<{ patternId: string }>();
  const pid = Number(patternId);
  const navigate = useNavigate();

  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showEditPattern, setShowEditPattern] = useState(false);
  const [showAddProblem, setShowAddProblem] = useState(false);

  const [editForm, setEditForm] = useState<{ pattern: string; confidence: Pattern['confidence']; notes: string }>({ pattern: '', confidence: 'MEDIUM', notes: '' });
  const [editSaving, setEditSaving] = useState(false);

  const [problemForm, setProblemForm] = useState({
    problem_name: '',
    difficulty: 'MEDIUM',
    link: '',
    reminder: '',
    notes: '',
  });
  const [problemSaving, setProblemSaving] = useState(false);

  const load = async () => {
    const [patRes, probRes] = await Promise.all([getPattern(pid), getProblems(pid)]);
    setPattern(patRes.data);
    setProblems(probRes.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [pid]);

  const openEditPattern = () => {
    if (pattern) {
      setEditForm({
        pattern: pattern.pattern,
        confidence: pattern.confidence,
        notes: pattern.notes ?? '',
      });
      setShowEditPattern(true);
    }
  };

  const handleEditPattern = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      await updatePattern(pid, editForm);
      setShowEditPattern(false);
      load();
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeletePattern = async () => {
    if (!confirm(`Delete pattern "${pattern?.pattern}"? All problems will be deleted too.`)) return;
    await deletePattern(pid);
    navigate('/patterns');
  };

  const handleAddProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    setProblemSaving(true);
    try {
      await createProblem(pid, {
        problem_name: problemForm.problem_name,
        difficulty: problemForm.difficulty as Problem['difficulty'],
        link: problemForm.link,
        reminder: problemForm.reminder ? problemForm.reminder + ':00Z' : null,
        notes: problemForm.notes || null,
      });
      setShowAddProblem(false);
      setProblemForm({ problem_name: '', difficulty: 'MEDIUM', link: '', reminder: '', notes: '' });
      load();
    } finally {
      setProblemSaving(false);
    }
  };

  const handleDeleteProblem = async (e: React.MouseEvent, problemId: number, name: string) => {
    e.stopPropagation();
    if (!confirm(`Delete problem "${name}"?`)) return;
    await deleteProblem(pid, problemId);
    setProblems((prev) => prev.filter((p) => p.id !== problemId));
  };

  if (loading) return <div className="loading">Loading…</div>;
  if (!pattern) return <div className="error-msg">Pattern not found.</div>;

  return (
    <div>
      <Link to="/patterns" className="back-btn">← Patterns</Link>

      <div className="detail-header">
        <div>
          <div className="detail-title-row">
            <h1 className="detail-title">{pattern.pattern}</h1>
            {confidenceBadge(pattern.confidence)}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            {pattern.problems_solved} problem{pattern.problems_solved !== 1 ? 's' : ''} solved
          </div>
        </div>
        <div className="detail-actions">
          <button className="btn btn-ghost btn-sm" onClick={openEditPattern}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={handleDeletePattern}>Delete</button>
        </div>
      </div>

      {pattern.notes && <div className="detail-notes">{pattern.notes}</div>}

      <div className="page-header" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Problems ({problems.length})</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddProblem(true)}>
          + Add Problem
        </button>
      </div>

      {problems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No problems yet</div>
          <div className="empty-state-desc">Add your first problem to this pattern</div>
        </div>
      ) : (
        <div className="problem-list">
          {problems.map((problem) => (
            <div
              key={problem.id}
              className="problem-row"
              onClick={() => navigate(`/patterns/${pid}/problems/${problem.id}`)}
            >
              <div className="problem-name">{problem.problem_name}</div>
              <div className="flex-row" style={{ gap: 8 }}>
                {difficultyBadge(problem.difficulty)}
                {problem.latest_attempt
                  ? statusBadge(problem.latest_attempt.status)
                  : <span className="badge badge-neutral">No attempts</span>}
                {problem.reminder && new Date(problem.reminder) <= new Date() && (
                  <span className="badge badge-failed" style={{ fontSize: 10 }}>Due</span>
                )}
              </div>
              <div className="problem-actions" onClick={(e) => e.stopPropagation()}>
                <a
                  href={problem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  ↗
                </a>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={(e) => handleDeleteProblem(e, problem.id, problem.problem_name)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Pattern Modal */}
      {showEditPattern && (
        <Modal
          title="Edit Pattern"
          onClose={() => setShowEditPattern(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowEditPattern(false)}>Cancel</button>
              <button className="btn btn-primary" form="edit-pattern-form" type="submit" disabled={editSaving}>
                {editSaving ? 'Saving…' : 'Save'}
              </button>
            </>
          }
        >
          <form id="edit-pattern-form" onSubmit={handleEditPattern}>
            <div className="form-group">
              <label className="form-label">Pattern Name *</label>
              <input
                className="input"
                required
                value={editForm.pattern}
                onChange={(e) => setEditForm({ ...editForm, pattern: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confidence</label>
              <select
                className="select"
                value={editForm.confidence}
                onChange={(e) => setEditForm({ ...editForm, confidence: e.target.value as Pattern['confidence'] })}
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                <option value="BLIND">Blind</option>
              </select>
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

      {/* Add Problem Modal */}
      {showAddProblem && (
        <Modal
          title="Add Problem"
          onClose={() => setShowAddProblem(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowAddProblem(false)}>Cancel</button>
              <button className="btn btn-primary" form="add-problem-form" type="submit" disabled={problemSaving}>
                {problemSaving ? 'Adding…' : 'Add'}
              </button>
            </>
          }
        >
          <form id="add-problem-form" onSubmit={handleAddProblem}>
            <div className="form-group">
              <label className="form-label">Problem Name *</label>
              <input
                className="input"
                required
                value={problemForm.problem_name}
                onChange={(e) => setProblemForm({ ...problemForm, problem_name: e.target.value })}
                placeholder="e.g. Two Sum"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select
                className="select"
                value={problemForm.difficulty}
                onChange={(e) => setProblemForm({ ...problemForm, difficulty: e.target.value })}
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
                value={problemForm.link}
                onChange={(e) => setProblemForm({ ...problemForm, link: e.target.value })}
                placeholder="https://leetcode.com/problems/…"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reminder</label>
              <input
                className="input"
                type="datetime-local"
                value={problemForm.reminder}
                onChange={(e) => setProblemForm({ ...problemForm, reminder: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="textarea"
                value={problemForm.notes}
                onChange={(e) => setProblemForm({ ...problemForm, notes: e.target.value })}
                placeholder="Key observations, approach…"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
