import React, { useState } from 'react';
import CampusMap from '../components/CampusMap';
import DependencyGraph from '../components/DependencyGraph';
import StatusBadge from '../components/StatusBadge';
import { Map, Server, GitBranch, Info } from 'lucide-react';

export function DigitalTwinPage({ state }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="alert-banner alert-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Info size={18} />
          <span>
            <strong>Simulated Institutional Twin:</strong> Spatial layout, electrical feeders, and capacities for UBDT College are simulated sample data for operational modeling.
          </span>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Map size={18} /> Interactive Campus Digital Twin — UBDT College
            </div>
            <div className="card-subtitle">
              Click any block, power feeder, backup system, classroom, or laboratory to inspect live status and ongoing sessions.
            </div>
          </div>
        </div>
        <CampusMap
          resources={state.evaluation.resources}
          ongoingClasses={state.evaluation.ongoingClasses}
        />
      </div>
    </div>
  );
}

export function ResourcesPage({ state }) {
  const [filter, setFilter] = useState('all');
  const resources = state.evaluation.resources.filter((r) =>
    filter === 'all' ? true : r.status === filter || r.type === filter
  );

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <Server size={18} /> College Resources Inventory (UBDT College)
          </div>
          <div className="card-subtitle">
            Academic blocks, laboratories, classrooms, electrical supply, generator, UPS, library, and server room.
          </div>
        </div>
        <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Resources ({state.evaluation.resources.length})</option>
          <option value="lab">Computer Laboratories</option>
          <option value="classroom">Classrooms</option>
          <option value="power">Power &amp; Feeders</option>
          <option value="failed">Failed Only</option>
          <option value="protected">Backup-Protected Only</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Resource Name</th>
              <th>Category</th>
              <th>Block</th>
              <th>Capacity</th>
              <th>Backup</th>
              <th>Dependencies</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((r) => (
              <tr key={r.id}>
                <td className="mono" style={{ fontWeight: 600 }}>{r.code}</td>
                <td>
                  <div style={{ fontWeight: 700, color: '#0b162a' }}>{r.name}</div>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>{r.description}</div>
                </td>
                <td>{r.category}</td>
                <td>{r.block}</td>
                <td className="mono">{r.capacity} {r.unit}</td>
                <td>{r.protectedBy?.length ? r.protectedBy.join(', ') : 'None'}</td>
                <td className="mono" style={{ fontSize: 11.5 }}>
                  {r.dependsOn?.length ? r.dependsOn.join(', ') : 'Root'}
                </td>
                <td>
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DependencyNetworkPage({ state }) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <GitBranch size={18} /> Institutional Dependency Network Graph
          </div>
          <div className="card-subtitle">
            Solid lines represent primary power/structural dependencies. Dashed blue lines represent Generator/UPS backup protection.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <StatusBadge status="operational" />
          <StatusBadge status="protected" />
          <StatusBadge status="affected" />
          <StatusBadge status="failed" />
        </div>
      </div>

      <DependencyGraph
        resources={state.evaluation.resources}
        interruptedClasses={state.evaluation.interruptedClasses}
      />
    </div>
  );
}
