import React from 'react';
import { CheckCircle2, ShieldAlert, AlertTriangle, XCircle } from 'lucide-react';

const CONFIG = {
  operational: { label: 'Operational', cls: 'badge-operational', Icon: CheckCircle2 },
  protected: { label: 'Protected by Backup', cls: 'badge-protected', Icon: ShieldAlert },
  affected: { label: 'Affected', cls: 'badge-affected', Icon: AlertTriangle },
  failed: { label: 'Failed', cls: 'badge-failed', Icon: XCircle }
};

export default function StatusBadge({ status, customLabel }) {
  const cfg = CONFIG[status] || CONFIG.operational;
  const Icon = cfg.Icon;
  return (
    <span className={`badge ${cfg.cls}`}>
      <Icon size={12} />
      {customLabel || cfg.label}
    </span>
  );
}
