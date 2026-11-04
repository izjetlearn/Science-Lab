import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../../audio';

interface Props {
  params: {
    maternalAllele: number; // 0: bb, 1: Bb, 2: BB
    paternalAllele: number; // 0: bb, 1: Bb, 2: BB
    sampleSize: number;     // 10 to 200
  };
  isRunning: boolean;
  progress: number;
  onRecordData?: (metrics: Record<string, string | number>) => void;
}

export default function GeneticsSim({ params, isRunning, progress, onRecordData }: Props) {
  const [selectedTrait, setSelectedTrait] = useState<'glow' | 'height' | 'pigment'>('glow');
  const helixCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Decode alleles
  // 0 -> ['b', 'b'], 1 -> ['B', 'b'], 2 -> ['B', 'B']
  const getAllelePair = (val: number): [string, string] => {
    if (val === 2) return ['B', 'B'];
    if (val === 1) return ['B', 'b'];
    return ['b', 'b'];
  };

  const matPair = getAllelePair(params.maternalAllele);
  const patPair = getAllelePair(params.paternalAllele);

  // Punnett Square combinations
  // Box 0: (mat[0], pat[0])
  // Box 1: (mat[1], pat[0])
  // Box 2: (mat[0], pat[1])
  // Box 3: (mat[1], pat[1])
  const combinations = [
    [matPair[0], patPair[0]].sort().reverse().join(''),
    [matPair[1], patPair[0]].sort().reverse().join(''),
    [matPair[0], patPair[1]].sort().reverse().join(''),
    [matPair[1], patPair[1]].sort().reverse().join('')
  ];

  const countBB = combinations.filter((c) => c === 'BB').length;
  const countBb = combinations.filter((c) => c === 'Bb').length;
  const countbb = combinations.filter((c) => c === 'bb').length;

  const probBB = (countBB / 4) * 100;
  const probBb = (countBb / 4) * 100;
  const probbb = (countbb / 4) * 100;

  const dominantPhenotypePercent = probBB + probBb;
  const recessivePhenotypePercent = probbb;

  // Trait metadata
  const traitMeta = {
    glow: {
      dominantName: 'Bioluminescent Cyan Glow (B_)',
      recessiveName: 'Deep Amethyst (bb)',
      dominantColor: '#06b6d4',
      recessiveColor: '#a855f7'
    },
    height: {
      dominantName: 'Vigorous Tall Phenotype (T_)',
      recessiveName: 'Dwarf Phenotype (tt)',
      dominantColor: '#10b981',
      recessiveColor: '#f59e0b'
    },
    pigment: {
      dominantName: 'Melanin Pigmented (B_)',
      recessiveName: 'Non-Pigmented Albinism (bb)',
      dominantColor: '#38bdf8',
      recessiveColor: '#94a3b8'
    }
  };

  useEffect(() => {
    if (isRunning && progress === 5) {
      sound.play('chime');
    }
  }, [isRunning, progress]);

  useEffect(() => {
    if (progress >= 99 && onRecordData) {
      onRecordData({
        'Mother Genotype': matPair.join(''),
        'Father Genotype': patPair.join(''),
        'P(Dominant)': `${dominantPhenotypePercent}%`,
        'P(Recessive)': `${recessivePhenotypePercent}%`,
        'Genotype Ratio (BB:Bb:bb)': `${countBB}:${countBb}:${countbb}`
      });
    }
  }, [progress, isRunning, countBB, countBb, countbb, dominantPhenotypePercent, recessivePhenotypePercent]);

  // DNA Double Helix animation on canvas
  useEffect(() => {
    const canvas = helixCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      angle += 0.03;
      const centerY = h / 2;
      const numNodes = 14;
      const spacing = w / (numNodes - 1);

      for (let i = 0; i < numNodes; i++) {
        const x = i * spacing;
        const currentAngle = angle + i * 0.45;
        const y1 = centerY + Math.sin(currentAngle) * 35;
        const y2 = centerY - Math.sin(currentAngle) * 35;
        const depth = Math.cos(currentAngle); // for 3D sorting

        // Connecting Base Pair hydrogen bonds
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.strokeStyle = `rgba(148, 163, 184, ${0.3 + Math.abs(depth) * 0.4})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Strand 1 Nucleotide
        ctx.beginPath();
        ctx.arc(x, y1, 4 + depth * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Strand 2 Nucleotide
        ctx.beginPath();
        ctx.arc(x, y2, 4 - depth * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#a855f7';
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Generate simulated offspring specimens
  const visibleSpecimens = Math.round((progress / 100) * Math.min(params.sampleSize, 40));

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 space-y-3">
      {/* Top Bar: Trait selector */}
      <div className="flex items-center justify-between z-10 text-xs">
        <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
          <span className="text-slate-400 font-mono">Trait:</span>
          {(['glow', 'height', 'pigment'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setSelectedTrait(t);
                sound.play('click');
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                selectedTrait === t ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'glow' ? 'Bioluminescence' : t === 'height' ? 'Height' : 'Pigment'}
            </button>
          ))}
        </div>

        <div className="bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800 text-xs font-mono text-cyan-400">
          Phenotypic Ratio:{' '}
          <span className="font-bold text-white">
            {dominantPhenotypePercent / 25}:{recessivePhenotypePercent / 25}
          </span>
        </div>
      </div>

      {/* Main Interactive Stage: Split Punnett Square + Live Offspring Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 items-center">
        {/* Left: 2x2 Interactive Punnett Matrix */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 flex flex-col items-center">
          <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-3 font-mono">
            Mendelian Fertilization Matrix
          </div>

          <div className="relative flex items-center justify-center">
            {/* Paternal Alleles label on left */}
            <div className="flex flex-col justify-around h-32 mr-3 text-sm font-mono font-bold text-purple-400">
              <span className="bg-purple-950/50 px-2 py-1 rounded border border-purple-800">{patPair[0]}</span>
              <span className="bg-purple-950/50 px-2 py-1 rounded border border-purple-800">{patPair[1]}</span>
            </div>

            <div>
              {/* Maternal Alleles label on top */}
              <div className="flex justify-around w-48 mb-2 text-sm font-mono font-bold text-cyan-400">
                <span className="bg-cyan-950/50 px-2.5 py-0.5 rounded border border-cyan-800">{matPair[0]}</span>
                <span className="bg-cyan-950/50 px-2.5 py-0.5 rounded border border-cyan-800">{matPair[1]}</span>
              </div>

              {/* 2x2 Grid */}
              <div className="grid grid-cols-2 gap-2 w-48 h-32">
                {combinations.map((comb, i) => {
                  const isDom = comb.includes('B');
                  return (
                    <div
                      key={i}
                      className={`flex flex-col items-center justify-center rounded-xl border text-center transition-all ${
                        isDom
                          ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300'
                          : 'bg-purple-950/30 border-purple-500/40 text-purple-300'
                      }`}
                    >
                      <span className="text-lg font-bold font-mono">{comb}</span>
                      <span className="text-[10px] text-slate-400">
                        {isDom ? 'Dominant' : 'Recessive'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* DNA animation ribbon under square */}
          <canvas ref={helixCanvasRef} width={220} height={40} className="mt-3 opacity-80" />
        </div>

        {/* Right: Probability Stats & Offspring Population Visualizer */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between h-full">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2 font-mono">
              Theoretical Genotypes
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Homozygous Dominant (BB):</span>
                  <span className="text-cyan-400 font-bold tabular-nums">{probBB}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400" style={{ width: `${probBB}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Heterozygous Carrier (Bb):</span>
                  <span className="text-indigo-400 font-bold tabular-nums">{probBb}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400" style={{ width: `${probBb}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Homozygous Recessive (bb):</span>
                  <span className="text-purple-400 font-bold tabular-nums">{probbb}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400" style={{ width: `${probbb}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Live Offspring Generation Grid */}
          <div className="mt-3 pt-3 border-t border-slate-800/60">
            <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-1.5 font-mono">
              <span>Simulated F1 Cohort ({visibleSpecimens} / {params.sampleSize})</span>
              <span>{dominantPhenotypePercent}% Dominant Trait</span>
            </div>

            <div className="grid grid-cols-10 gap-1 h-16 overflow-hidden">
              {Array.from({ length: 40 }).map((_, i) => {
                const isBorn = i < visibleSpecimens;
                const isDom = (i % 4) < (dominantPhenotypePercent / 25);
                return (
                  <div
                    key={i}
                    className={`h-3 w-3 rounded-full transition-all duration-300 ${
                      !isBorn
                        ? 'bg-slate-800/50 scale-75'
                        : isDom
                        ? 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)] scale-100'
                        : 'bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.8)] scale-100'
                    }`}
                    title={isBorn ? (isDom ? 'Dominant Phenotype' : 'Recessive Phenotype') : 'Pending'}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Equation */}
      <div className="z-10 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5 font-mono">
        <span>p² + 2pq + q² = 1.0</span>
        <span>Independent Assortment of Gametes</span>
      </div>
    </div>
  );
}
