import React, { useState } from 'react';
import { executeModeration } from '../../services/engine';
import type { TableRow } from '../../types';
import { AnswersTable } from '../AnswersTable';
import { ActionBanner } from '../ActionBanner';
import { JsonViewer } from '../JsonViewer';
import { Flag, Sparkles } from 'lucide-react';

const DEFAULT_POST = 'You are a complete idiot and nobody wants you here.';

const EXAMPLES = [
  'You are a complete idiot and nobody wants you here.',
  'Thanks for the writeup, this fixed my bug.',
  'BUY CHEAP FOLLOWERS NOW >>> click here <<<',
  'I will find you and make you pay for what you did.',
];

export const ModerationTab: React.FC = () => {
  const [post, setPost] = useState(DEFAULT_POST);
  const [threshold, setThreshold] = useState<number>(0.6);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<TableRow[] | null>(null);
  const [action, setAction] = useState<string>('');
  const [actionType, setActionType] = useState<'escalate' | 'warning' | 'priority' | 'success'>('success');
  const [composite, setComposite] = useState<number | null>(null);
  const [latency, setLatency] = useState<number>(0);
  const [raw, setRaw] = useState<any>(null);

  const handleModerate = () => {
    setLoading(true);
    setTimeout(() => {
      const res = executeModeration(post, threshold);
      setRows(res.rows);
      setAction(res.action);
      setActionType(res.actionType);
      setComposite(res.composite);
      setLatency(res.raw.latency_ms);
      setRaw(res.raw);
      setLoading(false);
    }, 150);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-sm text-slate-300">
        Composite rule scoring:{' '}
        <span className="font-mono text-xs text-indigo-300">
          3 × threat + 2 × harassment + 1.5 × toxic + spam
        </span>
        . Calibrated probabilities drive precise moderation decisions.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Post Content
            </label>
            <textarea
              rows={5}
              value={post}
              onChange={(e) => setPost(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y"
              placeholder="Paste social post or forum comment..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Confidence Needed to Remove Automatically
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
            onClick={handleModerate}
            disabled={loading || !post.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <span className="animate-spin mr-2">⚙</span> : <Flag className="w-4 h-4" />}
            <span>Moderate Post</span>
          </button>

          {/* Preset examples */}
          <div className="pt-2">
            <span className="text-xs text-slate-500 flex items-center gap-1 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-slate-400" /> Examples:
            </span>
            <div className="space-y-1.5">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setPost(ex)}
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

          {composite !== null && (
            <div className="px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60 text-xs flex justify-between items-center text-slate-300">
              <span>
                Calculated Composite Violation Score:{' '}
                <strong className="text-indigo-300 font-mono text-sm">{composite}</strong>
              </span>
              <span className="text-slate-400">Threshold: &ge; 3.0 to remove</span>
            </div>
          )}

          <AnswersTable rows={rows || []} />

          {raw && <JsonViewer data={raw} defaultOpen={false} />}
        </div>
      </div>
    </div>
  );
};

