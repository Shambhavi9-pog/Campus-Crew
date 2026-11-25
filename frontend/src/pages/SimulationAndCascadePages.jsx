import React, { useState } from 'react';
import { Zap, RotateCcw, AlertTriangle, ShieldAlert, Users, BookOpen } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import DependencyGraph from '../components/DependencyGraph';

const FAILURE_OPTIONS = [
  { id: 'MAIN_POWER', label: 'Main Power Supply (11 kV Grid)', priority: 'Priority 1' },
  { id: 'LAB_01', label: 'Computer Lab 01 Power Failure', priority: 'Lab' },
  { id: 'LAB_02', label: 'Computer Lab 02 Power Failure', priority: 'Lab' },
  { id: 'GEN_01', label: 'Backup Generator (250 kVA) Failure', priority: 'Backup' },
  { id: 'UPS_01', label: 'Central UPS Bank (80 kVA) Failure', priority: 'Backup' },
  { id: 'CR_02', label: 'Classroom 02 Unavailability', priority: 'Room' },
  { id: 'CR_01', label: 'Classroom 01 Unavailability', priority: 'Room' }
];

export function SimulationCentrePage({ state, onSimulate, onRestore, onResetDemo, loading }) {
  const [selectedFailures, setSelectedFailures] = useState(
    state.failedResourceIds?.length ? state.failedResourceIds : ['MAIN_POWER']
  );
  const [day, setDay] = useState(state.disruptionWindow?.day || 'Monday');
  const [slot, setSlot] = useState(state.disruptionWindow?.slot || '10:00 - 11:00');

  const toggleFailure = (id) => {
    setSelectedFailures((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Zap size={18} color="#dc2626" /> Disruption Simulation Control Panel
              </div>
              <div className="card-subtitle">
                Select one or more infrastructure failures and time window to trigger dynamic cascade analysis.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {FAILURE_OPTIONS.map((opt) => {
              const checked = selectedFailures.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1.5px solid ${checked ? '#ef4444' : '#e2e8f0'}`,
                    background: checked ? '#fef2f2' : '#ffffff',
                    cursor: 'pointer',
                    fontSize: 13.5,
                    fontWeight: 600
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFailure(opt.id)}
                    />
                    {opt.label}
                  </span>
                  <span className="badge badge-navy" style={{ fontSize: 10 }}>{opt.priority}</span>
                </label>
              );
            })}
          </div>

          <div className="grid-2" style={{ gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Disruption Day
              </label>
              <select className="form-select" style={{ width: '100%' }} value={day} onChange={(e) => setDay(e.target.value)}>
                {state.days.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Disruption Time Slot
              </label>
              <select className="form-select" style={{ width: '100%' }} value={slot} onChange={(e) => setSlot(e.target.value)}>
                {state.timeSlots.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="btn btn-danger"
              disabled={loading || selectedFailures.length === 0}
              onClick={() =>
                onSimulate({
                  failedResourceIds: selectedFailures,
                  day,
                  slot,
                  scenarioName: 'Custom Failure Simulation'
                })
              }
            >
              <Zap size={16} /> SIMULATE FAILURE
            </button>
            <button className="btn btn-success" disabled={loading} onClick={() => onRestore(false)}>
              <RotateCcw size={16} /> RESTORE SYSTEM
            </button>
            <button className="btn btn-outline" disabled={loading} onClick={onResetDemo}>
              Reset Preloaded Demo
            </button>
          </div>
        </div>

        {/* Preset Demonstration Scenarios */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Demonstration Scenario Presets</div>
              <div className="card-subtitle">
                One-click scenarios demonstrating backup protection, lab rescheduling, and unresolvable capacity bottlenecks.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: 14, borderRadius: 10, border: '1px solid #bfdbfe', background: '#eff6ff' }}>
              <div style={{ fontWeight: 800, color: '#0b162a', marginBottom: 4 }}>
                Scenario 1: 10 AM Main Power Failure (Default Demo)
              </div>
              <p style={{ fontSize: 12.5, color: '#334155', marginBottom: 10 }}>
                Main Power fails at Monday 10:00 AM. Computer Lab 01 goes offline, interrupting CSE A Data Structures Practical. Classroom 02 (CSE B Java) and Computer Lab 02 remain Generator + UPS protected. Engine recommends moving CSE A to Computer Lab 02 at 11:00 AM.
              </p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setSelectedFailures(['MAIN_POWER']);
                  setDay('Monday');
                  setSlot('10:00 - 11:00');
                  onSimulate({
                    failedResourceIds: ['MAIN_POWER'],
                    day: 'Monday',
                    slot: '10:00 - 11:00',
                    scenarioName: 'Scenario 1: 10 AM Main Power Failure'
                  });
                }}
              >
                Run Scenario 1
              </button>
            </div>

            <div style={{ padding: 14, borderRadius: 10, border: '1px solid #fecaca', background: '#fef2f2' }}>
              <div style={{ fontWeight: 800, color: '#991b1b', marginBottom: 4 }}>
                Scenario 2: No Alternative Lab Available (Main Power + Generator Failure)
              </div>
              <p style={{ fontSize: 12.5, color: '#7f1d1d', marginBottom: 10 }}>
                Both Main Power and the 250 kVA Generator fail at Monday 10:00 AM. All three laboratories (Lab 01, Lab 02, Lab 03) lose power. Engine explains why no lab is feasible and suggests the next post-restoration slot.
              </p>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  setSelectedFailures(['MAIN_POWER', 'GEN_01']);
                  setDay('Monday');
                  setSlot('10:00 - 11:00');
                  onSimulate({
                    failedResourceIds: ['MAIN_POWER', 'GEN_01'],
                    day: 'Monday',
                    slot: '10:00 - 11:00',
                    scenarioName: 'Scenario 2: No Alternative Lab Available'
                  });
                }}
              >
                Run Scenario 2
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Resource Status Strip */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Live Infrastructure Status Snapshot</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {state.evaluation.resources.map((r) => (
            <div
              key={r.id}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12.5
              }}
            >
              <strong>{r.name}</strong>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CascadeAnalysisPage({ state }) {
  const ev = state.evaluation;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <AlertTriangle size={18} color="#dc2626" /> Cascade Failure Propagation Chains
            </div>
            <div className="card-subtitle">
              Tracing root infrastructure failures through rooms, ongoing classes, faculty, and students.
            </div>
          </div>
        </div>

        {ev.cascadeChains.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
            No active cascade chains. All ongoing classes are operational or protected by backup power.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ev.cascadeChains.map((c) => (
              <div key={c.classId} className="cascade-chain">
                {c.steps.map((step, idx) => (
                  <React.Fragment key={step.id}>
                    <div className={`cascade-step ${step.status}`}>{step.label}</div>
                    {idx < c.steps.length - 1 && <span style={{ fontWeight: 700, color: '#64748b' }}>→</span>}
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 10 }}>
            <AlertTriangle size={16} color="#ef4444" /> Directly Affected ({ev.directlyAffected.length})
          </div>
          {ev.directlyAffected.length === 0 ? (
            <div style={{ fontSize: 12.5, color: '#64748b' }}>None</div>
          ) : (
            ev.directlyAffected.map((r) => (
              <div key={r.id} style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                <strong>{r.name}</strong> — <span style={{ color: '#b91c1c' }}>{r.statusReason}</span>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 10 }}>
            <ShieldAlert size={16} color="#f59e0b" /> Indirectly Affected ({ev.indirectlyAffected.length})
          </div>
          {ev.indirectlyAffected.length === 0 ? (
            <div style={{ fontSize: 12.5, color: '#64748b' }}>None</div>
          ) : (
            ev.indirectlyAffected.map((r) => (
              <div key={r.id} style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                <strong>{r.name}</strong> — <span style={{ color: '#92400e' }}>{r.statusReason}</span>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 10 }}>
            <Users size={16} color="#0284c7" /> Impacted People &amp; Risks
          </div>
          <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div><strong>Affected Faculty:</strong> {ev.affectedFaculty.length ? ev.affectedFaculty.join(', ') : 'None'}</div>
            <div><strong>Affected Students:</strong> {ev.affectedStudents}</div>
            <div><strong>Protected by Backup:</strong> {ev.protectedResources.map((r) => r.name).join(', ') || 'None'}</div>
            {ev.operationalRisks.map((risk, i) => (
              <div key={i} style={{ marginTop: 6, padding: 8, borderRadius: 6, background: '#fef2f2', fontSize: 12 }}>
                <strong>[{risk.severity.toUpperCase()}] {risk.title}:</strong> {risk.detail}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <BookOpen size={17} /> Visual Cascade Dependency Graph
          </div>
        </div>
        <DependencyGraph resources={ev.resources} interruptedClasses={ev.interruptedClasses} />
      </div>
    </div>
  );
}
