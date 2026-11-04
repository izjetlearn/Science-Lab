import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../../audio';

interface Props {
  params: {
    concentration: number;
    catalyst: number;
    soap: number;
  };
  isRunning: boolean;
  progress: number;
  onRecordData?: (metrics: Record<string, string | number>) => void;
}

export default function ToothpasteSim({ params, isRunning, progress, onRecordData }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [colorScheme, setColorScheme] = useState<'pink' | 'cyan' | 'green' | 'amber'>('pink');
  const [telemetry, setTelemetry] = useState({
    temp: 21.0,
    peakHeight: 0,
    o2Rate: 0,
    foamVol: 0
  });

  const animStateRef = useRef({
    particles: [] as Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      hue: number;
      saturation: number;
      lightness: number;
    }>,
    tempHistory: [] as number[]
  });

  // Calculate physical metrics based on parameters
  const reactionRate = (params.concentration / 35) * (params.catalyst / 50);
  const maxPossibleTemp = 20 + (params.concentration * 1.8) + (params.catalyst * 0.3);
  const foamExpansionFactor = (params.soap / 30) * (params.concentration / 20) * 120;

  useEffect(() => {
    if (isRunning && progress > 0 && progress < 100) {
      if (Math.random() < 0.25) {
        sound.play('foam');
      }
    }
  }, [isRunning, Math.floor(progress / 10)]);

  useEffect(() => {
    // Current temperature calculation as reaction advances
    const currentTemp = 21 + (maxPossibleTemp - 21) * (1 - Math.exp(-progress / 25));
    const currentO2Rate = isRunning && progress > 5 && progress < 90 
      ? Number(((params.concentration * params.catalyst * 0.08) * Math.sin((progress / 100) * Math.PI)).toFixed(1))
      : 0;
    const currentHeight = Math.round((progress / 100) * foamExpansionFactor);

    setTelemetry({
      temp: Number(currentTemp.toFixed(1)),
      peakHeight: currentHeight,
      o2Rate: currentO2Rate,
      foamVol: Math.round(currentHeight * 4.2)
    });

    if (animStateRef.current.tempHistory.length > 50) {
      animStateRef.current.tempHistory.shift();
    }
    animStateRef.current.tempHistory.push(currentTemp);

    if (progress >= 99 && onRecordData) {
      onRecordData({
        'Final Temp (°C)': currentTemp.toFixed(1),
        'Max Height (cm)': currentHeight,
        'Foam Yield (mL)': Math.round(currentHeight * 4.2),
        'Catalyst (KI)': `${params.catalyst} mg`,
        'H2O2 Conc.': `${params.concentration}%`
      });
    }
  }, [progress, isRunning, maxPossibleTemp, foamExpansionFactor]);

  // Canvas particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const baseHues = {
      pink: 330,
      cyan: 185,
      green: 145,
      amber: 40
    };

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const flaskCenterX = w / 2;
      const flaskBottomY = h - 60;
      const neckY = flaskBottomY - 140;
      const neckTopY = neckY - 60;
      const neckRadius = 18;

      // Spawn foam bubbles if running and active
      if (isRunning && progress > 5 && progress < 98) {
        const spawnCount = Math.floor(params.catalyst / 10) + 2;
        const currentHue = baseHues[colorScheme];

        for (let i = 0; i < spawnCount; i++) {
          const angle = (Math.random() - 0.5) * 0.45;
          const speed = (progress / 100) * (params.concentration / 10) * 4.5 + Math.random() * 2.5;

          animStateRef.current.particles.push({
            x: flaskCenterX + (Math.random() - 0.5) * neckRadius * 1.5,
            y: neckTopY,
            vx: Math.sin(angle) * speed * (Math.random() * 0.8 + 0.6),
            vy: -Math.cos(angle) * speed - 1.2,
            radius: Math.random() * 10 + 6,
            alpha: 0.95,
            hue: currentHue + (Math.random() * 20 - 10),
            saturation: 85,
            lightness: 65 + Math.random() * 25
          });
        }
      }

      // Update and draw foam bubbles
      const nextParticles = [];
      for (const p of animStateRef.current.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.radius = Math.min(p.radius + 0.08, 22);
        p.alpha -= 0.007;

        if (p.alpha > 0.05 && p.y < h + 50) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${p.alpha})`;
          ctx.fill();

          // Highlight reflection on bubble
          ctx.beginPath();
          ctx.arc(p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.6})`;
          ctx.fill();

          nextParticles.push(p);
        }
      }
      animStateRef.current.particles = nextParticles;

      // Draw Glass Conical Erlenmeyer Flask
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 3;

      // Flask body outline
      ctx.beginPath();
      // Lip
      ctx.ellipse(flaskCenterX, neckTopY, neckRadius + 4, 4, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Liquid pool inside flask
      const liquidHeight = 55 + (params.soap / 30) * 20;
      ctx.beginPath();
      ctx.moveTo(flaskCenterX - 70, flaskBottomY);
      ctx.lineTo(flaskCenterX + 70, flaskBottomY);
      ctx.lineTo(flaskCenterX + 45, flaskBottomY - liquidHeight);
      ctx.lineTo(flaskCenterX - 45, flaskBottomY - liquidHeight);
      ctx.closePath();
      const liquidHue = baseHues[colorScheme];
      ctx.fillStyle = `hsla(${liquidHue}, 75%, 50%, 0.4)`;
      ctx.fill();

      // Flask walls
      ctx.beginPath();
      ctx.moveTo(flaskCenterX - neckRadius, neckTopY);
      ctx.lineTo(flaskCenterX - neckRadius, neckY);
      ctx.lineTo(flaskCenterX - 75, flaskBottomY);
      ctx.quadraticCurveTo(flaskCenterX, flaskBottomY + 8, flaskCenterX + 75, flaskBottomY);
      ctx.lineTo(flaskCenterX + neckRadius, neckY);
      ctx.lineTo(flaskCenterX + neckRadius, neckTopY);
      ctx.stroke();

      // Graduation marks on glass
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      for (let i = 1; i <= 4; i++) {
        const markY = flaskBottomY - i * 25;
        const markWidth = 60 - i * 8;
        ctx.beginPath();
        ctx.moveTo(flaskCenterX - markWidth / 2, markY);
        ctx.lineTo(flaskCenterX - markWidth / 2 + 14, markY);
        ctx.stroke();
      }

      // Steam particles rising from the flask top
      if (telemetry.temp > 45 && isRunning) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        for (let i = 0; i < 4; i++) {
          const steamX = flaskCenterX + Math.sin(Date.now() / 200 + i) * 12;
          const steamY = neckTopY - 20 - (i * 20 + ((Date.now() / 15) % 40));
          ctx.beginPath();
          ctx.arc(steamX, steamY, 6 + i * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isRunning, progress, colorScheme, params]);

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4">
      {/* Simulation Top Bar Controls & Dye Selection */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Dye Indicator:</span>
          {(['pink', 'cyan', 'green', 'amber'] as const).map((c) => (
            <button
              key={c}
              onClick={() => {
                setColorScheme(c);
                sound.play('click');
              }}
              className={`w-6 h-6 rounded-full border transition-transform ${
                colorScheme === c ? 'scale-110 ring-2 ring-white/50 border-white' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor:
                  c === 'pink' ? '#ec4899' : c === 'cyan' ? '#06b6d4' : c === 'green' ? '#10b981' : '#f59e0b'
              }}
              title={`${c.toUpperCase()} Dye`}
            />
          ))}
        </div>

        {/* Exothermic indicator */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-slate-400">Core Temp:</span>
          <span className={`font-bold tabular-nums ${telemetry.temp > 60 ? 'text-rose-400' : telemetry.temp > 35 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {telemetry.temp}°C
          </span>
          {telemetry.temp > 60 && <span className="text-[10px] text-rose-400 uppercase font-sans font-semibold">Exothermic Alert</span>}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={460}
          height={380}
          className="max-w-full h-auto"
        />

        {/* Live Measurement Overlays */}
        <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs space-y-1.5 shadow-lg">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kinetic Telemetry</div>
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-slate-400">Foam Velocity:</span>
            <span className="text-cyan-400 font-semibold">{Math.round(reactionRate * 100)} cm/s</span>
          </div>
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-slate-400">O₂ Evolution:</span>
            <span className="text-emerald-400 font-semibold">{telemetry.o2Rate} L/s</span>
          </div>
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-slate-400">Foam Volume:</span>
            <span className="text-pink-400 font-semibold">{telemetry.foamVol} mL</span>
          </div>
        </div>
      </div>

      {/* Bottom Status Ticker */}
      <div className="z-10 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5 font-mono">
        <span>2H₂O₂(aq) ⟶[I⁻] 2H₂O(l) + O₂(g)</span>
        <span>Reaction Enthalpy ΔH° = -98 kJ/mol</span>
      </div>
    </div>
  );
}
