import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatterns, createPattern, deletePattern } from '../api/patterns';
import type { Pattern } from '../types';
import { confidenceBadge } from '../components/Badge';
import Modal from '../components/Modal';

export default function Patterns() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<{ pattern: string; confidence: Pattern['confidence']; notes: string }>({ pattern: '', confidence: 'MEDIUM', notes: '' });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const load = () => {
    getPatterns()
      .then((res) => setPatterns(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createPattern(form);
      setShowModal(false);
      setForm({ pattern: '', confidence: 'MEDIUM', notes: '' });
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number, name: string) => {
    e.stopPropagation();
    if (!confirm(`Delete pattern "${name}"? This will also delete all problems under it.`)) return;
    await deletePattern(id);
    setPatterns((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Patterns</h1>
          <p className="page-subtitle">{patterns.length} patterns tracked</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Pattern
        </button>
      </div>

      {patterns.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No patterns yet</div>
          <div className="empty-state-desc">Add your first DSA pattern to get started</div>
        </div>
      ) : (
        <div className="card-grid">
          {patterns.map((p) => (
            <div
              key={p.id}
              className="card card-clickable"
              onClick={() => navigate(`/patterns/${p.id}`)}
            >
              <div className="card-title">{p.pattern}</div>
              <div className="card-meta">
                {confidenceBadge(p.confidence)}
              </div>
              {p.notes && (
                <div className="card-notes">
                  {p.notes.length > 100 ? p.notes.slice(0, 100) + '…' : p.notes}
                </div>
              )}
              <div className="card-footer-row">
                <div className="card-stat">
                  Solved: <span>{p.problems_solved}</span>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={(e) => handleDelete(e, p.id, p.pattern)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title="New Pattern"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                form="pattern-form"
                type="submit"
                disabled={saving}
              >
                {saving ? 'Creating…' : 'Create'}
              </button>
            </>
          }
        >
          <form id="pattern-form" onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Pattern Name *</label>
              <input
                className="input"
                required
                value={form.pattern}
                onChange={(e) => setForm({ ...form, pattern: e.target.value })}
                placeholder="e.g. Two Pointers"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confidence</label>
              <select
                className="select"
                value={form.confidence}
                onChange={(e) => setForm({ ...form, confidence: e.target.value as Pattern['confidence'] })}
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
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Key ideas or strategy for this pattern…"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
