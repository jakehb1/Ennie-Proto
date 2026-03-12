import { useState, useEffect, useRef, useCallback } from "react";
import { speak, stopSpeaking } from "./tts.js";

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
  black: "#1A1A1A",
  muted: "#888888",
  light: "#aaaaaa",
  border: "#E0DCE8",
  pink: "#F8D4DE",
  green: "#34C759",
  red: "#FF3B30",
  amber: "#FF9500",
  bg: "#ECEDF7",
  yellow: "#F5D547",
  yl: "#FFDE59",
  yp: "#FFF3C4",
  yd: "#D4B52E",
};

const ff = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function Btn({ children, onClick, primary = true, disabled, style }) {
  return (
    <button
      disabled={disabled}
      onClick={(e) => { haptic(primary ? "heavy" : undefined); if (onClick) onClick(e); }}
      style={{
        width: "100%", padding: "16px 20px", borderRadius: 14,
        fontWeight: 600, fontSize: 16, cursor: disabled ? "default" : "pointer",
        fontFamily: ff, opacity: disabled ? 0.35 : 1,
        background: primary ? C.black : C.white,
        color: primary ? C.white : C.black,
        border: primary ? "none" : "1.5px solid " + C.black,
        boxShadow: "none", letterSpacing: 0.2, ...style,
      }}
    >
      {children}
    </button>
  );
}

function Inp({ value, onChange, placeholder, style, onKeyDown, label }) {
  return (
    <div style={{ width: "100%", ...style }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.black, marginBottom: 4, fontFamily: ff }}>{label}</label>}
      <input
        value={value} onChange={onChange} onKeyDown={onKeyDown}
        placeholder={placeholder}
        style={{
          width: "100%", boxSizing: "border-box", background: "transparent",
          border: "none", borderBottom: "1.5px solid " + C.border,
          padding: "10px 0", color: C.black, fontSize: 15,
          outline: "none", fontFamily: ff,
        }}
      />
    </div>
  );
}

function WCard({ children, style }) {
  return (
    <div style={{ background: C.white, borderRadius: 24, padding: 24, boxShadow: "0 2px 16px rgba(140,120,200,0.12)", ...style }}>
      {children}
    </div>
  );
}

function Hdr({ title, onBack }) {
  return (
    <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
      {onBack && (
        <button onClick={onBack} style={{ width: 32, height: 32, borderRadius: 999, background: C.black, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: C.white, fontSize: 14, fontWeight: 700 }}>✕</span>
        </button>
      )}
      {title && <span style={{ color: C.black, fontWeight: 700, fontSize: 16, fontFamily: ff }}>{title}</span>}
    </div>
  );
}

function Pill({ children, active, onClick, style }) {
  return (
    <button onClick={onClick} style={{ fontSize: 13, padding: "6px 16px", borderRadius: 999, fontWeight: 600, border: active ? "none" : "1.5px solid " + C.border, cursor: "pointer", fontFamily: ff, background: active ? C.black : C.white, color: active ? C.white : C.black, ...style }}>
      {children}
    </button>
  );
}

function Tag({ children }) {
  return <span style={{ fontSize: 11, background: C.pp, color: C.pd, borderRadius: 999, padding: "4px 12px", fontWeight: 600 }}>{children}</span>;
}

function Bubble({ text, from, typing }) {
  const isUser = from === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 10 }}>
      {!isUser && (
        <div style={{ width: 28, height: 28, borderRadius: 999, background: C.pp, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 8, flexShrink: 0, marginTop: 2 }}>
          <span style={{ color: C.pd, fontSize: 11, fontWeight: 800 }}>H</span>
        </div>
      )}
      <div style={{ maxWidth: "78%", borderRadius: 20, padding: "12px 16px", fontSize: 15, lineHeight: 1.5, fontFamily: ff, background: isUser ? C.black : C.white, color: isUser ? C.white : C.black, border: isUser ? "none" : "1px solid " + C.border, borderTopLeftRadius: isUser ? 20 : 4, borderTopRightRadius: isUser ? 4 : 20 }}>
        {!isUser && <p style={{ color: C.pd, fontSize: 10, fontWeight: 700, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: 1 }}>Healer</p>}
        {typing ? <span style={{ color: C.muted }}>...</span> : text}
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
        <span style={{ fontSize: size * 0.26, fontWeight: 800, color: urg ? C.red : C.black, fontFamily: ff }}>
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

function TabBar({ go, active }) {
  var items = [["🏠", "Home", "s21"], ["⊞", "Activity", "s21"], ["⚙️", "Settings", "s20"]];
  return (
    <div style={{ display: "flex", borderTop: "1px solid " + C.border, background: C.white }}>
      {items.map(function (item) {
        return (
          <div key={item[1]} onClick={() => go(item[2])} style={{ flex: 1, textAlign: "center", padding: "10px 0", cursor: "pointer" }}>
            <span style={{ fontSize: 18 }}>{item[0]}</span>
            <p style={{ fontSize: 10, color: active === item[1] ? C.black : C.muted, fontWeight: active === item[1] ? 700 : 400, margin: "2px 0 0" }}>{item[1]}</p>
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
    "Ennie is an app by world-renowned energy healer Charlie Goldsmith.",
    "Connect to a test energy healer, 100% remotely and anonymously.",
    "Rate your symptoms in real time during your session.",
  ];
  var next = useCallback(() => { setSlide((s) => (s + 1) % slides.length); haptic(); }, []);
  var prev = useCallback(() => { setSlide((s) => (s - 1 + slides.length) % slides.length); haptic(); }, []);
  var swipe = useSwipe(next, prev);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.purple }}>
      <Hdr onBack={() => {}} />
      <div style={{ padding: "0 24px", marginBottom: 8 }}>
        <p style={{ color: C.black, fontSize: 14, fontWeight: 500, margin: "0 0 4px", opacity: 0.7, fontFamily: ff }}>Suffering from pain?</p>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: C.black, lineHeight: 1.15, margin: 0, fontFamily: ff }}>Your energy healing journey begins here</h1>
      </div>
      <div style={{ flex: 1, padding: "12px 24px", display: "flex", flexDirection: "column" }}>
        <div {...swipe} style={{ background: C.white, borderRadius: 20, padding: 20, flex: 1, display: "flex", flexDirection: "column", border: "3px solid " + C.pd, boxShadow: "0 4px 24px rgba(100,80,200,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <button onClick={prev} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: C.black, padding: 4 }}>‹</button>
            <div style={{ background: C.black, borderRadius: 999, padding: "6px 14px", display: "flex", gap: 8 }}>
              {slides.map((_, i) => (
                <div key={i} style={{ width: i === slide ? 20 : 8, height: 8, borderRadius: 999, background: i === slide ? C.white : "rgba(255,255,255,0.3)", transition: "all 0.3s" }} />
              ))}
            </div>
            <button onClick={next} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: C.black, padding: 4 }}>›</button>
          </div>
          <p style={{ fontSize: 18, fontWeight: 600, color: C.black, textAlign: "center", lineHeight: 1.5, margin: "0 0 16px", fontFamily: ff, minHeight: 54 }}>{slides[slide]}</p>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <HandArt />
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 24px 32px", display: "flex", gap: 12 }}>
        <Btn onClick={() => go("s2")} style={{ flex: 1 }}>Join waitlist</Btn>
        <Btn primary={false} onClick={() => go("sLogin")} style={{ flex: 1 }}>Log in</Btn>
      </div>
    </div>
  );
}

function SelField({ label, value, onChange, options, style }) {
  return (
    <div style={{ width: "100%", ...style }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.black, marginBottom: 4, fontFamily: ff }}>{label}</label>
      <select value={value} onChange={onChange} style={{ width: "100%", boxSizing: "border-box", background: "transparent", border: "none", borderBottom: "1.5px solid " + C.border, padding: "10px 0", color: value ? C.black : C.muted, fontSize: 15, fontFamily: ff, outline: "none", appearance: "none", WebkitAppearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' fill='none' stroke-width='1.5'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 4px center" }}>
        <option value="">Select</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Chk({ checked, onChange, children }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: C.black, fontFamily: ff }}>
      <div onClick={(e) => { e.preventDefault(); onChange(!checked); }} style={{ width: 20, height: 20, borderRadius: 4, border: "1.5px solid " + C.border, background: checked ? C.black : C.white, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
        {checked && <span style={{ color: C.white, fontSize: 12, fontWeight: 700 }}>✓</span>}
      </div>
      <span>{children}</span>
    </label>
  );
}

function S2({ go }) {
  const [form, setForm] = useState({ first: "", last: "", gender: "", dob: "", email: "", country: "" });
  const [privacy, setPrivacy] = useState(false);
  const [terms, setTerms] = useState(false);
  var valid = form.first && form.last && form.email && privacy && terms;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
      <div style={{ background: C.purple, padding: "12px 20px 20px" }}>
        <button onClick={() => go("s1")} style={{ width: 32, height: 32, borderRadius: 999, background: C.black, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
          <span style={{ color: C.white, fontSize: 14, fontWeight: 700 }}>✕</span>
        </button>
        <p style={{ color: C.black, fontSize: 13, margin: "0 0 2px", opacity: 0.7, fontFamily: ff }}>Let's get you set up</p>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: C.black, margin: 0, fontFamily: ff }}>Add your details</h2>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 32px" }}>
        <Inp label="First Name" value={form.first} onChange={(e) => setForm((f) => ({ ...f, first: e.target.value }))} placeholder="Enter" style={{ marginBottom: 20 }} />
        <Inp label="Last Name" value={form.last} onChange={(e) => setForm((f) => ({ ...f, last: e.target.value }))} placeholder="Enter" style={{ marginBottom: 20 }} />
        <SelField label="Gender" value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} options={["Male", "Female"]} style={{ marginBottom: 20 }} />
        <Inp label="Date of birth" value={form.dob} onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))} placeholder="Select a date" style={{ marginBottom: 20 }} />
        <Inp label="Add your email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Enter" style={{ marginBottom: 20 }} />
        <SelField label="Country" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} options={["Australia", "United States", "United Kingdom", "Canada", "New Zealand", "Other"]} style={{ marginBottom: 24 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          <Chk checked={privacy} onChange={setPrivacy}>I agree to the <u>Privacy Policy</u></Chk>
          <Chk checked={terms} onChange={setTerms}>I accept the <u>Terms and Conditions</u></Chk>
        </div>
        <Btn disabled={!valid} onClick={() => go("s3")}>Next</Btn>
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
          <span style={{ color: C.white, fontSize: 14, fontWeight: 700 }}>✕</span>
        </button>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: C.black, margin: 0, fontFamily: ff }}>Log in to Ennie</h2>
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
  const [dob, setDob] = useState({ day: "", month: "", year: "" });
  const dobValid = dob.day && dob.month && dob.year && dob.year.length === 4;
  const getAge = () => {
    if (!dobValid) return 0;
    var bd = new Date(Number(dob.year), Number(dob.month) - 1, Number(dob.day));
    var diff = Date.now() - bd.getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  };
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.purple }}>
      <Hdr onBack={() => step > 0 ? setStep(s => s - 1) : go("s2")} />
      <div style={{ flex: 1, padding: "0 20px 32px" }}>
        <WCard style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          {step === 0 ? (
            <>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: C.black, lineHeight: 1.2, margin: "0 0 8px", fontFamily: ff }}>Date of birth</h2>
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>We need this to verify your age</p>
              <div style={{ display: "flex", gap: 10, width: "100%", marginBottom: 16 }}>
                <Inp value={dob.day} onChange={(e) => setDob(d => ({ ...d, day: e.target.value.replace(/\D/g, "").slice(0, 2) }))} placeholder="DD" style={{ flex: 1, textAlign: "center" }} />
                <Inp value={dob.month} onChange={(e) => setDob(d => ({ ...d, month: e.target.value.replace(/\D/g, "").slice(0, 2) }))} placeholder="MM" style={{ flex: 1, textAlign: "center" }} />
                <Inp value={dob.year} onChange={(e) => setDob(d => ({ ...d, year: e.target.value.replace(/\D/g, "").slice(0, 4) }))} placeholder="YYYY" style={{ flex: 2, textAlign: "center" }} />
              </div>
              <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.5, margin: "0 0 20px" }}>ENNIE is not a medical service. Energy healing is complementary — it does not replace professional medical advice, diagnosis, or treatment.</p>
              <Btn disabled={!dobValid || getAge() < 13} onClick={() => setStep(1)}>{!dobValid ? "Enter your date of birth" : getAge() < 13 ? "You must be 13 or older" : "Continue"}</Btn>
            </>
          ) : step === 1 ? (
            <>
              <div style={{ width: 48, height: 48, borderRadius: 999, border: "2px solid " + C.black, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <span style={{ fontSize: 22, fontWeight: 700 }}>!</span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: C.black, lineHeight: 1.2, margin: "0 0 16px", fontFamily: ff }}>Are you in a medical emergency?</h2>
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>ENNIE is not suitable for emergencies. If you need urgent help, please call your local emergency services.</p>
              <Btn onClick={() => setStep(2)}>No — not an emergency</Btn>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: C.black, margin: "0 0 12px", fontFamily: ff }}>Do you have active symptoms right now?</h2>
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>Free sessions require symptoms you can rate in real time during the session.</p>
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

function S4({ go }) {
  const [msgs, setMsgs] = useState([{ from: "ai", text: "Hi, I'm Ennie. What's been going on with your body today?" }]);
  const [pins, setPins] = useState([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mode, setMode] = useState("voice");
  const sr = useRef(null);

  const rep = ["Show me on the body map where you feel it.", "Got it. How long has this been going on?", "Set the severity — 0 to 10.", "Sounds like chronic pain. Does that feel right?", "You qualify for a free session."];

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMsgs((m) => [...m, { from: "user", text: msg }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      var reply = rep[step] || "Thanks.";
      setMsgs((m) => [...m, { from: "ai", text: reply }]);
      speak(reply);
      if (step === 0) setShowMap(true);
      setStep((s) => s + 1);
    }, 800);
  };

  const addPin = (pin) => {
    setPins((p) => [...p, pin]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      var reply = rep[Math.min(step + 1, rep.length - 1)];
      setMsgs((m) => [...m, { from: "ai", text: reply }]);
      speak(reply);
      setStep((s) => Math.max(s, 2));
    }, 600);
  };

  const simV = () => {
    var responses = ["My neck is really sore", "About two weeks", "Around a 7", "Yeah that sounds right", "OK let's do it"];
    send(responses[step] || "Yes");
  };

  useEffect(() => {
    if (sr.current) sr.current.scrollTop = sr.current.scrollHeight;
  }, [msgs, typing]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.purple }}>
      <Hdr title="Intake" onBack={() => go("s3")} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.white, borderRadius: "24px 24px 0 0", overflow: "hidden" }}>
        {mode === "voice" && !showMap && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, flex: 1 }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: C.black, marginBottom: 24, fontFamily: ff }}>Processing...</p>
            <div style={{ width: 140, height: 140, borderRadius: 999, background: C.pp, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 24, opacity: 0.4 }}>🎙</span>
            </div>
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
            <Btn onClick={() => { if (step >= 5) go("s6"); else simV(); }} style={{ fontSize: 14 }}>
              {step >= 5 ? "Continue →" : "Tap to simulate voice"}
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}

function S6({ go }) {
  const [sel, setSel] = useState(null);
  var tiers = [
    { id: 0, name: "Free", price: "FREE", wait: "~3 mins", rate: "40%", detail: "50% reduction", type: "Test healer", bg: C.pp },
    { id: 1, name: "Standard", price: "$50", wait: "~4 weeks", rate: "70%", detail: "90% reduction", type: "Qualified", bg: C.white },
    { id: 2, name: "Priority", price: "$150", wait: "~7 days", rate: "70%", detail: "90% reduction", type: "Qualified", bg: C.white, badge: "Popular" },
    { id: 3, name: "Immediate", price: "$350", wait: "~10 mins", rate: "70%", detail: "90% reduction", type: "Qualified", bg: C.pink, badge: "Fastest" },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.purple }}>
      <Hdr onBack={() => go("s4")} />
      <div style={{ padding: "0 20px 8px" }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: C.black, margin: "0 0 4px", fontFamily: ff }}>Choose your session</h2>
        <p style={{ color: C.black, opacity: 0.6, fontSize: 13, margin: 0 }}>Free = test healers · Paid = qualified healers</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {tiers.map((t) => (
          <div key={t.id} onClick={() => setSel(t.id)} style={{ background: t.bg, borderRadius: 20, padding: 20, cursor: "pointer", position: "relative", border: sel === t.id ? "3px solid " + C.black : "1px solid " + C.border, boxShadow: sel === t.id ? "0 4px 20px rgba(0,0,0,0.1)" : "0 2px 16px rgba(140,120,200,0.12)" }}>
            {t.badge && <span style={{ position: "absolute", top: 12, right: 16, fontSize: 10, fontWeight: 700, background: C.black, color: C.white, padding: "2px 10px", borderRadius: 999 }}>{t.badge}</span>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: C.black, fontFamily: ff }}>{t.name}</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: t.price === "FREE" ? C.green : C.black, fontFamily: ff }}>{t.price}</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: C.muted }}>Wait: <strong style={{ color: C.black }}>{t.wait}</strong></span>
              <span style={{ fontSize: 12, color: C.muted }}>Success: <strong style={{ color: C.green }}>{t.rate}</strong> report {t.detail}</span>
            </div>
            <span style={{ fontSize: 12, color: C.muted }}>{t.type}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "12px 20px 28px" }}>
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
      <div style={{ flex: 1, padding: "0 20px 32px" }}>
        <WCard style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: 999, background: C.pp, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <span style={{ fontSize: 36 }}>⏳</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.black, margin: "0 0 8px", fontFamily: ff }}>You're in the queue</h2>
          <p style={{ color: C.muted, fontSize: 16, marginBottom: 28 }}>Approx 10–20 mins</p>
          <div style={{ background: C.pp, borderRadius: 16, padding: "16px 20px", marginBottom: 24, minHeight: 70, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: C.pd, fontSize: 14, fontWeight: 600, margin: 0, lineHeight: 1.5 }}>{tips[tipIdx]}</p>
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
            <span style={{ fontSize: 36 }}>✨</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.black, margin: "0 0 8px", fontFamily: ff }}>It's nearly your turn</h2>
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
      <div style={{ flex: 1, padding: "0 20px 32px", overflowY: "auto" }}>
        <WCard>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.black, margin: "0 0 16px", fontFamily: ff }}>Still feeling these?</h2>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><BMap pins={pins} readonly small /></div>
          {Object.entries(scores).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 700, textTransform: "capitalize", fontSize: 15 }}>{k} pain</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: C.pd }}>{v}/10</span>
              </div>
              <input type="range" min="0" max="10" value={v} onChange={(e) => setScores((s) => ({ ...s, [k]: Number(e.target.value) }))} style={{ width: "100%", accentColor: C.pd }} />
            </div>
          ))}
          <Btn onClick={() => go("s9")}>I'm ready — start now</Btn>
        </WCard>
      </div>
    </div>
  );
}

function S9({ go }) {
  const TOTAL = 300;
  const [sec, setSec] = useState(TOTAL);
  const [mode, setMode] = useState("voice");
  const [input, setInput] = useState("");
  const [sp, setSp] = useState("healer");
  const [round, setRound] = useState(1);
  const sr = useRef(null);
  const [wf, setWf] = useState(0);
  const [pins, setPins] = useState([{ x: 47, y: 22, side: "front", score: 7, label: "Neck" }, { x: 55, y: 38, side: "front", score: 5, label: "Back" }]);
  const [msgs, setMsgs] = useState([{ from: "system", text: "Round 1 · Session started" }, { from: "healer", text: "Hi. Neck at 7, back at 5. Is the neck pain more left or right?" }]);
  const [lastH, setLastH] = useState("Is the neck pain more left or right?");

  useEffect(() => { speak("Hi. Neck at 7, back at 5. Is the neck pain more left or right?"); return () => stopSpeaking(); }, []);

  var fups = [{ at: 260, text: "Sharp or dull ache?" }, { at: 220, text: "When did it start?" }, { at: 180, text: "Working on it now. Let me know if anything shifts." }, { at: 130, text: "How's the neck now vs when we started?" }];

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
            <p style={{ color: C.black, fontWeight: 800, fontSize: 15, margin: 0, fontFamily: ff }}>Round {round}</p>
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
                      <p style={{ color: C.black, fontWeight: 800, fontSize: 22, margin: 0 }}>{p.score}<span style={{ fontSize: 13, fontWeight: 500, color: C.muted }}>/10</span></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding: "16px 20px", borderTop: "1px solid " + C.border, background: C.pp + "44" }}>
              <WaveBars count={24} maxH={24} active={sp !== "idle"} color={sp === "healer" ? C.pd : C.green} frame={wf} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 999, background: sp !== "idle" ? C.green : C.light }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: sp === "healer" ? C.pd : sp === "user" ? C.green : C.muted }}>
                  {sp === "healer" ? "Healer speaking" : sp === "user" ? "You" : "Live — speak anytime"}
                </span>
              </div>
              {sp === "healer" && <p style={{ color: C.muted, fontSize: 13, textAlign: "center", margin: "6px 0 0", fontStyle: "italic" }}>"{lastH}"</p>}
            </div>
            <div style={{ padding: "10px 16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => { setSec(TOTAL); setRound((r) => r + 1); setPins((p) => p.map((pin) => ({ ...pin, score: Math.max(1, pin.score - 2) }))); setMsgs((m) => [...m, { from: "system", text: "Round " + (round + 1) + " · Improvement detected" }, { from: "healer", text: "Good — I felt that. Continuing." }]); }} style={{ width: "100%", padding: "14px 20px", borderRadius: 14, background: C.green, border: "none", cursor: "pointer", fontFamily: ff, fontWeight: 700, fontSize: 15, color: C.white }}>I feel a change</button>
              <div style={{ display: "flex", gap: 8 }}>
                <div onClick={simV} style={{ flex: 1, padding: 12, borderRadius: 14, border: "1.5px solid " + C.border, textAlign: "center", cursor: "pointer" }}>
                  <span style={{ color: C.muted, fontSize: 13 }}>Simulate voice</span>
                </div>
                <button onClick={() => go("s10")} style={{ padding: "0 16px", borderRadius: 14, background: C.pp, border: "none", cursor: "pointer", fontFamily: ff, fontWeight: 700, fontSize: 13, color: C.black }}>End</button>
                <button onClick={() => { setMsgs((m) => [...m, { from: "system", text: "If this is a medical emergency, call your local emergency number. ENNIE is not a medical service." }]); }} style={{ padding: "0 12px", borderRadius: 14, background: C.white, border: "1.5px solid " + C.red, cursor: "pointer", fontFamily: ff, fontWeight: 600, fontSize: 11, color: C.red }}>Help</button>
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
                    <span style={{ fontWeight: 800, color: C.black }}>{p.score}/10</span>
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
                <button onClick={() => { setSec(TOTAL); setRound((r) => r + 1); setPins((p) => p.map((pin) => ({ ...pin, score: Math.max(1, pin.score - 2) }))); setMsgs((m) => [...m, { from: "system", text: "Round " + (round + 1) + " · Improvement detected" }, { from: "healer", text: "Good — I felt that. Continuing." }]); }} style={{ flex: 1, padding: "10px 14px", borderRadius: 14, background: C.green, border: "none", cursor: "pointer", fontFamily: ff, fontWeight: 700, fontSize: 13, color: C.white }}>I feel a change</button>
                <button onClick={() => go("s10")} style={{ padding: "0 14px", borderRadius: 14, background: C.pp, border: "none", cursor: "pointer", fontFamily: ff, fontWeight: 700, fontSize: 12, color: C.black }}>End</button>
                <button onClick={() => { setMsgs((m) => [...m, { from: "system", text: "If this is a medical emergency, call your local emergency number. ENNIE is not a medical service." }]); }} style={{ padding: "0 12px", borderRadius: 14, background: C.white, border: "1.5px solid " + C.red, cursor: "pointer", fontFamily: ff, fontWeight: 600, fontSize: 11, color: C.red }}>Help</button>
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
            <span style={{ fontSize: 28 }}>✨</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.black, margin: "0 0 6px", fontFamily: ff }}>Session complete</h2>
          <p style={{ color: C.muted, fontSize: 14, margin: "0 0 20px" }}>Thank you for your session. Here's how your symptoms changed.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 16 }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: C.muted, fontSize: 11, fontWeight: 700, margin: "0 0 4px", textTransform: "uppercase" }}>Before</p>
              <BMap pins={befPins} readonly small />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: C.green, fontSize: 11, fontWeight: 700, margin: "0 0 4px", textTransform: "uppercase" }}>After</p>
              <BMap pins={aftPins} readonly small />
            </div>
          </div>
          {befPins.map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid " + C.border + "22" }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>{p.label}</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: C.muted }}>{p.score}</span>
                <span style={{ color: C.light }}>→</span>
                <span style={{ color: C.green, fontWeight: 800, fontSize: 18 }}>{aftPins[i].score}</span>
              </div>
            </div>
          ))}
          <div style={{ background: C.pp, borderRadius: 14, padding: 14, margin: "16px 0" }}>
            <p style={{ color: C.pd, fontSize: 14, fontWeight: 600, margin: "0 0 8px" }}>How are you feeling overall?</p>
            {!feeling ? (
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                {["Much better", "A little better", "About the same"].map((f) => (
                  <button key={f} onClick={() => setFeeling(f)} style={{ padding: "8px 12px", borderRadius: 12, border: "1.5px solid " + C.pd, background: C.white, cursor: "pointer", fontFamily: ff, fontSize: 12, fontWeight: 600, color: C.pd }}>{f}</button>
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
            <p style={{ color: C.green, fontWeight: 600, fontSize: 14 }}>✓ Thank you sent</p>
          )}
          <Btn onClick={() => go("s21")}>Return home</Btn>
        </WCard>
      </div>
    </div>
  );
}

function S12({ go }) {
  const [slide, setSlide] = useState(0);
  var slides = [
    "Are you ready to transform lives for the better?",
    "Ennie makes energy healing accessible to anyone, anywhere.",
    "We securely connect test energy healers and users, protecting your data and privacy and conducting testing to ensure our test energy healers remain effective based on user feedback.",
  ];
  var next = useCallback(() => { setSlide((s) => (s + 1) % slides.length); haptic(); }, []);
  var prev = useCallback(() => { setSlide((s) => (s - 1 + slides.length) % slides.length); haptic(); }, []);
  var swipe = useSwipe(next, prev);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.yellow }}>
      <Hdr onBack={() => go("s1")} />
      <div style={{ padding: "0 24px", marginBottom: 8 }}>
        <p style={{ color: C.black, fontSize: 14, fontWeight: 500, margin: "0 0 4px", opacity: 0.7, fontFamily: ff }}>For test energy healers</p>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: C.black, lineHeight: 1.15, margin: 0, fontFamily: ff }}>Energy healing begins here</h1>
      </div>
      <div style={{ flex: 1, padding: "12px 24px", display: "flex", flexDirection: "column" }}>
        <div {...swipe} style={{ background: C.white, borderRadius: 20, padding: 20, flex: 1, display: "flex", flexDirection: "column", border: "3px solid " + C.yd, boxShadow: "0 4px 24px rgba(200,180,40,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <button onClick={prev} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: C.black, padding: 4 }}>‹</button>
            <div style={{ background: C.black, borderRadius: 999, padding: "6px 14px", display: "flex", gap: 8 }}>
              {slides.map((_, i) => (
                <div key={i} style={{ width: i === slide ? 20 : 8, height: 8, borderRadius: 999, background: i === slide ? C.white : "rgba(255,255,255,0.3)", transition: "all 0.3s" }} />
              ))}
            </div>
            <button onClick={next} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: C.black, padding: 4 }}>›</button>
          </div>
          <p style={{ fontSize: 16, fontWeight: 600, color: C.black, textAlign: "center", lineHeight: 1.5, margin: "0 0 16px", fontFamily: ff, minHeight: 54 }}>{slides[slide]}</p>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <HandArt />
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 24px 32px", display: "flex", gap: 12 }}>
        <Btn onClick={() => go("sHReg")} style={{ flex: 1 }}>Join waitlist</Btn>
        <Btn primary={false} onClick={() => go("sHLogin")} style={{ flex: 1 }}>Log in</Btn>
      </div>
    </div>
  );
}

function SHReg({ go }) {
  const [form, setForm] = useState({ first: "", last: "", gender: "", dob: "", email: "", country: "" });
  const [privacy, setPrivacy] = useState(false);
  const [terms, setTerms] = useState(false);
  var valid = form.first && form.last && form.email && privacy && terms;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
      <div style={{ background: C.yellow, padding: "12px 20px 20px" }}>
        <button onClick={() => go("s12")} style={{ width: 32, height: 32, borderRadius: 999, background: C.black, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
          <span style={{ color: C.white, fontSize: 14, fontWeight: 700 }}>✕</span>
        </button>
        <p style={{ color: C.black, fontSize: 13, margin: "0 0 2px", opacity: 0.7, fontFamily: ff }}>Let's get you set up</p>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: C.black, margin: 0, fontFamily: ff }}>Add your details</h2>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 32px" }}>
        <Inp label="First Name" value={form.first} onChange={(e) => setForm((f) => ({ ...f, first: e.target.value }))} placeholder="Enter" style={{ marginBottom: 20 }} />
        <Inp label="Last Name" value={form.last} onChange={(e) => setForm((f) => ({ ...f, last: e.target.value }))} placeholder="Enter" style={{ marginBottom: 20 }} />
        <SelField label="Gender" value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} options={["Male", "Female"]} style={{ marginBottom: 20 }} />
        <Inp label="Date of birth" value={form.dob} onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))} placeholder="Select a date" style={{ marginBottom: 20 }} />
        <Inp label="Add your email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Enter" style={{ marginBottom: 20 }} />
        <SelField label="Country" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} options={["Australia", "United States", "United Kingdom", "Canada", "New Zealand", "Other"]} style={{ marginBottom: 24 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          <Chk checked={privacy} onChange={setPrivacy}>I agree to the <u>Privacy Policy</u></Chk>
          <Chk checked={terms} onChange={setTerms}>I accept the <u>Terms and Conditions</u></Chk>
        </div>
        <Btn disabled={!valid} onClick={() => go("s13")}>Next</Btn>
      </div>
    </div>
  );
}

function SHLogin({ go }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
      <div style={{ background: C.yellow, padding: "12px 20px 20px" }}>
        <button onClick={() => go("s12")} style={{ width: 32, height: 32, borderRadius: 999, background: C.black, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
          <span style={{ color: C.white, fontSize: 14, fontWeight: 700 }}>✕</span>
        </button>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: C.black, margin: 0, fontFamily: ff }}>Log in to Ennie</h2>
      </div>
      <div style={{ flex: 1, padding: "32px 24px" }}>
        <Inp label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter" style={{ marginBottom: 24 }} />
        <Inp label="Password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Enter" style={{ marginBottom: 32 }} />
        <Btn onClick={() => go("s13")}>Log in</Btn>
        <p onClick={() => {}} style={{ color: C.black, fontSize: 14, textAlign: "center", marginTop: 20, cursor: "pointer", textDecoration: "underline", fontFamily: ff }}>Forgot password?</p>
      </div>
    </div>
  );
}

function HTag({ children }) {
  return <span style={{ fontSize: 11, background: C.yp, color: C.yd, borderRadius: 999, padding: "4px 12px", fontWeight: 600 }}>{children}</span>;
}

function S13({ go }) {
  const [on, setOn] = useState(false);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
      <div style={{ background: C.yellow, padding: "16px 24px 24px", borderRadius: "0 0 24px 24px" }}>
        <h2 style={{ color: C.black, fontWeight: 800, fontSize: 22, margin: 0, fontFamily: ff }}>Healer dashboard</h2>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 32px" }}>
        <div style={{ background: on ? C.yp : C.white, border: "1.5px solid " + (on ? C.yd : C.border), borderRadius: 20, padding: 20, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontWeight: 700, margin: 0, fontSize: 15 }}>{on ? "You're online" : "You're offline"}</p>
              <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{on ? "Accepting sessions" : "Toggle to start"}</p>
            </div>
            <button onClick={() => setOn((o) => !o)} style={{ width: 52, height: 28, borderRadius: 999, background: on ? C.black : C.border, position: "relative", border: "none", cursor: "pointer" }}>
              <div style={{ width: 22, height: 22, background: C.white, borderRadius: 999, position: "absolute", top: 3, left: on ? 27 : 3, transition: "all 0.3s" }} />
            </button>
          </div>
          {on && <Btn onClick={() => go("s14")} style={{ marginTop: 14, fontSize: 14 }}>Simulate incoming case →</Btn>}
        </div>
        <div style={{ background: C.yp, borderRadius: 20, padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Qualification</span>
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
              <p style={{ fontWeight: 900, fontSize: 20, margin: 0, color: C.yd }}>{v}</p>
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
      <div style={{ flex: 1, padding: "0 20px 32px" }}>
        <WCard style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.black, margin: "0 0 4px", fontFamily: ff }}>Incoming case</h2>
          <p style={{ color: C.muted, fontSize: 13, margin: "0 0 16px" }}>Session starts in {countdown}s</p>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <BMap pins={[{ x: 47, y: 22, side: "front", score: 7 }, { x: 55, y: 38, side: "front", score: 5 }]} readonly small />
            <div style={{ flex: 1 }}>
              <div style={{ background: C.yp, borderRadius: 12, padding: 12, marginBottom: 8 }}>
                <p style={{ color: C.muted, fontSize: 11, margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase" }}>Category</p>
                <p style={{ color: C.black, fontWeight: 700, fontSize: 15, margin: 0 }}>Chronic pain</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[["Neck", 7], ["Back", 5]].map(([label, score]) => (
                  <div key={label} style={{ background: C.yp, borderRadius: 10, padding: "6px 12px", flex: 1 }}>
                    <p style={{ color: C.muted, fontSize: 11, margin: 0 }}>{label}</p>
                    <p style={{ color: C.black, fontWeight: 800, fontSize: 18, margin: 0 }}>{score}<span style={{ fontSize: 12, color: C.muted }}>/10</span></p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ background: C.yp, borderRadius: 14, padding: 14 }}>
            <p style={{ color: C.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", margin: "0 0 4px" }}>AI summary</p>
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
            <p style={{ color: C.yd, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>AI Audio — work eyes-closed</p>
            <WaveBars count={20} maxH={20} active color={C.yd} frame={wf} />
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
            <div style={{ flex: 1, padding: 12, borderRadius: 14, border: "1.5px solid " + C.border, textAlign: "center" }}>
              <span style={{ color: C.muted, fontSize: 13 }}>Listening... speak to AI mediator</span>
            </div>
          )}
          <button onClick={() => go("s16")} style={{ padding: "0 16px", height: 42, borderRadius: 14, background: C.yp, border: "none", cursor: "pointer", fontFamily: ff, fontWeight: 700, fontSize: 13, color: C.black }}>End</button>
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
      <div style={{ flex: 1, padding: "0 20px 32px", overflowY: "auto" }}>
        <WCard>
          <div style={{ width: 60, height: 60, borderRadius: 999, background: C.yp, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <span style={{ fontSize: 28 }}>✨</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.black, margin: "0 0 6px", textAlign: "center", fontFamily: ff }}>Session complete</h2>
          <p style={{ color: C.muted, fontSize: 14, textAlign: "center", margin: "0 0 20px" }}>Here's how the case responded</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            {[["Neck", 7, 3], ["Back", 5, 2]].map(([label, before, after]) => (
              <div key={label} style={{ flex: 1, background: C.yp, borderRadius: 14, padding: 14, textAlign: "center" }}>
                <p style={{ color: C.muted, fontSize: 12, margin: "0 0 4px" }}>{label}</p>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
                  <span style={{ color: C.muted, fontSize: 16 }}>{before}</span>
                  <span style={{ color: C.light, fontSize: 12 }}>→</span>
                  <span style={{ color: C.green, fontWeight: 800, fontSize: 20 }}>{after}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[["19", "Sessions"], ["74%", "Change rate"], ["3.2", "Avg score"]].map(([v, l], i) => (
              <div key={i} style={{ background: C.white, border: "1px solid " + C.border, borderRadius: 14, padding: 12, textAlign: "center" }}>
                <p style={{ fontWeight: 900, fontSize: 18, margin: 0, color: C.yd }}>{v}</p>
                <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>{l}</p>
              </div>
            ))}
          </div>
          <Inp placeholder="Optional notes (private)" style={{ marginBottom: 16 }} />
          {!ready ? (
            <Btn onClick={() => setReady(true)}>Ready for another session?</Btn>
          ) : (
            <div style={{ textAlign: "center" }}>
              <p style={{ color: C.green, fontWeight: 700, fontSize: 15, margin: "0 0 12px" }}>You're back online</p>
              <Btn primary={false} onClick={() => go("s13")}>Go to dashboard</Btn>
            </div>
          )}
        </WCard>
      </div>
    </div>
  );
}

function S17({ go }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.purple }}>
      <Hdr onBack={() => go("s3")} />
      <div style={{ flex: 1, padding: "0 20px 32px" }}>
        <WCard style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 12px", fontFamily: ff }}>No active symptoms?</h2>
          <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>Free sessions require symptoms you can rate in real time. You can book a paid session with a qualified healer instead.</p>
          <Btn onClick={() => go("s6")}>Browse paid sessions</Btn>
        </WCard>
      </div>
    </div>
  );
}

function S18({ go }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.purple }}>
      <Hdr title="Payment" onBack={() => go("s6")} />
      <div style={{ flex: 1, padding: "0 20px 32px" }}>
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
      <div style={{ background: C.purple, padding: "16px 24px 24px", borderRadius: "0 0 24px 24px" }}>
        <h2 style={{ color: C.black, fontWeight: 800, fontSize: 22, margin: 0, fontFamily: ff }}>Settings</h2>
      </div>
      <div style={{ flex: 1, padding: "16px 20px", overflowY: "auto" }}>
        {settingsConfig.map((item) => (
          <div key={item.key} style={{ padding: "12px 0", borderBottom: "1px solid " + C.border }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.muted, margin: "0 0 6px" }}>{item.key}</p>
            <select value={values[item.key]} onChange={(e) => setValues((v) => ({ ...v, [item.key]: e.target.value }))} style={selStyle}>
              {item.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <div style={{ padding: "16px 0", cursor: "pointer" }} onClick={() => go("s1")}>
          <span style={{ fontSize: 15, fontWeight: 500, color: C.red }}>Delete account</span>
        </div>
        <Btn onClick={() => go("s21")} style={{ marginTop: 16 }}>Save & return home</Btn>
      </div>
      <TabBar go={go} active="Settings" />
    </div>
  );
}

function S21({ go }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
      <div style={{ background: C.purple, padding: "16px 24px 24px", borderRadius: "0 0 24px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: C.pl, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 14 }}>🤲</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: C.black, fontFamily: ff }}>Ennie™</span>
        </div>
        <h2 style={{ color: C.black, fontWeight: 800, fontSize: 22, margin: "0 0 4px", fontFamily: ff }}>Your energy healing journey</h2>
        <p style={{ color: C.black, opacity: 0.6, fontSize: 14, margin: 0 }}>At a glance</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16, overflowX: "auto" }}>
          {["Unlimited free sessions with test healers", "Rate symptoms in real time"].map((t, i) => (
            <div key={i} style={{ minWidth: 200, background: C.pp, borderRadius: 16, padding: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 999, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12 }}>💡</span>
              </div>
              <p style={{ fontSize: 13, color: C.black, margin: 0, lineHeight: 1.4 }}>{t}</p>
            </div>
          ))}
        </div>
        <div onClick={() => go("s3")} style={{ background: C.pl, borderRadius: 20, padding: "28px 20px", marginBottom: 12, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, margin: 0, fontFamily: ff }}>Start an energy<br />healing session</h3>
          <span style={{ fontSize: 24 }}>→</span>
        </div>
        <div onClick={() => go("s20")} style={{ background: C.pink, borderRadius: 20, padding: 20, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, fontFamily: ff }}>How Ennie Works</h3>
          <span style={{ fontSize: 20 }}>→</span>
        </div>
      </div>
      <TabBar go={go} active="Home" />
    </div>
  );
}

/* ===== SCREEN MAP ===== */
var SCREENS = {
  s1: { comp: S1, label: "1. Landing" },
  sLogin: { comp: SLogin, label: "1b. Login" },
  s2: { comp: S2, label: "2. Sign Up" },
  s3: { comp: S3, label: "3. Age Gate & DOB" },
  s4: { comp: S4, label: "4. Intake" },
  s6: { comp: S6, label: "5. Choose Session" },
  sq: { comp: SQueue, label: "6. Queue" },
  s7: { comp: S7, label: "7. Ready Now" },
  s8: { comp: S8, label: "8. Symptom Confirm" },
  s9: { comp: S9, label: "9. Live Session" },
  s10: { comp: S10, label: "10. Session End" },
  s12: { comp: S12, label: "12. Healer Landing" },
  sHReg: { comp: SHReg, label: "12b. Healer Sign Up" },
  sHLogin: { comp: SHLogin, label: "12c. Healer Login" },
  s13: { comp: S13, label: "13. Healer Dashboard" },
  s14: { comp: S14, label: "14. Match Notification" },
  s15: { comp: S15, label: "15. Healer Session" },
  s16: { comp: S16, label: "16. Healer Post-Session" },
  s17: { comp: S17, label: "17. No Symptoms" },
  s18: { comp: S18, label: "18. Payment" },
  s20: { comp: S20, label: "20. Settings" },
  s21: { comp: S21, label: "21. Home" },
};

var GROUPS = [
  { title: "Case Journey", keys: ["s1", "sLogin", "s2", "s3", "s4", "s6", "sq", "s7", "s8", "s9", "s10"] },
  { title: "Healer", keys: ["s12", "sHReg", "sHLogin", "s13", "s14", "s15", "s16"] },
  { title: "Other", keys: ["s17", "s18", "s20", "s21"] },
];

export default function ENNIEv1_3() {
  const [screen, setScreen] = useState("s1");
  const [nav, setNav] = useState(false);
  var entry = SCREENS[screen] || SCREENS.s1;
  var Comp = entry.comp;
  var label = entry.label;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.bg, padding: 12, fontFamily: ff }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, width: 390 }}>
        <span style={{ fontWeight: 800, fontSize: 14, color: C.pd }}>Ennie™</span>
        <span style={{ color: C.muted, fontSize: 12, flex: 1, textAlign: "center" }}>{label}</span>
        <button onClick={() => setNav((n) => !n)} style={{ color: C.black, fontSize: 12, background: C.white, border: "1.5px solid " + C.border, borderRadius: 10, padding: "5px 14px", cursor: "pointer", fontFamily: ff, fontWeight: 600 }}>
          {nav ? "✕ Close" : "☰ All"}
        </button>
      </div>
      <div style={{ position: "relative", width: 390, height: 844, borderRadius: 48, overflow: "hidden", boxShadow: "0 20px 60px rgba(120,100,180,0.25)", border: "1px solid " + C.border }}>
        {nav ? (
          <div style={{ height: "100%", background: C.white, overflowY: "auto", padding: "60px 24px 24px" }}>
            <h2 style={{ fontWeight: 900, fontSize: 22, margin: "0 0 4px", color: C.black, fontFamily: ff }}>All screens</h2>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>ENNIE v1.3 — Original design</p>
            {GROUPS.map((g) => (
              <div key={g.title} style={{ marginBottom: 20 }}>
                <p style={{ color: C.pd, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>{g.title}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {g.keys.map((k) => (
                    <button key={k} onClick={() => { setScreen(k); setNav(false); }} style={{ padding: "8px 14px", borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: ff, background: screen === k ? C.black : C.white, color: screen === k ? C.white : C.black, border: "1.5px solid " + (screen === k ? C.black : C.border) }}>
                      {SCREENS[k].label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
            <Comp go={setScreen} />
          </div>
        )}
      </div>
      <div style={{ color: C.muted, fontSize: 11, marginTop: 10 }}>Interactive prototype · Ennie by Charlie Goldsmith</div>
    </div>
  );
}
