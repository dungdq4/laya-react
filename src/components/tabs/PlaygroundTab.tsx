import React, { useState } from 'react';
import { executePlayground } from '../../services/engine';
import type { TableRow } from '../../types';
import { AnswersTable } from '../AnswersTable';
import { JsonViewer } from '../JsonViewer';
import { Play, AlertCircle, RefreshCw } from 'lucide-react';

const DEFAULT_STATE = JSON.stringify(
  {
    ticket: {
      subject: 'Duplicate charge',
      messages: [
        {
          from: 'customer',
          text: 'I was charged twice for order A-104. Please refund the duplicate.',
        },
      ],
    },
    refund_policy: 'Duplicate charges are eligible for a refund.',
  },
  null,
  2
);

const DEFAULT_QUESTIONS = JSON.stringify(
  {
    refund_requested: {
      type: 'noul',
      instructions: 'Does `ticket.messages[0].text` request a refund?',
    },
    policy_supports_refund: {
      type: 'noul',
      instructions: 'Does `refund_policy` allow the requested refund?',
    },
    department: {
      type: 'choice',
      instructions: 'Which team should handle this?',
      criteria: {
        billing: 'payments and refunds',
        technical: 'bugs and outages',
        sales: 'pricing',
      },
    },
    frustration: {
      type: 'score',
      instructions: 'How frustrated is the customer?',
      criteria: ['calm', 'annoyed', 'very angry'],
    },
  },
  null,
  2
);

export const PlaygroundTab: React.FC = () => {
  const [stateText, setStateText] = useState(DEFAULT_STATE);
  const [questionsText, setQuestionsText] = useState(DEFAULT_QUESTIONS);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<TableRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<any>(null);

  const handleRun = () => {
    setError(null);
    setLoading(true);
    try {
      // Validate questions JSON
      JSON.parse(questionsText);
    } catch (e: any) {
      setError(`Invalid Questions JSON: ${e.message}`);
      setLoading(false);
      return;
    }

    setTimeout(() => {
      try {
        const res = executePlayground(stateText, questionsText);
        setRows(res.rows);
        setRaw(res.raw);
      } catch (err: any) {
        setError(err.message || 'Error executing System 1 playground call');
      } finally {
        setLoading(false);
      }
    }, 150);
  };

  const handleReset = () => {
    setStateText(DEFAULT_STATE);
    setQuestionsText(DEFAULT_QUESTIONS);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 flex items-center justify-between">
        <span>
          Any <strong className="text-indigo-300">state</strong> (JSON or text), any{' '}
          <strong className="text-indigo-300">typed questions</strong> — matching the exact Laya API
          request shape.
        </span>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Editors */}
        <div className="lg:col-span-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>State (JSON or Plain Text)</span>
              <span className="text-[10px] text-slate-500 font-normal">Context provided to model</span>
            </label>
            <textarea
              rows={8}
              value={stateText}
              onChange={(e) => setStateText(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y"
              spellCheck={false}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Typed Questions (JSON)</span>
              <span className="text-[10px] text-slate-500 font-normal">choice | score | noul</span>
            </label>
            <textarea
              rows={12}
              value={questionsText}
              onChange={(e) => setQuestionsText(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y"
              spellCheck={false}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleRun}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <span className="animate-spin mr-2">⚙</span> : <Play className="w-4 h-4" />}
            <span>Execute Questions</span>
          </button>
        </div>

        {/* Right Column: Outputs */}
        <div className="lg:col-span-6 space-y-4">
          <AnswersTable rows={rows || []} />

          {raw && <JsonViewer data={raw} label="Playground Output (JSON)" defaultOpen={true} />}
        </div>
      </div>
    </div>
  );
};

