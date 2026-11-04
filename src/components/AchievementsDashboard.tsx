import React from 'react';
import { Trophy, Award, Flame, Zap, CheckCircle2, Lock } from 'lucide-react';
import { ACHIEVEMENTS_LIST } from '../data/experiments';

interface Props {
  medals: string[];
  bestStreak: number;
  totalRuns: number;
}

export default function AchievementsDashboard({ medals, bestStreak, totalRuns }: Props) {
  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame size={28} />
          </div>
          <div>
            <div className="text-3xl font-black text-white tabular-nums">{bestStreak}</div>
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mt-0.5">
              Best Quiz Streak
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Zap size={28} />
          </div>
          <div>
            <div className="text-3xl font-black text-white tabular-nums">{totalRuns}</div>
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mt-0.5">
              Simulations Completed
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Award size={28} />
          </div>
          <div>
            <div className="text-3xl font-black text-white tabular-nums">
              {medals.length} / {ACHIEVEMENTS_LIST.length}
            </div>
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mt-0.5">
              Honors & Accolades
            </div>
          </div>
        </div>
      </div>

      {/* Accolades Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">Scientific Distinctions</h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Earn badges by testing hypotheses, executing simulation runs, and maintaining answer streaks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ACHIEVEMENTS_LIST.map((ach) => {
            const isUnlocked = medals.includes(ach.id);

            return (
              <div
                key={ach.id}
                className={`p-6 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-slate-900/80 border-cyan-500/40 shadow-lg shadow-cyan-950/20'
                    : 'bg-slate-950/40 border-slate-850 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isUnlocked
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-slate-800/40 text-slate-600'
                      }`}
                    >
                      {isUnlocked ? <Trophy size={20} /> : <Lock size={18} />}
                    </div>

                    {isUnlocked ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400">
                        <CheckCircle2 size={12} />
                        <span>Unlocked</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-500">Locked</span>
                    )}
                  </div>

                  <h4 className="font-bold text-base text-white mb-1.5">{ach.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{ach.description}</p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-800/40 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  Requirement: {ach.threshold} {ach.category}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
