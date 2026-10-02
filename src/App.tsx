import { useState } from 'react';
import { Header } from './components/Header';
import { TabNav, type TabKey } from './components/TabNav';
import { SupportTriageTab } from './components/tabs/SupportTriageTab';
import { EmailPhishingTab } from './components/tabs/EmailPhishingTab';
import { GuardrailsTab } from './components/tabs/GuardrailsTab';
import { RagFilterTab } from './components/tabs/RagFilterTab';
import { ModerationTab } from './components/tabs/ModerationTab';
import { ModelRoutingTab } from './components/tabs/ModelRoutingTab';
import { MultilingualRoutingTab } from './components/tabs/MultilingualRoutingTab';
import { PlaygroundTab } from './components/tabs/PlaygroundTab';
import { ExternalLink, Zap } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('triage');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Intro banner */}
        <div className="border border-indigo-500/20 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/60 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Decisions, Not Text</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-normal border border-indigo-500/30">
                  Zero Hallucination
                </span>
              </h2>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Give it a <strong className="text-slate-200">state</strong> (text or JSON) and{' '}
                <strong className="text-slate-200">typed questions</strong>; it returns typed answers with
                calibrated probabilities and confidence scores. No text generation, nothing to parse, and
                sub-50ms latency.
              </p>
            </div>

            {/* Quick cheat sheet */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs shrink-0">
              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="block font-mono font-semibold text-blue-400">choice</span>
                <span className="text-[11px] text-slate-400">Categorical</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="block font-mono font-semibold text-purple-400">score</span>
                <span className="text-[11px] text-slate-400">Ordinal rubric</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="block font-mono font-semibold text-emerald-400">noul</span>
                <span className="text-[11px] text-slate-400">True / False</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="transition-all duration-200">
          {activeTab === 'triage' && <SupportTriageTab />}
          {activeTab === 'email' && <EmailPhishingTab />}
          {activeTab === 'guardrails' && <GuardrailsTab />}
          {activeTab === 'rag' && <RagFilterTab />}
          {activeTab === 'moderation' && <ModerationTab />}
          {activeTab === 'model-routing' && <ModelRoutingTab />}
          {activeTab === 'multilingual' && <MultilingualRoutingTab />}
          {activeTab === 'playground' && <PlaygroundTab />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-850 bg-slate-950 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span>Remix of</span>
            <a
              href="https://huggingface.co/spaces/convaiinnovations/laya-demo"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
            >
              Laya Demo <ExternalLink className="w-3 h-3" />
            </a>
            <span>by Convai Innovations</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1 text-slate-400">
              <Zap className="w-3.5 h-3.5 text-indigo-400" /> React 19 + Vite + Tailwind CSS
            </span>
            <a
              href="https://huggingface.co/convaiinnovations/laya"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition-colors inline-flex items-center gap-1"
            >
              Hugging Face Model <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
