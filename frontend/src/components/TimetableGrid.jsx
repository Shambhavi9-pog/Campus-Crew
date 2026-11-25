import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';

export default function TimetableGrid({
  section,
  entries = [],
  days = [],
  timeSlots = [],
  resources = [],
  interruptedIds = [],
  protectedIds = [],
  editable = false,
  onSaveEntry
}) {
  const [editing, setEditing] = useState(null);

  const filtered = section ? entries.filter((e) => e.section === section) : entries;
  const getRoomName = (roomId) => resources.find((r) => r.id === roomId)?.name || roomId;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editing || !onSaveEntry) return;
    await onSaveEntry(editing.id, {
      subject: editing.subject,
      faculty: editing.faculty,
      roomId: editing.roomId,
      isPractical: editing.isPractical
    });
    setEditing(null);
  };

  return (
    <div>
      <div className="tt-grid-wrap">
        <table className="tt-grid">
          <thead>
            <tr>
              <th>Time Slot</th>
              {days.map((d) => (
                <th key={d}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot) => (
              <tr key={slot}>
                <td className="tt-slot-col mono">{slot}</td>
                {days.map((day) => {
                  const entry = filtered.find((e) => e.day === day && e.slot === slot);
                  if (!entry) {
                    return (
                      <td key={day}>
                        <div style={{ color: '#cbd5e1', fontSize: 11, textAlign: 'center', paddingTop: 22 }}>
                          Free / Self-Study
                        </div>
                      </td>
                    );
                  }

                  const isFailed = interruptedIds.includes(entry.id);
                  const isProtected = protectedIds.includes(entry.id);
                  const isChanged = Boolean(entry.isRescheduled);

                  let cellClass = 'tt-cell';
                  if (isChanged) cellClass += ' tt-changed';
                  else if (isFailed) cellClass += ' tt-failed';
                  else if (isProtected) cellClass += ' tt-protected';

                  return (
                    <td key={day}>
                      <div
                        className={cellClass}
                        onClick={() => editable && setEditing({ ...entry })}
                        title={editable ? 'Click to edit schedule entry' : entry.subject}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
                          <span className="tt-subject">{entry.subject}</span>
                          {editable && <Edit3 size={11} color="#64748b" />}
                        </div>
                        <div className="tt-meta">{entry.faculty}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
                          <span className="tt-room">{getRoomName(entry.roomId)}</span>
                          {isChanged && (
                            <span style={{ fontSize: 9.5, fontWeight: 800, color: '#047857', background: '#d1fae5', padding: '1px 5px', borderRadius: 4 }}>
                              MOVED
                            </span>
                          )}
                          {!isChanged && isFailed && (
                            <span style={{ fontSize: 9.5, fontWeight: 800, color: '#b91c1c', background: '#fee2e2', padding: '1px 5px', borderRadius: 4 }}>
                              FAILED
                            </span>
                          )}
                          {!isChanged && isProtected && (
                            <span style={{ fontSize: 9.5, fontWeight: 800, color: '#0369a1', background: '#e0f2fe', padding: '1px 5px', borderRadius: 4 }}>
                              BACKUP
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSave}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0b162a', marginBottom: 12 }}>
              Edit Timetable Entry ({editing.section} • {editing.day} {editing.slot})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Subject</label>
                <input
                  className="form-input"
                  style={{ width: '100%' }}
                  value={editing.subject}
                  onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Faculty</label>
                <input
                  className="form-input"
                  style={{ width: '100%' }}
                  value={editing.faculty}
                  onChange={(e) => setEditing({ ...editing, faculty: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Classroom / Lab</label>
                <select
                  className="form-select"
                  style={{ width: '100%' }}
                  value={editing.roomId}
                  onChange={(e) => setEditing({ ...editing, roomId: e.target.value })}
                >
                  {resources
                    .filter((r) => r.type === 'lab' || r.type === 'classroom')
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.capacity} seats)
                      </option>
                    ))}
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={editing.isPractical}
                  onChange={(e) => setEditing({ ...editing, isPractical: e.target.checked })}
                />
                Practical Laboratory Session
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Schedule Entry
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
