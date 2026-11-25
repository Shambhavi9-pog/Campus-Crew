import React from 'react';
import {
  LayoutDashboard,
  Map,
  Server,
  GitBranch,
  Zap,
  AlertTriangle,
  CalendarDays,
  CalendarCheck,
  Cpu,
  Columns2,
  Lightbulb,
  FileBarChart,
  X
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { id: 'digital-twin', label: 'Digital Twin', icon: Map, group: 'Infrastructure' },
  { id: 'resources', label: 'College Resources', icon: Server, group: 'Infrastructure' },
  { id: 'dependency-network', label: 'Dependency Network', icon: GitBranch, group: 'Infrastructure' },
  { id: 'simulation', label: 'Simulation Centre', icon: Zap, group: 'Disruption & Cascade' },
  { id: 'cascade', label: 'Cascade Analysis', icon: AlertTriangle, group: 'Disruption & Cascade' },
  { id: 'cse-a', label: 'CSE A Timetable', icon: CalendarDays, group: 'Academic Schedules' },
  { id: 'cse-b', label: 'CSE B Timetable', icon: CalendarCheck, group: 'Academic Schedules' },
  { id: 'rescheduling', label: 'Smart Rescheduling', icon: Cpu, group: 'Recovery Engine' },
  { id: 'before-after', label: 'Before vs After Timetable', icon: Columns2, group: 'Recovery Engine' },
  { id: 'recommendations', label: 'Recommendations', icon: Lightbulb, group: 'Governance' },
  { id: 'reports', label: 'Reports', icon: FileBarChart, group: 'Governance' }
];

export default function Sidebar({ activePage, onNavigate, open, onClose, state }) {
  const failedCount = state?.evaluation?.summary?.failedCount || 0;
  const pendingCount = state?.pendingChangesCount || 0;

  let currentGroup = '';

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-logo">CC</div>
        <div style={{ flex: 1 }}>
          <div className="brand-title">CAMPUS CREW</div>
          <div className="brand-sub">UBDT College Digital Twin</div>
        </div>
        {open && (
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const showGroup = item.group !== currentGroup;
          currentGroup = item.group;

          let badge = null;
          if (item.id === 'cascade' && failedCount > 0) badge = failedCount;
          if ((item.id === 'rescheduling' || item.id === 'before-after') && pendingCount > 0) {
            badge = pendingCount;
          }

          return (
            <React.Fragment key={item.id}>
              {showGroup && <div className="nav-section-label">{item.group}</div>}
              <button
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {badge !== null && <span className="nav-badge">{badge}</span>}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: 3 }}>
          UBDT College • CSE A &amp; CSE B
        </div>
        <div>Simulated Institutional Twin</div>
      </div>
    </aside>
  );
}
