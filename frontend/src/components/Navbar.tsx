import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const [isLight, setIsLight] = useState(() => localStorage.getItem('theme') === 'light');

  useEffect(() => {
    if (isLight) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLight]);

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        <span className="brand-mark">DV</span>
        <span className="brand-title">DSA Vault</span>
      </NavLink>
      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Dashboard
        </NavLink>
        <NavLink to="/patterns" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Patterns
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          History
        </NavLink>
      </div>
      <div className="flex-row" style={{ gap: 16 }}>
        <button 
          className="btn btn-ghost btn-sm" 
          onClick={() => setIsLight(!isLight)}
          title="Toggle Theme"
          style={{ padding: '6px 8px' }}
        >
          {isLight ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <div className="navbar-meta">Track. Review. Improve.</div>
      </div>
    </nav>
  );
}
