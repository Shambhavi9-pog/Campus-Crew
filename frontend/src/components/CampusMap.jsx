import React, { useState } from 'react';
import StatusBadge from './StatusBadge';

const STATUS_COLORS = {
  operational: { fill: '#ecfdf5', stroke: '#10b981', text: '#065f46' },
  protected: { fill: '#e0f2fe', stroke: '#0284c7', text: '#075985' },
  affected: { fill: '#fffbeb', stroke: '#f59e0b', text: '#92400e' },
  failed: { fill: '#fef2f2', stroke: '#ef4444', text: '#991b1b' }
};

export default function CampusMap({ resources = [], ongoingClasses = [], onSelectResource }) {
  const [selectedId, setSelectedId] = useState('LAB_01');
  const selected = resources.find((r) => r.id === selectedId) || resources[0];

  const getRes = (id) => resources.find((r) => r.id === id);

  const renderConnection = (fromId, toId, isBackup = false) => {
    const a = getRes(fromId);
    const b = getRes(toId);
    if (!a || !b) return null;

    const failed = a.status === 'failed' || b.status === 'failed';
    const isProtected = b.status === 'protected' && isBackup;

    let stroke = '#94a3b8';
    let dash = isBackup ? '5,5' : '0';
    let width = 2;

    if (isProtected) {
      stroke = '#0284c7';
      width = 2.8;
    } else if (failed && !isBackup) {
      stroke = '#ef4444';
      dash = '6,4';
      width = 2.5;
    } else if (a.status === 'operational' && !isBackup) {
      stroke = '#10b981';
    }

    return (
      <line
        key={`${fromId}-${toId}-${isBackup ? 'b' : 'p'}`}
        x1={a.mapPos.x + 58}
        y1={a.mapPos.y + 24}
        x2={b.mapPos.x + 58}
        y2={b.mapPos.y + 24}
        stroke={stroke}
        strokeWidth={width}
        strokeDasharray={dash}
        opacity={0.85}
      />
    );
  };

  const getActiveClass = (roomId) => ongoingClasses.find((c) => c.roomId === roomId);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 310px', gap: 16 }}>
      <div
        style={{
          background: '#0b162a',
          borderRadius: 12,
          padding: 14,
          border: '1px solid #1e3a5f',
          overflowX: 'auto'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
            color: '#e2e8f0',
            fontSize: 12
          }}
        >
          <span style={{ fontWeight: 700, letterSpacing: '0.04em' }}>
            UBDT COLLEGE — SPATIAL DIGITAL TWIN (SIMULATED TOPOLOGY)
          </span>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ color: '#34d399' }}>● Operational</span>
            <span style={{ color: '#38bdf8' }}>● Backup Protected</span>
            <span style={{ color: '#f87171' }}>● Failed / Offline</span>
          </div>
        </div>

        <svg viewBox="0 0 880 530" style={{ width: '100%', minWidth: 680, height: 'auto', display: 'block' }}>
          {/* Zone backgrounds */}
          <rect x="20" y="25" width="560" height="105" rx="10" fill="#112240" stroke="#1e3a5f" />
          <text x="34" y="45" fill="#94a3b8" fontSize="11" fontWeight="700">
            UTILITY &amp; POWER SUBSTATION YARD
          </text>

          <rect x="20" y="145" width="390" height="365" rx="10" fill="#0f1f3d" stroke="#1e3a5f" />
          <text x="34" y="165" fill="#94a3b8" fontSize="11" fontWeight="700">
            ACADEMIC BLOCK A (GRID-ONLY WING)
          </text>

          <rect x="425" y="145" width="440" height="365" rx="10" fill="#0f1f3d" stroke="#1e3a5f" />
          <text x="439" y="165" fill="#94a3b8" fontSize="11" fontWeight="700">
            ACADEMIC BLOCK B (GENERATOR + UPS PROTECTED WING)
          </text>

          {/* Power & dependency lines */}
          {renderConnection('MAIN_POWER', 'FEEDER_A')}
          {renderConnection('MAIN_POWER', 'FEEDER_B')}
          {renderConnection('GEN_01', 'FEEDER_B', true)}
          {renderConnection('FEEDER_A', 'BLOCK_A')}
          {renderConnection('FEEDER_B', 'BLOCK_B')}
          {renderConnection('BLOCK_A', 'LAB_01')}
          {renderConnection('BLOCK_A', 'CR_01')}
          {renderConnection('BLOCK_A', 'CR_03')}
          {renderConnection('BLOCK_B', 'LAB_02')}
          {renderConnection('BLOCK_B', 'LAB_03')}
          {renderConnection('BLOCK_B', 'CR_02')}
          {renderConnection('BLOCK_B', 'SERVER_ROOM')}
          {renderConnection('BLOCK_B', 'LIBRARY')}
          {renderConnection('UPS_01', 'SERVER_ROOM', true)}

          {/* Resource Nodes */}
          {resources.map((res) => {
            const palette = STATUS_COLORS[res.status] || STATUS_COLORS.operational;
            const isSelected = res.id === selected?.id;
            const activeCls = getActiveClass(res.id);

            return (
              <g
                key={res.id}
                transform={`translate(${res.mapPos.x}, ${res.mapPos.y})`}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSelectedId(res.id);
                  if (onSelectResource) onSelectResource(res);
                }}
              >
                <rect
                  width="118"
                  height="52"
                  rx="8"
                  fill={palette.fill}
                  stroke={isSelected ? '#38bdf8' : palette.stroke}
                  strokeWidth={isSelected ? 3 : 1.8}
                />
                <text x="8" y="18" fill={palette.text} fontSize="10.5" fontWeight="700">
                  {res.name.length > 17 ? `${res.name.slice(0, 16)}…` : res.name}
                </text>
                <text x="8" y="32" fill="#475569" fontSize="9.5" fontWeight="600">
                  {res.code} • {res.status.toUpperCase()}
                </text>
                {activeCls && (
                  <text x="8" y="45" fill="#1d4ed8" fontSize="9" fontWeight="700">
                    {activeCls.section}: {activeCls.subject.slice(0, 13)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Inspector Panel */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
          Digital Twin Node Inspector
        </div>
        {selected && (
          <>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#0b162a' }}>{selected.name}</div>
              <div className="mono" style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                {selected.code} • {selected.block}
              </div>
            </div>

            <div>
              <StatusBadge status={selected.status} />
            </div>

            <div style={{ fontSize: 13, color: '#334155', background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <strong>Status Reason:</strong> {selected.statusReason}
            </div>

            <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div><strong>Category:</strong> {selected.category}</div>
              <div><strong>Capacity:</strong> {selected.capacity} {selected.unit}</div>
              <div>
                <strong>Backup Protection:</strong>{' '}
                {selected.protectedBy?.length > 0 ? selected.protectedBy.join(', ') : 'None (Grid Dependent)'}
              </div>
              <div>
                <strong>Dependencies:</strong>{' '}
                {selected.dependsOn?.length > 0 ? selected.dependsOn.join(' → ') : 'Root Supply'}
              </div>
            </div>

            {getActiveClass(selected.id) && (
              <div
                style={{
                  background: selected.status === 'failed' ? '#fef2f2' : '#eff6ff',
                  border: `1px solid ${selected.status === 'failed' ? '#fecaca' : '#bfdbfe'}`,
                  borderRadius: 8,
                  padding: 10,
                  fontSize: 12.5
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Current Scheduled Session</div>
                <div><strong>Section:</strong> {getActiveClass(selected.id).section}</div>
                <div><strong>Subject:</strong> {getActiveClass(selected.id).subject}</div>
                <div><strong>Faculty:</strong> {getActiveClass(selected.id).faculty}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
