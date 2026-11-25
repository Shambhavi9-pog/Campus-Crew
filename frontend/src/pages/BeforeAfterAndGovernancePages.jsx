import React, { useState } from 'react';
import TimetableGrid from '../components/TimetableGrid';
import { Columns2, Check, X, Play, Download, Lightbulb, FileBarChart, Eye } from 'lucide-react';

export function BeforeAfterPage({ state, onDecide, onApply, loading }) {
  const [sectionFilter, setSectionFilter] = useState('CSE A');
  const [previewMode, setPreviewMode] = useState(true);

  const interruptedIds = state.evaluation.interruptedClasses.map((c) => c.id);
  const protectedIds = state.evaluation.protectedClasses.map((c) => c.id);

  // Build preview timetable if previewMode is enabled and there are pending/approved proposals
  const previewTimetable = React.useMemo(() => {
    const base = structuredClone(state.revisedTimetable);
    if (!previewMode) return base;
    for (const p of state.proposals) {
      if (p.resolvable && (p.status === 'pending' || p.status === 'approved')) {
        const idx = base.findIndex((e) => e.id === p.classId);
        if (idx !== -1) {
          base[idx] = {
            ...base[idx],
            day: p.proposedDay,
            slot: p.proposedSlot,
            roomId: p.proposedRoomId,
            isRescheduled: true
          };
        }
      }
    }
    return base;
  }, [state.revisedTimetable, state.proposals, previewMode]);

  const approvedCount = state.proposals.filter((p) => p.status === 'approved' && p.resolvable).length;

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(state.revisedTimetable, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campus-crew-revised-timetable-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Action Bar */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: 0 }}>
          <div>
            <div className="card-title">
              <Columns2 size={18} /> Before vs After Timetable Comparison
            </div>
            <div className="card-subtitle">
              Original timetable is never modified. Preview, approve, reject, apply, and export revised schedules.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              className="form-select"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
            >
              <option value="CSE A">CSE A</option>
              <option value="CSE B">CSE B</option>
            </select>

            <button
              className={`btn btn-sm ${previewMode ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye size={14} /> {previewMode ? 'Previewing Proposed' : 'Showing Applied Only'}
            </button>

            <button
              className="btn btn-success btn-sm"
              disabled={loading || approvedCount === 0}
              onClick={onApply}
            >
              <Play size={14} /> Apply Approved Changes ({approvedCount})
            </button>

            <button className="btn btn-outline btn-sm" onClick={handleExportJSON}>
              <Download size={14} /> Export Revised
            </button>
          </div>
        </div>
      </div>

      {/* Change Approval Table */}
      {state.proposals.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Proposed &amp; Applied Timetable Changes</div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Original Subject &amp; Room</th>
                  <th>Original Time</th>
                  <th>Revised Room</th>
                  <th>Revised Time</th>
                  <th>Faculty</th>
                  <th>Reason for Change</th>
                  <th>Status / Admin Action</th>
                </tr>
              </thead>
              <tbody>
                {state.proposals.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.section}</strong></td>
                    <td>
                      <strong>{p.subject}</strong>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{p.originalRoomName}</div>
                    </td>
                    <td className="mono">{p.originalDay} {p.originalSlot}</td>
                    <td>
                      <strong style={{ color: p.resolvable ? '#047857' : '#b91c1c' }}>
                        {p.proposedRoomName}
                      </strong>
                    </td>
                    <td className="mono">
                      {p.resolvable ? `${p.proposedDay} ${p.proposedSlot}` : 'N/A'}
                    </td>
                    <td>{p.faculty}</td>
                    <td style={{ maxWidth: 260, fontSize: 12 }}>{p.reason}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span
                          className={`badge ${
                            p.status === 'approved' || p.status === 'applied'
                              ? 'badge-operational'
                              : p.status === 'rejected' || p.status === 'unresolvable'
                              ? 'badge-failed'
                              : 'badge-affected'
                          }`}
                        >
                          {p.status}
                        </span>
                        {p.resolvable && p.status !== 'applied' && (
                          <>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => onDecide(p.id, 'approved')}
                              title="Approve"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => onDecide(p.id, 'rejected')}
                              title="Reject"
                            >
                              <X size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Side-by-Side on Desktop, Stacked on Mobile */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">ORIGINAL TIMETABLE ({sectionFilter})</div>
              <div className="card-subtitle">Immutable baseline schedule</div>
            </div>
            <span className="badge badge-navy">BEFORE</span>
          </div>
          <TimetableGrid
            section={sectionFilter}
            entries={state.originalTimetable}
            days={state.days}
            timeSlots={state.timeSlots}
            resources={state.evaluation.resources}
            interruptedIds={interruptedIds}
            protectedIds={protectedIds}
          />
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">REVISED TIMETABLE ({sectionFilter})</div>
              <div className="card-subtitle">
                {previewMode ? 'Live preview with proposed moves highlighted' : 'Persisted approved schedule'}
              </div>
            </div>
            <span className="badge badge-operational">AFTER</span>
          </div>
          <TimetableGrid
            section={sectionFilter}
            entries={previewTimetable}
            days={state.days}
            timeSlots={state.timeSlots}
            resources={state.evaluation.resources}
            protectedIds={protectedIds}
          />
        </div>
      </div>
    </div>
  );
}

export function RecommendationsPage({ state }) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <Lightbulb size={18} color="#f59e0b" /> Institutional Resilience Recommendations
          </div>
          <div className="card-subtitle">
            Automated engineering &amp; scheduling recommendations for UBDT College.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ padding: 14, borderRadius: 10, border: '1px solid #fde68a', background: '#fffbeb' }}>
          <strong>1. Connect Computer Lab 01 to 250 kVA Generator Transfer Switch</strong>
          <p style={{ fontSize: 13, color: '#78350f', marginTop: 4 }}>
            Computer Lab 01 is currently on Grid-Only Feeder A, causing immediate practical session interruptions during main power outages. Extending backup coverage eliminates single-point failure for CSE A practicals.
          </p>
        </div>

        <div style={{ padding: 14, borderRadius: 10, border: '1px solid #bae6fd', background: '#f0f9ff' }}>
          <strong>2. Maintain Staggered Buffer Slot at Monday 11:00 - 12:00</strong>
          <p style={{ fontSize: 13, color: '#075985', marginTop: 4 }}>
            Keeping a 1-hour laboratory buffer in Computer Lab 02 enables zero-conflict emergency migration for interrupted 10:00 AM practicals.
          </p>
        </div>

        {state.evaluation.operationalRisks.map((r, i) => (
          <div key={i} style={{ padding: 14, borderRadius: 10, border: '1px solid #fecaca', background: '#fef2f2' }}>
            <strong>Active Risk — {r.title}</strong>
            <p style={{ fontSize: 13, color: '#7f1d1d', marginTop: 4 }}>{r.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportsPage({ state }) {
  const handlePrint = () => window.print();

  const handleDownloadReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      platform: 'CAMPUS CREW',
      college: state.college,
      recoveryStatus: state.recoveryStatus,
      summary: state.evaluation.summary,
      appliedChanges: state.appliedChanges,
      auditLog: state.auditLog
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campus-crew-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <FileBarChart size={18} /> Institutional Incident &amp; Rescheduling Report
            </div>
            <div className="card-subtitle">
              Exportable audit trail of simulated failures, cascade impacts, and applied timetable recoveries.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline btn-sm" onClick={handlePrint}>Print Report</button>
            <button className="btn btn-primary btn-sm" onClick={handleDownloadReport}>
              <Download size={14} /> Export JSON Report
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Category</th>
                <th>Event Details</th>
              </tr>
            </thead>
            <tbody>
              {state.auditLog.map((log) => (
                <tr key={log.id}>
                  <td className="mono" style={{ whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td><span className="badge badge-navy">{log.type}</span></td>
                  <td>{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
