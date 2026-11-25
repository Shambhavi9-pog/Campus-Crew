import React from 'react';
import TimetableGrid from '../components/TimetableGrid';
import { CalendarDays, Cpu, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export function SectionTimetablePage({ section, state, onSaveEntry }) {
  const interruptedIds = state.evaluation.interruptedClasses.map((c) => c.id);
  const protectedIds = state.evaluation.protectedClasses.map((c) => c.id);

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <CalendarDays size={18} /> {section} Weekly Timetable (Editable Baseline)
          </div>
          <div className="card-subtitle">
            Monday to Saturday schedule for {section} (60 students). Click any class cell to edit subject, faculty, or room.
          </div>
        </div>
        <span className="badge badge-navy">Original Baseline Preserved</span>
      </div>

      <TimetableGrid
        section={section}
        entries={state.originalTimetable}
        days={state.days}
        timeSlots={state.timeSlots}
        resources={state.evaluation.resources}
        interruptedIds={interruptedIds}
        protectedIds={protectedIds}
        editable={true}
        onSaveEntry={onSaveEntry}
      />
    </div>
  );
}

export function SmartReschedulingPage({ state, onNavigate }) {
  const { proposals, evaluation } = state;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Cpu size={18} /> Smart Constraint-Based Rescheduling Engine
            </div>
            <div className="card-subtitle">
              Evaluates room power, backup protection, capacity, lab suitability, faculty availability, and CSE A / CSE B conflict freedom.
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('before-after')}>
            Open Before vs After Comparison
          </button>
        </div>

        {proposals.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 13.5 }}>
            No interrupted classes detected for {evaluation.disruptionWindow.day} {evaluation.disruptionWindow.slot}.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {proposals.map((p) => (
              <div
                key={p.id}
                style={{
                  border: `1.5px solid ${p.resolvable ? '#bae6fd' : '#fecaca'}`,
                  borderRadius: 12,
                  padding: 18,
                  background: p.resolvable ? '#f8fafc' : '#fef2f2'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0b162a' }}>
                      {p.section} — {p.subject} ({p.faculty})
                    </h3>
                    <div style={{ fontSize: 12.5, color: '#475569', marginTop: 2 }}>
                      Interrupted at <strong>{p.originalRoomName}</strong> ({p.originalDay} {p.originalSlot}) • {p.students} Students
                    </div>
                  </div>
                  <span className={`badge ${p.resolvable ? 'badge-protected' : 'badge-failed'}`}>
                    {p.resolvable ? `Recommended: ${p.proposedRoomName} @ ${p.proposedSlot}` : 'No Suitable Lab Available'}
                  </span>
                </div>

                <div style={{ marginTop: 12, fontSize: 13, color: '#1e293b', background: 'white', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <strong>Engine Reasoning:</strong> {p.reason}
                </div>

                {!p.resolvable && p.nextFeasibleSuggestion && (
                  <div style={{ marginTop: 10, fontSize: 13, color: '#991b1b', background: '#fee2e2', padding: 10, borderRadius: 8 }}>
                    <AlertTriangle size={14} style={{ display: 'inline', marginRight: 6 }} />
                    <strong>Next Feasible Slot Suggestion:</strong> {p.nextFeasibleSuggestion}
                  </div>
                )}

                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
                    CONSTRAINT VERIFICATION LOG
                  </div>
                  <div className="grid-3" style={{ gap: 8 }}>
                    {p.constraintsChecked.map((c, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 6,
                          padding: 8,
                          background: 'white',
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                          fontSize: 12
                        }}
                      >
                        {c.passed ? (
                          <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} />
                        ) : (
                          <XCircle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                        )}
                        <div>
                          <div style={{ fontWeight: 700 }}>{c.label}</div>
                          <div style={{ color: '#64748b', fontSize: 11 }}>{c.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
