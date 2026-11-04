/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Beaker,
  Rocket,
  Activity,
  Mountain,
  Dna,
  Zap,
  ArrowLeft,
  Play,
  RotateCcw,
  BookOpen,
  ChevronRight,
  ShieldAlert,
  Flame,
  Award
} from 'lucide-react';

import { ExperimentDef, ExperimentCategory, LabLogEntry } from './types';
import { EXPERIMENTS_DATA, QUIZ_BANK, ACHIEVEMENTS_LIST } from './data/experiments';
import { sound } from './audio';

import Navbar from './components/Navbar';
import ToothpasteSim from './components/simulations/ToothpasteSim';
import RocketSim from './components/simulations/RocketSim';
import EarthquakeSim from './components/simulations/EarthquakeSim';
import VolcanoSim from './components/simulations/VolcanoSim';
import GeneticsSim from './components/simulations/GeneticsSim';
import MagnesiumSim from './components/simulations/MagnesiumSim';
import QuizEngine from './components/QuizEngine';
import LabNotebook from './components/LabNotebook';
import AchievementsDashboard from './components/AchievementsDashboard';

export default function App() {
  const [view, setView] = useState<'home' | 'experiment' | 'notebook' | 'achievements'>('home');
  const [activeExp, setActiveExp] = useState<ExperimentDef>(EXPERIMENTS_DATA[0]);
  const [selectedCategory, setSelectedCategory] = useState<'All' | ExperimentCategory>('All');

  // Simulation execution state
  const [params, setParams] = useState<Record<string, number>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  // Gamification & Records state
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [medals, setMedals] = useState<string[]>([]);
  const [logs, setLogs] = useState<LabLogEntry[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [unlockedNotice, setUnlockedNotice] = useState<string | null>(null);

  // Load persistence
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sciencelab_data') || '{}');
      if (saved.bestStreak) setBestStreak(saved.bestStreak);
      if (saved.medals) setMedals(saved.medals);
      if (saved.logs) setLogs(saved.logs);
      if (saved.soundEnabled !== undefined) {
        setSoundEnabled(saved.soundEnabled);
        sound.enabled = saved.soundEnabled;
      }
    } catch {
      // LocalStorage access fallback
    }
  }, []);

  // Save persistence
  useEffect(() => {
    try {
      localStorage.setItem(
        'sciencelab_data',
        JSON.stringify({ bestStreak, medals, logs, soundEnabled })
      );
    } catch {
      // LocalStorage access fallback
    }
  }, [bestStreak, medals, logs, soundEnabled]);

  // Sync default parameters when switching experiment
  useEffect(() => {
    if (activeExp) {
      const initial: Record<string, number> = {};
      activeExp.parameters.forEach((p) => {
        initial[p.key] = p.defaultValue;
      });
      setParams(initial);
      setIsRunning(false);
      setProgress(0);
    }
  }, [activeExp]);

  // Simulation step timer
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isRunning && progress < 100) {
      timer = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 1.25;
          if (next >= 100) {
            setIsRunning(false);
            checkAchievement('first_run');
            return 100;
          }
          return next;
        });
      }, 50);
    }
    return () => clearInterval(timer);
  }, [isRunning, progress]);

  // Sound toggle
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    sound.play('click');
  };

  // Streak & medals check
  const updateStreak = (correct: boolean) => {
    if (correct) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) {
        setBestStreak(nextStreak);
      }
      if (nextStreak >= 3) checkAchievement('streak_3');
      if (nextStreak >= 5) checkAchievement('streak_5');
      if (nextStreak >= 10) checkAchievement('streak_10');
      if (nextStreak >= 15) checkAchievement('streak_15');
      if (nextStreak >= 20) checkAchievement('streak_20');
    } else {
      setStreak(0);
    }
  };

  const checkAchievement = (achId: string) => {
    if (!medals.includes(achId)) {
      const match = ACHIEVEMENTS_LIST.find((a) => a.id === achId);
      if (match) {
        setMedals((prev) => [...prev, achId]);
        setUnlockedNotice(`Distinction Unlocked: ${match.title}!`);
        sound.play('success');
        setTimeout(() => setUnlockedNotice(null), 4000);
      }
    }
  };

  // Save completed run into lab notebook
  const handleRecordRun = (metrics: Record<string, string | number>) => {
    const newEntry: LabLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      experimentId: activeExp.id,
      experimentTitle: activeExp.title,
      timestamp: Date.now(),
      params: { ...params },
      metrics
    };
    setLogs((prev) => [newEntry, ...prev.slice(0, 49)]);
  };

  const filteredExperiments = useMemo(() => {
    if (selectedCategory === 'All') return EXPERIMENTS_DATA;
    return EXPERIMENTS_DATA.filter((e) => e.category === selectedCategory);
  }, [selectedCategory]);

  const categories: Array<'All' | ExperimentCategory> = [
    'All',
    'Chemistry',
    'Physics',
    'Geology',
    'Earth Science',
    'Genetics'
  ];

  const getCategoryIcon = (cat: ExperimentCategory) => {
    switch (cat) {
      case 'Chemistry':
        return <Beaker size={20} className="text-cyan-400" />;
      case 'Physics':
        return <Rocket size={20} className="text-blue-400" />;
      case 'Geology':
        return <Activity size={20} className="text-orange-400" />;
      case 'Earth Science':
        return <Mountain size={20} className="text-red-400" />;
      case 'Genetics':
        return <Dna size={20} className="text-emerald-400" />;
      default:
        return <Zap size={20} className="text-amber-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] text-slate-100 flex flex-col font-['Outfit',sans-serif]">
      {/* Top Navigation */}
      <Navbar
        currentView={view}
        onNavigate={(v) => {
          sound.play('click');
          setView(v);
        }}
        streak={streak}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />

      {/* Floating Distinction Toast */}
      {unlockedNotice && (
        <div className="fixed top-20 right-6 z-50 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce text-xs">
          <Award size={16} />
          <span>{unlockedNotice}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1">
        {/* VIEW 1: LAB HUB */}
        {view === 'home' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            {/* Hero Header */}
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-2">
                <span>Interactive Physical & Chemical Engines</span>
                <span className="text-slate-600">·</span>
                <span>Version 2.0</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white max-w-3xl leading-tight">
                Simulate the Laws of Nature in Real Time.
              </h1>
              <p className="text-slate-400 text-base max-w-2xl mt-3 leading-relaxed">
                Step into an interactive digital laboratory. Manipulate reaction catalysts, tectonic stresses,
                orbital trajectories, and Mendelian alleles with dynamic telemetry feedback.
              </p>
            </div>

            {/* Category Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    sound.play('click');
                    setSelectedCategory(cat);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Experiment Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperiments.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => {
                    sound.play('click');
                    setActiveExp(exp);
                    setView('experiment');
                  }}
                  className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col justify-between hover:shadow-xl hover:shadow-cyan-950/20 hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {getCategoryIcon(exp.category)}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {exp.difficulty}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 mb-1">
                      {exp.category}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                      {exp.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {exp.tagline}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400 text-[11px] truncate max-w-[200px]">
                      {exp.formulaLabel}
                    </span>
                    <span className="text-cyan-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Enter Lab <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: EXPERIMENT WORKSPACE */}
        {view === 'experiment' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Navigation Back Button */}
            <div className="flex items-center justify-between pb-2">
              <button
                onClick={() => {
                  sound.play('click');
                  setView('home');
                }}
                className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} />
                <span>Return to Laboratory Hub</span>
              </button>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono">Category:</span>
                <span className="text-xs font-bold text-cyan-400 font-mono bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-800/50">
                  {activeExp.category}
                </span>
              </div>
            </div>

            {/* Split Workspace Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Zone (60%): Interactive Stage & Principles */}
              <div className="lg:col-span-2 space-y-6">
                {/* Simulation Canvas Box */}
                <div className="bg-slate-950 rounded-3xl border border-slate-800 h-[500px] relative overflow-hidden flex flex-col justify-between shadow-2xl">
                  {/* Active Simulation Engine */}
                  <div className="relative flex-1">
                    {activeExp.id === 'toothpaste' && (
                      <ToothpasteSim
                        params={params as { concentration: number; catalyst: number; soap: number }}
                        isRunning={isRunning}
                        progress={progress}
                        onRecordData={handleRecordRun}
                      />
                    )}
                    {activeExp.id === 'rocket' && (
                      <RocketSim
                        params={params as { thrust: number; fuelMass: number; dragCoeff: number }}
                        isRunning={isRunning}
                        progress={progress}
                        onRecordData={handleRecordRun}
                      />
                    )}
                    {activeExp.id === 'earthquake' && (
                      <EarthquakeSim
                        params={params as { magnitude: number; depth: number; distance: number }}
                        isRunning={isRunning}
                        progress={progress}
                        onRecordData={handleRecordRun}
                      />
                    )}
                    {activeExp.id === 'volcano' && (
                      <VolcanoSim
                        params={params as { silica: number; gasPressure: number; ventDiameter: number }}
                        isRunning={isRunning}
                        progress={progress}
                        onRecordData={handleRecordRun}
                      />
                    )}
                    {activeExp.id === 'genetics' && (
                      <GeneticsSim
                        params={params as { maternalAllele: number; paternalAllele: number; sampleSize: number }}
                        isRunning={isRunning}
                        progress={progress}
                        onRecordData={handleRecordRun}
                      />
                    )}
                    {activeExp.id === 'magnesium' && (
                      <MagnesiumSim
                        params={params as { o2Concentration: number; ribbonMass: number; flameTemp: number }}
                        isRunning={isRunning}
                        progress={progress}
                        onRecordData={handleRecordRun}
                      />
                    )}
                  </div>

                  {/* Reaction Progress Bar */}
                  <div className="p-4 bg-slate-950/90 border-t border-slate-850">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5">
                      <span>Simulation Cycle</span>
                      <span className="text-cyan-400 tabular-nums">{Math.round(progress)}% Complete</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-75"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Scientific Principles Deep Dive Card */}
                <div className="bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-xl font-bold text-white">Scientific Principles & Governing Laws</h3>
                    {activeExp.formulaLabel && (
                      <span className="text-xs font-mono text-cyan-400">{activeExp.formulaLabel}</span>
                    )}
                  </div>

                  {activeExp.equation && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs md:text-sm text-cyan-300">
                      {activeExp.equation}
                    </div>
                  )}

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {activeExp.principles}
                  </p>

                  {activeExp.safetyNote && (
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/30 text-xs text-amber-200">
                      <ShieldAlert size={16} className="text-amber-400 shrink-0 mt-0.5" />
                      <span>{activeExp.safetyNote}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Zone (40%): Controls Deck & Assessment CTA */}
              <div className="space-y-6">
                {/* Calibration Deck */}
                <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="font-bold text-base text-white">Parameter Calibration</h4>
                    <span className="text-[11px] font-mono text-slate-400">Independent Variables</span>
                  </div>

                  {/* Preset Protocols */}
                  {activeExp.presets.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                        Quick Preset Configurations
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {activeExp.presets.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => {
                              sound.play('click');
                              setParams(preset.params);
                              setProgress(0);
                              setIsRunning(false);
                            }}
                            className="text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/60 hover:border-cyan-500/40 transition-colors"
                          >
                            <div className="text-xs font-bold text-slate-200">{preset.name}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1">{preset.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive Sliders */}
                  <div className="space-y-5 pt-2 border-t border-slate-800">
                    {activeExp.parameters.map((param) => {
                      const val = params[param.key] ?? param.defaultValue;
                      return (
                        <div key={param.key} className="space-y-2">
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-slate-300 font-medium">{param.label}</span>
                            <span className="text-cyan-400 font-bold tabular-nums">
                              {val} {param.unit}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={param.min}
                            max={param.max}
                            step={param.step}
                            value={val}
                            disabled={isRunning}
                            onChange={(e) => {
                              const newVal = parseFloat(e.target.value);
                              setParams((prev) => ({ ...prev, [param.key]: newVal }));
                            }}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50"
                          />
                          <p className="text-[11px] text-slate-400 leading-tight">
                            {param.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Playback Controls */}
                  <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                    <button
                      onClick={() => {
                        sound.play('click');
                        if (progress >= 100) {
                          setProgress(0);
                        }
                        setIsRunning(true);
                      }}
                      disabled={isRunning}
                      className="flex-1 py-3 px-6 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
                    >
                      <Play size={16} />
                      <span>{progress === 100 ? 'Re-Run Protocol' : isRunning ? 'Simulation Running...' : 'Execute Simulation'}</span>
                    </button>

                    <button
                      onClick={() => {
                        sound.play('click');
                        setIsRunning(false);
                        setProgress(0);
                      }}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white transition-colors"
                      title="Reset simulation"
                      aria-label="Reset simulation"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                </div>

                {/* Lab Quiz Card */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-indigo-800/40 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-wider">
                    <BookOpen size={14} />
                    <span>Scientific Mastery</span>
                  </div>
                  <h4 className="text-xl font-bold text-white">Test Your Understanding</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Evaluate your comprehension of {activeExp.title} principles. Correct answers advance your personal scholar streak and unlock research medals.
                  </p>
                  <button
                    onClick={() => {
                      sound.play('click');
                      setIsQuizOpen(true);
                    }}
                    className="w-full py-3 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-xl text-xs md:text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <span>Begin Experiment Quiz</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: LAB NOTEBOOK */}
        {view === 'notebook' && (
          <LabNotebook
            logs={logs}
            onClearLogs={() => setLogs([])}
            onNavigateHome={() => setView('home')}
          />
        )}

        {/* VIEW 4: ACHIEVEMENTS */}
        {view === 'achievements' && (
          <AchievementsDashboard
            medals={medals}
            bestStreak={bestStreak}
            totalRuns={logs.length}
          />
        )}
      </main>

      {/* QUIZ MODAL */}
      {isQuizOpen && (
        <QuizEngine
          exp={activeExp}
          questions={QUIZ_BANK[activeExp.id] || []}
          onClose={() => setIsQuizOpen(false)}
          updateStreak={updateStreak}
        />
      )}
    </div>
  );
}
