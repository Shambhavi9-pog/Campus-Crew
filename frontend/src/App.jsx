import React, { useEffect, useState } from 'react';
import { Menu, RefreshCw } from 'lucide-react';
import { api } from './api';
import Sidebar, { NAV_ITEMS } from './components/Sidebar';
import StatusBadge from './components/StatusBadge';
import DashboardPage from './pages/DashboardPage';
import {
  DigitalTwinPage,
  ResourcesPage,
  DependencyNetworkPage
} from './pages/DigitalTwinAndResourcesPages';
import {
  SimulationCentrePage,
  CascadeAnalysisPage
} from './pages/SimulationAndCascadePages';
import {
  SectionTimetablePage,
  SmartReschedulingPage
} from './pages/TimetablePages';
import {
  BeforeAfterPage,
  RecommendationsPage,
  ReportsPage
} from './pages/BeforeAfterAndGovernancePages';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadState = async () => {
    try {
      setError(null);
      const data = await api.getState();
      setState(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to CAMPUS CREW backend');
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  const runAction = async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await fn();
      setState(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const pageMeta = NAV_ITEMS.find((n) => n.id === activePage) || NAV_ITEMS[0];

  if (!state && !error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b162a', color: 'white', flexDirection: 'column', gap: 12 }}>
        <div className="brand-logo" style={{ width: 52, height: 52, fontSize: 20 }}>CC</div>
        <div style={{ fontWeight: 700, letterSpacing: '0.06em' }}>LOADING CAMPUS CREW DIGITAL TWIN...</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        state={state}
      />

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={18} />
            </button>
            <span className="topbar-brand-pill">CAMPUS CREW</span>
            <h1 className="topbar-page-title">{pageMeta.label}</h1>
          </div>

          <div className="topbar-actions">
            {state && (
              <>
                <StatusBadge
                  status={state.evaluation.summary.mainPowerStatus}
                  customLabel={`Grid: ${state.evaluation.summary.mainPowerStatus}`}
                />
                <span className="badge badge-navy">
                  {state.disruptionWindow.day} • {state.disruptionWindow.slot}
                </span>
              </>
            )}
            <button
              className="btn btn-outline btn-sm"
              onClick={loadState}
              disabled={loading}
              title="Refresh from backend"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Sync
            </button>
          </div>
        </header>

        <main className="content-container">
          {error && (
            <div className="alert-banner alert-danger">
              <strong>Error:</strong> {error}
            </div>
          )}

          {state && activePage === 'dashboard' && (
            <DashboardPage
              state={state}
              onSimulate={(payload) => runAction(() => api.simulate(payload))}
              onRestore={(resetTt) => runAction(() => api.restore(resetTt))}
              onNavigate={setActivePage}
            />
          )}

          {state && activePage === 'digital-twin' && <DigitalTwinPage state={state} />}
          {state && activePage === 'resources' && <ResourcesPage state={state} />}
          {state && activePage === 'dependency-network' && <DependencyNetworkPage state={state} />}

          {state && activePage === 'simulation' && (
            <SimulationCentrePage
              state={state}
              loading={loading}
              onSimulate={(payload) => runAction(() => api.simulate(payload))}
              onRestore={(resetTt) => runAction(() => api.restore(resetTt))}
              onResetDemo={() => runAction(() => api.resetDemo())}
            />
          )}

          {state && activePage === 'cascade' && <CascadeAnalysisPage state={state} />}

          {state && activePage === 'cse-a' && (
            <SectionTimetablePage
              section="CSE A"
              state={state}
              onSaveEntry={(id, updates) => runAction(() => api.updateTimetableEntry(id, updates))}
            />
          )}

          {state && activePage === 'cse-b' && (
            <SectionTimetablePage
              section="CSE B"
              state={state}
              onSaveEntry={(id, updates) => runAction(() => api.updateTimetableEntry(id, updates))}
            />
          )}

          {state && activePage === 'rescheduling' && (
            <SmartReschedulingPage state={state} onNavigate={setActivePage} />
          )}

          {state && activePage === 'before-after' && (
            <BeforeAfterPage
              state={state}
              loading={loading}
              onDecide={(id, decision) => runAction(() => api.decideProposal(id, decision))}
              onApply={() => runAction(() => api.applyApproved())}
            />
          )}

          {state && activePage === 'recommendations' && <RecommendationsPage state={state} />}
          {state && activePage === 'reports' && <ReportsPage state={state} />}
        </main>
      </div>
    </div>
  );
}
