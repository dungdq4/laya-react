import React, { useState } from 'react';
import { executeModelRouting } from '../../services/engine';
import type { TableRow } from '../../types';
import { AnswersTable } from '../AnswersTable';
import { ActionBanner } from '../ActionBanner';
import { JsonViewer } from '../JsonViewer';
import { GitBranch, Sparkles } from 'lucide-react';

const DEFAULT_REQ = 'What time is it in Tokyo right now?';

const EXAMPLES = [
  'What time is it in Tokyo right now?',
  'Refactor this service to use dependency injection and explain the trade-offs.',
  'Should I accept this settlement offer of $12,000 for my injury claim?',
  'Say hello in French.',
];

export const ModelRoutingTab: React.FC = () => {
  const [request, setRequest] = useState(DEFAULT_REQ);
  const [cheapModel, setCheapModel] = useState('gpt-5-mini');
  const [strongModel, setStrongModel] = useState('claude-opus-5');

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<TableRow[] | null>(null);
  const [action, setAction] = useState<string>('');
  const [latency, setLatency] = useState<number>(0);
  const [raw, setRaw] = useState<any>(null);

  const handleRoute = () => {
    setLoading(true);
    setTimeout(() => {
      const res = executeModelRouting(request, cheapModel, strongModel);
      setRows(res.rows);
      setAction(res.action);
      setLatency(res.raw.latency_ms);
      setRaw(res.raw);
      setLoading(false);
    }, 150);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-sm text-slate-300">
        Grade difficulty, domain and tool need, then send each request to the{' '}
        <span className="font-semibold text-indigo-300">cheapest model that can handle it</span>.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              User Request
            </label>
            <textarea
              rows={4}
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y"
              placeholder="Enter user prompt or query..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Cheap Model
              </label>
              <input
                type="text"
                value={cheapModel}
                onChange={(e) => setCheapModel(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Strong Model
              </label>
              <input
                type="text"
                value={strongModel}
                onChange={(e) => setStrongModel(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <button
            onClick={handleRoute}
            disabled={loading || !request.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <span className="animate-spin mr-2">⚙</span> : <GitBranch className="w-4 h-4" />}
            <span>Evaluate & Route</span>
          </button>

          {/* Preset examples */}
          <div className="pt-2">
            <span className="text-xs text-slate-500 flex items-center gap-1 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-slate-400" /> Presets:
            </span>
            <div className="space-y-1.5">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setRequest(ex)}
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
            <ActionBanner action={action} actionType="success" latencyMs={latency} />
          )}

          <AnswersTable rows={rows || []} />

          {raw && <JsonViewer data={raw} defaultOpen={false} />}
        </div>
      </div>
    </div>
  );
};

