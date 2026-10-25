import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Animaciones compartidas entre los promos

export const sec = (s: number) => Math.round(s * 30);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Golpe de "sello": escala de grande a normal con un leve sacudón
export const useStamp = (at: number) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 12, stiffness: 220, mass: 0.6 } });
  return {
    opacity: interpolate(f, [at, at + 3], [0, 1], clamp),
    transform: `scale(${interpolate(s, [0, 1], [2.2, 1])})`,
  };
};

export const useShake = (hits: number[]) => {
  const f = useCurrentFrame();
  let x = 0;
  let y = 0;
  for (const h of hits) {
    const d = f - h;
    if (d >= 0 && d < 10) {
      const a = (1 - d / 10) * 14;
      x += Math.sin(d * 3.1) * a;
      y += Math.cos(d * 2.3) * a;
    }
  }
  return `translate(${x}px, ${y}px)`;
};

// Salida común de cada escena
export const useExit = (dur: number, len = 8) => {
  const f = useCurrentFrame();
  return {
    opacity: interpolate(f, [dur - len, dur], [1, 0], clamp),
    filter: `blur(${interpolate(f, [dur - len, dur], [0, 18], clamp)}px)`,
  };
};
