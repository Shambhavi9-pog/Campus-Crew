import React from 'react';
import {
  Zap,
  RotateCcw,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  Users,
  MonitorCheck,
  Clock
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function DashboardPage({ state, onSimulate, onRestore, onNavigate }) {
  const { evaluation, recoveryStatus, pendingChangesCount, disruptionWindow } = state;
  const s = evaluation.summary;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Active Scenario Banner */}
      <div className={`alert-banner ${s.failedCount > 0 ? 'alert-danger' : 'alert-success'}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {s.failedCount > 0 ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
          <div>
            <strong>
              {s.failedCount > 0
                ? `ACTIVE DISRUPTION (${disruptionWindow.day} ${disruptionWindow.slot}): `
                : 'SYSTEM NOMINAL: '}
            </strong>
            {s.failedCount > 0
              ? `${s.failedCount} resource(s) offline, ${s.affectedClassesCount} class(es) interrupted (${s.affectedStudentsCount} students).`
              : 'All UBDT College power feeds, laboratories, and classrooms are operational.'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-danger btn-sm"
            onClick={() =>
              onSimulate({
                failedResourceIds: ['MAIN_POWER'],
                day: 'Monday',
                slot: '10:00 - 11:00',
                scenarioName: '10 AM Main Power Failure Demo'
              })
            }
          >
            <Zap size={14} /> Simulate 10 AM Power Failure
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => onRestore(false)}>
            <RotateCcw size={14} /> Restore System
          </button>
        </div>
      </div>

      {/* 9 Required KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Total Resources</span>
          <span className="kpi-value">{s.totalResources}</span>
          <span className="kpi-meta">UBDT College Twin Nodes</span>
        </div>

        <div className={`kpi-card ${s.mainPowerStatus === 'failed' ? 'kpi-failed' : 'kpi-operational'}`}>
          <span className="kpi-label">Main Power Status</span>
          <div style={{ marginTop: 4 }}>
            <StatusBadge status={s.mainPowerStatus} />
          </div>
          <span className="kpi-meta">11 kV Primary Grid Feed</span>
        </div>

        <div className="kpi-card kpi-operational">
          <span className="kpi-label">Operational Resources</span>
          <span className="kpi-value">{s.operationalCount + s.protectedCount}</span>
          <span className="kpi-meta">
            {s.operationalCount} normal • {s.protectedCount} backup-protected
          </span>
        </div>

        <div className={`kpi-card ${s.failedCount > 0 ? 'kpi-failed' : 'kpi-operational'}`}>
          <span className="kpi-label">Failed Resources</span>
          <span className="kpi-value">{s.failedCount}</span>
          <span className="kpi-meta">Direct + Cascaded failures</span>
        </div>

        <div className={`kpi-card ${s.affectedClassesCount > 0 ? 'kpi-affected' : 'kpi-operational'}`}>
          <span className="kpi-label">Affected Classes</span>
          <span className="kpi-value">{s.affectedClassesCount}</span>
          <span className="kpi-meta">At {disruptionWindow.day} {disruptionWindow.slot}</span>
        </div>

        <div className={`kpi-card ${s.affectedStudentsCount > 0 ? 'kpi-affected' : ''}`}>
          <span className="kpi-label">Affected Students</span>
          <span className="kpi-value">{s.affectedStudentsCount}</span>
          <span className="kpi-meta">CSE A &amp; CSE B Sections</span>
        </div>

        <div className="kpi-card kpi-protected">
          <span className="kpi-label">Available Labs</span>
          <span className="kpi-value">{s.availableLabsCount} / 3</span>
          <span className="kpi-meta">Powered or backup-protected</span>
        </div>

        <div className={`kpi-card ${pendingChangesCount > 0 ? 'kpi-affected' : ''}`}>
          <span className="kpi-label">Pending Timetable Changes</span>
          <span className="kpi-value">{pendingChangesCount}</span>
          <span className="kpi-meta">Awaiting admin approval</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Recovery Status</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#0b162a', marginTop: 4 }}>
            {recoveryStatus}
          </span>
          <span className="kpi-meta">End-to-end workflow state</span>
        </div>
      </div>

      {/* End-to-End Workflow Cards */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <AlertTriangle size={17} color="#dc2626" /> Live Disruption &amp; Cascade Summary
              </div>
              <div className="card-subtitle">
                Simulated institutional impact at {disruptionWindow.day} {disruptionWindow.slot}
              </div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('cascade')}>
              Full Cascade <ArrowRight size={13} />
            </button>
          </div>

          {evaluation.cascadeChains.length === 0 ? (
            <div style={{ padding: 18, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
              No active cascade disruptions. Trigger a failure in Simulation Centre to inspect propagation.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {evaluation.cascadeChains.map((chain) => (
                <div key={chain.classId} className="cascade-chain">
                  {chain.steps.map((step, i) => (
                    <React.Fragment key={step.id}>
                      <div className={`cascade-step ${step.status}`}>{step.label}</div>
                      {i < chain.steps.length - 1 && <ArrowRight size={15} color="#64748b" />}
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
          )}

          {evaluation.protectedClasses.length > 0 && (
            <div style={{ marginTop: 14, padding: 10, borderRadius: 8, background: '#f0f9ff', border: '1px solid #bae6fd', fontSize: 12.5 }}>
              <strong>Backup-Protected Sessions Continuing Normally:</strong>
              {evaluation.protectedClasses.map((c) => (
                <div key={c.id} style={{ marginTop: 4 }}>
                  • <strong>{c.section}</strong> — {c.subject} in {c.roomName} ({c.protectionNote})
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <MonitorCheck size={17} color="#0284c7" /> Smart Rescheduling Proposals
              </div>
              <div className="card-subtitle">
                Rule-based constraint solver across CSE A &amp; CSE B
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('before-after')}>
              Review &amp; Approve <ArrowRight size={13} />
            </button>
          </div>

          {state.proposals.length === 0 ? (
            <div style={{ padding: 18, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
              No pending timetable rescheduling proposals.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {state.proposals.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    border: `1px solid ${p.resolvable ? '#bae6fd' : '#fecaca'}`,
                    background: p.resolvable ? '#f8fafc' : '#fef2f2'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 13.5, color: '#0b162a' }}>
                      {p.section}: {p.subject}
                    </strong>
                    <span className={`badge ${p.resolvable ? 'badge-protected' : 'badge-failed'}`}>
                      {p.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#334155', marginTop: 6 }}>
                    <strong>Original:</strong> {p.originalRoomName} ({p.originalDay} {p.originalSlot})
                  </div>
                  <div style={{ fontSize: 12.5, color: p.resolvable ? '#047857' : '#b91c1c', marginTop: 2 }}>
                    <strong>Revised:</strong>{' '}
                    {p.resolvable ? `${p.proposedRoomName} (${p.proposedDay} ${p.proposedSlot})` : 'No powered lab available'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Audit Log */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Clock size={16} /> Recent Platform Activity
          </div>
          <span className="badge badge-navy">Persistent Store Active</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5 }}>
          {state.auditLog.slice(0, 5).map((log) => (
            <div key={log.id} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span className="mono" style={{ color: '#64748b', fontSize: 11.5 }}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span style={{ fontWeight: 600, color: '#0b162a' }}>{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
