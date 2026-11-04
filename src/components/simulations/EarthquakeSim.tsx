import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../../audio';

interface Props {
  params: {
    magnitude: number;
    depth: number;
    distance: number;
  };
  isRunning: boolean;
  progress: number;
  onRecordData?: (metrics: Record<string, string | number>) => void;
}

export default function EarthquakeSim({ params, isRunning, progress, onRecordData }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [telemetry, setTelemetry] = useState({
    pgaG: 0,
    energyJoules: '0',
    intensityMercalli: 'I',
    waveType: 'Baseline Quiescent'
  });

  const stateRef = useRef({
    seismogram: Array.from({ length: 120 }).fill(0) as number[],
    faultOffset: 0,
    shakeTime: 0
  });

  // Seismic energy E = 10^(4.8 + 1.5 * Mw)
  const rawLogE = 4.8 + 1.5 * params.magnitude;
  const energyExp = rawLogE.toFixed(1);
  const pgaMax = Number(((Math.pow(10, 0.45 * params.magnitude) / Math.sqrt(Math.pow(params.distance, 2) + Math.pow(params.depth, 2))) * 0.15).toFixed(2));

  // Modified Mercalli Scale estimation
  const getMercalli = (pga: number) => {
    if (pga < 0.02) return 'II - Weak';
    if (pga < 0.05) return 'IV - Light';
    if (pga < 0.15) return 'VI - Strong';
    if (pga < 0.35) return 'VIII - Severe';
    return 'X - Extreme Destruction';
  };

  useEffect(() => {
    if (isRunning && progress === 5) {
      sound.play('rumble');
    }
  }, [isRunning, progress]);

  useEffect(() => {
    let currentWave = 'Quiescent Baseline';
    let currentPga = 0;

    if (isRunning) {
      if (progress < 15) {
        currentWave = 'Pre-Rupture Strain Accumulation';
        currentPga = 0.01;
      } else if (progress < 40) {
        currentWave = 'Primary (P) Compressional Waves';
        currentPga = Number((pgaMax * 0.35).toFixed(2));
      } else if (progress < 75) {
        currentWave = 'Secondary (S) Shear Waves & Peak Rupture';
        currentPga = pgaMax;
      } else {
        currentWave = 'Coda & Surface Rayleigh Waves Decaying';
        currentPga = Number((pgaMax * 0.25).toFixed(2));
      }
    }

    setTelemetry({
      pgaG: currentPga,
      energyJoules: `10^${energyExp} Joules`,
      intensityMercalli: getMercalli(pgaMax),
      waveType: currentWave
    });

    if (progress >= 99 && onRecordData) {
      onRecordData({
        'Magnitude (Mw)': params.magnitude,
        'Peak Ground Accel (g)': `${pgaMax} g`,
        'Focal Depth': `${params.depth} km`,
        'Epicentral Distance': `${params.distance} km`,
        'Intensity': getMercalli(pgaMax)
      });
    }
  }, [progress, isRunning, pgaMax, energyExp, params]);

  // Seismogram & Building Resonance Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Top Half: Ground Surface & 3 Oscillating Buildings
      const groundY = 160;

      // Calculate dynamic ground shaking displacement
      let groundShakeX = 0;
      if (isRunning && progress > 15 && progress < 85) {
        stateRef.current.shakeTime += 0.3;
        const envelope = Math.sin((progress / 100) * Math.PI);
        groundShakeX = Math.sin(stateRef.current.shakeTime * 4) * pgaMax * 16 * envelope;
      } else {
        stateRef.current.shakeTime = 0;
      }

      // Draw Earth Crust Layers
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, groundY);

      // Soil / Bedrock strata
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, groundY, w, 30);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, groundY + 30, w, h - groundY - 30);

      // Tectonic Fault Rupture Line in Crust
      ctx.beginPath();
      ctx.moveTo(w / 2 - 40, groundY);
      ctx.lineTo(w / 2 - 10, groundY + 45);
      ctx.lineTo(w / 2 + 25, groundY + 80);
      ctx.strokeStyle = isRunning && progress > 20 && progress < 70 ? '#ef4444' : '#475569';
      ctx.lineWidth = isRunning && progress > 20 && progress < 70 ? 3 : 1.5;
      ctx.stroke();

      // Hypocenter Focus Glow
      if (isRunning && progress > 15 && progress < 60) {
        ctx.beginPath();
        ctx.arc(w / 2 + 25, groundY + 80, 8 + Math.sin(Date.now() / 80) * 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.fill();

        // Expanding concentric seismic wave rings
        const waveRadius = ((progress - 15) * 4) % 120;
        ctx.beginPath();
        ctx.arc(w / 2 + 25, groundY + 80, waveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(249, 115, 22, ${Math.max(0, 1 - waveRadius / 120)})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Ground Surface Line
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(w, groundY);
      ctx.stroke();

      // Draw 3 Buildings demonstrating resonance response
      // Building 1: Low-rise (3 floors, stiff, high natural freq)
      // Building 2: Mid-rise (8 floors, moderate resonance)
      // Building 3: High-rise (16 floors, low natural freq, large sway)
      const buildings = [
        { x: 50, width: 35, height: 45, floors: 3, stiffness: 0.3 },
        { x: 120, width: 45, height: 85, floors: 7, stiffness: 0.7 },
        { x: 200, width: 50, height: 130, floors: 12, stiffness: 1.2 }
      ];

      for (const b of buildings) {
        const sway = groundShakeX * b.stiffness;
        const bTopX = b.x + sway;
        const bBottomX = b.x;

        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;

        // Skewed building body
        ctx.beginPath();
        ctx.moveTo(bBottomX, groundY);
        ctx.lineTo(bTopX, groundY - b.height);
        ctx.lineTo(bTopX + b.width, groundY - b.height);
        ctx.lineTo(bBottomX + b.width, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Window grid
        ctx.fillStyle = '#38bdf8';
        const floorH = b.height / b.floors;
        for (let f = 1; f < b.floors; f++) {
          const fracY = f / b.floors;
          const currentSway = sway * fracY;
          const winY = groundY - fracY * b.height;
          ctx.fillRect(b.x + currentSway + 6, winY, b.width - 12, 3);
        }
      }

      // Bottom Half: Live Seismogram Drum Paper Chart
      const drumY = h - 75;
      const drumH = 65;

      // Seismograph paper background
      ctx.fillStyle = '#020617';
      ctx.fillRect(10, drumY, w - 20, drumH);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(10, drumY, w - 20, drumH);

      // Grid lines on paper
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = 1;
      for (let y = drumY + 15; y < drumY + drumH; y += 15) {
        ctx.beginPath();
        ctx.moveTo(10, y);
        ctx.lineTo(w - 10, y);
        ctx.stroke();
      }

      // Update seismogram waveform data
      if (isRunning && progress > 5) {
        let sample = 0;
        if (progress > 15 && progress < 40) {
          // P-wave: High frequency, lower amplitude
          sample = Math.sin(Date.now() / 40) * pgaMax * 8;
        } else if (progress >= 40 && progress < 75) {
          // S-wave: High amplitude shear
          sample = Math.sin(Date.now() / 70) * pgaMax * 24 + (Math.random() - 0.5) * 6;
        } else if (progress >= 75) {
          // Coda decay
          sample = Math.sin(Date.now() / 110) * pgaMax * 7;
        }
        stateRef.current.seismogram.push(sample);
        if (stateRef.current.seismogram.length > (w - 30)) {
          stateRef.current.seismogram.shift();
        }
      } else {
        stateRef.current.seismogram.push((Math.random() - 0.5) * 1.5);
        if (stateRef.current.seismogram.length > (w - 30)) {
          stateRef.current.seismogram.shift();
        }
      }

      // Draw seismogram wave line
      const centerY = drumY + drumH / 2;
      ctx.beginPath();
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.5;

      for (let i = 0; i < stateRef.current.seismogram.length; i++) {
        const x = 15 + i;
        const val = stateRef.current.seismogram[i];
        const y = Math.max(drumY + 2, Math.min(drumY + drumH - 2, centerY + val));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Pen needle indicator
      const penX = 15 + stateRef.current.seismogram.length - 1;
      const penY = centerY + (stateRef.current.seismogram[stateRef.current.seismogram.length - 1] || 0);
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(penX, penY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Seismogram label
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText('STATION SEISMOGRAM RECORD (GAL / ACCEL)', 18, drumY + 12);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isRunning, progress, pgaMax]);

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4">
      {/* Top Bar Status */}
      <div className="flex items-center justify-between z-10 text-xs font-mono">
        <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-orange-400">
          Phase: <span className="font-bold text-white">{telemetry.waveType}</span>
        </div>

        <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-rose-400">
          Intensity: <span className="font-bold text-white">{telemetry.intensityMercalli}</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={460}
          height={380}
          className="max-w-full h-auto rounded-2xl"
        />

        {/* Telemetry Overlay Card */}
        <div className="absolute top-4 right-4 bg-slate-950/85 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5 shadow-xl">
          <div className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">Geotechnical Feed</div>
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-slate-400">Peak Accel (PGA):</span>
            <span className="text-white font-bold tabular-nums">{telemetry.pgaG} g</span>
          </div>
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-slate-400">Energy Radiated:</span>
            <span className="text-amber-400 font-bold tabular-nums">{telemetry.energyJoules}</span>
          </div>
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-slate-400">P-Wave Velocity:</span>
            <span className="text-cyan-400 font-semibold">6.2 km/s</span>
          </div>
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-slate-400">S-Wave Velocity:</span>
            <span className="text-purple-400 font-semibold">3.6 km/s</span>
          </div>
        </div>
      </div>

      {/* Bottom Physics Equation */}
      <div className="z-10 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5 font-mono">
        <span>log₁₀(E) = 4.8 + 1.5·Mw</span>
        <span>Hypocenter: {params.depth} km deep · Δ = {params.distance} km</span>
      </div>
    </div>
  );
}
