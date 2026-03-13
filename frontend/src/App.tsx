import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Patterns from './pages/Patterns';
import PatternDetail from './pages/PatternDetail';
import ProblemDetail from './pages/ProblemDetail';
import History from './pages/History';

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <div className="app-glow app-glow-one" />
        <div className="app-glow app-glow-two" />
        <Navbar />
        <main className="main-content">
          <div className="content-frame">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patterns" element={<Patterns />} />
              <Route path="/patterns/:patternId" element={<PatternDetail />} />
              <Route path="/patterns/:patternId/problems/:problemId" element={<ProblemDetail />} />
              <Route path="/history" element={<History />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App
