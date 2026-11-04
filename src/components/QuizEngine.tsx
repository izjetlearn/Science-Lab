import React, { useState } from 'react';
import { ExperimentDef, QuizQuestion } from '../types';
import { sound } from '../audio';
import { CheckCircle2, XCircle, X, HelpCircle, ArrowRight } from 'lucide-react';

interface Props {
  exp: ExperimentDef;
  questions: QuizQuestion[];
  onClose: () => void;
  updateStreak: (correct: boolean) => void;
}

export default function QuizEngine({ exp, questions, onClose, updateStreak }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const q = questions[currentIdx] || {
    q: 'Default concept question',
    a: ['Option A', 'Option B'],
    c: 0,
    e: 'Fundamental law of physics.'
  };

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelected(idx);
    setIsAnswered(true);

    const isCorrect = idx === q.c;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      sound.play('success');
    } else {
      sound.play('error');
    }
    updateStreak(isCorrect);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelected(null);
      setIsAnswered(false);
      sound.play('click');
    } else {
      setIsFinished(true);
      sound.play('success');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-700/60 rounded-3xl p-6 md:p-8 shadow-2xl relative">
        {/* Header bar */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-cyan-400 font-mono">
              {exp.title}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">
              Question {currentIdx + 1} of {questions.length}
            </span>
          </div>

          <button
            onClick={() => {
              sound.play('click');
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Close quiz"
          >
            <X size={18} />
          </button>
        </div>

        {!isFinished ? (
          <div>
            {/* Question Text */}
            <h3 className="text-xl md:text-2xl font-bold mb-6 text-white leading-snug">
              {q.q}
            </h3>

            {/* Answer choices */}
            <div className="space-y-3 mb-6">
              {q.a.map((opt, idx) => {
                let btnStyle = 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-200';
                let icon = null;

                if (isAnswered) {
                  if (idx === q.c) {
                    btnStyle = 'border-emerald-500 bg-emerald-950/30 text-emerald-200 font-medium';
                    icon = <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />;
                  } else if (idx === selected) {
                    btnStyle = 'border-rose-500 bg-rose-950/30 text-rose-200 font-medium';
                    icon = <XCircle size={18} className="text-rose-400 shrink-0" />;
                  } else {
                    btnStyle = 'border-slate-800/40 opacity-40 text-slate-400';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelect(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between text-sm md:text-base ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Scientific Explanation Reveal */}
            {isAnswered && (
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs md:text-sm text-cyan-200 space-y-3 animate-in fade-in">
                <div className="flex items-start gap-2">
                  <HelpCircle size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Scientific Rationale: </span>
                    {q.e}
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleNext}
                    className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs md:text-sm flex items-center gap-2 transition-colors"
                  >
                    <span>{currentIdx === questions.length - 1 ? 'View Final Results' : 'Next Question'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Quiz Results screen */
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white mb-1">Assessment Complete</h3>
              <p className="text-sm text-slate-400 font-mono">
                Score: {score} of {questions.length} correct (
                {Math.round((score / questions.length) * 100)}%)
              </p>
            </div>

            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {score === questions.length
                ? 'Flawless comprehension of the governing laws and reaction kinetics!'
                : 'Good effort! Review the experiment parameters and rerun the simulation to reinforce principles.'}
            </p>

            <button
              onClick={() => {
                sound.play('click');
                onClose();
              }}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition-colors"
            >
              Return to Simulation Lab
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
