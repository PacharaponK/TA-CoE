'use client';

import RotatingEarth from '@/components/ui/wireframe-dotted-globe';

/**
 * Fixed decorative globe backdrop with pulsing glow and optional sonar rings.
 * Used on the queue page and contact page (neutral white tone).
 * The hero page uses its own blue-tinted variant with a crosshair.
 */
export function GlobeBackground({
  xPosition = 0.82,
  opacity = 0.16,
  ringCount = 2,
  ringSize = 40,
  ringDelay = 2.5,
  glowColor = 'rgba(255,255,255,0.05)',
  ringColor = 'rgba(255,255,255,0.05)',
}: {
  xPosition?: number;
  opacity?: number;
  ringCount?: number;
  ringSize?: number;
  ringDelay?: number;
  glowColor?: string;
  ringColor?: string;
}) {
  const xPct = `${xPosition * 100}%`;
  const halfSize = ringSize / 2;

  return (
    <>
      {/* Globe canvas */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
        style={{ opacity }}
      >
        <RotatingEarth width={2560} height={1440} rounded={false} fullscreen xPosition={xPosition} />
      </div>

      {/* Radial glow behind globe */}
      <div
        className="pointer-events-none fixed z-0 animate-[globe-glow-pulse_5s_ease-in-out_infinite]"
        style={{
          left: xPct,
          top: '50%',
          width: '60vmin',
          height: '60vmin',
          marginLeft: '-30vmin',
          marginTop: '-30vmin',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
        }}
      />

      {/* Sonar rings */}
      {Array.from({ length: ringCount }, (_, i) => (
        <div
          key={i}
          className="pointer-events-none fixed rounded-full border z-0 animate-[sonar_5s_ease-out_infinite]"
          style={{
            left: xPct,
            top: '50%',
            width: `${ringSize}vmin`,
            height: `${ringSize}vmin`,
            marginLeft: `-${halfSize}vmin`,
            marginTop: `-${halfSize}vmin`,
            borderColor: ringColor,
            animationDelay: `${i * ringDelay}s`,
          }}
        />
      ))}
    </>
  );
}
