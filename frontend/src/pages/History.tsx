import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProblems, deleteProblem } from '../api/problems';
import type { Problem, PaginatedResponse } from '../types';
import { difficultyBadge, statusBadge } from '../components/Badge';
import { Search, ChevronLeft, ChevronRight, CheckCircle, Trash2, Calendar } from 'lucide-react';
import client from '../api/client';

export default function History() {
  const [data, setData] = useState<PaginatedResponse<Problem> | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('ALL');
  const [ordering, setOrdering] = useState('-id');
  const [revision, setRevision] = useState(false);
  const [page, setPage] = useState(1);
  
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const navigate = useNavigate();

  const loadData = useCallback(() => {
    setLoading(true);
    const params: Record<string, any> = { page };
    if (search) params.search = search;
    if (difficulty !== 'ALL') params.difficulty = difficulty;
    if (revision) params.revision = true;
    params.ordering = ordering;

    getAllProblems(params)
      .then((res) => setData({
        ...res.data,
        results: res.data.results || (res.data as unknown as Problem[]) // handle both paginated and non-paginated gracefully  
      }))
      .finally(() => setLoading(false));
  }, [search, difficulty, ordering, revision, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Real-time search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
       if (page !== 1) setPage(1);
       else loadData();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleMarkRevised = async (e: React.MouseEvent, p: Problem) => {
    e.stopPropagation();
    try {
      // Record a new attempt
      await client.post(`/api/patterns/${p.pattern}/problems/${p.id}/attempts/`, {
        status: 'OWN',
        notes: 'Revised systematically'
      });
      // Clear reminder by setting it a few weeks out, or null
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 14); // Next revision in 14 days
      await client.patch(`/api/patterns/${p.pattern}/problems/${p.id}/`, {
        reminder: nextDate.toISOString()
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, p: Problem) => {
    e.stopPropagation();
    if (!window.confirm(`Delete ${p.problem_name}? This cannot be undone.`)) return;
    try {
      await deleteProblem(p.pattern, p.id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.size} problems?`)) return;
    try {
      for (const id of Array.from(selectedIds)) {
        const p = data?.results.find(x => x.id === id);
        if (p) await deleteProblem(p.pattern, p.id);
      }
      setSelectedIds(new Set());
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelect = (e: React.MouseEvent | React.ChangeEvent, id: number) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const results = data?.results || [];
  const totalCount = data?.count || results.length;

  return (
    <div>
      <div className="page-header" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">{revision ? 'Revision Queue' : 'History'}</h1>
            <p className="page-subtitle">{totalCount} problems</p>     
          </div>
          
          <div className="flex-row" style={{ gap: '10px' }}>
             {selectedIds.size > 0 && (
                <button className="btn btn-error btn-sm" onClick={handleBulkDelete}>
                  Delete Selected ({selectedIds.size})
                </button>
             )}
            <button 
               className={`btn btn-sm ${revision ? 'btn-primary' : 'btn-ghost'}`} 
               onClick={() => { 
                 const willBeRevision = !revision;
                 setRevision(willBeRevision); 
                 if (willBeRevision) setOrdering('id'); // oldest first
                 setPage(1); 
               }}
            >
               <Calendar size={16} style={{marginRight: 4}} />
               Revision Queue
            </button>
          </div>
        </div>
        
        <div className="flex-row" style={{ marginTop: 16, flexWrap: 'wrap', gap: 12 }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: 8, color: 'var(--text-muted)' }} />
            <input 
               type="text" 
               placeholder="Search by title..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '6px 10px 6px 34px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--text)' }}
            />
          </div>
          
          {/* Sort */}
          <select 
             className="btn btn-sm btn-ghost" 
             value={ordering} 
             onChange={(e) => { setOrdering(e.target.value); setPage(1); }}
             style={{ padding: '6px' }}
          >
             <option value="-id">Most Recent</option>
             <option value="id">Oldest</option>
             <option value="-attempts__solved_at">Latest Attempt</option>
             <option value="difficulty">Difficulty (Easiest)</option>
          </select>

          {/* Filters */}
          <div className="flex-row" style={{ gap: 4 }}>
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((d) => (
              <button
                key={d}
                className={`btn btn-sm ${difficulty === d ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => { setDifficulty(d); setPage(1); }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && !results.length ? (
        <div className="loading">Loading...</div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No problems found</div>
        </div>
      ) : (
        <>
          <div className="problem-list" style={{ marginTop: 16 }}>
            {results.map((p, idx) => (
              <div
                key={p.id + '-' + idx}
                className="problem-row"
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                onClick={() => navigate(`/patterns/${p.pattern}/problems/${p.id}`)}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(p.id)}
                  onChange={(e) => toggleSelect(e, p.id)}
                  onClick={(e) => e.stopPropagation()}
                />

                <div style={{ flex: 1 }}>
                  <div className="problem-name" style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text)' }}>{p.problem_name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {p.latest_attempt ? `Last attempt: ${p.latest_attempt.status} on ${p.latest_attempt.solved_at || 'unknown date'}` : 'Not attempted'}
                  </div>
                </div>
                
                <div className="flex-row" style={{ gap: 8, alignItems: 'center' }}>
                  {difficultyBadge(p.difficulty)}
                  {p.latest_attempt
                    ? statusBadge(p.latest_attempt.status)
                    : <span className="badge badge-neutral">No attempts</span>}   
                </div>
                
                <div className="problem-actions flex-row" style={{ gap: 8 }} onClick={(e) => e.stopPropagation()}>
                  {revision && (
                     <button
                       className="btn btn-primary btn-sm"
                       onClick={(e) => handleMarkRevised(e, p)}
                       title="Mark as revised"
                     >
                       <CheckCircle size={14} style={{ marginRight: 4 }} />
                       Revised
                     </button>
                  )}
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm"
                    title="Open Leetcode"
                  >
                    ↗
                  </a>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={(e) => handleDelete(e, p)} title="Delete problem">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {data?.count && data.count > 20 && (
            <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24 }}>
               <button 
                 className="btn btn-sm btn-ghost" 
                 disabled={!data.previous}
                 onClick={() => setPage(p => p - 1)}
               >
                 <ChevronLeft size={16} /> Prev
               </button>
               <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                 Page {page}
               </span>
               <button 
                 className="btn btn-sm btn-ghost" 
                 disabled={!data.next}
                 onClick={() => setPage(p => p + 1)}
               >
                 Next <ChevronRight size={16} />
               </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
