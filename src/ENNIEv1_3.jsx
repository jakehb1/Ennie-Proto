import { useState, useEffect, useRef, useCallback } from "react";
import { speak, stopSpeaking, createListener, isSTTAvailable } from "./tts.js";
import { OpenSelectHandGesture, HomeSimple, GraphUp, Settings, Mail, Microphone, Lock, ArrowRight, Xmark, Check, StarSolid, Flash, Bell, SendDiagonal, InfoCircle, Clock, Shield, Heart, User, Activity, Activity as Pulse } from "iconoir-react";

/* ===== ENNIE ICON SYSTEM (Iconoir) ===== */
var iconMap = { hands: OpenSelectHandGesture, home: HomeSimple, chart: GraphUp, gear: Settings, mail: Mail, mic: Microphone, lock: Lock, arrow: ArrowRight, close: Xmark, check: Check, star: StarSolid, bolt: Flash, bell: Bell, send: SendDiagonal, info: InfoCircle, clock: Clock, shield: Shield, heart: Heart, user: User, activity: Activity, pulse: Pulse };
function Ico({ name, size, color }) {
  var s = size || 20;
  var c = color || "currentColor";
  var sw = s <= 16 ? 1.5 : 1.75;
  var Icon = iconMap[name] || iconMap.star;
  return <Icon width={s} height={s} color={c} strokeWidth={sw} style={{ display: "block", flexShrink: 0, overflow: "visible" }} />;
}

function haptic(style) {
  if (navigator.vibrate) navigator.vibrate(style === "heavy" ? 30 : 10);
}

function useSwipe(onLeft, onRight) {
  const touch = useRef(null);
  var onStart = useCallback((e) => { touch.current = e.touches[0].clientX; }, []);
  var onEnd = useCallback((e) => {
    if (touch.current === null) return;
    var diff = e.changedTouches[0].clientX - touch.current;
    touch.current = null;
    if (diff > 50) onRight();
    else if (diff < -50) onLeft();
  }, [onLeft, onRight]);
  return { onTouchStart: onStart, onTouchEnd: onEnd };
}

const C = {
  purple: "#816FE8",
  pl: "#9B8ADE",
  pp: "#C4B8F0",
  pd: "#6B5BD4",
  white: "#FFFFFF",
  black: "#1A1A2E",
  muted: "#8E8E93",
  light: "#AEAEB2",
  border: "#E0DCE8",
  borderLight: "#F0EEF5",
  pink: "#F8D4DE",
  green: "#34C759",
  greenLight: "#E8F8ED",
  red: "#FF3B30",
  amber: "#FF9500",
  bg: "#F4F3FA",
  bgWarm: "#FAF9FF",
  yellow: "#F5D547",
  yl: "#FFDE59",
  yp: "#FFF3C4",
  yd: "#D4B52E",
};

const ff = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

/* ===== SPARKLINE CHART ===== */
function Sparkline({ data, width, height, color, showLabels }) {
  if (!data || data.length < 2) return null;
  var w = width || 320;
  var h = height || 80;
  var pad = showLabels ? 22 : 10;
  var min = Math.min.apply(null, data);
  var max = Math.max.apply(null, data);
  var range = max - min || 1;
  var points = data.map(function (v, i) {
    return [(i / (data.length - 1)) * (w - pad * 2) + pad, h - pad - ((v - min) / range) * (h - pad * 2)];
  });
  var line = points.map(function (p) { return p[0] + "," + p[1]; }).join(" ");
  return (
    <svg width={w} height={h} viewBox={"0 0 " + w + " " + h} style={{ display: "block" }}>
      <polyline points={line} fill="none" stroke={color || C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map(function (p, i) {
        return <circle key={i} cx={p[0]} cy={p[1]} r={i === points.length - 1 ? 5 : 3.5} fill={color || C.green} stroke={C.white} strokeWidth="2" />;
      })}
      {showLabels && data.map(function (v, i) {
        return <text key={i} x={points[i][0]} y={points[i][1] - 12} textAnchor="middle" fill={C.black} fontSize="11" fontWeight="700" fontFamily={ff}>{v}</text>;
      })}
    </svg>
  );
}

/* ===== STATUS BADGE ===== */
function Badge({ children, color, bg }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 500, color: color || C.green, background: bg || (C.green + "12"), padding: "5px 14px", borderRadius: 999, letterSpacing: 0.2 }}>{children}</span>
  );
}

function Btn({ children, onClick, primary = true, disabled, style }) {
  return (
    <button
      disabled={disabled}
      onClick={(e) => { haptic(primary ? "heavy" : undefined); if (onClick) onClick(e); }}
      style={{
        width: "100%", padding: "18px 28px", borderRadius: 14,
        fontWeight: 600, fontSize: 16, cursor: disabled ? "default" : "pointer",
        fontFamily: ff, opacity: disabled ? 0.35 : 1,
        background: primary ? C.black : C.white,
        color: primary ? C.white : C.black,
        border: primary ? "none" : "1.5px solid " + C.border,
        boxShadow: primary ? "0 4px 14px rgba(0,0,0,0.15)" : "none",
        letterSpacing: 0.2, transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)", ...style,
      }}
    >
      {children}
    </button>
  );
}

function Slider({ value, onChange, min = 0, max = 10, color }) {
  var accent = color || C.pd;
  var pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ position: "relative", height: 32, display: "flex", alignItems: "center", cursor: "pointer", touchAction: "none" }}
      onPointerDown={(e) => {
        var rect = e.currentTarget.getBoundingClientRect();
        var update = function (ev) {
          var x = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
          onChange(Math.round(x * (max - min) + min));
        };
        update(e);
        var onMove = function (ev) { update(ev); };
        var onUp = function () { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      }}
    >
      <div style={{ position: "absolute", left: 0, right: 0, height: 6, borderRadius: 999, background: C.border }}>
        <div style={{ height: "100%", width: pct + "%", borderRadius: 999, background: accent, transition: "width 0.1s" }} />
      </div>
      <div style={{ position: "absolute", left: "calc(" + pct + "% - 14px)", width: 28, height: 28, borderRadius: 999, background: C.white, border: "3px solid " + accent, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", transition: "left 0.1s" }} />
    </div>
  );
}

function Toggle({ on, onToggle, color }) {
  var accent = color || C.black;
  return (
    <button onClick={onToggle} style={{ width: 56, height: 30, borderRadius: 999, background: on ? accent : C.border, position: "relative", border: "none", cursor: "pointer", transition: "background 0.3s", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)" }}>
      <div style={{ width: 24, height: 24, background: C.white, borderRadius: 999, position: "absolute", top: 3, left: on ? 29 : 3, transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

function Inp({ value, onChange, placeholder, style, onKeyDown, label }) {
  return (
    <div style={{ width: "100%", ...style }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.muted, marginBottom: 8, fontFamily: ff, letterSpacing: 0.2 }}>{label}</label>}
      <input
        value={value} onChange={onChange} onKeyDown={onKeyDown}
        placeholder={placeholder}
        style={{
          width: "100%", boxSizing: "border-box", background: C.bg,
          border: "none", borderRadius: 12,
          padding: "14px 16px", color: C.black, fontSize: 15,
          outline: "none", fontFamily: ff, transition: "box-shadow 0.2s",
        }}
        onFocus={(e) => { e.target.style.boxShadow = "0 0 0 2px " + C.pd; }}
        onBlur={(e) => { e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

function WCard({ children, style }) {
  return (
    <div style={{ background: C.white, borderRadius: 20, padding: 32, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: "1px solid " + C.borderLight, ...style }}>
      {children}
    </div>
  );
}

function Hdr({ title, onBack, light }) {
  return (
    <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: 14 }}>
      {onBack && (
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 12, background: light ? "rgba(255,255,255,0.12)" : C.black, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: C.white, fontSize: 14, fontWeight: 500 }}>✕</span>
        </button>
      )}
      {title && <span style={{ color: light ? C.white : C.black, fontWeight: 600, fontSize: 17, fontFamily: ff, letterSpacing: -0.2 }}>{title}</span>}
    </div>
  );
}

function Pill({ children, active, onClick, style }) {
  return (
    <button onClick={onClick} style={{ fontSize: 13, padding: "8px 20px", borderRadius: 999, fontWeight: 500, border: active ? "none" : "1.5px solid " + C.border, cursor: "pointer", fontFamily: ff, background: active ? C.black : C.white, color: active ? C.white : C.black, transition: "all 0.2s ease", boxShadow: active ? "0 2px 6px rgba(0,0,0,0.1)" : "none", ...style }}>
      {children}
    </button>
  );
}

function Tag({ children }) {
  return <span style={{ fontSize: 11, background: C.pp, color: C.pd, borderRadius: 999, padding: "4px 12px", fontWeight: 500 }}>{children}</span>;
}

function Bubble({ text, from, typing }) {
  const isUser = from === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 16 }}>
      {!isUser && (
        <div style={{ width: 32, height: 32, borderRadius: 10, background: C.pd, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 10, flexShrink: 0, marginTop: 2 }}>
          <span style={{ color: C.white, fontSize: 12, fontWeight: 600 }}>E</span>
        </div>
      )}
      <div style={{ maxWidth: "78%", borderRadius: 18, padding: "14px 20px", fontSize: 15, lineHeight: 1.6, fontFamily: ff, background: isUser ? C.black : C.white, color: isUser ? C.white : C.black, border: isUser ? "none" : "1px solid " + C.borderLight, borderTopLeftRadius: isUser ? 18 : 4, borderTopRightRadius: isUser ? 4 : 18, boxShadow: isUser ? "0 2px 8px rgba(0,0,0,0.1)" : "none" }}>
        {!isUser && <p style={{ color: C.pd, fontSize: 10, fontWeight: 500, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 1.2 }}>Ennie</p>}
        {typing ? <span style={{ color: C.muted, fontSize: 20, letterSpacing: 2 }}>···</span> : text}
      </div>
    </div>
  );
}

function BMap({ pins = [], onAddPin, readonly, small }) {
  const [side, setSide] = useState("front");
  const w = small ? 90 : 130;
  const h = small ? 180 : 260;
  const handleClick = (e) => {
    if (readonly) return;
    const r = e.currentTarget.getBoundingClientRect();
    if (onAddPin) {
      onAddPin({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, side: side, score: 6, label: "Pain" });
    }
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ display: "flex", gap: 6 }}>
        <Pill active={side === "front"} onClick={() => setSide("front")} style={{ fontSize: 11, padding: "4px 12px" }}>Front</Pill>
        <Pill active={side === "back"} onClick={() => setSide("back")} style={{ fontSize: 11, padding: "4px 12px" }}>Back</Pill>
      </div>
      <div style={{ position: "relative", cursor: readonly ? "default" : "crosshair" }} onClick={handleClick}>
        <svg viewBox="0 0 120 240" width={w} height={h}>
          <g stroke={C.pd} strokeWidth="1.2" fill="none" opacity="0.4">
            <ellipse cx="60" cy="22" rx="15" ry="17" />
            <rect x="54" y="37" width="12" height="7" rx="2" />
            <path d="M32 46 L22 100 L24 128 L96 128 L98 100 L88 46 Z" />
            <path d="M32 48 L12 94 L16 128" strokeLinecap="round" />
            <path d="M88 48 L108 94 L104 128" strokeLinecap="round" />
            <path d="M36 128 L30 188 L24 232" strokeLinecap="round" />
            <path d="M84 128 L90 188 L96 232" strokeLinecap="round" />
          </g>
          {pins.filter((p) => p.side === side).map((pin, i) => (
            <g key={i}>
              <circle cx={pin.x * 1.2} cy={pin.y * 2.4} r={small ? 5 : 7} fill={pin.score > 7 ? C.red : pin.score > 4 ? C.amber : C.pd} opacity="0.9" />
              <text x={pin.x * 1.2} y={pin.y * 2.4 + (small ? 3 : 4)} textAnchor="middle" fill="white" fontSize={small ? 5 : 7} fontWeight="bold">{pin.score}</text>
            </g>
          ))}
        </svg>
        {!readonly && <div style={{ textAlign: "center", color: C.muted, fontSize: 11, marginTop: 2 }}>Tap to mark symptom</div>}
      </div>
    </div>
  );
}

function CRing({ seconds, total, size = 56 }) {
  const r = (size / 2) - 7;
  const circ = 2 * Math.PI * r;
  const dash = circ * (seconds / total);
  const urg = seconds <= 30;
  const cx = size / 2;
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} viewBox={"0 0 " + size + " " + size}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={C.border} strokeWidth="4" />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={urg ? C.red : C.pd} strokeWidth="4" strokeDasharray={dash + " " + circ} strokeLinecap="round" transform={"rotate(-90 " + cx + " " + cx + ")"} style={{ transition: "stroke-dasharray 1s linear" }} />
      </svg>
      <div style={{ position: "absolute" }}>
        <span style={{ fontSize: size * 0.26, fontWeight: 700, color: urg ? C.red : C.black, fontFamily: ff }}>
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

function TabBar({ go, active }) {
  var items = [["home", "Home", "s21"], ["chart", "Activity", "s22"], ["gear", "Settings", "s20"]];
  return (
    <div style={{ display: "flex", background: C.white, borderTop: "1px solid " + C.borderLight, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      {items.map(function (item) {
        var isActive = active === item[1];
        return (
          <div key={item[1]} onClick={() => { haptic(); go(item[2]); }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 0 10px", cursor: "pointer", transition: "all 0.2s" }}>
            <Ico name={item[0]} size={22} color={isActive ? C.black : C.muted} />
            <p style={{ fontSize: 11, color: isActive ? C.black : C.muted, fontWeight: isActive ? 600 : 400, margin: "6px 0 0", letterSpacing: 0.1, fontFamily: ff }}>{item[1]}</p>
          </div>
        );
      })}
    </div>
  );
}

function WaveBars({ count, maxH, active, color, frame }) {
  var barElements = [];
  for (var i = 0; i < count; i++) {
    var h = active ? (Math.sin((frame + i * 1.3) * 0.5) * 0.5 + 0.5) * maxH + 3 : 2;
    barElements.push(
      <div key={i} style={{ width: 4, height: h, borderRadius: 3, background: color, opacity: active ? 0.7 : 0.15, transition: "height 0.15s" }} />
    );
  }
  return <div style={{ display: "flex", gap: 3, alignItems: "center", justifyContent: "center" }}>{barElements}</div>;
}

/* ===== SCREENS ===== */

function HandArt({ style }) {
  return (
    <svg viewBox="0 0 320 200" style={{ width: "100%", ...style }}>
      <g stroke={C.black} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M80 160 C70 130, 50 110, 40 80 C35 65, 45 55, 55 65 C60 70, 65 80, 70 95" />
        <path d="M70 95 C65 75, 55 55, 50 40 C45 25, 60 20, 65 35 C70 50, 75 70, 80 90" />
        <path d="M80 90 C78 65, 75 45, 72 30 C70 15, 85 12, 87 28 C90 45, 90 65, 90 85" />
        <path d="M90 85 C92 65, 95 50, 97 38 C100 25, 112 28, 110 42 C108 55, 102 75, 100 90" />
        <path d="M100 90 C105 80, 115 70, 120 65 C128 58, 132 68, 125 76 C118 85, 108 95, 105 105" />
        <path d="M80 160 C85 140, 95 120, 105 105" />
        <path d="M65 160 C60 155, 55 150, 80 160" />
        <path d="M220 160 C230 130, 250 110, 260 80 C265 65, 255 55, 245 65 C240 70, 235 80, 230 95" />
        <path d="M230 95 C235 75, 245 55, 250 40 C255 25, 240 20, 235 35 C230 50, 225 70, 220 90" />
        <path d="M220 90 C222 65, 225 45, 228 30 C230 15, 215 12, 213 28 C210 45, 210 65, 210 85" />
        <path d="M210 85 C208 65, 205 50, 203 38 C200 25, 188 28, 190 42 C192 55, 198 75, 200 90" />
        <path d="M200 90 C195 80, 185 70, 180 65 C172 58, 168 68, 175 76 C182 85, 192 95, 195 105" />
        <path d="M220 160 C215 140, 205 120, 195 105" />
        <path d="M235 160 C240 155, 245 150, 220 160" />
        <path d="M125 76 C140 90, 155 95, 175 76" opacity="0.4" strokeDasharray="4 4" />
      </g>
    </svg>
  );
}

function S1({ go }) {
  const [slide, setSlide] = useState(0);
  var slides = [
    { text: "Ennie is built by world-renowned energy healer Charlie Goldsmith.", icon: "hands" },
    { text: "Connect to a test energy healer, 100% remotely and anonymously.", icon: "lock" },
    { text: "Rate your symptoms in real time during your session.", icon: "chart" },
  ];
  var next = useCallback(() => { setSlide((s) => (s + 1) % slides.length); haptic(); }, []);
  var prev = useCallback(() => { setSlide((s) => (s - 1 + slides.length) % slides.length); haptic(); }, []);
  var swipe = useSwipe(next, prev);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.pd }}>
      <div style={{ padding: "28px 28px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.pp, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ico name="hands" size={20} color={C.pd} />
          </div>
          <span style={{ fontWeight: 600, fontSize: 20, color: C.white, fontFamily: ff, letterSpacing: -0.3 }}>Ennie</span>
        </div>
        <p style={{ color: C.pp, fontSize: 15, fontWeight: 400, margin: "0 0 8px", fontFamily: ff }}>Suffering from pain?</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: C.white, lineHeight: 1.2, margin: 0, fontFamily: ff, letterSpacing: -0.5 }}>Your energy healing<br />journey begins here</h1>
      </div>
      <div style={{ flex: 1, padding: "28px 28px 0", display: "flex", flexDirection: "column" }}>
        <div {...swipe} style={{ background: C.white, borderRadius: 20, padding: 28, flex: 1, display: "flex", flexDirection: "column", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 24 }}>
            {slides.map((_, i) => (
              <div key={i} onClick={() => { setSlide(i); haptic(); }} style={{ width: i === slide ? 24 : 8, height: 8, borderRadius: 999, background: i === slide ? C.pd : C.border, transition: "all 0.3s", cursor: "pointer" }} />
            ))}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
              <Ico name={slides[slide].icon} size={28} color={C.pd} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 400, color: C.black, textAlign: "center", lineHeight: 1.6, margin: "0 0 24px", fontFamily: ff, minHeight: 54 }}>{slides[slide].text}</p>
          </div>
          <HandArt style={{ maxHeight: 130, opacity: 0.5 }} />
        </div>
      </div>
      <div style={{ padding: "20px 28px 40px", display: "flex", gap: 14 }}>
        <Btn onClick={() => go("s2")} style={{ flex: 1, background: C.white, color: C.black }}>Join waitlist</Btn>
        <Btn primary={false} onClick={() => go("sLogin")} style={{ flex: 1, background: "transparent", color: C.white, border: "1.5px solid rgba(255,255,255,0.35)" }}>Log in</Btn>
      </div>
    </div>
  );
}

function S2({ go }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.purple }}>
      <Hdr onBack={() => go("s1")} />
      <div style={{ flex: 1, padding: "0 24px 36px" }}>
        <WCard style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {!sent ? (
            <>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: C.black, textAlign: "center", margin: "0 0 24px", fontFamily: ff }}>Create your account</h2>
              <Inp value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" style={{ marginBottom: 12 }} />
              <Btn onClick={() => email && setSent(true)}>Send magic link</Btn>
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ color: C.muted, fontSize: 13 }}>or</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn primary={false} style={{ flex: 1, fontSize: 14 }}>Apple</Btn>
                <Btn primary={false} style={{ flex: 1, fontSize: 14 }}>Google</Btn>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ width: 80, height: 80, borderRadius: 999, background: C.pp, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ico name="mail" size={36} color={C.pd} />
              </div>
              <h3 style={{ color: C.black, fontWeight: 700, fontSize: 22, fontFamily: ff }}>Check your email</h3>
              <p style={{ color: C.muted, fontSize: 15, textAlign: "center" }}>Magic link sent to<br /><strong style={{ color: C.black }}>{email}</strong></p>
              <Btn onClick={() => go("s3")}>Continue (demo)</Btn>
            </div>
          )}
        </WCard>
      </div>
    </div>
  );
}

function SLogin({ go }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
      <div style={{ background: C.purple, padding: "12px 20px 20px" }}>
        <button onClick={() => go("s1")} style={{ width: 32, height: 32, borderRadius: 999, background: C.black, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
          <span style={{ color: C.white, fontSize: 14, fontWeight: 600 }}>✕</span>
        </button>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: C.black, margin: 0, fontFamily: ff }}>Log in to Ennie</h2>
      </div>
      <div style={{ flex: 1, padding: "32px 24px" }}>
        <Inp label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter" style={{ marginBottom: 24 }} />
        <Inp label="Password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Enter" style={{ marginBottom: 32 }} />
        <Btn onClick={() => go("s21")}>Log in</Btn>
        <p onClick={() => {}} style={{ color: C.black, fontSize: 14, textAlign: "center", marginTop: 20, cursor: "pointer", textDecoration: "underline", fontFamily: ff }}>Forgot password?</p>
      </div>
    </div>
  );
}

function S3({ go }) {
  const [step, setStep] = useState(0);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.purple }}>
      <Hdr onBack={() => go("s2")} />
      <div style={{ flex: 1, padding: "0 24px 36px" }}>
        <WCard style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          {step === 0 ? (
            <>
              <div style={{ width: 48, height: 48, borderRadius: 999, border: "2px solid " + C.black, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <span style={{ fontSize: 22, fontWeight: 600 }}>!</span>
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: C.black, lineHeight: 1.2, margin: "0 0 16px", fontFamily: ff }}>Are you in a medical emergency or require medical or psychological assistance?</h2>
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>Ennie is not suitable for emergencies. If you have severe symptoms, please consult a licensed healthcare provider or call your local emergency services.</p>
              <Btn onClick={() => setStep(1)}>Not an emergency</Btn>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: 30, fontWeight: 700, color: C.black, margin: "0 0 28px", fontFamily: ff }}>Do you have symptoms now?</h2>
              <div style={{ display: "flex", gap: 12, width: "100%" }}>
                <Btn primary={false} onClick={() => go("s17")} style={{ flex: 1 }}>No</Btn>
                <Btn onClick={() => go("s4")} style={{ flex: 1 }}>Yes</Btn>
              </div>
            </>
          )}
        </WCard>
      </div>
    </div>
  );
}

function S4({ go, setIntakeData }) {
  const greeting = "Hi, I'm Ennie. Tell me, what's been going on with your body today?";
  const [msgs, setMsgs] = useState([{ from: "ai", text: greeting }]);
  const [pins, setPins] = useState([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mode, setMode] = useState("voice");
  const sr = useRef(null);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const listenerRef = useRef(null);
  const intake = useRef({ area: "", duration: "", severity: "", description: "" });

  useEffect(() => { speak(greeting); return () => stopSpeaking(); }, []);

  function buildReply(step, userText) {
    var l = userText.toLowerCase();
    // Extract body part keywords
    var parts = [];
    ["neck", "back", "shoulder", "head", "knee", "leg", "arm", "wrist", "hip", "chest", "stomach", "ankle", "foot", "elbow"].forEach(function (p) { if (l.includes(p)) parts.push(p); });
    var pain = l.includes("pain") || l.includes("sore") || l.includes("hurt") || l.includes("ache") || l.includes("stiff") || l.includes("tight");
    var area = parts.length > 0 ? parts.join(" and ") : "";

    if (step === 0) {
      intake.current.area = area || "that area";
      intake.current.description = userText;
      if (area) {
        return "I hear you — " + area + " pain. Can you show me on the body map exactly where you feel it?";
      }
      return "Got it. Can you show me on the body map where you feel it?";
    }
    if (step === 1) {
      intake.current.duration = userText;
      // Parse duration from response
      if (l.includes("week")) return "So about " + userText.trim() + ". On a scale of 0 to 10, how bad is the " + intake.current.area + " right now?";
      if (l.includes("month")) return userText.trim() + " — that's been a while. On a scale of 0 to 10, how severe is it right now?";
      if (l.includes("day")) return "Just " + userText.trim() + ". On a scale of 0 to 10, how would you rate the pain right now?";
      if (l.includes("year")) return userText.trim() + " — that's significant. On a scale of 0 to 10, how bad is it currently?";
      return "Got it, " + userText.trim() + ". On a scale of 0 to 10, how severe is the " + intake.current.area + " pain right now?";
    }
    if (step === 2) {
      intake.current.severity = userText.replace(/[^0-9]/g, "") || "7";
      var sev = parseInt(intake.current.severity) || 7;
      var sevWord = sev >= 7 ? "quite intense" : sev >= 4 ? "moderate" : "mild";
      return "A " + sev + " out of 10 — that's " + sevWord + ". So you've had " + intake.current.area + " pain for " + intake.current.duration.trim() + " at a " + sev + ". Does that sound right?";
    }
    if (step === 3) {
      if (setIntakeData) setIntakeData(intake.current);
      return "Great. Based on what you've told me — " + intake.current.area + " pain, " + intake.current.duration.trim() + ", severity " + intake.current.severity + " — you qualify for a free energy healing session. Let's find you a healer.";
    }
    return "Thank you. Let's move on.";
  }

  const send = useCallback((text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMsgs((m) => [...m, { from: "user", text: msg }]);
    setInput("");
    setInterim("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      var reply = buildReply(step, msg);
      setMsgs((m) => [...m, { from: "ai", text: reply }]);
      speak(reply);
      if (step === 0) setShowMap(true);
      setStep((s) => s + 1);
    }, 1200);
  }, [input, step]);

  const addPin = (pin) => {
    setPins((p) => [...p, pin]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      var reply = "Got it, I can see where you marked. How long has this been going on?";
      if (step >= 1) reply = "Noted. How would you rate the pain from 0 to 10?";
      setMsgs((m) => [...m, { from: "ai", text: reply }]);
      speak(reply);
      setStep((s) => Math.max(s, 2));
    }, 600);
  };

  // Set up speech recognition
  useEffect(() => {
    if (!isSTTAvailable()) return;
    var sendRef = send;
    listenerRef.current = createListener(
      (text) => { sendRef(text); },
      (state) => { setListening(state.listening); setInterim(state.interim || ""); }
    );
    return () => { if (listenerRef.current) listenerRef.current.stop(); };
  }, [send]);

  // Auto-start listening in voice mode
  useEffect(() => {
    if (mode === "voice" && listenerRef.current && step < 5) {
      listenerRef.current.start();
    } else if (mode !== "voice" && listenerRef.current) {
      listenerRef.current.stop();
    }
    return () => { if (listenerRef.current) listenerRef.current.stop(); };
  }, [mode, step]);

  useEffect(() => {
    if (sr.current) sr.current.scrollTop = sr.current.scrollHeight;
  }, [msgs, typing]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.purple }}>
      <Hdr title="Intake" onBack={() => go("s3")} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.white, borderRadius: "24px 24px 0 0", overflow: "hidden" }}>
        {mode === "voice" && !showMap && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, flex: 1 }}>
            <p style={{ fontSize: 22, fontWeight: 600, color: C.black, marginBottom: 24, fontFamily: ff }}>{listening ? "Listening..." : "Starting mic..."}</p>
            <div style={{ width: 140, height: 140, borderRadius: 999, background: listening ? C.pp : C.border, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", animation: listening ? "pulse 2s infinite" : "none" }}>
              <Ico name="mic" size={24} color={listening ? C.pd : C.muted} />
            </div>
            {interim && <p style={{ color: C.muted, fontSize: 14, marginTop: 16, fontStyle: "italic", fontFamily: ff }}>{interim}</p>}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
          <Pill active={mode === "voice"} onClick={() => setMode("voice")} style={{ fontSize: 12 }}>Voice</Pill>
          <Pill active={mode === "text"} onClick={() => setMode("text")} style={{ fontSize: 12, marginLeft: 6 }}>Text</Pill>
        </div>
        {showMap && (
          <div style={{ padding: 10, borderBottom: "1px solid " + C.border }}>
            <BMap pins={pins} onAddPin={addPin} small />
          </div>
        )}
        <div ref={sr} style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {msgs.map((m, i) => (
            <Bubble key={i} from={m.from === "ai" ? "healer" : "user"} text={m.text} />
          ))}
          {typing && <Bubble from="healer" typing />}
        </div>
        <div style={{ padding: "10px 16px 20px", borderTop: "1px solid " + C.border, display: "flex", gap: 8 }}>
          {mode === "text" ? (
            step >= 5 ? (
              <Btn onClick={() => go("s6")} style={{ fontSize: 14 }}>Continue →</Btn>
            ) : (
              <>
                <Inp value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type your response..." style={{ flex: 1, fontSize: 14, padding: "12px 14px" }} />
                <button onClick={() => send()} style={{ width: 42, height: 42, borderRadius: 14, background: C.black, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", flexShrink: 0 }}>
                  <span style={{ color: C.white, fontSize: 16 }}>↑</span>
                </button>
              </>
            )
          ) : (
            step >= 5 ? (
              <Btn onClick={() => go("s6")} style={{ fontSize: 14 }}>Continue →</Btn>
            ) : (
              <div style={{ flex: 1, padding: 14, borderRadius: 14, border: "1.5px solid " + (listening ? C.green : C.border), textAlign: "center", background: listening ? C.green + "11" : "transparent", transition: "all 0.3s" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 999, background: listening ? C.green : C.light, animation: listening ? "pulse 1.5s infinite" : "none" }} />
                  <span style={{ color: listening ? C.green : C.muted, fontSize: 13, fontWeight: 500 }}>{listening ? (interim || "Speak now...") : "Starting mic..."}</span>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function S6({ go }) {
  const [sel, setSel] = useState(null);
  var tiers = [
    { id: 0, name: "Free", price: "FREE", wait: "~3 mins", rate: "40%", detail: "50% reduction", type: "Test healer", icon: "hands" },
    { id: 1, name: "Standard", price: "$50", wait: "~4 weeks", rate: "70%", detail: "90% reduction", type: "Qualified", icon: "star", badge: "Best value" },
    { id: 2, name: "Priority", price: "$150", wait: "~7 days", rate: "70%", detail: "90% reduction", type: "Qualified", icon: "bolt", badge: "Popular" },
    { id: 3, name: "Immediate", price: "$350", wait: "~10 mins", rate: "70%", detail: "90% reduction", type: "Qualified", icon: "star", badge: "Fastest" },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.bg }}>
      <div style={{ background: C.pd, padding: "0 0 24px" }}>
        <Hdr onBack={() => go("s4")} light />
        <div style={{ padding: "0 24px" }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: C.white, margin: "0 0 4px", fontFamily: ff, letterSpacing: -0.5 }}>Choose your session</h2>
          <p style={{ color: C.pp, fontSize: 13, margin: 0 }}>Free = test healers · Paid = qualified healers</p>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
        {tiers.map((t) => {
          var isSel = sel === t.id;
          return (
            <div key={t.id} onClick={() => { haptic(); setSel(t.id); }} style={{ background: C.white, borderRadius: 20, padding: "18px 18px", cursor: "pointer", position: "relative", border: isSel ? "2px solid " + C.pd : "1px solid " + C.borderLight, transition: "all 0.2s" }}>
              {t.badge && <span style={{ position: "absolute", top: -9, right: 18, fontSize: 10, fontWeight: 600, background: C.black, color: C.white, padding: "3px 12px", borderRadius: 999 }}>{t.badge}</span>}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: t.id === 0 ? C.pp : C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ico name={t.icon} size={20} color={C.pd} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 17, fontWeight: 700, color: C.black, fontFamily: ff }}>{t.name}</span>
                    <span style={{ fontSize: 19, fontWeight: 700, color: t.price === "FREE" ? C.green : C.black, fontFamily: ff }}>{t.price}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span style={{ fontSize: 12, color: C.muted }}>Wait <strong style={{ color: C.black }}>{t.wait}</strong></span>
                    <span style={{ fontSize: 12, color: C.muted }}>Success <strong style={{ color: C.green }}>{t.rate}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: "12px 20px 32px", background: C.bg }}>
        <Btn disabled={sel === null} onClick={() => sel === 0 ? go("sq") : go("s18")}>
          {sel === null ? "Select a tier" : sel === 0 ? "Join free queue →" : "Pay " + tiers[sel].price + " →"}
        </Btn>
      </div>
    </div>
  );
}

function SQueue({ go }) {
  const tips = [
    "Find a quiet, comfortable spot",
    "You'll be asked to rate your symptoms during the session",
    "The session is anonymous — your healer won't know who you are",
    "A real person will be working on you — not AI",
  ];
  const [tipIdx, setTipIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTipIdx((i) => (i + 1) % tips.length), 4000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => go("s7"), 6000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.purple }}>
      <Hdr onBack={() => go("s6")} />
      <div style={{ flex: 1, padding: "0 24px 36px" }}>
        <WCard style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: 999, background: C.pp, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Ico name="clock" size={32} color={C.pd} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: C.black, margin: "0 0 8px", fontFamily: ff }}>You're in the queue</h2>
          <p style={{ color: C.muted, fontSize: 16, marginBottom: 28 }}>Approx 10–20 mins</p>
          <div style={{ background: C.pp, borderRadius: 16, padding: "20px 24px", marginBottom: 24, minHeight: 70, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: C.pd, fontSize: 14, fontWeight: 500, margin: 0, lineHeight: 1.5 }}>{tips[tipIdx]}</p>
          </div>
          <Btn primary={false} onClick={() => go("s6")} style={{ color: C.red, borderColor: C.red }}>Leave queue</Btn>
        </WCard>
      </div>
    </div>
  );
}

function S7({ go }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.purple }}>
      <div style={{ flex: 1, padding: "60px 20px 32px" }}>
        <WCard style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: 999, background: C.pp, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Ico name="star" size={32} color={C.pd} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: C.black, margin: "0 0 8px", fontFamily: ff }}>It's nearly your turn</h2>
          <p style={{ color: C.muted, fontSize: 16, marginBottom: 28 }}>Are you ready to begin?</p>
          <Btn onClick={() => go("s8")} style={{ marginBottom: 10 }}>Yes, I'm ready</Btn>
          <Btn primary={false} onClick={() => go("sq")}>Snooze — keep my spot</Btn>
        </WCard>
      </div>
    </div>
  );
}

function S8({ go }) {
  const [scores, setScores] = useState({ neck: 7, back: 5 });
  var pins = [{ x: 47, y: 22, side: "front", score: scores.neck }, { x: 55, y: 38, side: "front", score: scores.back }];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.purple }}>
      <Hdr title="Symptom check" onBack={() => go("s7")} />
      <div style={{ flex: 1, padding: "0 24px 36px", overflowY: "auto" }}>
        <WCard>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.black, margin: "0 0 16px", fontFamily: ff }}>Still feeling these?</h2>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><BMap pins={pins} readonly small /></div>
          {Object.entries(scores).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontWeight: 600, textTransform: "capitalize", fontSize: 15 }}>{k} pain</span>
                <span style={{ fontWeight: 700, fontSize: 20, color: v <= 3 ? C.green : v <= 6 ? C.amber : C.red }}>{v}/10</span>
              </div>
              <Slider value={v} onChange={(val) => { haptic(); setScores((s) => ({ ...s, [k]: val })); }} color={v <= 3 ? C.green : v <= 6 ? C.amber : C.red} />
            </div>
          ))}
          <Btn onClick={() => go("s9")}>I'm ready — start now</Btn>
        </WCard>
      </div>
    </div>
  );
}

function S9({ go, intakeData }) {
  var area = (intakeData && intakeData.area) || "neck";
  var sev = (intakeData && intakeData.severity) || "7";
  var dur = (intakeData && intakeData.duration) || "a while";
  var greet = "Hi, I can see you've been dealing with " + area + " pain at a " + sev + " out of 10 for " + dur + ". I'm going to start working on that now. Can you tell me — is the pain more on the left or right side?";

  const TOTAL = 300;
  const [sec, setSec] = useState(TOTAL);
  const [mode, setMode] = useState("voice");
  const [input, setInput] = useState("");
  const [sp, setSp] = useState("healer");
  const [round, setRound] = useState(1);
  const sr = useRef(null);
  const [wf, setWf] = useState(0);
  const [pins, setPins] = useState([{ x: 47, y: 22, side: "front", score: 7, label: "Neck" }, { x: 55, y: 38, side: "front", score: 5, label: "Back" }]);
  const [msgs, setMsgs] = useState([{ from: "system", text: "Round 1 · Session started" }, { from: "healer", text: greet }]);
  const [lastH, setLastH] = useState(greet);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const listenerRef = useRef(null);
  const userReplies = useRef(0);

  useEffect(() => { speak(greet); return () => stopSpeaking(); }, []);

  var fups = [
    { at: 260, text: "Is it a sharp pain or more of a dull ache in your " + area + "?" },
    { at: 220, text: "OK, I'm focusing on that area now. Just relax and let me know if you feel anything shift." },
    { at: 180, text: "I'm working on the " + area + " right now. How's it feeling compared to when we started?" },
    { at: 130, text: "We're making progress. What would you rate the " + area + " pain at now, out of 10?" },
  ];

  useEffect(() => {
    if (sec <= 0) { go("s10"); return; }
    const t = setTimeout(() => setSec((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sec]);

  useEffect(() => {
    var fu = fups.find((x) => x.at === sec);
    if (fu) {
      setSp("healer");
      setLastH(fu.text);
      setMsgs((m) => [...m, { from: "healer", text: fu.text }]);
      speak(fu.text);
      setTimeout(() => setSp("idle"), 2500);
    }
  }, [sec]);

  useEffect(() => {
    if (sr.current) sr.current.scrollTop = sr.current.scrollHeight;
  }, [msgs]);

  useEffect(() => {
    const t = setInterval(() => setWf((x) => x + 1), 150);
    return () => clearInterval(t);
  }, []);

  function buildHealerReply(text) {
    var l = text.toLowerCase();
    if (l.includes("right")) return "OK, right side. I'm directing energy to the right side of your " + area + " now. Let me know when you feel something.";
    if (l.includes("left")) return "Got it, left side. Focusing on the left " + area + " area. Take a deep breath and tell me if anything changes.";
    if (l.includes("sharp")) return "Sharp pain — that helps me focus. I'm going to work specifically on easing that sharpness. Just breathe.";
    if (l.includes("dull") || l.includes("ache")) return "A dull ache — often that responds well to energy work. I'm easing into it now. Let me know how it feels.";
    if (l.includes("tingle") || l.includes("warm") || l.includes("heat")) return "That's a great sign — warmth and tingling often mean the energy is flowing. I'll keep going.";
    if (l.includes("same") || l.includes("no change")) return "That's OK, sometimes it takes a moment. I'm adjusting my approach. Stay relaxed.";
    if (l.match(/\b[0-9]\b/) || l.match(/\b10\b/)) return "Thank you for the update. I'm continuing to work on bringing that down. Stay with it.";
    if (l.includes("yes") || l.includes("yeah") || l.includes("ok")) return "Great, let's keep going. I'm still focused on your " + area + ". Tell me if anything shifts.";
    return "Thank you for sharing that. I'm still working on the " + area + " area. Let me know how you're feeling.";
  }

  // Speech recognition for voice mode
  const sendVoice = useCallback((text) => {
    if (!text) return;
    userReplies.current++;
    setMsgs((m) => [...m, { from: "user", text }]);
    setInterim("");
    setSp("user");
    var l = text.toLowerCase();
    var improved = l.includes("better") || l.includes("lighter") || l.includes("eased") || l.includes("shifted") || l.includes("change") || l.includes("less");

    if (improved) {
      setSec(TOTAL);
      setRound((r) => r + 1);
      setPins((p) => p.map((pin) => ({ ...pin, score: Math.max(1, pin.score - 2) })));
      setTimeout(() => {
        setMsgs((m) => [...m, { from: "system", text: "Round " + (round + 1) + " · Timer reset" }]);
        setTimeout(() => {
          var t = "Good — I can feel that shift too. The " + area + " is responding. I'll keep working on it.";
          setSp("healer");
          setLastH(t);
          setMsgs((m) => [...m, { from: "healer", text: t }]);
          speak(t);
          setTimeout(() => setSp("idle"), 3000);
        }, 500);
      }, 400);
    } else {
      // Reply contextually based on what user said
      setTimeout(() => {
        var reply = buildHealerReply(text);
        setSp("healer");
        setLastH(reply);
        setMsgs((m) => [...m, { from: "healer", text: reply }]);
        speak(reply);
        setTimeout(() => setSp("idle"), 3000);
      }, 1500);
    }
  }, [round, area]);

  useEffect(() => {
    if (!isSTTAvailable()) return;
    listenerRef.current = createListener(
      (text) => { sendVoice(text); },
      (state) => { setListening(state.listening); setInterim(state.interim || ""); }
    );
    return () => { if (listenerRef.current) listenerRef.current.stop(); };
  }, [sendVoice]);

  useEffect(() => {
    if (mode === "voice" && listenerRef.current) listenerRef.current.start();
    else if (listenerRef.current) listenerRef.current.stop();
    return () => { if (listenerRef.current) listenerRef.current.stop(); };
  }, [mode]);

  const send = (text) => {
    var msg = text || input.trim();
    if (!msg) return;
    setMsgs((m) => [...m, { from: "user", text: msg }]);
    setInput("");
    setSp("idle");
    var l = msg.toLowerCase();
    if (l.includes("better") || l.includes("lighter") || l.includes("eased") || l.includes("shifted")) {
      setSec(TOTAL);
      setRound((r) => r + 1);
      setPins((p) => p.map((pin) => ({ ...pin, score: Math.max(1, pin.score - 2) })));
      setTimeout(() => {
        setMsgs((m) => [...m, { from: "system", text: "Round " + (round + 1) + " · Timer reset" }]);
        setTimeout(() => {
          var t = "Good — I felt that. Continuing.";
          setSp("healer");
          setLastH(t);
          setMsgs((m) => [...m, { from: "healer", text: t }]);
          speak(t);
          setTimeout(() => setSp("idle"), 2000);
        }, 500);
      }, 400);
    }
  };

  const simV = () => {
    var responses = ["Right side", "Dull ache", "Couple of weeks", "Neck feels lighter now", "Eased up a lot"];
    var idx = msgs.filter((m) => m.from === "user").length;
    send(responses[idx] || "Yes");
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.purple }}>
      <div style={{ padding: "8px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CRing seconds={sec} total={TOTAL} size={52} />
          <div>
            <p style={{ color: C.black, fontWeight: 700, fontSize: 15, margin: 0, fontFamily: ff }}>Round {round}</p>
            <p style={{ color: C.black, opacity: 0.5, fontSize: 11, margin: 0 }}>Healer A7Q2</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <Pill active={mode === "voice"} onClick={() => setMode("voice")} style={{ fontSize: 11, padding: "3px 10px" }}>Voice</Pill>
          <Pill active={mode === "text"} onClick={() => setMode("text")} style={{ fontSize: 11, padding: "3px 10px" }}>Text</Pill>
        </div>
      </div>
      <div style={{ flex: 1, background: C.white, borderRadius: "24px 24px 0 0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {mode === "voice" ? (
          <>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <BMap pins={pins} readonly />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {pins.map((p, i) => (
                    <div key={i} style={{ background: C.pp, borderRadius: 12, padding: "10px 16px" }}>
                      <p style={{ color: C.muted, fontSize: 11, margin: 0 }}>{p.label}</p>
                      <p style={{ color: C.black, fontWeight: 700, fontSize: 22, margin: 0 }}>{p.score}<span style={{ fontSize: 13, fontWeight: 500, color: C.muted }}>/10</span></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding: "20px 24px", borderTop: "1px solid " + C.border, background: C.pp + "44" }}>
              <WaveBars count={24} maxH={24} active={sp !== "idle" || listening} color={sp === "healer" ? C.pd : C.green} frame={wf} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 999, background: (sp !== "idle" || listening) ? C.green : C.light }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: sp === "healer" ? C.pd : sp === "user" ? C.green : listening ? C.green : C.muted }}>
                  {sp === "healer" ? "Healer speaking" : sp === "user" ? "You" : listening ? "Listening — speak anytime" : "Live — speak anytime"}
                </span>
              </div>
              {sp === "healer" && <p style={{ color: C.muted, fontSize: 13, textAlign: "center", margin: "6px 0 0", fontStyle: "italic" }}>"{lastH}"</p>}
              {interim && sp === "idle" && <p style={{ color: C.green, fontSize: 13, textAlign: "center", margin: "6px 0 0", fontStyle: "italic" }}>"{interim}"</p>}
            </div>
            <div style={{ padding: "10px 16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => { setSec(TOTAL); setRound((r) => r + 1); setPins((p) => p.map((pin) => ({ ...pin, score: Math.max(1, pin.score - 2) }))); setMsgs((m) => [...m, { from: "system", text: "Round " + (round + 1) + " · Improvement detected" }, { from: "healer", text: "Good — I felt that. Continuing." }]); speak("Good — I felt that. Continuing."); }} style={{ width: "100%", padding: "14px 20px", borderRadius: 14, background: C.green, border: "none", cursor: "pointer", fontFamily: ff, fontWeight: 600, fontSize: 15, color: C.white }}>I feel a change</button>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, padding: 12, borderRadius: 14, border: "1.5px solid " + (listening ? C.green : C.border), textAlign: "center", background: listening ? C.green + "11" : "transparent" }}>
                  <span style={{ color: listening ? C.green : C.muted, fontSize: 13 }}>{listening ? "Mic active" : "Mic off"}</span>
                </div>
                <button onClick={() => go("s10")} style={{ padding: "0 16px", borderRadius: 14, background: C.pp, border: "none", cursor: "pointer", fontFamily: ff, fontWeight: 600, fontSize: 13, color: C.black }}>End</button>
                <button onClick={() => { setMsgs((m) => [...m, { from: "system", text: "If this is a medical emergency, call your local emergency number. ENNIE is not a medical service." }]); }} style={{ padding: "0 12px", borderRadius: 14, background: C.white, border: "1.5px solid " + C.red, cursor: "pointer", fontFamily: ff, fontWeight: 500, fontSize: 11, color: C.red }}>Help</button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ padding: 12, borderBottom: "1px solid " + C.border, display: "flex", alignItems: "flex-start", gap: 10 }}>
              <BMap pins={pins} readonly small />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {pins.map((p, i) => (
                  <div key={i} style={{ background: C.pp, borderRadius: 10, padding: "6px 12px" }}>
                    <span style={{ color: C.muted, fontSize: 11 }}>{p.label}: </span>
                    <span style={{ fontWeight: 700, color: C.black }}>{p.score}/10</span>
                  </div>
                ))}
              </div>
            </div>
            <div ref={sr} style={{ flex: 1, overflowY: "auto", padding: "10px 14px" }}>
              {msgs.map((m, i) => {
                if (m.from === "system") {
                  return <div key={i} style={{ textAlign: "center", marginBottom: 10 }}><span style={{ color: C.muted, fontSize: 11, background: C.pp, padding: "3px 12px", borderRadius: 999 }}>{m.text}</span></div>;
                }
                return <Bubble key={i} from={m.from} text={m.text} />;
              })}
            </div>
            <div style={{ padding: "10px 14px 20px", borderTop: "1px solid " + C.border, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <Inp value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Reply to your healer..." style={{ flex: 1, fontSize: 14, padding: 12 }} />
                <button onClick={() => send()} style={{ width: 42, height: 42, borderRadius: 14, background: C.black, border: "none", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: C.white, fontSize: 16 }}>↑</span>
                </button>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setSec(TOTAL); setRound((r) => r + 1); setPins((p) => p.map((pin) => ({ ...pin, score: Math.max(1, pin.score - 2) }))); setMsgs((m) => [...m, { from: "system", text: "Round " + (round + 1) + " · Improvement detected" }, { from: "healer", text: "Good — I felt that. Continuing." }]); }} style={{ flex: 1, padding: "10px 14px", borderRadius: 14, background: C.green, border: "none", cursor: "pointer", fontFamily: ff, fontWeight: 600, fontSize: 13, color: C.white }}>I feel a change</button>
                <button onClick={() => go("s10")} style={{ padding: "0 14px", borderRadius: 14, background: C.pp, border: "none", cursor: "pointer", fontFamily: ff, fontWeight: 600, fontSize: 12, color: C.black }}>End</button>
                <button onClick={() => { setMsgs((m) => [...m, { from: "system", text: "If this is a medical emergency, call your local emergency number. ENNIE is not a medical service." }]); }} style={{ padding: "0 12px", borderRadius: 14, background: C.white, border: "1.5px solid " + C.red, cursor: "pointer", fontFamily: ff, fontWeight: 500, fontSize: 11, color: C.red }}>Help</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function S10({ go }) {
  var befPins = [{ x: 47, y: 22, side: "front", score: 7, label: "Neck" }, { x: 55, y: 38, side: "front", score: 5, label: "Back" }];
  var aftPins = [{ x: 47, y: 22, side: "front", score: 3, label: "Neck" }, { x: 55, y: 38, side: "front", score: 2, label: "Back" }];
  const [thx, setThx] = useState(false);
  const [feeling, setFeeling] = useState(null);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.purple }}>
      <div style={{ flex: 1, padding: "40px 20px 32px", overflowY: "auto" }}>
        <WCard style={{ textAlign: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: 999, background: C.pp, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Ico name="star" size={26} color={C.pd} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: C.black, margin: "0 0 6px", fontFamily: ff }}>Session complete</h2>
          <p style={{ color: C.muted, fontSize: 14, margin: "0 0 20px" }}>Thank you for your session. Here's how your symptoms changed.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 16 }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: C.muted, fontSize: 11, fontWeight: 600, margin: "0 0 4px", textTransform: "uppercase" }}>Before</p>
              <BMap pins={befPins} readonly small />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: C.green, fontSize: 11, fontWeight: 600, margin: "0 0 4px", textTransform: "uppercase" }}>After</p>
              <BMap pins={aftPins} readonly small />
            </div>
          </div>
          {befPins.map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid " + C.border + "22" }}>
              <span style={{ fontWeight: 500, fontSize: 15 }}>{p.label}</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: C.muted }}>{p.score}</span>
                <span style={{ color: C.light }}>→</span>
                <span style={{ color: C.green, fontWeight: 700, fontSize: 18 }}>{aftPins[i].score}</span>
              </div>
            </div>
          ))}
          <div style={{ background: C.pp, borderRadius: 14, padding: 14, margin: "16px 0" }}>
            <p style={{ color: C.pd, fontSize: 14, fontWeight: 500, margin: "0 0 8px" }}>How are you feeling overall?</p>
            {!feeling ? (
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                {["Much better", "A little better", "About the same"].map((f) => (
                  <button key={f} onClick={() => setFeeling(f)} style={{ padding: "8px 12px", borderRadius: 12, border: "1.5px solid " + C.pd, background: C.white, cursor: "pointer", fontFamily: ff, fontSize: 12, fontWeight: 500, color: C.pd }}>{f}</button>
                ))}
              </div>
            ) : (
              <p style={{ color: C.pd, fontSize: 13, margin: 0 }}>You said: <strong>{feeling}</strong></p>
            )}
          </div>
          <p style={{ color: C.muted, fontSize: 12, fontStyle: "italic", margin: "0 0 16px" }}>We'll check in with you in 24 hours.</p>
          {!thx ? (
            <Btn primary={false} onClick={() => setThx(true)} style={{ marginBottom: 10 }}>Send anonymous thank you</Btn>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Ico name="check" size={16} color={C.green} /><span style={{ color: C.green, fontWeight: 500, fontSize: 14 }}>Thank you sent</span></div>
          )}
          <Btn onClick={() => go("s21")}>Return home</Btn>
        </WCard>
      </div>
    </div>
  );
}

function S11({ go }) {
  const [scores, setScores] = useState({ neck: 3, back: 2 });
  const [feeling, setFeeling] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.purple }}>
      <div style={{ flex: 1, padding: "40px 20px 32px", overflowY: "auto" }}>
        <WCard style={{ textAlign: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: 999, background: C.pp, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Ico name="bell" size={26} color={C.pd} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.black, margin: "0 0 6px", fontFamily: ff }}>24-Hour Follow-up</h2>
          <p style={{ color: C.muted, fontSize: 14, margin: "0 0 20px" }}>It's been 24 hours since your session. How are your symptoms now?</p>
          {!submitted ? (
            <>
              {Object.entries(scores).map(([k, v]) => (
                <div key={k} style={{ marginBottom: 20, textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, textTransform: "capitalize", fontSize: 15 }}>{k} pain</span>
                    <span style={{ fontWeight: 700, fontSize: 20, color: v <= 2 ? C.green : v <= 5 ? C.amber : C.pd }}>{v}/10</span>
                  </div>
                  <Slider value={v} onChange={(val) => { haptic(); setScores((s) => ({ ...s, [k]: val })); }} color={v <= 2 ? C.green : v <= 5 ? C.amber : C.pd} />
                </div>
              ))}
              <div style={{ background: C.pp, borderRadius: 14, padding: 14, margin: "8px 0 16px" }}>
                <p style={{ color: C.pd, fontSize: 14, fontWeight: 500, margin: "0 0 8px" }}>Overall, how are you feeling?</p>
                {!feeling ? (
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                    {["Much better", "A little better", "About the same", "Worse"].map((f) => (
                      <button key={f} onClick={() => { haptic(); setFeeling(f); }} style={{ padding: "8px 12px", borderRadius: 12, border: "1.5px solid " + C.pd, background: C.white, cursor: "pointer", fontFamily: ff, fontSize: 12, fontWeight: 500, color: C.pd }}>{f}</button>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: C.pd, fontSize: 13, margin: 0 }}>You said: <strong>{feeling}</strong></p>
                )}
              </div>
              <Btn disabled={!feeling} onClick={() => { haptic("heavy"); setSubmitted(true); }}>Submit follow-up</Btn>
            </>
          ) : (
            <>
              <div style={{ width: 60, height: 60, borderRadius: 999, background: C.green + "22", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Ico name="check" size={26} color={C.green} />
              </div>
              <p style={{ color: C.green, fontWeight: 600, fontSize: 16, margin: "0 0 8px" }}>Thank you!</p>
              <p style={{ color: C.muted, fontSize: 14, margin: "0 0 20px" }}>Your feedback helps improve our healers and your future sessions.</p>
              <Btn onClick={() => go("s21")}>Return home</Btn>
            </>
          )}
        </WCard>
      </div>
    </div>
  );
}

function S12({ go }) {
  const [step, setStep] = useState(0);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.yellow }}>
      <Hdr title="Become a test healer" onBack={() => step > 0 ? setStep((s) => s - 1) : go("s1")} />
      <div style={{ flex: 1, padding: "0 24px 36px" }}>
        <WCard style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <p style={{ color: C.muted, fontSize: 12, marginBottom: 16 }}>Step {step + 1} of 3</p>
          {step === 0 && (
            <>
              <Inp placeholder="Language" style={{ marginBottom: 10 }} />
              <Inp placeholder="Healing modality" style={{ marginBottom: 10 }} />
              <Inp placeholder="Timezone" style={{ marginBottom: 16 }} />
              <Btn onClick={() => setStep(1)}>Next</Btn>
            </>
          )}
          {step === 1 && (
            <>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 16px" }}>Do you have experience?</h3>
              <Btn onClick={() => setStep(2)} style={{ marginBottom: 10 }}>Yes</Btn>
              <Btn primary={false} onClick={() => setStep(2)}>No — show me training</Btn>
            </>
          )}
          {step === 2 && (
            <>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px" }}>Platform rules</h3>
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>Sessions are AI-mediated and anonymous. No recordings.</p>
              <Btn onClick={() => go("s13")}>I accept — join healer pool</Btn>
            </>
          )}
          <div style={{ marginTop: "auto", display: "flex", justifyContent: "center", gap: 8, paddingTop: 16 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: i === step ? 20 : 8, height: 8, borderRadius: 999, background: i === step ? C.black : C.border, transition: "all 0.3s" }} />
            ))}
          </div>
        </WCard>
      </div>
    </div>
  );
}

function HTag({ children }) {
  return <span style={{ fontSize: 11, background: C.yp, color: C.yd, borderRadius: 999, padding: "4px 12px", fontWeight: 500 }}>{children}</span>;
}

function S13({ go }) {
  const [on, setOn] = useState(false);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
      <div style={{ background: C.yellow, padding: "16px 24px 24px", borderRadius: "0 0 24px 24px" }}>
        <h2 style={{ color: C.black, fontWeight: 700, fontSize: 22, margin: 0, fontFamily: ff }}>Healer dashboard</h2>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 36px" }}>
        <div style={{ background: on ? C.yp : C.white, border: "1.5px solid " + (on ? C.yd : C.border), borderRadius: 20, padding: 20, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontWeight: 600, margin: 0, fontSize: 15 }}>{on ? "You're online" : "You're offline"}</p>
              <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{on ? "Accepting sessions" : "Toggle to start"}</p>
            </div>
            <Toggle on={on} onToggle={() => setOn((o) => !o)} color={C.yd} />
          </div>
          {on && <Btn onClick={() => go("s14")} style={{ marginTop: 14, fontSize: 14 }}>Simulate incoming case →</Btn>}
        </div>
        <div style={{ background: C.yp, borderRadius: 20, padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Qualification</span>
            <HTag>Active</HTag>
          </div>
          <div style={{ height: 6, background: C.white, borderRadius: 999, marginBottom: 4 }}>
            <div style={{ height: "100%", width: "60%", background: C.yd, borderRadius: 999 }} />
          </div>
          <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>18 of 30 sessions</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[["18", "Sessions"], ["72%", "Change rate"], ["3.1", "Avg"]].map(([v, l], i) => (
            <div key={i} style={{ background: C.white, border: "1px solid " + C.border, borderRadius: 16, padding: 14, textAlign: "center" }}>
              <p style={{ fontWeight: 700, fontSize: 20, margin: 0, color: C.yd }}>{v}</p>
              <p style={{ fontSize: 11, color: C.muted, margin: "2px 0 0" }}>{l}</p>
            </div>
          ))}
        </div>
        <Btn primary={false} onClick={() => go("s12")} style={{ marginTop: 14, fontSize: 13 }}>← Back</Btn>
      </div>
    </div>
  );
}

function S14({ go }) {
  const [countdown, setCountdown] = useState(10);
  useEffect(() => {
    if (countdown <= 0) { go("s15"); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.yellow }}>
      <div style={{ padding: "8px 20px" }}><HTag>Healer view</HTag></div>
      <div style={{ flex: 1, padding: "0 24px 36px" }}>
        <WCard style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.black, margin: "0 0 4px", fontFamily: ff }}>Incoming case</h2>
          <p style={{ color: C.muted, fontSize: 13, margin: "0 0 16px" }}>Session starts in {countdown}s</p>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <BMap pins={[{ x: 47, y: 22, side: "front", score: 7 }, { x: 55, y: 38, side: "front", score: 5 }]} readonly small />
            <div style={{ flex: 1 }}>
              <div style={{ background: C.yp, borderRadius: 12, padding: 12, marginBottom: 8 }}>
                <p style={{ color: C.muted, fontSize: 11, margin: "0 0 2px", fontWeight: 500, textTransform: "uppercase" }}>Category</p>
                <p style={{ color: C.black, fontWeight: 600, fontSize: 15, margin: 0 }}>Chronic pain</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[["Neck", 7], ["Back", 5]].map(([label, score]) => (
                  <div key={label} style={{ background: C.yp, borderRadius: 10, padding: "6px 12px", flex: 1 }}>
                    <p style={{ color: C.muted, fontSize: 11, margin: 0 }}>{label}</p>
                    <p style={{ color: C.black, fontWeight: 700, fontSize: 18, margin: 0 }}>{score}<span style={{ fontSize: 12, color: C.muted }}>/10</span></p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ background: C.yp, borderRadius: 14, padding: 14 }}>
            <p style={{ color: C.muted, fontSize: 11, fontWeight: 500, textTransform: "uppercase", margin: "0 0 4px" }}>AI summary</p>
            <p style={{ color: C.black, fontSize: 14, lineHeight: 1.5, margin: 0 }}>Case reports chronic neck and back pain for approximately 2 weeks. Neck is primary concern, rated 7/10. Described as dull ache on right side.</p>
          </div>
          <div style={{ marginTop: "auto", paddingTop: 16 }}>
            <div style={{ height: 6, background: C.border, borderRadius: 999, marginBottom: 14 }}>
              <div style={{ height: "100%", background: C.yd, borderRadius: 999, width: ((10 - countdown) / 10 * 100) + "%", transition: "width 1s linear" }} />
            </div>
            <Btn onClick={() => go("s15")}>Start session now</Btn>
          </div>
        </WCard>
      </div>
    </div>
  );
}

function S15({ go }) {
  const TOTAL = 300;
  const [sec, setSec] = useState(TOTAL);
  const [mode, setMode] = useState("voice");
  const [msgs, setMsgs] = useState([{ from: "system", text: "Case matched · Round 1" }, { from: "system", text: "Case: Neck 7/10, Back 5/10 — chronic pain, 2 weeks" }]);
  const [input, setInput] = useState("");
  const [pins, setPins] = useState([{ x: 47, y: 22, side: "front", score: 7, label: "Neck" }, { x: 55, y: 38, side: "front", score: 5, label: "Back" }]);
  const sr = useRef(null);
  const [wf, setWf] = useState(0);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const listenerRef = useRef(null);

  useEffect(() => { return () => stopSpeaking(); }, []);

  useEffect(() => {
    if (sec <= 0) { go("s16"); return; }
    const t = setTimeout(() => setSec((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sec]);

  useEffect(() => {
    if (sr.current) sr.current.scrollTop = sr.current.scrollHeight;
  }, [msgs]);

  useEffect(() => {
    const t = setInterval(() => setWf((x) => x + 1), 150);
    return () => clearInterval(t);
  }, []);

  // Simulate case updates at certain times
  useEffect(() => {
    if (sec === 250) { setMsgs((m) => [...m, { from: "system", text: "Case reports: neck feels slightly lighter" }]); speak("Case reports: neck feels slightly lighter"); }
    if (sec === 250) setPins((p) => p.map((pin) => pin.label === "Neck" ? { ...pin, score: 5 } : pin));
    if (sec === 200) { setMsgs((m) => [...m, { from: "system", text: "Case tapped 'I feel a change'" }]); speak("Case tapped I feel a change"); }
    if (sec === 200) setPins((p) => p.map((pin) => ({ ...pin, score: Math.max(1, pin.score - 1) })));
  }, [sec]);

  const sendVoice = useCallback((text) => {
    if (!text) return;
    setMsgs((m) => [...m, { from: "user", text }]);
    setInterim("");
    setTimeout(() => setMsgs((m) => [...m, { from: "system", text: "Relayed to case via AI" }]), 500);
  }, []);

  useEffect(() => {
    if (!isSTTAvailable()) return;
    listenerRef.current = createListener(
      (text) => { sendVoice(text); },
      (state) => { setListening(state.listening); setInterim(state.interim || ""); }
    );
    return () => { if (listenerRef.current) listenerRef.current.stop(); };
  }, [sendVoice]);

  useEffect(() => {
    if (mode === "voice" && listenerRef.current) listenerRef.current.start();
    else if (listenerRef.current) listenerRef.current.stop();
    return () => { if (listenerRef.current) listenerRef.current.stop(); };
  }, [mode]);

  const send = () => {
    if (!input.trim()) return;
    setMsgs((m) => [...m, { from: "user", text: input }]);
    setInput("");
    setTimeout(() => setMsgs((m) => [...m, { from: "system", text: "Relayed to case via AI" }]), 500);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.yellow }}>
      <div style={{ padding: "8px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <HTag>Healer view</HTag>
          <CRing seconds={sec} total={TOTAL} size={48} />
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <Pill active={mode === "voice"} onClick={() => setMode("voice")} style={{ fontSize: 11, padding: "3px 10px" }}>Voice</Pill>
          <Pill active={mode === "text"} onClick={() => setMode("text")} style={{ fontSize: 11, padding: "3px 10px" }}>Text</Pill>
        </div>
      </div>
      <div style={{ flex: 1, background: C.white, borderRadius: "24px 24px 0 0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: 12, borderBottom: "1px solid " + C.border, display: "flex", alignItems: "center", gap: 10 }}>
          <BMap pins={pins} readonly small />
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            {pins.map((p, i) => (
              <div key={i} style={{ background: C.yp, borderRadius: 8, padding: "4px 10px" }}>
                <span style={{ fontSize: 12 }}>{p.label}: <strong>{p.score}/10</strong></span>
              </div>
            ))}
          </div>
        </div>
        {mode === "voice" ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <p style={{ color: C.yd, fontSize: 13, fontWeight: 500, marginBottom: 8 }}>{listening ? "Mic active — speak naturally" : "AI Audio — work eyes-closed"}</p>
            <WaveBars count={20} maxH={20} active={listening} color={C.yd} frame={wf} />
            {interim && <p style={{ color: C.yd, fontSize: 14, marginTop: 8, fontStyle: "italic" }}>"{interim}"</p>}
            <p style={{ color: C.muted, fontSize: 12, marginTop: 12, textAlign: "center", lineHeight: 1.5 }}>AI mediates between you and the case.<br />Speak naturally — your words are relayed.</p>
          </div>
        ) : (
          <div ref={sr} style={{ flex: 1, overflowY: "auto", padding: "10px 14px" }}>
            {msgs.map((m, i) => {
              if (m.from === "system") {
                return <div key={i} style={{ textAlign: "center", marginBottom: 8 }}><span style={{ color: C.muted, fontSize: 11, background: C.yp, padding: "2px 10px", borderRadius: 999 }}>{m.text}</span></div>;
              }
              return <Bubble key={i} from={m.from} text={m.text} />;
            })}
          </div>
        )}
        <div style={{ padding: "10px 14px 20px", borderTop: "1px solid " + C.border, display: "flex", gap: 8 }}>
          {mode === "text" ? (
            <>
              <Inp value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Message case via AI..." style={{ flex: 1, fontSize: 14, padding: 12 }} />
              <button onClick={send} style={{ width: 42, height: 42, borderRadius: 14, background: C.black, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: C.white }}>↑</span>
              </button>
            </>
          ) : (
            <div style={{ flex: 1, padding: 12, borderRadius: 14, border: "1.5px solid " + (listening ? C.yd : C.border), textAlign: "center", background: listening ? C.yd + "22" : "transparent", transition: "all 0.3s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 999, background: listening ? C.yd : C.light }} />
                <span style={{ color: listening ? C.yd : C.muted, fontSize: 13 }}>{listening ? (interim || "Speak to AI mediator...") : "Starting mic..."}</span>
              </div>
            </div>
          )}
          <button onClick={() => go("s16")} style={{ padding: "0 16px", height: 42, borderRadius: 14, background: C.yp, border: "none", cursor: "pointer", fontFamily: ff, fontWeight: 600, fontSize: 13, color: C.black }}>End</button>
        </div>
      </div>
    </div>
  );
}

function S16({ go }) {
  const [ready, setReady] = useState(false);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.yellow }}>
      <div style={{ padding: "8px 20px" }}><HTag>Healer view</HTag></div>
      <div style={{ flex: 1, padding: "0 24px 36px", overflowY: "auto" }}>
        <WCard>
          <div style={{ width: 60, height: 60, borderRadius: 999, background: C.yp, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Ico name="star" size={26} color={C.pd} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.black, margin: "0 0 6px", textAlign: "center", fontFamily: ff }}>Session complete</h2>
          <p style={{ color: C.muted, fontSize: 14, textAlign: "center", margin: "0 0 20px" }}>Here's how the case responded</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            {[["Neck", 7, 3], ["Back", 5, 2]].map(([label, before, after]) => (
              <div key={label} style={{ flex: 1, background: C.yp, borderRadius: 14, padding: 14, textAlign: "center" }}>
                <p style={{ color: C.muted, fontSize: 12, margin: "0 0 4px" }}>{label}</p>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
                  <span style={{ color: C.muted, fontSize: 16 }}>{before}</span>
                  <span style={{ color: C.light, fontSize: 12 }}>→</span>
                  <span style={{ color: C.green, fontWeight: 700, fontSize: 20 }}>{after}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[["19", "Sessions"], ["74%", "Change rate"], ["3.2", "Avg score"]].map(([v, l], i) => (
              <div key={i} style={{ background: C.white, border: "1px solid " + C.border, borderRadius: 14, padding: 12, textAlign: "center" }}>
                <p style={{ fontWeight: 700, fontSize: 18, margin: 0, color: C.yd }}>{v}</p>
                <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>{l}</p>
              </div>
            ))}
          </div>
          <Inp placeholder="Optional notes (private)" style={{ marginBottom: 16 }} />
          {!ready ? (
            <Btn onClick={() => setReady(true)}>Ready for another session?</Btn>
          ) : (
            <div style={{ textAlign: "center" }}>
              <p style={{ color: C.green, fontWeight: 600, fontSize: 15, margin: "0 0 12px" }}>You're back online</p>
              <Btn primary={false} onClick={() => go("s13")}>Go to dashboard</Btn>
            </div>
          )}
        </WCard>
      </div>
    </div>
  );
}

function S17({ go }) {
  const [sel, setSel] = useState(null);
  var tiers = [
    { id: 0, name: "Standard", price: "$50", per: "per session", wait: "~4 weeks", rate: "70%", detail: "90% avg reduction", type: "Qualified healer", icon: "hands" },
    { id: 1, name: "Priority", price: "$150", per: "per session", wait: "~7 days", rate: "70%", detail: "90% avg reduction", type: "Qualified healer", icon: "bolt", badge: "Most popular" },
    { id: 2, name: "Immediate", price: "$350", per: "per session", wait: "~10 mins", rate: "70%", detail: "90% avg reduction", type: "Qualified healer", icon: "star", badge: "Fastest" },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
      <div style={{ background: C.purple, padding: "16px 24px 28px", borderRadius: "0 0 24px 24px" }}>
        <Hdr onBack={() => go("s3")} />
        <h2 style={{ fontSize: 28, fontWeight: 700, color: C.black, margin: "0 0 6px", fontFamily: ff }}>Paid sessions</h2>
        <p style={{ color: C.black, opacity: 0.6, fontSize: 14, margin: 0 }}>No active symptoms needed — book a qualified healer</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px 12px", display: "flex", flexDirection: "column", gap: 14 }}>
        {tiers.map((t) => {
          var isSel = sel === t.id;
          return (
            <div key={t.id} onClick={() => { haptic(); setSel(t.id); }} style={{ background: C.white, borderRadius: 22, padding: "22px 20px", cursor: "pointer", position: "relative", border: isSel ? "2.5px solid " + C.pd : "1.5px solid " + C.border, boxShadow: isSel ? "0 6px 24px rgba(107,91,212,0.2)" : "0 2px 12px rgba(0,0,0,0.04)", transition: "all 0.25s ease", transform: isSel ? "scale(1.02)" : "scale(1)" }}>
              {t.badge && <span style={{ position: "absolute", top: -10, right: 20, fontSize: 11, fontWeight: 600, background: t.id === 2 ? C.pd : C.black, color: C.white, padding: "4px 14px", borderRadius: 999, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>{t.badge}</span>}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: t.id === 2 ? C.pp : C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name={t.icon} size={22} color={C.pd} /></div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: C.black, fontFamily: ff, display: "block" }}>{t.name}</span>
                  <span style={{ fontSize: 12, color: C.muted }}>{t.type}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: C.black, fontFamily: ff, display: "block", lineHeight: 1 }}>{t.price}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>{t.per}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, background: C.bg, borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
                  <p style={{ fontSize: 11, color: C.muted, margin: "0 0 2px" }}>Wait time</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.black, margin: 0 }}>{t.wait}</p>
                </div>
                <div style={{ flex: 1, background: C.bg, borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
                  <p style={{ fontSize: 11, color: C.muted, margin: "0 0 2px" }}>Success</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.green, margin: 0 }}>{t.rate}</p>
                </div>
                <div style={{ flex: 1, background: C.bg, borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
                  <p style={{ fontSize: 11, color: C.muted, margin: "0 0 2px" }}>Avg result</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.pd, margin: 0 }}>{t.detail.replace("avg ", "")}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ background: C.pp, borderRadius: 16, padding: 16, textAlign: "center" }}>
          <p style={{ color: C.pd, fontSize: 13, margin: 0, fontWeight: 500 }}>Have active symptoms? <span onClick={() => go("s3")} style={{ fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}>Try a free session</span></p>
        </div>
      </div>
      <div style={{ padding: "12px 20px 28px", background: C.white, borderTop: "1px solid " + C.border }}>
        <Btn disabled={sel === null} onClick={() => go("s18")}>
          {sel === null ? "Select a tier" : "Pay " + tiers[sel].price + " →"}
        </Btn>
      </div>
    </div>
  );
}

function S18({ go }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.purple }}>
      <Hdr title="Payment" onBack={() => go("s6")} />
      <div style={{ flex: 1, padding: "0 24px 36px" }}>
        <WCard>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <Btn primary={false} onClick={() => go("sq")} style={{ flex: 1, fontSize: 14 }}>Apple Pay</Btn>
            <Btn primary={false} onClick={() => go("sq")} style={{ flex: 1, fontSize: 14 }}>Google Pay</Btn>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "12px 0" }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ color: C.muted, fontSize: 12 }}>or card</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>
          <Inp placeholder="Card number" style={{ marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <Inp placeholder="MM/YY" style={{ flex: 1 }} />
            <Inp placeholder="CVC" style={{ flex: 1 }} />
          </div>
          <p style={{ color: C.muted, fontSize: 12, marginBottom: 16 }}>Auto refund if no match or session fails.</p>
          <Btn onClick={() => go("sq")}>Pay and join queue</Btn>
        </WCard>
      </div>
    </div>
  );
}

function S20({ go }) {
  const [values, setValues] = useState({ "Display name": "User", "Email": "user@example.com", "Language": "English", "Notifications": "On", "Payment methods": "None" });
  const selStyle = { width: "100%", boxSizing: "border-box", background: C.white, border: "1.5px solid " + C.border, borderRadius: 14, padding: "12px 16px", color: C.black, fontSize: 14, fontFamily: ff, appearance: "none", WebkitAppearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' fill='none' stroke-width='1.5'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" };
  var settingsConfig = [
    { key: "Display name", options: ["User", "Anonymous", "Custom"] },
    { key: "Email", options: ["user@example.com", "Change email"] },
    { key: "Language", options: ["English", "Spanish", "French", "Portuguese", "Mandarin"] },
    { key: "Notifications", options: ["On", "Off", "Quiet hours only"] },
    { key: "Payment methods", options: ["None", "Add card", "Apple Pay", "Google Pay"] },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
      <div style={{ background: C.pd, padding: "28px 28px 28px", borderRadius: "0 0 24px 24px" }}>
        <h2 style={{ color: C.white, fontWeight: 600, fontSize: 24, margin: 0, fontFamily: ff, letterSpacing: -0.3 }}>Settings</h2>
      </div>
      <div style={{ flex: 1, padding: "24px 24px", overflowY: "auto" }}>
        {settingsConfig.map((item) => (
          <div key={item.key} style={{ padding: "16px 0", borderBottom: "1px solid " + C.borderLight }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: C.muted, margin: "0 0 8px" }}>{item.key}</p>
            <select value={values[item.key]} onChange={(e) => setValues((v) => ({ ...v, [item.key]: e.target.value }))} style={selStyle}>
              {item.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <div onClick={() => go("sSupport")} style={{ padding: "16px 0", borderBottom: "1px solid " + C.border, cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 15, fontWeight: 500 }}>Support</span>
          <span style={{ color: C.muted }}>→</span>
        </div>
        <div style={{ padding: "16px 0", cursor: "pointer" }} onClick={() => go("s23")}>
          <span style={{ fontSize: 15, fontWeight: 500, color: C.red }}>Delete account</span>
        </div>
        <Btn onClick={() => go("s21")} style={{ marginTop: 16 }}>Save & return home</Btn>
      </div>
      <TabBar go={go} active="Settings" />
    </div>
  );
}

function S22({ go }) {
  var sessions = [
    { title: "Neck & back pain", date: "Today", time: "12 min", healer: "Healer anon", status: "Improved", areas: [["Neck", 7, 3], ["Back", 5, 2]] },
    { title: "Shoulder tension", date: "2 weeks ago", time: "8 min", healer: "Healer anon", status: "Improved", areas: [["Shoulder", 6, 2]] },
    { title: "Lower back pain", date: "1 month ago", time: "15 min", healer: "Healer anon", status: "Improved", areas: [["Back", 8, 5]] },
  ];
  var chartData = [8, 5, 3];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.bg }}>
      <div style={{ padding: "28px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ color: C.black, fontWeight: 600, fontSize: 24, margin: 0, fontFamily: ff, letterSpacing: -0.3 }}>Your sessions</h2>
          <div style={{ display: "flex", gap: 6 }}>
            <Pill active={true} onClick={() => {}} style={{ fontSize: 12, padding: "6px 16px", background: C.pd, color: C.white, border: "none" }}>Home</Pill>
            <Pill active={false} onClick={() => go("s20")} style={{ fontSize: 12, padding: "6px 16px" }}>Settings</Pill>
          </div>
        </div>
        <div style={{ background: C.white, borderRadius: 16, padding: "20px 16px 16px", marginBottom: 24, border: "1px solid " + C.borderLight }}>
          <Sparkline data={chartData} width={340} height={70} color={C.green} showLabels />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 8px" }}>
        {sessions.map((s, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 20, padding: "18px 18px 16px", marginBottom: 10, border: "1px solid " + C.borderLight }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: C.black, margin: "0 0 4px", fontFamily: ff }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>{s.date} · {s.time} · {s.healer}</p>
              </div>
              <Badge>{s.status}</Badge>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              {s.areas.map(([label, before, after]) => (
                <span key={label} style={{ fontSize: 14, color: C.muted }}>
                  {before} <span style={{ color: C.light }}>→</span> <span style={{ color: C.green, fontWeight: 700 }}>{after}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <TabBar go={go} active="Activity" />
    </div>
  );
}

function S21({ go }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.bg }}>
      <div style={{ background: C.pd, padding: "28px 28px 32px", borderRadius: "0 0 24px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.pp, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ico name="hands" size={18} color={C.pd} />
            </div>
            <span style={{ fontWeight: 600, fontSize: 18, color: C.white, fontFamily: ff, letterSpacing: -0.2 }}>Ennie</span>
          </div>
          <Badge color={C.white} bg="rgba(255,255,255,0.12)">3 sessions</Badge>
        </div>
        <h2 style={{ color: C.white, fontWeight: 700, fontSize: 24, margin: "0 0 6px", fontFamily: ff, letterSpacing: -0.5 }}>Your healing journey</h2>
        <p style={{ color: C.pp, fontSize: 14, fontWeight: 400, margin: 0 }}>At a glance</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "22px 24px 8px" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          {[{ t: "Unlimited free sessions with test healers", icon: "star" }, { t: "Rate symptoms in real time", icon: "chart" }].map((item, i) => (
            <div key={i} style={{ flex: 1, minWidth: 0, background: C.white, borderRadius: 16, padding: "20px 18px", border: "1px solid " + C.borderLight }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <Ico name={item.icon} size={18} color={C.pd} />
              </div>
              <p style={{ fontSize: 14, color: C.black, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{item.t}</p>
            </div>
          ))}
        </div>
        <div onClick={() => go("s3")} style={{ background: C.pd, borderRadius: 18, padding: "26px 24px", marginBottom: 14, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 6px", fontFamily: ff, color: C.white, letterSpacing: -0.2 }}>Start a session</h3>
            <p style={{ fontSize: 13, color: C.pp, fontWeight: 400, margin: 0 }}>Free with test healers</p>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ico name="arrow" size={18} color={C.white} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <div onClick={() => go("s19")} style={{ flex: 1, background: C.white, borderRadius: 16, padding: "20px 18px", cursor: "pointer", border: "1px solid " + C.borderLight }}>
            <div style={{ marginBottom: 10 }}><Ico name="star" size={20} color={C.pd} /></div>
            <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px", fontFamily: ff }}>How it works</p>
            <p style={{ fontSize: 13, color: C.muted, fontWeight: 400, margin: 0 }}>Learn about Ennie</p>
          </div>
          <div onClick={() => go("s17")} style={{ flex: 1, background: C.white, borderRadius: 16, padding: "20px 18px", cursor: "pointer", border: "1px solid " + C.borderLight }}>
            <div style={{ marginBottom: 10 }}><Ico name="bolt" size={20} color={C.pd} /></div>
            <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px", fontFamily: ff }}>Paid sessions</p>
            <p style={{ fontSize: 13, color: C.muted, fontWeight: 400, margin: 0 }}>Skip the queue</p>
          </div>
        </div>
      </div>
      <TabBar go={go} active="Home" />
    </div>
  );
}

function S19({ go }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.purple }}>
      <Hdr onBack={() => go("s21")} />
      <div style={{ flex: 1, padding: "0 24px 36px", overflowY: "auto" }}>
        <WCard style={{ textAlign: "center" }}>
          <div style={{ width: 100, height: 100, borderRadius: 999, background: C.pl, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: "3px solid " + C.pd }}>
            <Ico name="hands" size={40} color={C.pd} />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: C.black, margin: "0 0 4px", fontFamily: ff }}>Charlie Goldsmith</h2>
          <p style={{ color: C.pd, fontSize: 13, fontWeight: 500, margin: "0 0 16px" }}>World-renowned energy healer</p>
          <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, margin: "0 0 20px", textAlign: "left" }}>
            Charlie Goldsmith is an internationally recognized energy healer whose abilities have been tested and validated in peer-reviewed clinical trials. He has been featured on major media outlets worldwide.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[["80%+", "Success rate"], ["10K+", "Sessions"], ["20+", "Countries"]].map(([v, l], i) => (
              <div key={i} style={{ background: C.pp, borderRadius: 14, padding: 12, textAlign: "center" }}>
                <p style={{ fontWeight: 700, fontSize: 18, margin: 0, color: C.pd }}>{v}</p>
                <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>{l}</p>
              </div>
            ))}
          </div>
          <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, margin: "0 0 20px", textAlign: "left" }}>
            Ennie was built by Charlie to make energy healing accessible to anyone, anywhere. Our test healers are put through a rigorous qualification process, and every session is tracked for effectiveness.
          </p>
          <div style={{ background: C.pp, borderRadius: 14, padding: 16, marginBottom: 20, textAlign: "left" }}>
            <p style={{ color: C.pd, fontSize: 12, fontWeight: 600, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 1 }}>Clinical evidence</p>
            <p style={{ color: C.black, fontSize: 14, lineHeight: 1.6, margin: 0 }}>A peer-reviewed study published in the Journal of Alternative and Complementary Medicine demonstrated statistically significant results from Charlie's energy healing sessions.</p>
          </div>
          <Btn onClick={() => go("s3")}>Try a free session</Btn>
        </WCard>
      </div>
    </div>
  );
}

function SSupport({ go }) {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  var faqs = [
    { q: "How does energy healing work?", a: "Energy healing works by directing healing energy to areas of the body experiencing symptoms. It's complementary and does not replace medical treatment." },
    { q: "Is my session really anonymous?", a: "Yes — your healer never sees your name, photo, or personal details. Communication is AI-mediated." },
    { q: "What if I don't feel anything?", a: "Not everyone feels a change during the session. Some people notice improvements hours or days later. We'll follow up with you." },
    { q: "How do I get a refund?", a: "Paid sessions are automatically refunded if no healer matches within the promised timeframe, or if a session fails." },
  ];
  const [openFaq, setOpenFaq] = useState(null);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.bg }}>
      <div style={{ background: C.pd, padding: "24px 24px 24px", borderRadius: "0 0 24px 24px" }}>
        <h2 style={{ color: C.white, fontWeight: 700, fontSize: 24, margin: 0, fontFamily: ff, letterSpacing: -0.5 }}>Support</h2>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 36px" }}>
        <p style={{ color: C.pd, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>FAQ</p>
        {faqs.map((f, i) => (
          <div key={i} onClick={() => { haptic(); setOpenFaq(openFaq === i ? null : i); }} style={{ background: openFaq === i ? C.pp : C.bg, borderRadius: 14, padding: 14, marginBottom: 8, cursor: "pointer", transition: "background 0.2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 500, fontSize: 14, color: C.black }}>{f.q}</span>
              <span style={{ color: C.pd, fontSize: 16, fontWeight: 600 }}>{openFaq === i ? "−" : "+"}</span>
            </div>
            {openFaq === i && <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.6, margin: "8px 0 0" }}>{f.a}</p>}
          </div>
        ))}
        <p style={{ color: C.pd, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, margin: "24px 0 12px" }}>Contact us</p>
        {!sent ? (
          <>
            <Inp value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Describe your issue..." style={{ marginBottom: 12 }} />
            <Btn disabled={!msg.trim()} onClick={() => { haptic("heavy"); setSent(true); }}>Send message</Btn>
          </>
        ) : (
          <div style={{ background: C.green + "18", borderRadius: 14, padding: 16, textAlign: "center" }}>
            <p style={{ color: C.green, fontWeight: 600, fontSize: 15, margin: "0 0 4px" }}>Message sent!</p>
            <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>We'll get back to you within 24 hours.</p>
          </div>
        )}
      </div>
      <TabBar go={go} active="Settings" />
    </div>
  );
}

function S23({ go }) {
  const [confirm, setConfirm] = useState(false);
  const [typed, setTyped] = useState("");
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
      <div style={{ background: C.red + "18", padding: "16px 24px 24px", borderRadius: "0 0 24px 24px" }}>
        <Hdr onBack={() => go("s20")} />
        <h2 style={{ color: C.red, fontWeight: 700, fontSize: 22, margin: 0, fontFamily: ff }}>Delete Account</h2>
      </div>
      <div style={{ flex: 1, padding: "28px 24px 36px" }}>
        {!confirm ? (
          <>
            <div style={{ background: C.red + "11", borderRadius: 14, padding: 16, marginBottom: 20 }}>
              <p style={{ color: C.red, fontWeight: 600, fontSize: 15, margin: "0 0 8px" }}>This action is permanent</p>
              <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.6, margin: 0 }}>Deleting your account will permanently remove all your data, session history, and preferences. This cannot be undone.</p>
            </div>
            <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>What you'll lose:</p>
            {["All session history and symptom data", "Your queue position and preferences", "Any remaining paid session credits"].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Ico name="close" size={12} color={C.red} />
                <span style={{ fontSize: 14, color: C.black }}>{item}</span>
              </div>
            ))}
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              <Btn onClick={() => { haptic("heavy"); setConfirm(true); }} style={{ background: C.red }}>I want to delete my account</Btn>
              <Btn primary={false} onClick={() => go("s20")}>Cancel — keep my account</Btn>
            </div>
          </>
        ) : (
          <>
            <p style={{ color: C.black, fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Type "DELETE" to confirm</p>
            <Inp value={typed} onChange={(e) => setTyped(e.target.value.toUpperCase())} placeholder="Type DELETE" style={{ marginBottom: 16 }} />
            <Btn disabled={typed !== "DELETE"} onClick={() => { haptic("heavy"); go("s1"); }} style={{ background: C.red }}>Permanently delete account</Btn>
          </>
        )}
      </div>
    </div>
  );
}

function AnimNum({ target, suffix }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    var start = 0;
    var end = typeof target === "number" ? target : parseFloat(target) || 0;
    var dur = 800;
    var t0 = Date.now();
    var frame = function () {
      var pct = Math.min(1, (Date.now() - t0) / dur);
      var ease = 1 - Math.pow(1 - pct, 3);
      setVal(Math.round(start + (end - start) * ease));
      if (pct < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [target]);
  return <>{val}{suffix || ""}</>;
}

function SAdmin({ go }) {
  var stats = { users: 1247, healers: 89, activeSessions: 12, avgChange: 3.4, successRate: 72 };
  const [expanded, setExpanded] = useState(null);
  var recent = [
    { id: "S-4821", case: "Neck 7→3", healer: "A7Q2", status: "Completed", time: "2:30 PM", dur: "5:00" },
    { id: "S-4820", case: "Back 6→2", healer: "B3K1", status: "Completed", time: "11:00 AM", dur: "5:00" },
    { id: "S-4819", case: "Shoulder 8→5", healer: "C9M4", status: "In progress", time: "4:15 PM", dur: "3:22" },
    { id: "S-4818", case: "Knee 5→3", healer: "A7Q2", status: "Completed", time: "9:45 AM", dur: "5:00" },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.bg }}>
      <div style={{ background: C.green, padding: "20px 24px 28px", borderRadius: "0 0 24px 24px" }}>
        <h2 style={{ color: C.white, fontWeight: 700, fontSize: 24, margin: "0 0 4px", fontFamily: ff }}>Admin Dashboard</h2>
        <p style={{ color: C.white, opacity: 0.8, fontSize: 13, margin: 0 }}>Ennie platform overview</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
          {[["Users", stats.users, ""], ["Healers", stats.healers, ""], ["Active now", stats.activeSessions, ""], ["Avg change", stats.avgChange, " pts"]].map(([l, v, suf], i) => (
            <div key={i} style={{ background: C.white, borderRadius: 18, padding: "18px 16px", textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
              <p style={{ fontWeight: 700, fontSize: 26, margin: 0, color: C.black, fontFamily: ff }}><AnimNum target={v} suffix={suf} /></p>
              <p style={{ fontSize: 12, color: C.muted, margin: "4px 0 0", fontWeight: 500 }}>{l}</p>
            </div>
          ))}
        </div>
        <div style={{ background: C.white, borderRadius: 18, padding: "18px 20px", marginBottom: 18, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>Platform success rate</span>
            <span style={{ fontWeight: 700, fontSize: 26, color: C.green, fontFamily: ff }}><AnimNum target={stats.successRate} suffix="%" /></span>
          </div>
          <div style={{ height: 8, background: C.bg, borderRadius: 999 }}>
            <div style={{ height: "100%", width: stats.successRate + "%", background: C.green, borderRadius: 999, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
          </div>
        </div>
        <p style={{ color: C.pd, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Recent sessions</p>
        {recent.map((s, i) => (
          <div key={i} onClick={() => { haptic(); setExpanded(expanded === i ? null : i); }} style={{ background: C.white, borderRadius: 16, padding: "14px 16px", marginBottom: 8, cursor: "pointer", boxShadow: "0 1px 6px rgba(0,0,0,0.03)", transition: "all 0.2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: 14, color: C.black }}>{s.id}</span>
                <p style={{ color: C.muted, fontSize: 12, margin: "3px 0 0" }}>{s.case} · {s.healer}</p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: s.status === "Completed" ? C.green : C.amber, background: (s.status === "Completed" ? C.green : C.amber) + "14", padding: "4px 12px", borderRadius: 999 }}>{s.status}</span>
            </div>
            {expanded === i && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + C.border, display: "flex", gap: 10 }}>
                <div style={{ flex: 1, background: C.bg, borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
                  <p style={{ color: C.muted, fontSize: 10, margin: "0 0 2px" }}>Time</p>
                  <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{s.time}</p>
                </div>
                <div style={{ flex: 1, background: C.bg, borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
                  <p style={{ color: C.muted, fontSize: 10, margin: "0 0 2px" }}>Duration</p>
                  <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{s.dur}</p>
                </div>
                <div style={{ flex: 1, background: C.bg, borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
                  <p style={{ color: C.muted, fontSize: 10, margin: "0 0 2px" }}>Healer</p>
                  <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{s.healer}</p>
                </div>
              </div>
            )}
          </div>
        ))}
        <Btn primary={false} onClick={() => go("s21")} style={{ marginTop: 12 }}>← Back</Btn>
      </div>
    </div>
  );
}

/* ===== SCREEN MAP ===== */
var SCREENS = {
  s1: { comp: S1, label: "1. Landing" },
  sLogin: { comp: SLogin, label: "1b. Login" },
  s2: { comp: S2, label: "2. Sign Up" },
  s3: { comp: S3, label: "3. Age Gate" },
  s4: { comp: S4, label: "4. Intake" },
  s6: { comp: S6, label: "6. Choose Your Session" },
  sq: { comp: SQueue, label: "6b. Queue" },
  s7: { comp: S7, label: "7. Ready Now" },
  s8: { comp: S8, label: "8. Symptom Confirm" },
  s9: { comp: S9, label: "9. Live Session" },
  s10: { comp: S10, label: "10. Session End" },
  s11: { comp: S11, label: "11. Follow-up" },
  s12: { comp: S12, label: "12. Healer Onboard" },
  s13: { comp: S13, label: "13. Healer Home" },
  s14: { comp: S14, label: "14. Match Notif" },
  s15: { comp: S15, label: "15. Healer Session" },
  s16: { comp: S16, label: "16. Healer Post-Session" },
  s17: { comp: S17, label: "17. Tier Selection" },
  s18: { comp: S18, label: "18. Payment" },
  s19: { comp: S19, label: "19. Charlie Reveal" },
  s20: { comp: S20, label: "20. Profile & Settings" },
  s21: { comp: S21, label: "21. Session History" },
  s22: { comp: S22, label: "21b. Activity" },
  sSupport: { comp: SSupport, label: "22. Support" },
  s23: { comp: S23, label: "23. Delete Account" },
  sAdmin: { comp: SAdmin, label: "Admin Dashboard" },
};

var GROUPS = [
  { title: "Case Journey", keys: ["s1", "sLogin", "s2", "s3", "s4", "s6", "sq", "s7", "s8", "s9", "s10", "s11"] },
  { title: "Healer Journey", keys: ["s12", "s13", "s14", "s15", "s16"] },
  { title: "Paid Sessions", keys: ["s17", "s18"] },
  { title: "Charlie Featured", keys: ["s19"] },
  { title: "Shared / Account", keys: ["s20", "s22", "sSupport", "s23"] },
  { title: "Admin", keys: ["sAdmin"] },
];

export default function ENNIEv1_3() {
  const [screen, setScreen] = useState("s1");
  const [nav, setNav] = useState(false);
  const [intakeData, setIntakeData] = useState({ area: "neck", duration: "two weeks", severity: "7", description: "" });
  var entry = SCREENS[screen] || SCREENS.s1;
  var Comp = entry.comp;
  var label = entry.label;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.bg, padding: 12, fontFamily: ff }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, width: 390 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: C.pd }}>Ennie™</span>
        <span style={{ color: C.muted, fontSize: 12, flex: 1, textAlign: "center" }}>{label}</span>
        <button onClick={() => setNav((n) => !n)} style={{ color: C.black, fontSize: 12, background: C.white, border: "1.5px solid " + C.border, borderRadius: 10, padding: "5px 14px", cursor: "pointer", fontFamily: ff, fontWeight: 500 }}>
          {nav ? "Close" : "All screens"}
        </button>
      </div>
      <div style={{ position: "relative", width: 390, height: 844, borderRadius: 48, overflow: "hidden", boxShadow: "0 20px 60px rgba(120,100,180,0.25)", border: "1px solid " + C.border }}>
        {nav ? (
          <div style={{ height: "100%", background: C.white, overflowY: "auto", padding: "60px 24px 24px" }}>
            <h2 style={{ fontWeight: 700, fontSize: 22, margin: "0 0 4px", color: C.black, fontFamily: ff }}>All screens</h2>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>ENNIE v1.3 — Original design</p>
            {GROUPS.map((g) => (
              <div key={g.title} style={{ marginBottom: 20 }}>
                <p style={{ color: C.pd, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>{g.title}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {g.keys.map((k) => (
                    <button key={k} onClick={() => { setScreen(k); setNav(false); }} style={{ padding: "8px 14px", borderRadius: 12, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: ff, background: screen === k ? C.black : C.white, color: screen === k ? C.white : C.black, border: "1.5px solid " + (screen === k ? C.black : C.border) }}>
                      {SCREENS[k].label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
            <Comp go={setScreen} intakeData={intakeData} setIntakeData={setIntakeData} />
          </div>
        )}
      </div>
      <div style={{ color: C.muted, fontSize: 11, marginTop: 10 }}>Interactive prototype · Ennie by Charlie Goldsmith</div>
    </div>
  );
}
