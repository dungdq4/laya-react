import React, { useState } from 'react';
import { executeEmailTriage } from '../../services/engine';
import type { TableRow } from '../../types';
import { AnswersTable } from '../AnswersTable';
import { ActionBanner } from '../ActionBanner';
import { JsonViewer } from '../JsonViewer';
import { Send, FileText, Sparkles } from 'lucide-react';

const DEFAULT_FROM = 'security@wellsf-argo-verify.com';
const DEFAULT_SUBJ = 'Urgent: your account is locked';
const DEFAULT_BODY = `Your account has been locked for security reasons. Verify immediately at http://wellsfargo--verify.tj49.wsipv6.com or it will be closed.

Regards,
Security Team

CONFIDENTIALITY NOTICE: intended solely for the use of the named addressee.`;

const EXAMPLES = [
  {
    from: 'security@wellsf-argo-verify.com',
    subj: 'Urgent: your account is locked',
    body: DEFAULT_BODY,
  },
  {
    from: 'promo@greatdeals-bulk.net',
    subj: 'BUY CHEAP FOLLOWERS NOW >>> click here <<<',
    body: 'Huge discounts on followers, likes and views! Click here to claim 50% discount today.\n\nUnsubscribe from this mailing list.',
  },
  {
    from: 'alice@company.com',
    subj: 'Invoice payment confirmation for #882',
    body: 'Hi Team,\nCould you please send over the official receipt for invoice #882 paid yesterday?\n\nThanks,\nAlice Cooper\nChief Accountant',
  },
];

export const EmailPhishingTab: React.FC = () => {
  const [from, setFrom] = useState(DEFAULT_FROM);
  const [subject, setSubject] = useState(DEFAULT_SUBJ);
  const [body, setBody] = useState(DEFAULT_BODY);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<TableRow[] | null>(null);
  const [action, setAction] = useState<string>('');
  const [actionType, setActionType] = useState<'escalate' | 'warning' | 'priority' | 'success'>('success');
  const [cleanedBody, setCleanedBody] = useState<string>('');
  const [latency, setLatency] = useState<number>(0);
  const [raw, setRaw] = useState<any>(null);

  const handleAsk = () => {
    setLoading(true);
    setTimeout(() => {
      const res = executeEmailTriage(from, subject, body);
      setRows(res.rows);
      setAction(res.action);
      setActionType(res.actionType);
      setCleanedBody(res.cleanedBody);
      setLatency(res.raw.latency_ms);
      setRaw(res.raw);
      setLoading(false);
    }, 150);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-sm text-slate-300">
        Quoted replies, signatures and disclaimers are stripped{' '}
        <span className="font-semibold text-indigo-300">in code</span> first, then one call
        answers five questions.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                From
              </label>
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Raw Email Body
            </label>
            <textarea
              rows={7}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y font-mono text-xs"
              placeholder="Paste raw email body..."
            />
          </div>

          <button
            onClick={handleAsk}
            disabled={loading || !body.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <span className="animate-spin mr-2">⚙</span> : <Send className="w-4 h-4" />}
            <span>Ask System 1</span>
          </button>

          {/* Preset examples */}
          <div className="pt-2">
            <span className="text-xs text-slate-500 flex items-center gap-1 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-slate-400" /> Or load an example:
            </span>
            <div className="space-y-1.5">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setFrom(ex.from);
                    setSubject(ex.subj);
                    setBody(ex.body);
                  }}
                  className="w-full text-left p-2 rounded-lg bg-slate-900/40 hover:bg-slate-850 border border-slate-800/80 text-xs text-slate-300 transition-colors cursor-pointer"
                >
                  <span className="font-semibold block text-indigo-300">{ex.subj}</span>
                  <span className="text-[11px] text-slate-500 font-mono truncate block">{ex.from}</span>
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

          {cleanedBody && (
            <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-4 space-y-1.5">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Cleaned body sent to the model (noise stripped)</span>
              </div>
              <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-lg text-xs font-mono text-slate-300 whitespace-pre-wrap">
                {cleanedBody}
              </div>
            </div>
          )}

          {raw && <JsonViewer data={raw} defaultOpen={false} />}
        </div>
      </div>
    </div>
  );
};

