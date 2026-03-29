import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getDashboard } from '../api/dashboard';
import type { DashboardData } from '../types';
import { difficultyBadge, confidenceBadge } from '../components/Badge';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (!data) return <div className="error-msg">Failed to load dashboard.</div>;

  const difficultyOrder = ['EASY', 'MEDIUM', 'HARD'];
  const difficultyColors: Record<string, string> = {
    EASY: '#4ade80',  // var(--easy) equivalent visually
    MEDIUM: '#facc15', // var(--medium) 
    HARD: '#f87171',   // var(--hard)
  };

  const statusColors: Record<string, string> = {
    OWN: '#4ade80',
    PARTIAL: '#facc15',
    HINT: '#fb923c',
    FAILED: '#ef4444'
  };

  const diffChartData = data.by_difficulty.map(d => ({
    name: d.difficulty,
    value: d.count,
    fill: difficultyColors[d.difficulty] || '#888'
  }));

  const statusChartData = data.by_status.map(s => ({
    name: s.status,
    value: s.count,
    fill: statusColors[s.status] || '#888'
  }));

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
        {/* Difficulty Breakdown Chart */}
        <div className="dashboard-section" style={{ margin: 0, padding: 20 }}>
          <h2 className="section-title">By Difficulty</h2>
          <div style={{ width: '100%', height: 250, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie data={diffChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {diffChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Chart */}
        <div className="dashboard-section" style={{ margin: 0, padding: 20 }}>
          <h2 className="section-title">Confidence Distribution</h2>
          <div style={{ width: '100%', height: 250, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Graph */}
      <div className="dashboard-section" style={{ padding: 20, marginTop: 24 }}>
        <h2 className="section-title">Problems Solved Over Time (Last 60 days)</h2>
        <div style={{ width: '100%', height: 250, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
             <LineChart data={data.activity_graph}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={tick => new Date(tick).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} />
                <YAxis allowDecimals={false} />
                <Tooltip labelFormatter={label => new Date(label as string).toLocaleDateString()} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
             </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
          {/* Weak patterns */}
          {data.weak_patterns.length > 0 && (
            <div className="dashboard-section" style={{ margin: 0 }}>
              <h2 className="section-title" style={{ color: 'var(--hard)' }}>Weak Patterns</h2>
              <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                {data.weak_patterns.map((p, i) => (
                  <div 
                    key={i} 
                    className="card card-clickable" 
                    onClick={() => navigate(`/patterns/${p.id}`)}
                    style={{ borderTop: '3px solid var(--hard)' }}
                  >
                    <div className="card-title">{p.pattern}</div>
                    <div className="card-meta" style={{ marginTop: 8 }}>
                      {confidenceBadge(p.confidence)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Due for revision */}
          {data.due_for_revision.length > 0 && (
            <div className="dashboard-section" style={{ margin: 0 }}>
              <h2 className="section-title">Due for Revision Focus</h2>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Problem</th>
                      <th>Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.due_for_revision.slice(0, 5).map((p) => (
                      <tr key={p.id}>
                        <td>
                          <Link to={`/problems/${p.id}`} className="hover-link" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 500 }}>{p.problem_name}</span> 
                            {difficultyBadge(p.difficulty)}
                          </Link>
                        </td>
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
      </div>

      {/* By pattern table */}
      <div className="dashboard-section" style={{ marginTop: 24 }}>
        <h2 className="section-title">Breakdown By Pattern</h2>
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
              {data.by_pattern.sort((a,b) => b.problem_count - a.problem_count).map((p, i) => (
                <tr key={i}>
                  <td>
                    <Link to={`/patterns/${p.id}`} className="hover-link" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>{p.pattern}</Link>
                  </td>
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
