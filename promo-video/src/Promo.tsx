import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { clamp, sec, useExit, useShake, useStamp } from "./anim";

// Paleta y tipografía tomadas de la landing (styles.css)
const C = {
  bg: "#050509",
  text: "#eef2f7",
  muted: "#8d9bb5",
  cyan: "#00c6ff",
  blue: "#0096ff",
  deep: "#0066cc",
  sky: "#38bdf8",
};
const FONT = "'Inter', -apple-system, sans-serif";
const GRADIENT = `linear-gradient(135deg, ${C.cyan} 0%, ${C.blue} 50%, ${C.sky} 100%)`;

const GradientText: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <span
    style={{
      background: GRADIENT,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      filter: `drop-shadow(0 0 30px rgba(0,150,255,0.55))`,
      ...style,
    }}
  >
    {children}
  </span>
);

// Fondo con los "orbs" difuminados de la web
const Orbs: React.FC = () => {
  const f = useCurrentFrame();
  const orb = (size: number, color: string, x: number, y: number, speed: number, amp: number) => (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: "blur(140px)",
        opacity: 0.32,
        left: x + Math.sin(f / speed) * amp,
        top: y + Math.cos(f / (speed * 1.3)) * amp,
      }}
    />
  );
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      {orb(800, C.blue, -250, -200, 40, 90)}
      {orb(700, C.sky, 600, 1400, 50, 110)}
      {orb(550, "#1e3a5f", 500, 700, 45, 80)}
      {/* grano sutil */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 4px)",
        }}
      />
    </AbsoluteFill>
  );
};

const headline: React.CSSProperties = {
  fontFamily: FONT,
  fontWeight: 900,
  color: C.text,
  textTransform: "uppercase",
  letterSpacing: "-0.03em",
  lineHeight: 0.95,
  textAlign: "center",
};

// ── Escena 1 (0–3 s): gancho ──
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const a = useStamp(sec(0.35));
  const b = useStamp(sec(1.45));
  const shake = useShake([sec(0.35), sec(1.45)]);
  const exit = useExit(sec(3));
  const badgeIn = interpolate(f, [0, 12], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", ...exit }}>
      <div style={{ transform: shake, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 38,
            color: C.sky,
            letterSpacing: "0.3em",
            opacity: badgeIn,
            transform: `translateY(${(1 - badgeIn) * 20}px)`,
          }}
        >
          HOMBRES OCUPADOS
        </div>
        <div style={{ ...headline, fontSize: 136, ...a }}>
          LLEVAS AÑOS
          <br />
          ENTRENANDO
        </div>
        <div style={{ ...headline, fontSize: 136, ...b }}>
          <GradientText>Y SIGUES</GradientText>
          <br />
          <GradientText>IGUAL</GradientText>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Escena 2 (3–6 s): giro del mensaje ──
const Reframe: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inA = spring({ frame: f, fps, config: { damping: 18 } });
  const strike = interpolate(f, [sec(0.7), sec(1.1)], [0, 100], { ...clamp, easing: Easing.out(Easing.cubic) });
  const dim = interpolate(f, [sec(1.1), sec(1.4)], [1, 0.35], clamp);
  const b = useStamp(sec(1.5));
  const shake = useShake([sec(1.5)]);
  const exit = useExit(sec(3));
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80, ...exit }}>
      <div style={{ transform: shake, display: "flex", flexDirection: "column", alignItems: "center", gap: 70 }}>
        <div
          style={{
            ...headline,
            fontSize: 108,
            position: "relative",
            opacity: inA * dim,
            transform: `translateY(${(1 - inA) * 60}px)`,
          }}
        >
          NO TE FALTA
          <br />
          DISCIPLINA
          <div
            style={{
              position: "absolute",
              left: -20,
              top: "55%",
              height: 16,
              width: `calc(${strike}% + 40px)`,
              background: "#ff3b5c",
              borderRadius: 8,
              transform: "rotate(-4deg)",
              boxShadow: "0 0 30px rgba(255,59,92,0.7)",
            }}
          />
        </div>
        <div style={{ ...headline, fontSize: 132, ...b }}>
          TE FALTA
          <br />
          <GradientText>DIRECCIÓN</GradientText>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Escena 3 (6–11 s): los 3 pilares ──
const PILLARS = [
  { n: "01", title: "Entrenamiento\nInteligente", sub: "Adaptado a tu tiempo real" },
  { n: "02", title: "Nutrición\nAdaptada", sub: "Sin dietas extremas" },
  { n: "03", title: "Optimización\nDel Cuerpo", sub: "Resultados reales, no teoría" },
];

const Pillars: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleIn = spring({ frame: f, fps, config: { damping: 16 } });
  const exit = useExit(sec(5));
  const hits = [sec(0.4), sec(1.9), sec(3.4)];
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 230, ...exit }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 36,
          letterSpacing: "0.3em",
          color: C.sky,
          opacity: titleIn,
        }}
      >
        EL SISTEMA
      </div>
      <div style={{ ...headline, fontSize: 120, marginTop: 16, opacity: titleIn, transform: `scale(${0.9 + 0.1 * titleIn})` }}>
        <GradientText>3 PILARES</GradientText>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 40, marginTop: 90, width: 900 }}>
        {PILLARS.map((p, i) => {
          const s = spring({ frame: f - hits[i], fps, config: { damping: 14, stiffness: 160 } });
          const active = f >= hits[i];
          const glow = interpolate(f - hits[i], [0, 6, 30], [0, 1, 0.35], clamp);
          return (
            <div
              key={p.n}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 40,
                padding: "40px 48px",
                borderRadius: 28,
                background: "rgba(10, 14, 25, 0.75)",
                border: `2px solid rgba(0,150,255,${0.15 + glow * 0.6})`,
                boxShadow: `0 0 ${60 * glow}px rgba(0,150,255,${0.5 * glow})`,
                opacity: active ? s : 0,
                transform: `translateX(${(1 - s) * (i % 2 ? 300 : -300)}px)`,
              }}
            >
              <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 96, lineHeight: 1 }}>
                <GradientText>{p.n}</GradientText>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: FONT,
                    fontWeight: 800,
                    fontSize: 54,
                    color: C.text,
                    textTransform: "uppercase",
                    lineHeight: 1.02,
                    whiteSpace: "pre-line",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {p.title}
                </div>
                <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 32, color: C.muted, marginTop: 10 }}>
                  {p.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Escena 4 (11–15 s): Julián Ramos ──
const Coach: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = sec(4);
  const zoom = interpolate(f, [0, dur], [1.12, 1.0]);
  const fadeIn = interpolate(f, [0, 8], [0, 1], clamp);
  const name = spring({ frame: f - 8, fps, config: { damping: 16 } });
  const role = spring({ frame: f - 18, fps, config: { damping: 16 } });
  const quote = spring({ frame: f - 40, fps, config: { damping: 18 } });
  const exit = useExit(dur, 6);
  return (
    <AbsoluteFill style={{ ...exit, opacity: fadeIn * exit.opacity }}>
      <Img
        src={staticFile("julian.jpg")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "50% 20%",
          transform: `scale(${zoom})`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(5,5,9,0.15) 0%, rgba(5,5,9,0) 35%, rgba(5,5,9,0.85) 68%, #050509 100%)",
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 30% 30%, rgba(0,150,255,0.18), transparent 60%)" }} />
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 220 }}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 34,
            letterSpacing: "0.3em",
            color: C.sky,
            opacity: role,
            transform: `translateY(${(1 - role) * 30}px)`,
          }}
        >
          TU MENTOR
        </div>
        <div
          style={{
            ...headline,
            textAlign: "left",
            fontSize: 140,
            marginTop: 12,
            opacity: name,
            transform: `translateX(${(1 - name) * -80}px)`,
          }}
        >
          JULIÁN
          <br />
          <GradientText>RAMOS</GradientText>
        </div>
        <div
          style={{
            marginTop: 40,
            opacity: quote,
            transform: `translateY(${(1 - quote) * 30}px)`,
            borderLeft: `6px solid ${C.blue}`,
            paddingLeft: 28,
          }}
        >
          <div style={{ color: "#facc15", fontSize: 40, letterSpacing: 6 }}>★★★★★</div>
          <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 40, color: C.text, marginTop: 8, lineHeight: 1.25 }}>
            "Por fin entendí qué estaba haciendo mal"
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Escena 5 (15–20 s): logo + llamado a la acción ──
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const flash = interpolate(f, [0, 2, 14], [0, 0.9, 0], clamp);
  const logo = spring({ frame: f, fps, config: { damping: 11, stiffness: 120 } });
  const shine = interpolate(f, [10, 40], [-30, 130], clamp);
  const tag = spring({ frame: f - 30, fps, config: { damping: 16 } });
  const ctaAt = sec(2.2);
  const cta = spring({ frame: f - ctaAt, fps, config: { damping: 12, stiffness: 160 } });
  const pulse = f > ctaAt + 15 ? 1 + 0.035 * Math.sin(((f - ctaAt) / fps) * Math.PI * 2) : 1;
  const ring = ((f - ctaAt) % 30) / 30;
  const out = interpolate(f, [sec(4.4), sec(5)], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: out }}>
      <div style={{ position: "relative", transform: `scale(${interpolate(logo, [0, 1], [0.6, 1])})`, opacity: logo }}>
        <Img src={staticFile("logo.png")} style={{ width: 880, filter: "drop-shadow(0 0 40px rgba(0,150,255,0.45))" }} />
        {/* destello que recorre el logo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(105deg, transparent ${shine - 12}%, rgba(255,255,255,0.55) ${shine}%, transparent ${shine + 12}%)`,
            mixBlendMode: "overlay",
            WebkitMaskImage: `url(${staticFile("logo.png")})`,
            WebkitMaskSize: "100% 100%",
          }}
        />
      </div>
      <div
        style={{
          ...headline,
          fontSize: 64,
          marginTop: 70,
          lineHeight: 1.1,
          opacity: tag,
          transform: `translateY(${(1 - tag) * 30}px)`,
        }}
      >
        Haz que tu físico
        <br />
        <GradientText>finalmente responda</GradientText>
      </div>
      <div style={{ position: "relative", marginTop: 110, opacity: f >= ctaAt ? cta : 0 }}>
        {f > ctaAt + 15 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 999,
              border: `3px solid ${C.cyan}`,
              transform: `scale(${1 + ring * 0.25})`,
              opacity: 1 - ring,
            }}
          />
        )}
        <div
          style={{
            background: GRADIENT,
            borderRadius: 999,
            padding: "44px 80px",
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 50,
            color: "#fff",
            letterSpacing: "0.02em",
            boxShadow: "0 20px 60px rgba(0,150,255,0.55)",
            transform: `scale(${interpolate(cta, [0, 1], [0.5, 1]) * pulse})`,
            whiteSpace: "nowrap",
          }}
        >
          AGENDA TU LLAMADA →
        </div>
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 32,
          color: C.muted,
          letterSpacing: "0.25em",
          marginTop: 44,
          opacity: interpolate(f, [ctaAt + 10, ctaAt + 25], [0, 1], clamp),
        }}
      >
        ACCESO GRATUITO
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: flash, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export const Promo: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Orbs />
    <Sequence from={0} durationInFrames={sec(3)}>
      <Hook />
    </Sequence>
    <Sequence from={sec(3)} durationInFrames={sec(3)}>
      <Reframe />
    </Sequence>
    <Sequence from={sec(6)} durationInFrames={sec(5)}>
      <Pillars />
    </Sequence>
    <Sequence from={sec(11)} durationInFrames={sec(4)}>
      <Coach />
    </Sequence>
    <Sequence from={sec(15)} durationInFrames={sec(5)}>
      <Outro />
    </Sequence>
    <Audio src={staticFile("soundtrack.wav")} />
  </AbsoluteFill>
);
