import React from 'react';
import {
  Headphones,
  Mail,
  ShieldAlert,
  Layers,
  Flag,
  GitBranch,
  Languages,
  Terminal,
} from 'lucide-react';

export type TabKey =
  | 'triage'
  | 'email'
  | 'guardrails'
  | 'rag'
  | 'moderation'
  | 'model-routing'
  | 'multilingual'
  | 'playground';

interface TabItem {
  id: TabKey;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const TABS: TabItem[] = [
  { id: 'triage', label: 'Support triage', icon: <Headphones className="w-4 h-4" /> },
  { id: 'email', label: 'Email + phishing', icon: <Mail className="w-4 h-4" /> },
  { id: 'guardrails', label: 'LLM guardrails', icon: <ShieldAlert className="w-4 h-4" /> },
  { id: 'rag', label: 'RAG passage filter', icon: <Layers className="w-4 h-4" /> },
  { id: 'moderation', label: 'Moderation', icon: <Flag className="w-4 h-4" /> },
  { id: 'model-routing', label: 'Model routing', icon: <GitBranch className="w-4 h-4" /> },
  { id: 'multilingual', label: 'Multilingual routing', icon: <Languages className="w-4 h-4" />, badge: 'Router' },
  { id: 'playground', label: 'Playground', icon: <Terminal className="w-4 h-4" /> },
];

interface TabNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const TabNav: React.FC<TabNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-b border-slate-800 bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto py-2 no-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-indigo-400' : 'text-slate-400'}>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
