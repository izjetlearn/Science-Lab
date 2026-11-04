import React from 'react';
import { LabLogEntry } from '../types';
import { sound } from '../audio';
import { BookOpen, Trash2, Download, Clock } from 'lucide-react';

interface Props {
  logs: LabLogEntry[];
  onClearLogs: () => void;
  onNavigateHome: () => void;
}

export default function LabNotebook({ logs, onClearLogs, onNavigateHome }: Props) {
  const handleExport = () => {
    sound.play('click');
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sciencelab_notebook_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <BookOpen size={14} />
            <span>Empirical Journal</span>
          </div>
          <h2 className="text-3xl font-black text-white">Laboratory Notebook</h2>
          <p className="text-sm text-slate-400 mt-1">
            Chronological record of completed simulation trials, parameter settings, and observed sensor telemetry.
          </p>
        </div>

        {logs.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-200 flex items-center gap-2 transition-colors"
            >
              <Download size={14} />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => {
                sound.play('click');
                if (confirm('Clear all recorded lab notebook entries?')) {
                  onClearLogs();
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-950/40 border border-rose-800/50 hover:bg-rose-900/40 text-xs font-medium text-rose-300 flex items-center gap-2 transition-colors"
            >
              <Trash2 size={14} />
              <span>Clear Log</span>
            </button>
          </div>
        )}
      </div>

      {/* Log list */}
      {logs.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/30 rounded-3xl border border-dashed border-slate-850 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-300">No Experimental Records Yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              Select any simulation in the Lab Hub, calibrate its parameters, and execute the run to auto-record empirical data here.
            </p>
          </div>
          <button
            onClick={() => {
              sound.play('click');
              onNavigateHome();
            }}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
          >
            Go to Lab Hub
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-750 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{log.experimentTitle}</h3>
                  <span className="text-xs text-cyan-400 font-mono bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                    Run #{log.id.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Clock size={12} />
                  <span>{new Date(log.timestamp).toLocaleTimeString()} · {new Date(log.timestamp).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* Input Parameters */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Control Parameters
                  </div>
                  {Object.entries(log.params).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-slate-300">
                      <span className="text-slate-500">{k}:</span>
                      <span className="font-semibold text-slate-200">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Observed Telemetry */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                    Observed Metrics
                  </div>
                  {Object.entries(log.metrics).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-slate-300">
                      <span className="text-slate-500">{k}:</span>
                      <span className="font-semibold text-cyan-300">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
