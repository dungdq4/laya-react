import React, { useState } from 'react';
import { executeSupportTriage } from '../../services/engine';
import type { TableRow } from '../../types';
import { AnswersTable } from '../AnswersTable';
import { ActionBanner } from '../ActionBanner';
import { JsonViewer } from '../JsonViewer';
import { Send, Sparkles } from 'lucide-react';

const DEFAULT_MSG =
  'I was charged twice for invoice 4411 and nobody has answered for three days. Refund the duplicate today or we are cancelling our plan.';

const EXAMPLES = [
  'I was charged twice for invoice 4411 and nobody has answered for three days. Refund the duplicate today or we are cancelling our plan.',
  'How do I invite additional team members to our workspace?',
  'Our API integration is returning 500 errors since 2 hours ago. This is blocking our checkout system.',
  'We would like to discuss enterprise custom pricing and SLA terms.',
];

export const SupportTriageTab: React.FC = () => {
  const [message, setMessage] = useState(DEFAULT_MSG);
  const [tier, setTier] = useState<'free' | 'business' | 'enterprise'>('enterprise');
  const [threshold, setThreshold] = useState<number>(0.5);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<TableRow[] | null>(null);
  const [action, setAction] = useState<string>('');
  const [actionType, setActionType] = useState<'escalate' | 'warning' | 'priority' | 'success'>('success');
  const [latency, setLatency] = useState<number>(0);
  const [raw, setRaw] = useState<any>(null);

  const handleAsk = () => {
    setLoading(true);
    setTimeout(() => {
      const res = executeSupportTriage(message, tier, threshold);
      setRows(res.rows);
      setAction(res.action);
      setActionType(res.actionType);
      setLatency(res.raw.latency_ms);
      setRaw(res.raw);
      setLoading(false);
    }, 150);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-sm text-slate-300">
        Classify, detect urgency, score frustration and check for a refund request{' '}
        <span className="font-semibold text-indigo-300">in one call</span>, then route.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Customer Message
            </label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y"
              placeholder="Enter customer message..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Account Tier (state metadata, not a question)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['free', 'business', 'enterprise'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTier(t)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium capitalize border transition-all cursor-pointer ${
                    tier === t
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Confidence Needed to Act Without Human
              </label>
              <span className="font-mono text-xs font-semibold text-indigo-300">
                {threshold.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.30"
              max="0.95"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <button
            onClick={handleAsk}
            disabled={loading || !message.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="animate-spin mr-2">⚙</span>
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Ask System 1</span>
          </button>

          {/* Preset examples */}
          <div className="pt-2">
            <span className="text-xs text-slate-500 flex items-center gap-1 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-slate-400" /> Or try an example:
            </span>
            <div className="space-y-1.5">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setMessage(ex)}
                  className="w-full text-left p-2 rounded-lg bg-slate-900/40 hover:bg-slate-850 border border-slate-800/80 text-xs text-slate-300 truncate transition-colors cursor-pointer"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Outputs */}
        <div className="lg:col-span-7 space-y-4">
          {action && (
            <ActionBanner action={action} actionType={actionType} latencyMs={latency} />
          )}

          <AnswersTable rows={rows || []} />

          {raw && <JsonViewer data={raw} defaultOpen={false} />}
        </div>
      </div>
    </div>
  );
};

