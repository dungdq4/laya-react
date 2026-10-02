import React from 'react';
import { AlertTriangle, CheckCircle, Clock, ShieldAlert, ArrowRightCircle } from 'lucide-react';

interface ActionBannerProps {
  action: string;
  actionType?: 'escalate' | 'warning' | 'priority' | 'success';
  latencyMs?: number;
}

export const ActionBanner: React.FC<ActionBannerProps> = ({
  action,
  actionType = 'success',
  latencyMs,
}) => {
  if (!action) return null;

  const getStyle = () => {
    switch (actionType) {
      case 'escalate':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-200',
          icon: <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />,
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-200',
          icon: <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />,
        };
      case 'priority':
        return {
          bg: 'bg-purple-500/10 border-purple-500/30 text-purple-200',
          icon: <ArrowRightCircle className="w-5 h-5 text-purple-400 shrink-0" />,
        };
      case 'success':
      default:
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200',
          icon: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
        };
    }
  };

  const { bg, icon } = getStyle();

  return (
    <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${bg} shadow-md`}>
      <div className="flex items-center space-x-3">
        {icon}
        <span className="text-sm font-semibold tracking-wide">{action}</span>
      </div>
      {typeof latencyMs === 'number' && (
        <div className="flex items-center space-x-1 text-xs font-mono text-slate-400 shrink-0">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{latencyMs.toFixed(0)} ms</span>
        </div>
      )}
    </div>
  );
};

