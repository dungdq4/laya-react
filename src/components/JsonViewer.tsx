import React, { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';

interface JsonViewerProps {
  data: any;
  label?: string;
  defaultOpen?: boolean;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  label = 'Raw Response (JSON)',
  defaultOpen = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-slate-800 rounded-xl bg-slate-900/40 overflow-hidden">
      <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <Code className="w-3.5 h-3.5 text-indigo-400" />
          <span>{label}</span>
          <span className="text-[10px] text-slate-500">{isOpen ? '▼ hide' : '▶ show'}</span>
        </button>

        {isOpen && (
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>

      {isOpen && (
        <pre className="p-4 text-xs font-mono text-slate-300 bg-slate-950/80 overflow-x-auto max-h-96 leading-relaxed">
          {jsonString}
        </pre>
      )}
    </div>
  );
};

