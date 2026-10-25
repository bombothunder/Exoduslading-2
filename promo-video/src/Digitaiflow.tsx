import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { clamp, sec, useExit, useShake, useStamp } from "./anim";

// Paleta propuesta para Digitaiflow ("AI" + "flow": violeta eléctrico → menta)
const C = {
  bg: "#07060d",
  text: "#f1eeff",
  muted: "#9a94b8",
  violet: "#7c5cff",
  purple: "#a78bfa",
  mint: "#00e0b8",
  card: "rgba(18, 14, 34, 0.8)",
};
const FONT = "'Inter', -apple-system, sans-serif";
const GRADIENT = `linear-gradient(120deg, ${C.violet} 0%, ${C.purple} 45%, ${C.mint} 100%)`;

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
      filter: "drop-shadow(0 0 30px rgba(124,92,255,0.55))",
      ...style,
    }}
  >
    {children}
  </span>
);

const headline: React.CSSProperties = {
  fontFamily: FONT,
  fontWeight: 900,
  color: C.text,
  textTransform: "uppercase",
  letterSpacing: "-0.03em",
  lineHeight: 0.95,
  textAlign: "center",
};

const label: React.CSSProperties = {
  fontFamily: FONT,
  fontWeight: 600,
  fontSize: 36,
  letterSpacing: "0.3em",
  color: C.mint,
};

// Fondo: grilla en perspectiva + líneas de "flujo" que corren
const FlowBackground: React.FC = () => {
  const f = useCurrentFrame();
  const lines = Array.from({ length: 7 }, (_, i) => i);
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: C.violet,
          filter: "blur(160px)",
          opacity: 0.28,
          left: -300 + Math.sin(f / 45) * 80,
          top: -250 + Math.cos(f / 60) * 80,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 750,
          height: 750,
          borderRadius: "50%",
          background: C.mint,
          filter: "blur(170px)",
          opacity: 0.16,
          left: 550 + Math.cos(f / 50) * 90,
          top: 1350 + Math.sin(f / 40) * 90,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(167,139,250,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.07) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          backgroundPosition: `0 ${(f * 1.5) % 90}px`,
          maskImage: "radial-gradient(ellipse at 50% 50%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, black 30%, transparent 75%)",
        }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
        <defs>
          <linearGradient id="flowLine" x1="0" x2="1">
            <stop offset="0" stopColor={C.violet} stopOpacity="0" />
            <stop offset="0.5" stopColor={C.purple} />
            <stop offset="1" stopColor={C.mint} stopOpacity="0" />
          </linearGradient>
        </defs>
        {lines.map((i) => {
          const y = 200 + i * 260;
          const ph = f / 25 + i;
          const d = `M -100 ${y} C 300 ${y + 120 * Math.sin(ph)}, 700 ${y - 120 * Math.cos(ph)}, 1180 ${y}`;
          return (
            <path
              key={i}
              d={d}
              stroke="url(#flowLine)"
              strokeWidth={2}
              fill="none"
              strokeDasharray="160 900"
              strokeDashoffset={-(f * 9 + i * 140)}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ── Escena 1 (0–3 s): gancho ──
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const a = useStamp(sec(0.35));
  const b = useStamp(sec(1.45));
  const shake = useShake([sec(0.35), sec(1.45)]);
  const exit = useExit(sec(3));
  const labelIn = interpolate(f, [0, 12], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", ...exit }}>
      <div style={{ transform: shake, display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <div style={{ ...label, opacity: labelIn, transform: `translateY(${(1 - labelIn) * 20}px)` }}>
          COACHES &amp; CREATORS
        </div>
        <div style={{ ...headline, fontSize: 116, ...a }}>
          YOUR CONTENT
          <br />
          GETS VIEWS
        </div>
        <div style={{ ...headline, fontSize: 116, ...b }}>
          <GradientText>BUT NO</GradientText>
          <br />
          <GradientText>BOOKED CALLS?</GradientText>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Escena 2 (3–6 s): el problema real ──
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
      <div style={{ transform: shake, display: "flex", flexDirection: "column", alignItems: "center", gap: 80 }}>
        <div
          style={{
            ...headline,
            fontSize: 96,
            position: "relative",
            opacity: inA * dim,
            transform: `translateY(${(1 - inA) * 60}px)`,
          }}
        >
          IT'S NOT
          <br />
          YOUR TRAFFIC
          <div
            style={{
              position: "absolute",
              left: -20,
              top: "55%",
              height: 16,
              width: `calc(${strike}% + 40px)`,
              background: "#ff4d6d",
              borderRadius: 8,
              transform: "rotate(-4deg)",
              boxShadow: "0 0 30px rgba(255,77,109,0.7)",
            }}
          />
        </div>
        <div style={{ ...headline, fontSize: 140, ...b }}>
          IT'S YOUR
          <br />
          <GradientText>FUNNEL</GradientText>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Escena 3 (6–11 s): el sistema en 3 pasos, unidos por una línea de flujo ──
const STEPS = [
  { n: "01", title: "VSL Landing Page", sub: "Built to convert, not just look good" },
  { n: "02", title: "Lead Capture + AI Automation", sub: "Every lead saved and followed up" },
  { n: "03", title: "Calls Booked On Autopilot", sub: "Straight into your calendar" },
];

const System: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleIn = spring({ frame: f, fps, config: { damping: 16 } });
  const exit = useExit(sec(5));
  const hits = [sec(0.4), sec(1.9), sec(3.4)];
  const CARD_H = 210;
  const GAP = 70;
  // la línea crece hasta el paso que está activo
  const lineH = interpolate(f, [hits[0], hits[2]], [0, (CARD_H + GAP) * 2], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 250, ...exit }}>
      <div style={{ ...label, opacity: titleIn }}>THE DIGITAIFLOW</div>
      <div style={{ ...headline, fontSize: 132, marginTop: 16, opacity: titleIn, transform: `scale(${0.9 + 0.1 * titleIn})` }}>
        <GradientText>SYSTEM</GradientText>
      </div>
      <div style={{ position: "relative", marginTop: 100, width: 920 }}>
        <div
          style={{
            position: "absolute",
            left: 74,
            top: CARD_H / 2,
            width: 6,
            height: lineH,
            borderRadius: 3,
            background: `linear-gradient(180deg, ${C.violet}, ${C.mint})`,
            boxShadow: `0 0 24px ${C.purple}`,
          }}
        />
        {STEPS.map((s, i) => {
          const sp = spring({ frame: f - hits[i], fps, config: { damping: 14, stiffness: 160 } });
          const active = f >= hits[i];
          const glow = interpolate(f - hits[i], [0, 6, 30], [0, 1, 0.35], clamp);
          return (
            <div
              key={s.n}
              style={{
                position: "relative",
                height: CARD_H,
                marginBottom: GAP,
                display: "flex",
                alignItems: "center",
                gap: 40,
                opacity: active ? sp : 0,
                transform: `translateX(${(1 - sp) * 260}px)`,
              }}
            >
              <div
                style={{
                  width: 154,
                  height: 154,
                  flexShrink: 0,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: C.bg,
                  border: `4px solid ${i === 2 ? C.mint : C.violet}`,
                  boxShadow: `0 0 ${50 * glow}px ${i === 2 ? C.mint : C.violet}`,
                  fontFamily: FONT,
                  fontWeight: 900,
                  fontSize: 60,
                  color: C.text,
                }}
              >
                {s.n}
              </div>
              <div
                style={{
                  flex: 1,
                  padding: "34px 40px",
                  borderRadius: 28,
                  background: C.card,
                  border: `2px solid rgba(167,139,250,${0.15 + glow * 0.6})`,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT,
                    fontWeight: 800,
                    fontSize: 48,
                    color: C.text,
                    textTransform: "uppercase",
                    lineHeight: 1.05,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {s.title}
                </div>
                <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 30, color: C.muted, marginTop: 10 }}>
                  {s.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Escena 4 (11–15 s): teléfono con una landing y llamadas que entran ──
const CalendarIcon: React.FC = () => (
  <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth={2.4}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4" />
    <path d="M9 15l2 2 4-4" />
  </svg>
);

const TOASTS = [
  { at: 0.9, when: "Tue · 10:00 AM" },
  { at: 1.8, when: "Wed · 3:30 PM" },
  { at: 2.7, when: "Thu · 9:00 AM" },
];

const Phone: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = sec(4);
  const exit = useExit(dur, 6);
  const titleIn = spring({ frame: f, fps, config: { damping: 16 } });
  const phoneIn = spring({ frame: f - 4, fps, config: { damping: 15, stiffness: 120 } });
  const scroll = interpolate(f, [10, dur], [0, -40], clamp);
  const bar = (w: number, h = 22, color = "rgba(241,238,255,0.18)") => (
    <div style={{ width: w, height: h, borderRadius: h / 2, background: color, marginBottom: 16 }} />
  );
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 170, ...exit }}>
      <div style={{ ...headline, fontSize: 92, lineHeight: 1, opacity: titleIn, transform: `translateY(${(1 - titleIn) * 30}px)` }}>
        FROM VIEW TO CALL
        <br />
        <GradientText>AUTOMATICALLY</GradientText>
      </div>
      <div
        style={{
          position: "relative",
          marginTop: 80,
          width: 560,
          height: 1100,
          borderRadius: 70,
          border: "14px solid #1c1830",
          background: "#0d0b18",
          boxShadow: "0 40px 120px rgba(124,92,255,0.35)",
          overflow: "hidden",
          opacity: phoneIn,
          transform: `translateY(${(1 - phoneIn) * 300}px) rotate(${(1 - phoneIn) * 6}deg)`,
        }}
      >
        {/* landing de ejemplo (wireframe) */}
        <div style={{ padding: "70px 44px", transform: `translateY(${scroll}px)` }}>
          {bar(140, 16, C.mint)}
          {bar(440, 30, "rgba(241,238,255,0.85)")}
          {bar(380, 30, "rgba(241,238,255,0.85)")}
          {bar(300, 18)}
          <div
            style={{
              marginTop: 30,
              height: 270,
              borderRadius: 24,
              background: `linear-gradient(135deg, rgba(124,92,255,0.5), rgba(0,224,184,0.25))`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: "34px solid transparent",
                borderBottom: "34px solid transparent",
                borderLeft: `56px solid ${C.text}`,
                marginLeft: 12,
              }}
            />
          </div>
          <div
            style={{
              marginTop: 40,
              height: 92,
              borderRadius: 999,
              background: GRADIENT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 30,
              color: "#fff",
            }}
          >
            BOOK YOUR CALL
          </div>
          <div style={{ marginTop: 50 }}>
            {bar(460)}
            {bar(420)}
            {bar(440)}
            {bar(260)}
          </div>
        </div>
        {/* notificaciones */}
        <div style={{ position: "absolute", left: 22, right: 22, bottom: 30, display: "flex", flexDirection: "column-reverse" }}>
          {TOASTS.map((t, i) => {
            const at = sec(t.at);
            const s = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 180 } });
            if (f < at) return null;
            return (
              <div
                key={t.when}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  padding: "22px 24px",
                  marginTop: 16,
                  borderRadius: 26,
                  background: "rgba(241,238,255,0.94)",
                  boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
                  transform: `translateY(${(1 - s) * 140}px) scale(${0.9 + 0.1 * s})`,
                  opacity: s,
                  zIndex: 3 - i,
                }}
              >
                <div
                  style={{
                    width: 82,
                    height: 82,
                    flexShrink: 0,
                    borderRadius: 20,
                    background: C.mint,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CalendarIcon />
                </div>
                <div>
                  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 32, color: C.bg }}>New call booked</div>
                  <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 26, color: "#4b4668" }}>
                    {t.when}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Escena 5 (15–20 s): marca + llamado a la acción ──
const Wordmark: React.FC<{ progress: number; frame: number }> = ({ progress, frame }) => {
  const wave = `M 0 40 C 120 ${40 - 34 * Math.sin(frame / 8)}, 240 ${40 + 34 * Math.sin(frame / 8)}, 360 40 S 600 ${
    40 - 34 * Math.cos(frame / 8)
  }, 720 40`;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 150,
          letterSpacing: "-0.05em",
          color: C.text,
          lineHeight: 1,
        }}
      >
        digit<GradientText>ai</GradientText>flow
      </div>
      <svg width={720} height={80} style={{ marginTop: 18 }}>
        <defs>
          <linearGradient id="wm" x1="0" x2="1">
            <stop offset="0" stopColor={C.violet} />
            <stop offset="1" stopColor={C.mint} />
          </linearGradient>
        </defs>
        <path
          d={wave}
          stroke="url(#wm)"
          strokeWidth={8}
          strokeLinecap="round"
          fill="none"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - progress}
          style={{ filter: `drop-shadow(0 0 12px ${C.purple})` }}
        />
      </svg>
    </div>
  );
};

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const flash = interpolate(f, [0, 2, 14], [0, 0.85, 0], clamp);
  const logo = spring({ frame: f, fps, config: { damping: 11, stiffness: 120 } });
  const draw = interpolate(f, [4, 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const tag = spring({ frame: f - 28, fps, config: { damping: 16 } });
  const ctaAt = sec(2.2);
  const cta = spring({ frame: f - ctaAt, fps, config: { damping: 12, stiffness: 160 } });
  const pulse = f > ctaAt + 15 ? 1 + 0.035 * Math.sin(((f - ctaAt) / fps) * Math.PI * 2) : 1;
  const ring = ((f - ctaAt) % 30) / 30;
  const out = interpolate(f, [sec(4.4), sec(5)], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: out }}>
      <div style={{ transform: `scale(${interpolate(logo, [0, 1], [0.6, 1])})`, opacity: logo }}>
        <Wordmark progress={draw} frame={f} />
      </div>
      <div
        style={{
          ...headline,
          fontSize: 66,
          marginTop: 60,
          lineHeight: 1.1,
          opacity: tag,
          transform: `translateY(${(1 - tag) * 30}px)`,
        }}
      >
        Funnels that
        <br />
        <GradientText>book calls</GradientText>
      </div>
      <div style={{ position: "relative", marginTop: 100, opacity: f >= ctaAt ? cta : 0 }}>
        {f > ctaAt + 15 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 999,
              border: `3px solid ${C.mint}`,
              transform: `scale(${1 + ring * 0.25})`,
              opacity: 1 - ring,
            }}
          />
        )}
        <div
          style={{
            background: GRADIENT,
            borderRadius: 999,
            padding: "42px 70px",
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 46,
            color: "#fff",
            letterSpacing: "0.01em",
            boxShadow: "0 20px 60px rgba(124,92,255,0.55)",
            transform: `scale(${interpolate(cta, [0, 1], [0.5, 1]) * pulse})`,
            whiteSpace: "nowrap",
          }}
        >
          BOOK A FREE STRATEGY CALL →
        </div>
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 36,
          color: C.muted,
          letterSpacing: "0.12em",
          marginTop: 48,
          opacity: interpolate(f, [ctaAt + 10, ctaAt + 25], [0, 1], clamp),
        }}
      >
        digitaiflow.com
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: flash, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export const DigitaiflowPromo: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <FlowBackground />
    <Sequence from={0} durationInFrames={sec(3)}>
      <Hook />
    </Sequence>
    <Sequence from={sec(3)} durationInFrames={sec(3)}>
      <Reframe />
    </Sequence>
    <Sequence from={sec(6)} durationInFrames={sec(5)}>
      <System />
    </Sequence>
    <Sequence from={sec(11)} durationInFrames={sec(4)}>
      <Phone />
    </Sequence>
    <Sequence from={sec(15)} durationInFrames={sec(5)}>
      <Outro />
    </Sequence>
    <Audio src={staticFile("soundtrack-digitaiflow.wav")} />
  </AbsoluteFill>
);
