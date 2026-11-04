import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../../audio';

interface Props {
  params: {
    o2Concentration: number; // 10 to 100%
    ribbonMass: number;      // 0.1 to 2.0 g
    flameTemp: number;       // 500 to 1100 °C
  };
  isRunning: boolean;
  progress: number;
  onRecordData?: (metrics: Record<string, string | number>) => void;
}

export default function MagnesiumSim({ params, isRunning, progress, onRecordData }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [telemetry, setTelemetry] = useState({
    flameTempK: 298,
    uvIndex: 0,
    mgoProducedG: 0,
    heatReleasedKj: 0,
    isIgnited: false
  });

  const animStateRef = useRef({
    sparks: [] as Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
    }>,
    smoke: [] as Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }>
  });

  // Activation energy threshold check: Mg needs ~650°C
  const isIgnitionSuccessful = params.flameTemp >= 650;
  // Stoichiometry: 2 Mg (48.62 g) + O2 (32 g) -> 2 MgO (80.62 g)
  // Ratio: 1g Mg yields 1.658g MgO
  const maxMgoG = Number((params.ribbonMass * 1.658).toFixed(2));
  const maxHeatKj = Number(((params.ribbonMass / 24.31) * 601.7).toFixed(1));
  const maxPeakTempK = Math.round(2400 + params.o2Concentration * 8.5);

  useEffect(() => {
    if (isRunning && progress === 15 && isIgnitionSuccessful) {
      sound.play('flare');
    }
  }, [isRunning, progress, isIgnitionSuccessful]);

  useEffect(() => {
    let currentTemp = 298;
    let currentUv = 0;
    let currentMgo = 0;
    let currentHeat = 0;
    const ignited = isRunning && isIgnitionSuccessful && progress > 15;

    if (ignited) {
      const burnProgress = (progress - 15) / 85;
      currentTemp = Math.round(298 + (maxPeakTempK - 298) * Math.sin(burnProgress * Math.PI));
      currentUv = Number(((currentTemp / 3100) * 14 * (params.o2Concentration / 50)).toFixed(1));
      currentMgo = Number((maxMgoG * Math.min(1, burnProgress * 1.2)).toFixed(2));
      currentHeat = Number((maxHeatKj * Math.min(1, burnProgress * 1.2)).toFixed(1));
    } else if (isRunning && !isIgnitionSuccessful) {
      // Sub-threshold smolder
      currentTemp = params.flameTemp + 273;
    }

    setTelemetry({
      flameTempK: currentTemp,
      uvIndex: currentUv,
      mgoProducedG: currentMgo,
      heatReleasedKj: currentHeat,
      isIgnited: ignited
    });

    if (progress >= 99 && onRecordData) {
      onRecordData({
        'Ignition Achieved': isIgnitionSuccessful ? 'Yes (Thermal Runaway)' : 'Failed (Below 650°C)',
        'Peak Temp': `${currentTemp} K (${currentTemp - 273} °C)`,
        'MgO Yield': `${currentMgo} g`,
        'Enthalpy Released': `${currentHeat} kJ`,
        'O2 Enrichment': `${params.o2Concentration}%`
      });
    }
  }, [progress, isRunning, isIgnitionSuccessful, maxMgoG, maxHeatKj, maxPeakTempK, params]);

  // Canvas fire, flare, and smoke rendering
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

      const ribbonCenterX = w / 2;
      const ribbonY = 170;

      // Dark ceramic heat chamber
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, w, h);

      // Crucible platform
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(ribbonCenterX - 65, ribbonY + 80, 130, 20);
      ctx.strokeStyle = '#44403c';
      ctx.strokeRect(ribbonCenterX - 65, ribbonY + 80, 130, 20);

      // Ceramic Crucible cup
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.moveTo(ribbonCenterX - 45, ribbonY + 80);
      ctx.lineTo(ribbonCenterX - 35, ribbonY + 50);
      ctx.lineTo(ribbonCenterX + 35, ribbonY + 50);
      ctx.lineTo(ribbonCenterX + 45, ribbonY + 80);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // White solid MgO ash residue accumulating inside crucible
      if (telemetry.mgoProducedG > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(ribbonCenterX, ribbonY + 68, 25, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bunsen Burner heating tube from bottom
      ctx.fillStyle = '#475569';
      ctx.fillRect(ribbonCenterX - 8, ribbonY + 110, 16, 70);

      // Bunsen Flame (Blue activation flame)
      if (isRunning) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.beginPath();
        ctx.moveTo(ribbonCenterX - 6, ribbonY + 110);
        ctx.quadraticCurveTo(ribbonCenterX + (Math.random() - 0.5) * 4, ribbonY + 75, ribbonCenterX, ribbonY + 70);
        ctx.quadraticCurveTo(ribbonCenterX + (Math.random() - 0.5) * 4, ribbonY + 75, ribbonCenterX + 6, ribbonY + 110);
        ctx.fill();
      }

      // Crucible Laboratory Tongs holding Magnesium ribbon
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ribbonCenterX - 110, ribbonY - 20);
      ctx.lineTo(ribbonCenterX - 15, ribbonY);
      ctx.stroke();

      // Magnesium Metal Ribbon
      // If burned, the ribbon shrinks or turns into white oxide
      const ribbonLength = 35 * Math.max(0.2, 1 - (telemetry.isIgnited ? (progress - 15) / 85 : 0));
      ctx.strokeStyle = telemetry.isIgnited ? '#ffffff' : '#cbd5e1';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(ribbonCenterX - 15, ribbonY);
      ctx.lineTo(ribbonCenterX - 15 + ribbonLength, ribbonY + 10);
      ctx.stroke();

      // THE MAGNESIUM FLARE: Incandescent Planck Blackbody Radiant Bloom
      if (telemetry.isIgnited) {
        const flareIntensity = Math.sin(((progress - 15) / 85) * Math.PI);

        // Blinding white-hot core glow
        const glowRadius = 40 + flareIntensity * 60;
        const radialGrad = ctx.createRadialGradient(ribbonCenterX, ribbonY, 4, ribbonCenterX, ribbonY, glowRadius);
        radialGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        radialGrad.addColorStop(0.3, 'rgba(254, 240, 138, 0.9)');
        radialGrad.addColorStop(0.6, 'rgba(125, 211, 252, 0.5)');
        radialGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = radialGrad;
        ctx.beginPath();
        ctx.arc(ribbonCenterX, ribbonY, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Screen-wide thermal optical flash
        ctx.fillStyle = `rgba(255, 255, 255, ${flareIntensity * 0.18})`;
        ctx.fillRect(0, 0, w, h);

        // Sparks & incandescent MgO particulate ejecta
        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 4 + 2;
          animStateRef.current.sparks.push({
            x: ribbonCenterX,
            y: ribbonY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 3 + 1,
            alpha: 1.0,
            color: Math.random() > 0.4 ? '#ffffff' : '#fef08a'
          });
        }

        // Billowing dense white MgO smoke
        animStateRef.current.smoke.push({
          x: ribbonCenterX + (Math.random() - 0.5) * 10,
          y: ribbonY - 10,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -Math.random() * 2 - 1,
          radius: Math.random() * 6 + 4,
          alpha: 0.6
        });
      }

      // Update & draw sparks
      const activeSparks = [];
      for (const s of animStateRef.current.sparks) {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.08;
        s.alpha -= 0.03;

        if (s.alpha > 0.05 && s.y < h) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = s.alpha;
          ctx.fill();
          activeSparks.push(s);
        }
      }

      // Update & draw smoke
      const activeSmoke = [];
      for (const sm of animStateRef.current.smoke) {
        sm.x += sm.vx;
        sm.y += sm.vy;
        sm.radius += 0.2;
        sm.alpha -= 0.008;

        if (sm.alpha > 0.05 && sm.y > -20) {
          ctx.beginPath();
          ctx.arc(sm.x, sm.y, sm.radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(241, 245, 249, 0.7)';
          ctx.globalAlpha = sm.alpha;
          ctx.fill();
          activeSmoke.push(sm);
        }
      }
      ctx.globalAlpha = 1.0;

      animStateRef.current.sparks = activeSparks;
      animStateRef.current.smoke = activeSmoke;

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isRunning, progress, telemetry]);

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4">
      {/* Top HUD */}
      <div className="flex items-center justify-between z-10 text-xs font-mono">
        <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-yellow-400">
          Core Temp: <span className="font-bold text-white tabular-nums">{telemetry.flameTempK} K ({telemetry.flameTempK - 273}°C)</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-400">UV Radiation:</span>
          <span className={`font-bold tabular-nums ${telemetry.uvIndex > 8 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
            Index {telemetry.uvIndex} {telemetry.uvIndex > 8 ? '(HAZARD)' : ''}
          </span>
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
          <div className="text-[10px] uppercase font-bold text-yellow-400 tracking-wider">Stoichiometry Ledger</div>
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-slate-400">Mg Ribbon Initial:</span>
            <span className="text-white font-bold tabular-nums">{params.ribbonMass} g</span>
          </div>
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-slate-400">Solid MgO Yield:</span>
            <span className="text-emerald-400 font-bold tabular-nums">{telemetry.mgoProducedG} g</span>
          </div>
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-slate-400">Enthalpy Released:</span>
            <span className="text-amber-400 font-bold tabular-nums">{telemetry.heatReleasedKj} kJ</span>
          </div>
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-slate-400">Atmosphere:</span>
            <span className="text-cyan-400 font-semibold">{params.o2Concentration}% O₂</span>
          </div>
        </div>
      </div>

      {/* Bottom Physics Equation */}
      <div className="z-10 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5 font-mono">
        <span>2Mg(s) + O₂(g) ⟶ 2MgO(s)</span>
        <span>Standard Enthalpy ΔH° = -1204 kJ/mol</span>
      </div>
    </div>
  );
}
