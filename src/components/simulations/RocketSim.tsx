import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../../audio';

interface Props {
  params: {
    thrust: number;    // kN
    fuelMass: number;  // kg
    dragCoeff: number; // Cd
  };
  isRunning: boolean;
  progress: number;
  onRecordData?: (metrics: Record<string, string | number>) => void;
}

export default function RocketSim({ params, isRunning, progress, onRecordData }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [telemetry, setTelemetry] = useState({
    altitudeKm: 0,
    velocityMs: 0,
    mach: 0,
    maxQ: 0,
    fuelRemainingPercent: 100
  });

  const animStateRef = useRef({
    particles: [] as Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
    }>,
    stars: Array.from({ length: 60 }).map(() => ({
      x: Math.random() * 460,
      y: Math.random() * 200,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.8 + 0.2
    }))
  });

  // Physics calculation
  const dryMass = 350; // kg
  const totalMass = dryMass + params.fuelMass;
  const burnDurationSec = (params.fuelMass / (params.thrust * 1.2)); // seconds of burn
  const maxApogeeKm = Number((((params.thrust * 1000) / totalMass) * Math.pow(burnDurationSec, 1.4) * 0.08 / params.dragCoeff).toFixed(1));

  useEffect(() => {
    if (isRunning && progress === 1) {
      sound.play('rocket');
    }
  }, [isRunning, progress]);

  useEffect(() => {
    // Current flight telemetry derived from progress
    const frac = progress / 100;
    const currentFuel = Math.max(0, Math.round(100 - frac * 120));
    const currentAlt = Number((maxApogeeKm * Math.pow(frac, 1.35)).toFixed(1));
    const currentVel = Math.round(Math.sin(frac * Math.PI * 0.85) * (maxApogeeKm * 18));
    const mach = Number((currentVel / 340).toFixed(2));
    const dynamicPressure = Math.round(0.5 * 1.225 * Math.exp(-currentAlt / 8.5) * Math.pow(Math.min(currentVel, 600), 2) / 1000);

    setTelemetry({
      altitudeKm: currentAlt,
      velocityMs: currentVel,
      mach: mach,
      maxQ: dynamicPressure,
      fuelRemainingPercent: currentFuel
    });

    if (progress >= 99 && onRecordData) {
      onRecordData({
        'Apogee Altitude (km)': `${maxApogeeKm} km`,
        'Max Speed': `${currentVel} m/s (Mach ${mach})`,
        'Max Dynamic Pressure': `${dynamicPressure} kPa`,
        'Thrust Applied': `${params.thrust} kN`,
        'Propellant Mass': `${params.fuelMass} kg`
      });
    }
  }, [progress, isRunning, maxApogeeKm, params]);

  // Canvas flight animation
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

      // Background Sky Gradient depending on altitude
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      if (telemetry.altitudeKm < 15) {
        // Lower atmosphere: Deep twilight blue to cyan haze
        skyGrad.addColorStop(0, '#0a192f');
        skyGrad.addColorStop(0.7, '#0f2b48');
        skyGrad.addColorStop(1, '#1b3b5a');
      } else if (telemetry.altitudeKm < 50) {
        // Stratosphere: Inky navy to dark cyan
        skyGrad.addColorStop(0, '#020617');
        skyGrad.addColorStop(0.8, '#0b1329');
        skyGrad.addColorStop(1, '#162238');
      } else {
        // Space / Exosphere: Jet black with Earth curvature horizon
        skyGrad.addColorStop(0, '#000000');
        skyGrad.addColorStop(0.7, '#030712');
        skyGrad.addColorStop(1, '#082f49');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Stars in upper atmosphere
      if (telemetry.altitudeKm > 10) {
        const starAlpha = Math.min(1, (telemetry.altitudeKm - 10) / 25);
        for (const star of animStateRef.current.stars) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * starAlpha})`;
          ctx.fill();
        }
      }

      // Earth curvature in upper stage
      if (telemetry.altitudeKm > 35) {
        ctx.beginPath();
        ctx.arc(w / 2, h + 220, 260, Math.PI * 1.15, Math.PI * 1.85);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Launchpad surface if at low altitude
      if (telemetry.altitudeKm < 3) {
        const groundY = h - 25;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, groundY, w, 25);

        // Launch tower
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.strokeRect(w / 2 + 35, groundY - 80, 14, 80);
        ctx.beginPath();
        ctx.moveTo(w / 2 + 35, groundY - 60);
        ctx.lineTo(w / 2 + 10, groundY - 60);
        ctx.stroke();
      }

      // Rocket position on canvas
      // Ascends as progress increases
      const rocketCenterX = w / 2;
      const startY = h - 75;
      const targetY = 90;
      const rocketY = startY - (startY - targetY) * (progress / 100);

      // Rocket Exhaust Fire & Smoke particles
      if (isRunning && telemetry.fuelRemainingPercent > 0) {
        const exhaustCount = 4;
        for (let i = 0; i < exhaustCount; i++) {
          const spread = (Math.random() - 0.5) * 8;
          animStateRef.current.particles.push({
            x: rocketCenterX + spread,
            y: rocketY + 28,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 6 + 4,
            size: Math.random() * 8 + 4,
            alpha: 0.9,
            color: Math.random() > 0.3 ? '#fb923c' : '#fef08a'
          });
        }
      }

      // Update & render exhaust particles
      const activeParticles = [];
      for (const p of animStateRef.current.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.size += 0.3;
        p.alpha -= 0.04;

        if (p.alpha > 0.05 && p.y < h) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
          activeParticles.push(p);
        }
      }
      ctx.globalAlpha = 1.0;
      animStateRef.current.particles = activeParticles;

      // Draw Rocket Vessel
      ctx.save();
      ctx.translate(rocketCenterX, rocketY);

      // Slight aerodynamic stability oscillation
      if (isRunning) {
        const tilt = Math.sin(Date.now() / 80) * 0.02;
        ctx.rotate(tilt);
      }

      // Aerodynamic Shockwave / Mach Cone when Mach > 1
      if (telemetry.mach > 1.0 && isRunning) {
        ctx.beginPath();
        ctx.moveTo(0, -32);
        ctx.lineTo(-24, 20);
        ctx.moveTo(0, -32);
        ctx.lineTo(24, 20);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Rocket Fuselage (Streamlined cylinder)
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      // Nosecone
      ctx.moveTo(0, -30);
      ctx.bezierCurveTo(-10, -15, -12, 0, -12, 22);
      ctx.lineTo(12, 22);
      ctx.bezierCurveTo(12, 0, 10, -15, 0, -30);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Cockpit / Avionics stripe
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-10, -6, 20, 6);

      // Reaction engine nozzle
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(-6, 22);
      ctx.lineTo(-9, 28);
      ctx.lineTo(9, 28);
      ctx.lineTo(6, 22);
      ctx.closePath();
      ctx.fill();

      // Aerodynamic Stabilization Fins
      ctx.fillStyle = '#ef4444';
      // Left fin
      ctx.beginPath();
      ctx.moveTo(-12, 10);
      ctx.lineTo(-20, 26);
      ctx.lineTo(-12, 24);
      ctx.closePath();
      ctx.fill();
      // Right fin
      ctx.beginPath();
      ctx.moveTo(12, 10);
      ctx.lineTo(20, 26);
      ctx.lineTo(12, 24);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isRunning, progress, telemetry]);

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4">
      {/* Top HUD: Layer and Mach Meter */}
      <div className="flex items-center justify-between z-10 text-xs font-mono">
        <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-cyan-400">
          Atmosphere:{' '}
          <span className="font-bold text-white">
            {telemetry.altitudeKm < 12
              ? 'Troposphere'
              : telemetry.altitudeKm < 50
              ? 'Stratosphere'
              : 'Mesosphere / Low Orbit'}
          </span>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-400">Fuel:</span>
          <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ${
                telemetry.fuelRemainingPercent > 20 ? 'bg-cyan-500' : 'bg-rose-500'
              }`}
              style={{ width: `${telemetry.fuelRemainingPercent}%` }}
            />
          </div>
          <span className="text-slate-200 tabular-nums">{telemetry.fuelRemainingPercent}%</span>
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
          <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Flight Avionics</div>
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-slate-400">Altitude:</span>
            <span className="text-white font-bold tabular-nums">{telemetry.altitudeKm} km</span>
          </div>
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-slate-400">Velocity:</span>
            <span className="text-emerald-400 font-bold tabular-nums">{telemetry.velocityMs} m/s</span>
          </div>
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-slate-400">Mach Number:</span>
            <span className={`font-bold tabular-nums ${telemetry.mach > 1 ? 'text-amber-400' : 'text-slate-300'}`}>
              Mach {telemetry.mach}
            </span>
          </div>
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-slate-400">Dynamic Pressure:</span>
            <span className="text-indigo-300 font-semibold tabular-nums">{telemetry.maxQ} kPa</span>
          </div>
        </div>
      </div>

      {/* Bottom Physics Equation */}
      <div className="z-10 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5 font-mono">
        <span>F_thrust = ṁ · v_exhaust</span>
        <span>Peak Apogee: {maxApogeeKm} km</span>
      </div>
    </div>
  );
}
