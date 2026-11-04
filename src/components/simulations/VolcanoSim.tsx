import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../../audio';

interface Props {
  params: {
    silica: number;        // % SiO2
    gasPressure: number;   // wt %
    ventDiameter: number;  // m
  };
  isRunning: boolean;
  progress: number;
  onRecordData?: (metrics: Record<string, string | number>) => void;
}

export default function VolcanoSim({ params, isRunning, progress, onRecordData }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [telemetry, setTelemetry] = useState({
    vei: 0,
    plumeHeightKm: 0,
    viscosityPaS: '10^3',
    eruptionType: 'Hawaiian Effusive',
    chamberPressureMpa: 45
  });

  const animStateRef = useRef({
    particles: [] as Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      color: string;
      isLava: boolean;
    }>,
    lightningTimer: 0
  });

  // Calculate viscosity & VEI
  // Basalt (50% SiO2) -> ~10^2 Pa.s; Rhyolite (72% SiO2) -> ~10^8 Pa.s
  const logViscosity = (params.silica - 45) * 0.28 + 2;
  const isExplosive = params.silica > 60 || params.gasPressure > 4.0;
  const maxPlumeKm = Number((((params.gasPressure * 4.5) + (params.silica - 48) * 0.4) / (params.ventDiameter / 35)).toFixed(1));
  const calcVei = Math.min(7, Math.max(0, Math.floor((maxPlumeKm / 4) + (isExplosive ? 1 : 0))));

  const getEruptionName = (vei: number, silica: number) => {
    if (vei === 0) return 'Hawaiian Effusive (Pahoehoe)';
    if (vei <= 2) return 'Strombolian Spatter Fountain';
    if (vei <= 4) return 'Vulcanian Ash Column';
    return 'Plinian Cataclysmic Eruption';
  };

  useEffect(() => {
    if (isRunning && progress === 8) {
      sound.play('rumble');
    }
  }, [isRunning, progress]);

  useEffect(() => {
    const currentPlume = isRunning ? Number(((progress / 100) * maxPlumeKm).toFixed(1)) : 0;
    const currentPressure = Math.round(30 + params.gasPressure * 12 - (progress / 100) * 18);

    setTelemetry({
      vei: calcVei,
      plumeHeightKm: currentPlume,
      viscosityPaS: `10^${logViscosity.toFixed(1)} Pa·s`,
      eruptionType: getEruptionName(calcVei, params.silica),
      chamberPressureMpa: currentPressure
    });

    if (progress >= 99 && onRecordData) {
      onRecordData({
        'Eruption Style': getEruptionName(calcVei, params.silica),
        'VEI (0-8)': calcVei,
        'Plume Altitude': `${maxPlumeKm} km`,
        'Silica (SiO2)': `${params.silica}%`,
        'Volatiles': `${params.gasPressure} wt%`
      });
    }
  }, [progress, isRunning, maxPlumeKm, calcVei, logViscosity, params]);

  // Canvas particle dynamics
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

      const ventX = w / 2;
      const ventY = 175;
      const chamberY = h - 45;

      // Dark volcanic sky
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, isExplosive && isRunning ? '#18181b' : '#09090b');
      sky.addColorStop(1, '#1c1917');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Spawn volcanic particles if running
      if (isRunning && progress > 5) {
        const spawnCount = isExplosive ? 6 : 3;
        for (let i = 0; i < spawnCount; i++) {
          if (isExplosive) {
            // Explosive ash plume particles rising high
            const angle = (Math.random() - 0.5) * 0.7;
            const speed = Math.random() * 5 + 3.5;
            animStateRef.current.particles.push({
              x: ventX + (Math.random() - 0.5) * 15,
              y: ventY,
              vx: Math.sin(angle) * speed,
              vy: -Math.cos(angle) * speed - 1.5,
              radius: Math.random() * 8 + 4,
              alpha: 0.85,
              color: Math.random() > 0.4 ? '#52525b' : Math.random() > 0.5 ? '#f97316' : '#27272a',
              isLava: Math.random() > 0.7
            });
          } else {
            // Effusive basaltic lava fountain & flank rivers
            const dir = Math.random() > 0.5 ? 1 : -1;
            animStateRef.current.particles.push({
              x: ventX + (Math.random() - 0.5) * 10,
              y: ventY,
              vx: dir * (Math.random() * 2 + 0.5),
              vy: -Math.random() * 2 - 1,
              radius: Math.random() * 4 + 2,
              alpha: 0.9,
              color: Math.random() > 0.3 ? '#ef4444' : '#fbbf24',
              isLava: true
            });
          }
        }
      }

      // Update and draw particles
      const activeParticles = [];
      for (const p of animStateRef.current.particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.isLava && !isExplosive) {
          // Flow down the mountain slope
          p.vy += 0.08;
          if (p.y > ventY) {
            p.vx *= 1.01;
          }
        } else {
          // Ash plume dispersion
          p.vy += 0.02; // slow fall
          p.radius += 0.12; // expand like a cloud
          p.alpha -= 0.008;
        }

        if (p.alpha > 0.05 && p.y < h) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
          activeParticles.push(p);
        }
      }
      ctx.globalAlpha = 1.0;
      animStateRef.current.particles = activeParticles;

      // Volcanic Lightning in explosive plumes
      if (isExplosive && isRunning && progress > 30 && progress < 85) {
        animStateRef.current.lightningTimer++;
        if (animStateRef.current.lightningTimer % 18 === 0) {
          ctx.strokeStyle = '#67e8f9';
          ctx.lineWidth = 2;
          ctx.beginPath();
          let lx = ventX + (Math.random() - 0.5) * 60;
          let ly = ventY - 40;
          ctx.moveTo(lx, ly);
          for (let s = 0; s < 4; s++) {
            lx += (Math.random() - 0.5) * 20;
            ly -= Math.random() * 25 + 15;
            ctx.lineTo(lx, ly);
          }
          ctx.stroke();
        }
      }

      // Draw Volcano Mountain Flanks
      ctx.fillStyle = '#27272a';
      ctx.beginPath();
      ctx.moveTo(0, h - 70);
      ctx.lineTo(ventX - 35, ventY);
      ctx.lineTo(ventX - 15, ventY + 6);
      ctx.lineTo(ventX + 15, ventY + 6);
      ctx.lineTo(ventX + 35, ventY);
      ctx.lineTo(w, h - 70);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Mountain rock shading
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Magma Chamber & Conduit Cross-Section
      ctx.fillStyle = '#18181b';
      // Conduit channel
      ctx.fillRect(ventX - 8, ventY, 16, chamberY - ventY);

      // Magma glow inside conduit
      const magmaGlow = ctx.createLinearGradient(ventX, ventY, ventX, chamberY);
      magmaGlow.addColorStop(0, '#f97316');
      magmaGlow.addColorStop(1, '#ef4444');
      ctx.fillStyle = magmaGlow;
      ctx.fillRect(ventX - 6, ventY, 12, chamberY - ventY);

      // Subsurface Magma Chamber Oval
      ctx.beginPath();
      ctx.ellipse(ventX, chamberY, 55, 30, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#dc2626';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Conduit Vent Lip
      ctx.fillStyle = '#52525b';
      ctx.fillRect(ventX - 35, ventY - 2, 70, 4);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isRunning, progress, isExplosive, params]);

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4">
      {/* Top Status */}
      <div className="flex items-center justify-between z-10 text-xs font-mono">
        <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-amber-400">
          Regime: <span className="font-bold text-white">{telemetry.eruptionType}</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-rose-400">
          <span>VEI Index:</span>
          <span className="font-bold text-white text-sm tabular-nums">VEI {telemetry.vei}</span>
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
        <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5 shadow-xl">
          <div className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Volcanic Gas & Magma</div>
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-slate-400">Plume Altitude:</span>
            <span className="text-white font-bold tabular-nums">{telemetry.plumeHeightKm} km</span>
          </div>
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-slate-400">Magma Viscosity:</span>
            <span className="text-amber-300 font-semibold tabular-nums">{telemetry.viscosityPaS}</span>
          </div>
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-slate-400">Chamber Pressure:</span>
            <span className="text-cyan-400 font-semibold tabular-nums">{telemetry.chamberPressureMpa} MPa</span>
          </div>
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-slate-400">Vent Choke:</span>
            <span className="text-emerald-400 font-semibold">Ø {params.ventDiameter} m</span>
          </div>
        </div>
      </div>

      {/* Bottom Physics Equation */}
      <div className="z-10 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5 font-mono">
        <span>η = η₀·exp(E/RT)</span>
        <span>Magma Chamber: 6.5 km Lithostatic Depth</span>
      </div>
    </div>
  );
}
