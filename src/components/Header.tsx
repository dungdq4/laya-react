import React from 'react';
import { Cpu, Zap, ShieldCheck, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">Laya</h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  System 1 Engine
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Decisions, Not Text · Calibrated probabilities · Single-pass inference
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Model: <span className="text-slate-100 font-mono font-medium">convaiinnovations/laya</span> (421M)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Latency: <span className="text-slate-100 font-mono font-medium">~32 ms</span></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Calibrated: <span className="text-slate-100 font-mono font-medium">Proper Scoring Rules</span></span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

