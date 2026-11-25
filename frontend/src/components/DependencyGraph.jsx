import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const NODE_COLORS = {
  operational: { bg: '#ecfdf5', border: '#10b981', text: '#065f46' },
  protected: { bg: '#e0f2fe', border: '#0284c7', text: '#075985' },
  affected: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
  failed: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' }
};

export default function DependencyGraph({ resources = [], interruptedClasses = [] }) {
  const { nodes, edges } = useMemo(() => {
    const rfNodes = resources.map((res) => {
      const style = NODE_COLORS[res.status] || NODE_COLORS.operational;
      return {
        id: res.id,
        position: res.graphPos || { x: 100, y: 100 },
        data: {
          label: (
            <div style={{ textAlign: 'left', fontSize: 11.5 }}>
              <div style={{ fontWeight: 800, color: style.text }}>{res.name}</div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>
                {res.code} • <strong>{res.status.toUpperCase()}</strong>
              </div>
            </div>
          )
        },
        style: {
          background: style.bg,
          border: `2px solid ${style.border}`,
          borderRadius: 10,
          padding: '8px 12px',
          width: 170,
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.08)'
        }
      };
    });

    // Add interrupted class nodes to show full cascade down to academic schedule
    interruptedClasses.forEach((cls, idx) => {
      const classNodeId = `CLS-${cls.id}`;
      rfNodes.push({
        id: classNodeId,
        position: { x: 60 + idx * 240, y: 560 },
        data: {
          label: (
            <div style={{ textAlign: 'left', fontSize: 11.5 }}>
              <div style={{ fontWeight: 800, color: '#991b1b' }}>
                {cls.section}: {cls.subject}
              </div>
              <div style={{ fontSize: 10, color: '#7f1d1d', marginTop: 2 }}>
                {cls.faculty} • {cls.students} Students (INTERRUPTED)
              </div>
            </div>
          )
        },
        style: {
          background: '#fef2f2',
          border: '2px dashed #ef4444',
          borderRadius: 10,
          padding: '8px 12px',
          width: 210
        }
      });
    });

    const rfEdges = [];
    for (const res of resources) {
      for (const depId of res.dependsOn || []) {
        const src = resources.find((r) => r.id === depId);
        const isFailed = src?.status === 'failed' || res.status === 'failed';
        rfEdges.push({
          id: `e-${depId}-${res.id}`,
          source: depId,
          target: res.id,
          animated: isFailed,
          style: { stroke: isFailed ? '#ef4444' : '#64748b', strokeWidth: isFailed ? 2.5 : 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: isFailed ? '#ef4444' : '#64748b' }
        });
      }
      for (const bId of res.protectedBy || []) {
        const isProtected = res.status === 'protected';
        rfEdges.push({
          id: `b-${bId}-${res.id}`,
          source: bId,
          target: res.id,
          animated: isProtected,
          style: {
            stroke: isProtected ? '#0284c7' : '#94a3b8',
            strokeDasharray: '5 5',
            strokeWidth: isProtected ? 2.5 : 1.2
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: isProtected ? '#0284c7' : '#94a3b8' }
        });
      }
    }

    for (const cls of interruptedClasses) {
      rfEdges.push({
        id: `e-${cls.roomId}-CLS-${cls.id}`,
        source: cls.roomId,
        target: `CLS-${cls.id}`,
        animated: true,
        style: { stroke: '#ef4444', strokeWidth: 2.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' }
      });
    }

    return { nodes: rfNodes, edges: rfEdges };
  }, [resources, interruptedClasses]);

  return (
    <div style={{ height: 520, width: '100%', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', background: '#f8fafc' }}>
      <ReactFlow nodes={nodes} edges={edges} fitView attributionPosition="bottom-right">
        <Background gap={18} color="#cbd5e1" />
        <Controls />
        <MiniMap
          nodeColor={(n) => n.style?.border?.split(' ').pop() || '#64748b'}
          style={{ borderRadius: 8 }}
        />
      </ReactFlow>
    </div>
  );
}
