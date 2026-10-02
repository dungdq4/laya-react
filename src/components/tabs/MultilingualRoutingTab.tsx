import React, { useState } from 'react';
import { executeMultilingualRouting } from '../../services/engine';
import type { TableRow } from '../../types';
import { AnswersTable } from '../AnswersTable';
import { JsonViewer } from '../JsonViewer';
import { Globe2, Sparkles, Cpu } from 'lucide-react';

const DEFAULT_TEXT =
  'I was charged twice for invoice 4411 and nobody has answered for three days. Refund the duplicate today.';

const EXAMPLES = [
  {
    lang: 'English (Latin script)',
    text: 'I was charged twice for invoice 4411 and nobody has answered for three days. Refund the duplicate today.',
  },
  {
    lang: 'Hindi (Devanagari)',
    text: 'मुझसे इनवॉइस 4411 के लिए दो बार शुल्क लिया गया और तीन दिनों से कोई जवाब नहीं मिला। कृपया आज ही धनवापसी करें।',
  },
  {
    lang: 'Japanese (Kanji/Kana)',
    text: '請求書4411で二重に請求されました。三日間返信がありません。本日中に返金してください。',
  },
  {
    lang: 'Korean (Hangul)',
    text: '청구서 4411에 대해 두 번 청구되었습니다. 사흘 동안 답변이 없습니다. 오늘 환불해 주세요.',
  },
  {
    lang: 'Arabic (Arabic script)',
    text: 'تم خصم مبلغ الفاتورة 4411 مرتين ولم يرد أحد منذ ثلاثة أيام. يرجى رد المبلغ اليوم.',
  },
  {
    lang: 'Russian (Cyrillic)',
    text: 'Мне дважды списали деньги по счёту 4411, và уже три дня нет ответа. Верните деньги сегодня.',
  },
  {
    lang: 'German (Latin with umlauts)',
    text: 'Der Kunde wurde zweimal fuer Rechnung 4411 belastet und hat seit drei Tagen keine Antwort erhalten.',
  },
  {
    lang: 'Chinese (Simplified Han)',
    text: '发票4411被重复扣款，三天没有人回复。请今天退款。',
  },
];

export const MultilingualRoutingTab: React.FC = () => {
  const [text, setText] = useState(DEFAULT_TEXT);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<TableRow[] | null>(null);
  const [routingInfo, setRoutingInfo] = useState<{
    model: string;
    script: string;
    language: string;
    reason: string;
    repo: string;
    latencyMs: number;
  } | null>(null);
  const [raw, setRaw] = useState<any>(null);

  const handleRouteAndAsk = () => {
    setLoading(true);
    setTimeout(() => {
      const res = executeMultilingualRouting(text);
      setRows(res.rows);
      setRoutingInfo({
        model: res.model,
        script: res.script,
        language: res.language,
        reason: res.reason,
        repo: res.repo,
        latencyMs: res.raw.latency_ms,
      });
      setRaw(res.raw);
      setLoading(false);
    }, 150);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-sm text-slate-300">
        <p>
          One <code className="text-indigo-300">Router</code>, multiple checkpoints. The script of
          the incoming text decides which checkpoint answers —{' '}
          <strong className="text-indigo-300">before the forward pass</strong>, because the
          model's own confidence gives no warning when it cannot read the script.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Message (Any Language)
            </label>
            <textarea
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y"
              placeholder="Paste message in any language or script..."
            />
          </div>

          <button
            onClick={handleRouteAndAsk}
            disabled={loading || !text.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <span className="animate-spin mr-2">⚙</span> : <Globe2 className="w-4 h-4" />}
            <span>Route and Ask</span>
          </button>

          {/* Preset examples in 8 languages */}
          <div className="pt-2">
            <span className="text-xs text-slate-500 flex items-center gap-1 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-slate-400" /> Try another language:
            </span>
            <div className="space-y-1.5">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setText(ex.text)}
                  className="w-full text-left p-2 rounded-lg bg-slate-900/40 hover:bg-slate-850 border border-slate-800/80 text-xs text-slate-300 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-semibold text-indigo-300">{ex.lang}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{ex.text}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Outputs */}
        <div className="lg:col-span-7 space-y-4">
          {routingInfo && (
            <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-indigo-200">
                    Routed to checkpoint: <code className="font-mono">{routingInfo.model}</code>
                  </span>
                </div>
                <span className="text-xs font-mono text-indigo-300">
                  {routingInfo.latencyMs} ms
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                <span className="px-2 py-0.5 rounded bg-slate-900/60 border border-slate-700/60">
                  Script: <strong>{routingInfo.script}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900/60 border border-slate-700/60">
                  Lang: <strong>{routingInfo.language}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900/60 border border-slate-700/60 font-mono text-[11px]">
                  Repo: {routingInfo.repo}
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">{routingInfo.reason}</p>
            </div>
          )}

          <AnswersTable rows={rows || []} />

          {raw && <JsonViewer data={raw} defaultOpen={false} />}
        </div>
      </div>
    </div>
  );
};
