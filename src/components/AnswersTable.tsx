import React, { useState } from 'react';
import type { TableRow } from '../types';
import { ChevronDown, ChevronUp, BarChart2, Info } from 'lucide-react';

interface AnswersTableProps {
  rows: TableRow[];
}

export const AnswersTable: React.FC<AnswersTableProps> = ({ rows }) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  if (!rows || rows.length === 0) {
    return (
      <div className="border border-slate-800 rounded-xl bg-slate-900/40 p-8 text-center text-slate-500">
        No answers yet. Click Ask to run System 1 inference.
      </div>
    );
  }

  const toggleExpand = (qid: string) => {
    setExpandedRow((prev) => (prev === qid ? null : qid));
  };

  return (
    <div className="border border-slate-800/80 rounded-xl bg-slate-900/60 shadow-lg overflow-hidden backdrop-blur-sm">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <span>Decisions & Probabilities</span>
          <span className="text-xs lowercase text-slate-400 font-normal">
            ({rows.length} questions in single pass)
          </span>
        </h3>
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          Click row to inspect distribution
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800/70 bg-slate-800/40 text-xs font-semibold text-slate-400 uppercase">
              <th className="py-2.5 px-4">Question</th>
              <th className="py-2.5 px-4">Type</th>
              <th className="py-2.5 px-4">Answer</th>
              <th className="py-2.5 px-4">Confidence</th>
              <th className="py-2.5 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {rows.map((row) => {
              const isExpanded = expandedRow === row.question;
              const confVal = parseFloat(row.confidence) || 0;
              const raw = row.rawAnswer;

              return (
                <React.Fragment key={row.question}>
                  <tr
                    onClick={() => toggleExpand(row.question)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-200">
                      {row.question}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono uppercase font-semibold ${
                          row.type === 'choice'
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/25'
                            : row.type === 'score'
                            ? 'bg-purple-500/15 text-purple-300 border border-purple-500/25'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                        }`}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-indigo-200">
                      {row.answer}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              confVal >= 0.8
                                ? 'bg-emerald-500'
                                : confVal >= 0.5
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.round(confVal * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-slate-300 font-medium">
                          {row.confidence}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 inline-block text-indigo-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 inline-block text-slate-500" />
                      )}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-slate-950/60 border-y border-slate-800/80">
                      <td colSpan={5} className="p-4">
                        <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3 space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                            <span className="flex items-center gap-1 font-semibold text-slate-300">
                              <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                              Calibrated Probability Distribution
                            </span>
                            {raw.rl_agent && (
                              <span className="font-mono text-slate-400">
                                RL Action Prob: {raw.rl_agent.act_probability.toFixed(3)}
                              </span>
                            )}
                          </div>

                          {/* Distribution breakdown */}
                          {'probabilities' in raw && raw.probabilities ? (
                            <div className="space-y-1.5 pt-1">
                              {Object.entries(raw.probabilities).map(([key, p]) => {
                                const probVal = p as number;
                                const isSelected =
                                  (raw.type === 'choice' && raw.choice === key) ||
                                  (raw.type === 'score' &&
                                    Math.round(raw.score) === parseInt(key, 10));

                                const labelText =
                                  raw.type === 'score' && raw.legend && raw.legend[key]
                                    ? `Level ${key}: ${raw.legend[key]}`
                                    : key;

                                return (
                                  <div key={key} className="space-y-0.5">
                                    <div className="flex justify-between text-xs font-mono">
                                      <span
                                        className={
                                          isSelected
                                            ? 'text-indigo-300 font-semibold'
                                            : 'text-slate-400'
                                        }
                                      >
                                        {labelText}
                                      </span>
                                      <span className="text-slate-300">
                                        {(probVal * 100).toFixed(1)}% ({probVal.toFixed(4)})
                                      </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${
                                          isSelected ? 'bg-indigo-500' : 'bg-slate-600'
                                        }`}
                                        style={{ width: `${Math.round(probVal * 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : raw.type === 'noul' ? (
                            <div className="space-y-1 pt-1">
                              <div className="flex justify-between text-xs font-mono">
                                <span className="text-slate-400">True probability</span>
                                <span className="text-emerald-400 font-semibold">
                                  {(raw.noul * 100).toFixed(1)}% ({raw.noul.toFixed(4)})
                                </span>
                              </div>
                              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                                <div
                                  className="h-full bg-emerald-500"
                                  style={{ width: `${Math.round(raw.noul * 100)}%` }}
                                />
                                <div
                                  className="h-full bg-slate-600"
                                  style={{ width: `${Math.round((1 - raw.noul) * 100)}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                                <span>False: {((1 - raw.noul) * 100).toFixed(1)}%</span>
                                <span>True: {(raw.noul * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

