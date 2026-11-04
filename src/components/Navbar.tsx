import React from 'react';
import { Beaker, Volume2, VolumeX, Flame } from 'lucide-react';

interface Props {
  currentView: 'home' | 'experiment' | 'notebook' | 'achievements';
  onNavigate: (view: 'home' | 'experiment' | 'notebook' | 'achievements') => void;
  streak: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export default function Navbar({ currentView, onNavigate, streak, soundEnabled, onToggleSound }: Props) {
  return (
    <header className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left font-black tracking-tight text-white hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
        >
          <div className="p-1.5 bg-cyan-500 rounded-lg shadow-md shadow-cyan-500/20 text-slate-950">
            <Beaker size={18} strokeWidth={2.5} />
          </div>
          <span className="text-xl">
            Science<span className="text-cyan-400">Lab</span>
          </span>
        </button>

        {/* Zone 2: 4 single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 hover:text-white ${
              currentView === 'home' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' : ''
            }`}
          >
            Lab Hub
          </button>
          <button
            onClick={() => onNavigate('notebook')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 hover:text-white ${
              currentView === 'notebook' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' : ''
            }`}
          >
            Lab Notebook
          </button>
          <button
            onClick={() => onNavigate('achievements')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 hover:text-white ${
              currentView === 'achievements' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' : ''
            }`}
          >
            Achievements
          </button>
        </nav>

        {/* Zone 3: 1 primary action cluster (Streak & Sound Toggle) */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
            <Flame size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-slate-400">Streak:</span>
            <span className="text-cyan-400 font-bold tabular-nums">{streak}</span>
          </div>

          <button
            onClick={onToggleSound}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title={soundEnabled ? 'Mute audio' : 'Enable audio'}
            aria-label={soundEnabled ? 'Mute audio' : 'Enable audio'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-rose-400" />}
          </button>
        </div>
      </div>
    </header>
  );
}
