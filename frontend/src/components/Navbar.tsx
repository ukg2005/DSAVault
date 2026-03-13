import { NavLink } from 'react-router-dom';

export default function Navbar() {
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
      <div className="navbar-meta">Track. Review. Improve.</div>
    </nav>
  );
}
