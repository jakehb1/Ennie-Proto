import { useState, useEffect, useRef, useCallback } from "react";

/* ─── palette & constants ─── */
const C = {
  brand: "#00A896", brandDark: "#008577", brandGlow: "#00A89640",
  dark: "#0B1420", darker: "#060D14", panel: "#111D2C",
  text: "#F0FAF8", muted: "rgba(255,255,255,0.5)", faint: "rgba(255,255,255,0.25)",
  border: "rgba(255,255,255,0.08)", red: "#ef4444", amber: "#f59e0b",
};

const font = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

/* ─── shared micro-components ─── */
const Pill = ({ children, active, onClick, style }) => (
  <button onClick={onClick} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 999, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: font, background: active ? C.brand : "rgba(255,255,255,0.08)", color: active ? "#fff" : C.muted, transition: "all 0.2s", ...style }}>{children}</button>
);

const Tag = ({ children, color }) => (
  <span style={{ fontSize: 11, background: `${color || C.brand}22`, color: color || C.brand, borderRadius: 999, padding: "3px 10px", fontWeight: 600, letterSpacing: 0.3 }}>{children}</span>
);

const Btn = ({ children, onClick, primary = true, danger, disabled, style }) => (
  <button disabled={disabled} onClick={onClick} style={{
    width: "100%", padding: "14px 20px", borderRadius: 14, fontWeight: 700, fontSize: 15, border: "none", cursor: disabled ? "default" : "pointer", fontFamily: font, opacity: disabled ? 0.4 : 1, transition: "all 0.2s",
    background: danger ? `${C.red}22` : primary ? C.brand : "rgba(255,255,255,0.07)",
    color: danger ? C.red : primary ? "#fff" : C.muted,
    boxShadow: primary && !danger ? `0 6px 20px ${C.brand}33` : "none",
    border: primary ? "none" : "1px solid rgba(255,255,255,0.1)", ...style
  }}>{children}</button>
);

const Input = ({ value, onChange, placeholder, type = "text", style }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{
    width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "13px 16px", color: "#fff", fontSize: 14, outline: "none", fontFamily: font, ...style
  }} />
);

const Header = ({ title, sub, onBack, right }) => (
  <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, minHeight: 52 }}>
    {onBack && <button onClick={onBack} style={{ color: C.brand, background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 0 }}>‹</button>}
    <div style={{ flex: 1 }}>
      <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>{title}</p>
      {sub && <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{sub}</p>}
    </div>
    {right}
  </div>
);

const Card = ({ children, style, glow }) => (
  <div style={{ background: glow ? `${C.brand}0d` : "rgba(255,255,255,0.04)", border: `1px solid ${glow ? `${C.brand}33` : C.border}`, borderRadius: 16, padding: 16, ...style }}>{children}</div>
);

const ChatBubble = ({ text, from, typing }) => (
  <div style={{ display: "flex", justifyContent: from === "ai" ? "flex-start" : "flex-end", marginBottom: 10 }}>
    {from === "ai" && <div style={{ width: 26, height: 26, borderRadius: 999, background: `${C.brand}28`, border: `1px solid ${C.brand}55`, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 8, flexShrink: 0, marginTop: 2 }}><span style={{ color: C.brand, fontSize: 11, fontWeight: 800 }}>E</span></div>}
    <div style={{ maxWidth: "78%", borderRadius: 16, padding: "10px 14px", background: from === "ai" ? "rgba(255,255,255,0.08)" : C.brand, color: "#fff", fontSize: 14, lineHeight: 1.5, borderTopLeftRadius: from === "ai" ? 4 : 16, borderTopRightRadius: from === "ai" ? 16 : 4 }}>
      {typing ? <span style={{ opacity: 0.5 }}>typing…</span> : text}
    </div>
  </div>
);

/* ─── Body Map ─── */
const BodyMap = ({ pins = [], onAddPin, readonly, small }) => {
  const [side, setSide] = useState("front");
  const w = small ? 100 : 140, h = small ? 200 : 280;
  const handleClick = (e) => {
    if (readonly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onAddPin && onAddPin({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100, side, score: 6, label: "Pain" });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ display: "flex", gap: 6 }}>{["front", "back"].map(s => <Pill key={s} active={side === s} onClick={() => setSide(s)}>{s === "front" ? "Front" : "Back"}</Pill>)}</div>
      <div style={{ position: "relative", cursor: readonly ? "default" : "crosshair" }} onClick={handleClick}>
        <svg viewBox="0 0 120 240" width={w} height={h}>
          <g stroke={C.brand} strokeWidth="1.2" fill="none" opacity="0.5">
            <ellipse cx="60" cy="22" rx="15" ry="17" /><rect x="54" y="37" width="12" height="7" rx="2" />
            <path d="M32 46 L22 100 L24 128 L96 128 L98 100 L88 46 Z" />
            <path d="M32 48 L12 94 L16 128" strokeLinecap="round" /><path d="M88 48 L108 94 L104 128" strokeLinecap="round" />
            <path d="M36 128 L30 188 L24 232" strokeLinecap="round" /><path d="M84 128 L90 188 L96 232" strokeLinecap="round" />
          </g>
          {pins.filter(p => p.side === side).map((pin, i) => (
            <g key={i}><circle cx={pin.x * 1.2} cy={pin.y * 2.4} r={small ? 5 : 7} fill={pin.score > 7 ? C.red : pin.score > 4 ? C.amber : C.brand} opacity="0.9" />
              <text x={pin.x * 1.2} y={pin.y * 2.4 + (small ? 3 : 4)} textAnchor="middle" fill="white" fontSize={small ? 5 : 7} fontWeight="bold">{pin.score}</text></g>
          ))}
        </svg>
        {!readonly && <div style={{ textAlign: "center", color: C.faint, fontSize: 11, marginTop: 2 }}>Tap body to mark symptom</div>}
      </div>
    </div>
  );
};

/* ─── Countdown Ring ─── */
const CountdownRing = ({ seconds, total, size = 110 }) => {
  const r = (size / 2) - 10, circ = 2 * Math.PI * r, dash = circ * (seconds / total), urgent = seconds <= 30;
  const cx = size / 2;
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={urgent ? C.red : C.brand} strokeWidth="6" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cx})`} style={{ transition: "stroke-dasharray 1s linear" }} />
      </svg>
      <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 700, color: urgent ? "#f87171" : "#fff", fontFamily: font }}>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span>
        <span style={{ color: C.faint, fontSize: 10 }}>remaining</span>
      </div>
    </div>
  );
};

/* ─── Healer Silhouette ─── */
const HealerSilhouette = ({ active }) => {
  const [f, setF] = useState(0);
  useEffect(() => { const t = setInterval(() => setF(v => (v + 1) % 4), 800); return () => clearInterval(t); }, []);
  const h = ["M55 85 Q60 70 65 60", "M55 85 Q58 68 68 55", "M55 85 Q62 72 60 58", "M55 85 Q60 70 63 62"];
  return (
    <svg width="100" height="130" viewBox="0 0 120 160">
      <defs><filter id="sblur"><feGaussianBlur stdDeviation="3" /></filter>
        <radialGradient id="sglow" cx="50%" cy="50%"><stop offset="0%" stopColor={C.brand} stopOpacity="0.25" /><stop offset="100%" stopColor={C.brand} stopOpacity="0" /></radialGradient></defs>
      <ellipse cx="60" cy="80" rx="50" ry="65" fill="url(#sglow)" />
      <g filter="url(#sblur)" fill={C.brand} opacity="0.6">
        <ellipse cx="60" cy="28" rx="13" ry="15" /><path d="M36 46 L26 108 L94 108 L84 46 Z" />
        <path d={h[f]} stroke={C.brand} strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M65 85 Q70 68 62 55" stroke={C.brand} strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.7" />
      </g>
      {active && <text x="60" y="148" textAnchor="middle" fill={C.brand} fontSize="8" opacity="0.7">● working with you</text>}
    </svg>
  );
};

/* ─── Phone Frame ─── */
const PhoneFrame = ({ children, label }) => (
  <div style={{ position: "relative", width: "100%", height: "100%", background: C.dark, overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", zIndex: 50, background: `${C.dark}dd` }}>
      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 500 }}>9:41</span>
      <div style={{ width: 80, height: 22, background: "#000", borderRadius: 999 }} />
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <div style={{ width: 14, height: 10, border: "1px solid rgba(255,255,255,0.35)", borderRadius: 2 }} />
      </div>
    </div>
    <div style={{ position: "absolute", top: 44, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>{children}</div>
  </div>
);

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SCREEN DEFINITIONS — all 23 + admin
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ── S1: Landing ── */
const S1_Landing = ({ go }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", background: C.dark }}>
    <div style={{ position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)", width: 300, height: 300, background: `${C.brand}15`, borderRadius: 999, filter: "blur(70px)" }} />
    <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%", padding: "28px 28px 36px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "auto" }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: C.brand, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>E</span></div>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: 0.5 }}>ENNIE</span>
      </div>
      <div style={{ marginBottom: 44 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", lineHeight: 1.15, marginBottom: 10, fontFamily: font }}>Welcome to<br /><span style={{ color: C.brand }}>ENNIE.</span></h1>
        <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.5 }}>Energy healing for anyone, anywhere.</p>
        <div style={{ display: "inline-block", background: `${C.brand}1a`, border: `1px solid ${C.brand}44`, borderRadius: 10, padding: "7px 14px", marginTop: 10 }}>
          <p style={{ color: C.brand, fontWeight: 600, fontSize: 13, margin: 0 }}>Suffering from pain?</p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Btn onClick={() => go("s2")}>Get started for FREE</Btn>
        <Btn primary={false} onClick={() => go("s12")}>Join as a test healer</Btn>
        <button onClick={() => go("s2")} style={{ color: C.faint, fontSize: 13, padding: 6, background: "none", border: "none", cursor: "pointer", fontFamily: font }}>Login</button>
      </div>
    </div>
  </div>
);

/* ── S2: Sign Up ── */
const S2_SignUp = ({ go }) => {
  const [email, setEmail] = useState(""); const [sent, setSent] = useState(false);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.dark, padding: "20px 28px 36px" }}>
      <Header title="Create your account" sub="We only need your email to get started." onBack={() => go("s1")} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingTop: 24 }}>
        {!sent ? <>
          <label style={{ color: C.muted, fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 2 }}>Email address</label>
          <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ marginBottom: 16, fontSize: 16 }} />
          <Btn onClick={() => email && setSent(true)}>Send magic link</Btn>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
            <div style={{ flex: 1, height: 1, background: C.border }} /><span style={{ color: C.faint, fontSize: 12 }}>or</span><div style={{ flex: 1, height: 1, background: C.border }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {["🍎 Apple", "G  Google"].map(t => <Btn key={t} primary={false} style={{ flex: 1, fontSize: 13 }}>{t}</Btn>)}
          </div>
          <p style={{ color: C.faint, fontSize: 11, textAlign: "center", marginTop: 24 }}>By continuing you agree to our Terms of Service and Privacy Policy</p>
        </> : <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 14 }}>
          <div style={{ width: 72, height: 72, borderRadius: 999, background: `${C.brand}28`, border: `2px solid ${C.brand}55`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 36 }}>✉️</span></div>
          <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>Check your email</h3>
          <p style={{ color: C.muted, fontSize: 14, textAlign: "center" }}>We sent a magic link to<br /><span style={{ color: C.brand }}>{email}</span></p>
          <Btn onClick={() => go("s3")} style={{ marginTop: 20 }}>Continue (demo)</Btn>
        </div>}
      </div>
    </div>
  );
};

/* ── S3: Age Gate & Disclaimers ── */
const S3_AgeGate = ({ go }) => {
  const [dob, setDob] = useState({ month: "", day: "", year: "" });
  const [agreed, setAgreed] = useState(false);
  const valid = dob.month && dob.day && dob.year && dob.year.length === 4;
  const age = valid ? Math.floor((Date.now() - new Date(`${dob.year}-${dob.month}-${dob.day}`)) / 31557600000) : 0;
  const minor = age >= 13 && age < 18;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.dark, padding: "20px 28px 36px" }}>
      <Header title="Before we begin" sub="We need to verify a few things" onBack={() => go("s2")} />
      <div style={{ flex: 1, paddingTop: 24, display: "flex", flexDirection: "column" }}>
        <p style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Date of birth</p>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <Input value={dob.month} onChange={e => setDob(d => ({ ...d, month: e.target.value }))} placeholder="MM" style={{ flex: 1 }} />
          <Input value={dob.day} onChange={e => setDob(d => ({ ...d, day: e.target.value }))} placeholder="DD" style={{ flex: 1 }} />
          <Input value={dob.year} onChange={e => setDob(d => ({ ...d, year: e.target.value }))} placeholder="YYYY" style={{ flex: 2 }} />
        </div>
        {valid && age < 13 && <Card style={{ marginBottom: 16, borderColor: `${C.red}44` }}><p style={{ color: C.red, fontSize: 13, margin: 0 }}>You must be at least 13 to use ENNIE.</p></Card>}
        {minor && <Card glow style={{ marginBottom: 16 }}><p style={{ color: C.brand, fontSize: 13, margin: 0 }}>You're eligible as a case. Healer roles, paid sessions, and video features require 18+.</p></Card>}
        <Card style={{ marginBottom: 16 }}>
          <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: "0 0 8px" }}>Important</p>
          <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.5, margin: 0 }}>ENNIE connects you with energy healers for wellness purposes. It is not a substitute for medical care. If you have a medical emergency, call emergency services.</p>
        </Card>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", marginBottom: 20 }} onClick={() => setAgreed(a => !a)}>
          <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${agreed ? C.brand : "rgba(255,255,255,0.2)"}`, background: agreed ? C.brand : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>{agreed && <span style={{ color: "#fff", fontSize: 14 }}>✓</span>}</div>
          <span style={{ color: C.muted, fontSize: 13, lineHeight: 1.5 }}>I understand and agree to continue</span>
        </label>
        <div style={{ marginTop: "auto" }}>
          <Btn disabled={!valid || age < 13 || !agreed} onClick={() => go("s4")}>Continue</Btn>
        </div>
      </div>
    </div>
  );
};

/* ── S4: Intake (AI conversation + body map) ── */
const S4_Intake = ({ go }) => {
  const [messages, setMessages] = useState([{ from: "ai", text: "Hi, I'm ENNIE. I'll help you describe what you're experiencing so we can match you with the right healer. What's been going on?" }]);
  const [pins, setPins] = useState([]); const [input, setInput] = useState(""); const [step, setStep] = useState(0); const [typing, setTyping] = useState(false); const [showMap, setShowMap] = useState(false); const [mode, setMode] = useState("text"); const scrollRef = useRef(null);
  const replies = [
    "Can you show me on the body map where you feel it? Tap the area on the figure.",
    "Got it — I've marked that. How long have you been experiencing this?",
    "On the body map, drag the slider to set your severity (0–10).",
    "Thanks. Based on what you've told me, this sounds like it could be chronic pain. Does that feel right?",
    "You qualify for a free session. A healer can work with you shortly."
  ];
  const send = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { from: "user", text: input }]); setInput(""); setTyping(true);
    setTimeout(() => { setTyping(false); setMessages(m => [...m, { from: "ai", text: replies[step] || "Thanks for sharing that." }]); if (step === 0) setShowMap(true); setStep(s => s + 1); }, 1000);
  };
  const addPin = (pin) => { setPins(p => [...p, pin]); setTyping(true); setTimeout(() => { setTyping(false); setMessages(m => [...m, { from: "ai", text: replies[Math.min(step + 1, replies.length - 1)] }]); setStep(s => Math.max(s, 2)); }, 600); };
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, typing]);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.dark }}>
      <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => go("s3")} style={{ color: C.brand, background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>‹</button>
          <div><p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0 }}>ENNIE Intake</p><p style={{ color: C.muted, fontSize: 11, margin: 0 }}>Tell me what's going on</p></div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <Pill active={mode === "text"} onClick={() => setMode("text")}>Text</Pill>
          <Pill active={mode === "voice"} onClick={() => setMode("voice")}>🎙 Voice</Pill>
        </div>
      </div>
      {showMap && <div style={{ padding: 10, background: `${C.brand}0a`, borderBottom: `1px solid ${C.brand}22` }}><BodyMap pins={pins} onAddPin={addPin} small /></div>}
      <div style={{ padding: "4px 16px 2px" }}><p style={{ color: C.faint, fontSize: 10, fontStyle: "italic", margin: 0 }}>ENNIE is not medical advice. If you need emergency care, call your local emergency number.</p></div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>{messages.map((m, i) => <ChatBubble key={i} {...m} />)}{typing && <ChatBubble from="ai" typing />}</div>
      <div style={{ padding: "10px 16px 20px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
        <Input value={input} onChange={e => setInput(e.target.value)} placeholder={mode === "voice" ? "Listening… or type" : "Type your response..."} style={{ flex: 1 }} />
        <button onClick={send} style={{ width: 42, height: 42, borderRadius: 14, background: C.brand, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", flexShrink: 0 }}><span style={{ color: "#fff", fontSize: 16 }}>↑</span></button>
        {step >= 4 && <button onClick={() => go("s6")} style={{ width: 42, height: 42, borderRadius: 14, background: "rgba(255,255,255,0.08)", border: `1px solid ${C.brand}55`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><span style={{ color: C.brand, fontSize: 16 }}>→</span></button>}
      </div>
    </div>
  );
};

/* ── S5: Eligibility — built into S4 conversation ── */

/* ── S6: Queue — SKU Tier Selection ── */
const S6_Queue = ({ go }) => {
  const [sel, setSel] = useState(null);
  const tiers = [
    { id: 0, name: "Free", price: "FREE", wait: "~3 mins", waitSub: "Quick match", successRate: "40%", successDetail: "report a 50% reduction", healerType: "Test healer", desc: "Matched with a test healer building their track record on ENNIE. Free, fast — results vary.", badge: null, tier: "test" },
    { id: 1, name: "Standard", price: "$50", wait: "~4 weeks", waitSub: "Current waitlist", successRate: "70%", successDetail: "report a 90% reduction", healerType: "Qualified healer", desc: "A proven, qualified healer — you just wait for availability.", badge: null, tier: "qualified" },
    { id: 2, name: "Priority", price: "$150", wait: "~7 days", waitSub: "Shorter queue", successRate: "70%", successDetail: "report a 90% reduction", healerType: "Qualified healer", desc: "Same qualified healers, faster matching. Skip the main waitlist.", badge: "Popular", tier: "qualified" },
    { id: 3, name: "Immediate", price: "$350", wait: "~10 mins", waitSub: "Near-instant match", successRate: "70%", successDetail: "report a 90% reduction", healerType: "Qualified healer", desc: "Top-priority matching with a proven healer. Minutes, not weeks.", badge: "Fastest", tier: "qualified" },
  ];

  const tips = ["Find a quiet, comfortable spot", "You'll be asked to rate your symptoms during the session", "The session is anonymous — your healer won't know who you are", "A real person will be working on you — not AI"];
  const [tipIdx, setTipIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setTipIdx(i => (i + 1) % tips.length), 3500); return () => clearInterval(t); }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.dark }}>
      <div style={{ padding: "20px 24px 14px" }}>
        <button onClick={() => go("s4")} style={{ color: C.brand, background: "none", border: "none", cursor: "pointer", fontFamily: font, fontSize: 13, padding: 0, marginBottom: 10, display: "block" }}>‹ Back</button>
        <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 21, margin: "0 0 4px" }}>You qualify — choose your session</h2>
        <p style={{ color: C.muted, fontSize: 13, margin: 0, lineHeight: 1.4 }}>Free sessions use test healers. Paid sessions use qualified healers with stronger outcomes.</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Section: Free */}
        <p style={{ color: C.faint, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, margin: "4px 0 0" }}>Free — test healers</p>
        {tiers.filter(t => t.tier === "test").map((t) => (
          <div key={t.id} onClick={() => setSel(t.id)} style={{
            position: "relative", borderRadius: 16, padding: 16, cursor: "pointer", transition: "all 0.2s",
            background: sel === t.id ? `${C.brand}12` : "rgba(255,255,255,0.03)",
            border: sel === t.id ? `2px solid ${C.brand}` : `1px solid ${C.border}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: 999, border: `2px solid ${sel === t.id ? C.brand : "rgba(255,255,255,0.2)"}`, background: sel === t.id ? C.brand : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>{sel === t.id && <div style={{ width: 8, height: 8, borderRadius: 999, background: "#fff" }} />}</div>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{t.name}</span>
              </div>
              <span style={{ color: "#22c55e", fontWeight: 900, fontSize: 20 }}>{t.price}</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "6px 10px", flex: 1 }}>
                <p style={{ color: C.faint, fontSize: 10, margin: "0 0 1px", textTransform: "uppercase", letterSpacing: 1 }}>Wait</p>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0 }}>{t.wait}</p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "6px 10px", flex: 1.4 }}>
                <p style={{ color: C.faint, fontSize: 10, margin: "0 0 1px", textTransform: "uppercase", letterSpacing: 1 }}>Outcomes</p>
                <p style={{ color: C.amber, fontWeight: 700, fontSize: 14, margin: 0 }}>{t.successRate} of users</p>
                <p style={{ color: C.faint, fontSize: 10, margin: "1px 0 0" }}>{t.successDetail}</p>
              </div>
            </div>
            <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.4, margin: 0 }}>{t.desc}</p>
          </div>
        ))}

        {/* Section: Paid — qualified healers */}
        <p style={{ color: C.faint, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, margin: "8px 0 0" }}>Paid — qualified healers</p>
        {tiers.filter(t => t.tier === "qualified").map((t) => (
          <div key={t.id} onClick={() => setSel(t.id)} style={{
            position: "relative", borderRadius: 16, padding: 16, cursor: "pointer", transition: "all 0.2s",
            background: sel === t.id ? `${C.brand}12` : "rgba(255,255,255,0.03)",
            border: sel === t.id ? `2px solid ${C.brand}` : `1px solid ${C.border}`,
            boxShadow: t.id === 3 && sel === t.id ? `0 0 30px ${C.brand}22` : "none"
          }}>
            {t.badge && <div style={{ position: "absolute", top: -1, right: 16, background: t.id === 3 ? C.brand : `${C.brand}cc`, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: "0 0 8px 8px", letterSpacing: 0.5 }}>{t.badge}</div>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: 999, border: `2px solid ${sel === t.id ? C.brand : "rgba(255,255,255,0.2)"}`, background: sel === t.id ? C.brand : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>{sel === t.id && <div style={{ width: 8, height: 8, borderRadius: 999, background: "#fff" }} />}</div>
                <div><span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{t.name}</span><span style={{ color: C.brand, fontSize: 11, fontWeight: 600, marginLeft: 8 }}>{t.healerType}</span></div>
              </div>
              <span style={{ color: C.brand, fontWeight: 900, fontSize: 20 }}>{t.price}</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "6px 10px", flex: 1 }}>
                <p style={{ color: C.faint, fontSize: 10, margin: "0 0 1px", textTransform: "uppercase", letterSpacing: 1 }}>Wait</p>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0 }}>{t.wait}</p>
                <p style={{ color: C.faint, fontSize: 10, margin: "1px 0 0" }}>{t.waitSub}</p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "6px 10px", flex: 1.4 }}>
                <p style={{ color: C.faint, fontSize: 10, margin: "0 0 1px", textTransform: "uppercase", letterSpacing: 1 }}>Outcomes</p>
                <p style={{ color: "#22c55e", fontWeight: 700, fontSize: 14, margin: 0 }}>{t.successRate} of users</p>
                <p style={{ color: C.faint, fontSize: 10, margin: "1px 0 0" }}>{t.successDetail}</p>
              </div>
            </div>
            <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.4, margin: 0 }}>{t.desc}</p>
          </div>
        ))}

        {/* Rotating tip */}
        <Card style={{ display: "flex", alignItems: "center", marginTop: 2 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `${C.brand}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>💡</div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, margin: 0, lineHeight: 1.4 }}>{tips[tipIdx]}</p>
          </div>
        </Card>
      </div>

      {/* Bottom action */}
      <div style={{ padding: "12px 20px 24px", borderTop: `1px solid ${C.border}` }}>
        <Btn disabled={sel === null} onClick={() => sel === 0 ? go("s7") : go("s18")}>
          {sel === null ? "Select a tier to continue" : sel === 0 ? "Join free queue →" : `Continue to payment — ${tiers[sel]?.price} →`}
        </Btn>
      </div>
    </div>
  );
};

/* ── S7: Ready-now Prompt ── */
const S7_ReadyNow = ({ go }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.dark, padding: "0 28px" }}>
    <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 250, height: 250, background: `${C.brand}15`, borderRadius: 999, filter: "blur(80px)" }} />
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div style={{ width: 72, height: 72, borderRadius: 999, background: `${C.brand}28`, border: `2px solid ${C.brand}66`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 36 }}>✨</span></div>
      <div style={{ textAlign: "center" }}><h2 style={{ color: "#fff", fontWeight: 900, fontSize: 22, marginBottom: 6 }}>It's nearly your turn</h2><p style={{ color: C.muted, fontSize: 15 }}>Are you ready to begin?</p></div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
        <Btn onClick={() => go("s8")}>Yes, I'm ready</Btn>
        <Btn primary={false} onClick={() => go("s6")}>Snooze — keep my spot</Btn>
      </div>
    </div>
  </div>
);

/* ── S8: Symptom Confirmation ── */
const S8_SymptomConfirm = ({ go }) => {
  const [scores, setScores] = useState({ neck: 7, back: 5 });
  const [notes, setNotes] = useState({});
  const pins = [{ x: 47, y: 22, side: "front", score: scores.neck }, { x: 55, y: 38, side: "front", score: scores.back }];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.dark, padding: "20px 24px 28px", overflowY: "auto" }}>
      <Tag>Your healer is ready</Tag>
      <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 22, margin: "8px 0 14px" }}>Check in — symptoms still present?</h2>
      <Card style={{ marginBottom: 14, display: "flex", justifyContent: "center" }}><BodyMap pins={pins} readonly small /></Card>
      {Object.entries(scores).map(([key, val]) => (
        <Card key={key} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: "#fff", fontWeight: 600, textTransform: "capitalize", fontSize: 14 }}>{key} pain</span><span style={{ color: C.brand, fontWeight: 700, fontSize: 18 }}>{val}/10</span></div>
          <input type="range" min="0" max="10" value={val} onChange={e => setScores(s => ({ ...s, [key]: Number(e.target.value) }))} style={{ width: "100%", accentColor: C.brand }} />
          <div style={{ display: "flex", justifyContent: "space-between", color: C.faint, fontSize: 11, marginTop: 2 }}><span>No pain</span><span>Severe</span></div>
          <Input value={notes[key] || ""} onChange={e => setNotes(n => ({ ...n, [key]: e.target.value }))} placeholder="Optional note…" style={{ marginTop: 8, fontSize: 12, padding: "8px 12px" }} />
        </Card>
      ))}
      <div style={{ marginTop: "auto", paddingTop: 12 }}><Btn onClick={() => go("s9")}>I'm ready — start now</Btn></div>
    </div>
  );
};

/* ── S9: Live Session Room (case view) — real-time healer dialogue ── */
const S9_Session = ({ go }) => {
  const TOTAL = 300; const [sec, setSec] = useState(TOTAL);
  const [changed, setChanged] = useState(false);
  const [mode, setMode] = useState("voice");
  const [input, setInput] = useState("");
  const [speaking, setSpeaking] = useState("healer"); // who's currently talking
  const scrollRef = useRef(null);

  const [msgs, setMsgs] = useState([
    { from: "system", text: "Session started. Your healer is connected." },
    { from: "healer", text: "Hi there. I can see you've marked neck at 7 and back at 5. Can you tell me — is the neck pain more on the left side or the right?" },
  ]);

  // Simulated healer questions that fire during the session
  const healerFollowUps = [
    { at: 260, text: "Is the pain sharp or more of a dull ache?" },
    { at: 220, text: "OK. And when did it start — was there a specific moment or did it build up gradually?" },
    { at: 180, text: "I'm going to work on that area now. Just stay present and let me know if anything shifts." },
    { at: 120, text: "How's the neck feeling right now compared to when we started?" },
  ];

  useEffect(() => { if (sec <= 0) { go("s10"); return; } const t = setTimeout(() => setSec(s => s - 1), 1000); return () => clearTimeout(t); }, [sec]);
  useEffect(() => {
    const fu = healerFollowUps.find(f => f.at === sec);
    if (fu) {
      setSpeaking("healer");
      setMsgs(m => [...m, { from: "healer", text: fu.text }]);
      setTimeout(() => setSpeaking("idle"), 2000);
    }
  }, [sec]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs]);

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMsgs(m => [...m, { from: "user", text: msg }]); setInput(""); setSpeaking("idle");
  };

  const simulateVoice = () => {
    const responses = ["It's more on the right side", "Dull ache, gets worse in the afternoon", "It built up over a couple of weeks", "Actually yeah — the neck feels a bit lighter now"];
    const idx = msgs.filter(m => m.from === "user").length;
    const txt = responses[idx] || "Yes I can feel that";
    setSpeaking("user");
    setTimeout(() => { send(txt); setSpeaking("idle"); }, 800);
  };

  const onChange = () => {
    setChanged(true); setSec(TOTAL);
    setMsgs(m => [...m, { from: "user", text: "I feel a change — something shifted in my neck" }, { from: "healer", text: "Good — I felt that too. I'm going to keep working on that area. Timer's reset, we'll keep going." }]);
    setTimeout(() => setChanged(false), 2500);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.dark }}>
      {/* Top bar — timer, status, mode toggle */}
      <div style={{ padding: "10px 16px 8px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div>
            <Tag color={changed ? "#22c55e" : C.brand}>{changed ? "✓ Change registered" : "Live session"}</Tag>
            <p style={{ color: C.muted, fontSize: 11, margin: "3px 0 0" }}>Healer A7Q2 · Anonymous</p>
          </div>
          <CountdownRing seconds={sec} total={TOTAL} size={64} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 999, marginRight: 12 }}><div style={{ height: "100%", background: C.brand, borderRadius: 999, transition: "width 1s", width: `${(sec / TOTAL) * 100}%` }} /></div>
          <div style={{ display: "flex", gap: 3 }}>
            <Pill active={mode === "voice"} onClick={() => setMode("voice")} style={{ fontSize: 11, padding: "3px 10px" }}>🎙 Voice</Pill>
            <Pill active={mode === "text"} onClick={() => setMode("text")} style={{ fontSize: 11, padding: "3px 10px" }}>Text</Pill>
          </div>
        </div>
      </div>

      {/* Voice activity indicator — shows who's speaking */}
      {mode === "voice" && (
        <div style={{ padding: "8px 16px", background: `${C.brand}08`, borderBottom: `1px solid ${C.brand}15`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{
                width: 3, borderRadius: 2, background: speaking === "healer" ? C.brand : speaking === "user" ? "#22c55e" : C.faint,
                height: speaking !== "idle" ? `${8 + Math.random() * 14}px` : "4px",
                transition: "height 0.15s", opacity: speaking === "idle" ? 0.3 : 0.8
              }} />
            ))}
          </div>
          <span style={{ color: speaking === "healer" ? C.brand : speaking === "user" ? "#22c55e" : C.faint, fontSize: 12, fontWeight: 600 }}>
            {speaking === "healer" ? "Healer speaking…" : speaking === "user" ? "You're speaking…" : "Tap mic to respond"}
          </span>
        </div>
      )}

      {/* Conversation thread */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "10px 14px" }}>
        {msgs.map((m, i) => (
          m.from === "system" ? (
            <div key={i} style={{ textAlign: "center", marginBottom: 10 }}><span style={{ color: C.faint, fontSize: 11, background: "rgba(255,255,255,0.05)", padding: "3px 12px", borderRadius: 999 }}>{m.text}</span></div>
          ) : (
            <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
              {m.from === "healer" && <div style={{ width: 26, height: 26, borderRadius: 999, background: `${C.brand}28`, border: `1px solid ${C.brand}55`, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 8, flexShrink: 0, marginTop: 2 }}><span style={{ color: C.brand, fontSize: 10, fontWeight: 800 }}>H</span></div>}
              <div style={{
                maxWidth: "78%", borderRadius: 16, padding: "10px 14px", fontSize: 14, lineHeight: 1.5,
                background: m.from === "user" ? C.brand : "rgba(255,255,255,0.08)",
                color: "#fff",
                borderTopLeftRadius: m.from === "healer" ? 4 : 16,
                borderTopRightRadius: m.from === "user" ? 4 : 16,
              }}>
                {m.from === "healer" && <p style={{ color: C.brand, fontSize: 10, fontWeight: 700, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: 1 }}>Healer</p>}
                {m.text}
              </div>
            </div>
          )
        ))}
      </div>

      {/* "I feel a change" bar */}
      <div style={{ padding: "0 14px" }}>
        <button onClick={onChange} style={{
          width: "100%", padding: 10, borderRadius: 12, fontWeight: 700, fontSize: 13, border: `1px solid ${changed ? C.brand : `${C.brand}44`}`,
          background: changed ? C.brand : `${C.brand}15`, color: changed ? "#fff" : C.brand,
          cursor: "pointer", fontFamily: font, transition: "all 0.3s",
          boxShadow: changed ? `0 0 20px ${C.brand}33` : "none"
        }}>{changed ? "✓ Change registered — timer reset" : "⚡ I feel a change"}</button>
      </div>

      {/* Input area */}
      <div style={{ padding: "10px 14px 18px", display: "flex", gap: 8, alignItems: "center" }}>
        {mode === "voice" ? <>
          <button onClick={simulateVoice} style={{
            flex: 1, height: 46, borderRadius: 14, border: `2px solid ${C.brand}44`, background: `${C.brand}0d`,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer"
          }}>
            <span style={{ fontSize: 20 }}>🎙</span>
            <span style={{ color: C.brand, fontSize: 14, fontWeight: 600, fontFamily: font }}>Hold to talk</span>
          </button>
        </> : <>
          <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Reply to your healer…" style={{ flex: 1 }} />
          <button onClick={() => send()} style={{ width: 42, height: 42, borderRadius: 14, background: C.brand, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", flexShrink: 0 }}><span style={{ color: "#fff", fontSize: 16 }}>↑</span></button>
        </>}
        <button onClick={() => go("s10")} style={{ width: 42, height: 42, borderRadius: 14, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><span style={{ color: C.faint, fontSize: 14 }}>✕</span></button>
        <button onClick={() => go("s22")} style={{ width: 42, height: 42, borderRadius: 14, background: `${C.red}0d`, border: `1px solid ${C.red}33`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><span style={{ fontSize: 14 }}>🚨</span></button>
      </div>
    </div>
  );
};

/* ── S10: Session End (case) ── */
const S10_SessionEnd = ({ go }) => {
  const before = { neck: 7, back: 5 }, after = { neck: 3, back: 2 }; const [grateful, setGrateful] = useState(false);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.dark, padding: "20px 24px 28px", overflowY: "auto" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
        <div style={{ width: 60, height: 60, borderRadius: 999, background: `${C.brand}28`, border: `2px solid ${C.brand}66`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}><span style={{ fontSize: 26 }}>✨</span></div>
        <Tag>Session complete</Tag>
        <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 22, textAlign: "center", margin: "8px 0 0" }}>How are you feeling?</h2>
      </div>
      <Card style={{ marginBottom: 14 }}>
        <p style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Symptom changes</p>
        {Object.keys(before).map(key => (
          <div key={key} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "#fff", fontSize: 13, textTransform: "capitalize" }}>{key} pain</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}><span style={{ color: C.muted }}>{before[key]}</span><span style={{ color: C.faint }}>→</span><span style={{ color: C.brand, fontWeight: 700 }}>{after[key]}</span><Tag color="#22c55e">↓{before[key] - after[key]}</Tag></div>
            </div>
            <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 999 }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: "rgba(255,255,255,0.15)", borderRadius: 999, width: `${(before[key] / 10) * 100}%` }} />
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: C.brand, borderRadius: 999, width: `${(after[key] / 10) * 100}%` }} />
            </div>
          </div>
        ))}
      </Card>
      <Card glow style={{ marginBottom: 14 }}><p style={{ color: C.brand, fontSize: 13, fontStyle: "italic", margin: 0 }}>We'll check in with you in 24 hours to see how you're feeling.</p></Card>
      {!grateful ? <Btn primary={false} onClick={() => setGrateful(true)} style={{ marginBottom: 12 }}>Send anonymous thank you</Btn>
        : <Card glow style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}><span style={{ color: C.brand }}>✓</span><p style={{ color: C.brand, fontSize: 13, margin: 0 }}>Anonymous thank you sent to your healer</p></Card>}
      <div style={{ marginTop: "auto" }}><Btn onClick={() => go("s21")}>Return home</Btn></div>
    </div>
  );
};

/* ── S11: Follow-up Notifications ── */
const S11_FollowUp = ({ go }) => {
  const intervals = [{ label: "24 hours", status: "due" }, { label: "1 week", status: "upcoming" }, { label: "1 month", status: "upcoming" }];
  const [replied, setReplied] = useState(null);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.dark, padding: "20px 24px 28px" }}>
      <Header title="Follow-up check-in" sub="24 hours post-session" onBack={() => go("s10")} />
      <div style={{ flex: 1, paddingTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <Card><p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: "0 0 6px" }}>Please rate your symptoms since your session</p><p style={{ color: C.muted, fontSize: 13, margin: 0 }}>This helps measure outcomes and improve healing quality.</p></Card>
        {!replied ? <>
          <p style={{ color: C.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 2 }}>Quick reply</p>
          <div style={{ display: "flex", gap: 10 }}>
            {["Better", "Same", "Worse"].map(r => <Btn key={r} primary={false} onClick={() => setReplied(r)} style={{ flex: 1, fontSize: 13 }}>{r === "Better" ? "👍" : r === "Same" ? "➡️" : "👎"} {r}</Btn>)}
          </div>
        </> : <Card glow><p style={{ color: C.brand, fontSize: 14, margin: 0 }}>✓ Recorded: {replied}. Thank you for your feedback.</p></Card>}
        <p style={{ color: C.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 2, marginTop: 8 }}>Follow-up schedule</p>
        {intervals.map((iv, i) => (
          <Card key={i} glow={iv.status === "due"}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#fff", fontSize: 13 }}>{iv.label}</span>
              <Tag color={iv.status === "due" ? C.brand : undefined}>{iv.status === "due" ? (replied ? "Done" : "Due now") : "Upcoming"}</Tag>
            </div>
          </Card>
        ))}
      </div>
      <Btn onClick={() => go("s21")} style={{ marginTop: 12 }}>Back to home</Btn>
    </div>
  );
};

/* ── S12: Healer Onboarding ── */
const S12_HealerOnboard = ({ go }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ lang: "English", modality: "", tz: "", experience: null });
  const [agreed, setAgreed] = useState(false);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.dark, padding: "20px 24px 28px", overflowY: "auto" }}>
      <Header title="Become a test healer" sub={`Step ${step + 1} of 3`} onBack={() => step > 0 ? setStep(s => s - 1) : go("s1")} />
      <div style={{ flex: 1, paddingTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        {step === 0 && <>
          <p style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>Your details</p>
          <div><label style={{ color: C.muted, fontSize: 12, marginBottom: 4, display: "block" }}>Language</label><Input value={form.lang} onChange={e => setForm(f => ({ ...f, lang: e.target.value }))} /></div>
          <div><label style={{ color: C.muted, fontSize: 12, marginBottom: 4, display: "block" }}>Healing modality</label><Input value={form.modality} onChange={e => setForm(f => ({ ...f, modality: e.target.value }))} placeholder="e.g. Energy healing, Reiki, etc." /></div>
          <div><label style={{ color: C.muted, fontSize: 12, marginBottom: 4, display: "block" }}>Timezone</label><Input value={form.tz} onChange={e => setForm(f => ({ ...f, tz: e.target.value }))} placeholder="e.g. America/Los_Angeles" /></div>
        </>}
        {step === 1 && <>
          <p style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>Experience</p>
          <p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>Do you have prior healing experience?</p>
          <Btn primary={form.experience === true} onClick={() => setForm(f => ({ ...f, experience: true }))}>Yes — I have experience</Btn>
          <Btn primary={form.experience === false} onClick={() => setForm(f => ({ ...f, experience: false }))}>No — I'm new to this</Btn>
          {form.experience === false && <Card glow style={{ marginTop: 8 }}><p style={{ color: C.brand, fontSize: 13, margin: 0 }}>You'll need to complete or acknowledge the Human Medicine training before proceeding.</p><button style={{ color: C.brand, textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontFamily: font, fontSize: 13, padding: 0, marginTop: 6 }}>View Human Medicine training →</button></Card>}
        </>}
        {step === 2 && <>
          <p style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>Agreements</p>
          <Card>
            <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: "0 0 8px" }}>Platform rules</p>
            <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.5, margin: "0 0 8px" }}>All sessions are mediated by AI. You will communicate with cases through the AI mediator. Sessions are anonymous. No recordings.</p>
          </Card>
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }} onClick={() => setAgreed(a => !a)}>
            <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${agreed ? C.brand : "rgba(255,255,255,0.2)"}`, background: agreed ? C.brand : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>{agreed && <span style={{ color: "#fff", fontSize: 14 }}>✓</span>}</div>
            <span style={{ color: C.muted, fontSize: 13 }}>I accept the platform rules and AI mediation agreement</span>
          </label>
        </>}
      </div>
      <Btn disabled={step === 2 && !agreed} onClick={() => step < 2 ? setStep(s => s + 1) : go("s13")} style={{ marginTop: 12 }}>{step < 2 ? "Next" : "Join healer pool"}</Btn>
    </div>
  );
};

/* ── S13: Healer Home ── */
const S13_HealerHome = ({ go }) => {
  const [online, setOnline] = useState(false);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.dark, padding: "20px 24px 28px", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div><p style={{ color: C.muted, fontSize: 12 }}>Welcome back</p><h2 style={{ color: "#fff", fontWeight: 900, fontSize: 22, margin: 0 }}>Healer dashboard</h2></div>
        <button onClick={() => go("s1")} style={{ color: C.brand, fontSize: 12, background: "none", border: "none", cursor: "pointer", fontFamily: font }}>← App home</button>
      </div>
      <Card glow={online} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><p style={{ color: "#fff", fontWeight: 700, margin: 0, fontSize: 14 }}>{online ? "You're online" : "You're offline"}</p><p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{online ? "Accepting sessions" : "Toggle to start"}</p></div>
          <button onClick={() => setOnline(o => !o)} style={{ width: 52, height: 28, borderRadius: 999, background: online ? C.brand : "rgba(255,255,255,0.15)", position: "relative", border: "none", cursor: "pointer" }}>
            <div style={{ width: 20, height: 20, background: "#fff", borderRadius: 999, position: "absolute", top: 4, left: online ? 28 : 4, transition: "all 0.3s" }} />
          </button>
        </div>
        {online && <Btn onClick={() => go("s14")} style={{ marginTop: 14, fontSize: 13 }}>Simulate incoming case →</Btn>}
      </Card>
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><p style={{ color: "#fff", fontWeight: 600, fontSize: 13, margin: 0 }}>Qualification progress</p><Tag>Active test healer</Tag></div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 999, marginBottom: 4 }}><div style={{ height: "100%", width: "60%", background: `linear-gradient(to right, ${C.brand}, #00d4bc)`, borderRadius: 999 }} /></div>
        <p style={{ color: C.faint, fontSize: 12, margin: 0 }}>18 of 30 sessions completed</p>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[["Sessions", "18"], ["Change rate", "72%"], ["Avg improv.", "3.1"]].map(([l, v], i) => (
          <Card key={i} style={{ textAlign: "center", padding: 12 }}>
            <p style={{ color: C.brand, fontWeight: 900, fontSize: 18, margin: 0 }}>{v}</p><p style={{ color: C.faint, fontSize: 11, marginTop: 2, margin: "2px 0 0" }}>{l}</p>
          </Card>
        ))}
      </div>
      <Btn primary={false} onClick={() => go("s20")} style={{ fontSize: 13 }}>Schedule availability</Btn>
    </div>
  );
};

/* ── S14: Match Notification ── */
const S14_MatchNotif = ({ go }) => {
  const [countdown, setCountdown] = useState(5);
  useEffect(() => { if (countdown <= 0) { go("s15"); return; } const t = setTimeout(() => setCountdown(c => c - 1), 1000); return () => clearTimeout(t); }, [countdown]);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.dark, padding: "0 28px" }}>
      <div style={{ position: "absolute", top: "25%", left: "50%", transform: "translateX(-50%)", width: 280, height: 280, background: `${C.brand}18`, borderRadius: 999, filter: "blur(80px)" }} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <Tag>New case matched</Tag>
        <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 22, textAlign: "center", margin: 0 }}>Session starting in {countdown}s</h2>
        <Card style={{ width: "100%" }}>
          <p style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, margin: "0 0 8px" }}>Case summary</p>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <BodyMap pins={[{ x: 47, y: 22, side: "front", score: 7 }, { x: 55, y: 38, side: "front", score: 5 }]} readonly small />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Tag>Chronic pain</Tag>
              {[["Neck", 7], ["Back", 5]].map(([k, v]) => <div key={k} style={{ display: "flex", gap: 4, alignItems: "center" }}><span style={{ color: C.muted, fontSize: 12 }}>{k}:</span><span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{v}/10</span></div>)}
              <p style={{ color: C.muted, fontSize: 11, margin: 0 }}>2 weeks duration</p>
            </div>
          </div>
        </Card>
        <p style={{ color: C.faint, fontSize: 12 }}>No accept/decline — you're committed by being online</p>
      </div>
    </div>
  );
};

/* ── S15: Healer Session Room ── */
const S15_HealerSession = ({ go }) => {
  const TOTAL = 300; const [sec, setSec] = useState(TOTAL);
  const [msgs, setMsgs] = useState([{ from: "ai", text: "Case ready. Neck 7/10, back 5/10. 2 weeks duration. Begin when ready." }]);
  const [input, setInput] = useState(""); const scrollRef = useRef(null);
  useEffect(() => { if (sec <= 0) { go("s16"); return; } const t = setTimeout(() => setSec(s => s - 1), 1000); return () => clearTimeout(t); }, [sec]);
  useEffect(() => { if (sec === 220) setMsgs(m => [...m, { from: "ai", text: "Update: case reports neck now 5/10. Movement detected." }]); }, [sec]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs]);
  const send = () => { if (!input.trim()) return; setMsgs(m => [...m, { from: "user", text: `[To case]: ${input}` }]); setInput(""); setTimeout(() => setMsgs(m => [...m, { from: "ai", text: "Message relayed. Awaiting case response." }]), 800); };
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.dark }}>
      <div style={{ padding: "12px 20px 10px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><Tag color="#818cf8">Healer view</Tag><p style={{ color: C.muted, fontSize: 11, margin: "4px 0 0" }}>Case · Anonymous</p></div>
          <CountdownRing seconds={sec} total={TOTAL} size={70} />
        </div>
      </div>
      <div style={{ padding: 10, borderBottom: `1px solid ${C.border}`, display: "flex", gap: 12, alignItems: "center", justifyContent: "center" }}>
        <BodyMap pins={[{ x: 47, y: 22, side: "front", score: 7 }, { x: 55, y: 38, side: "front", score: 5 }]} readonly small />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[["Neck", 7], ["Back", 5]].map(([k, v]) => <Card key={k} style={{ padding: 10 }}><p style={{ color: C.muted, fontSize: 11, margin: 0 }}>{k}</p><p style={{ color: "#fff", fontWeight: 700, fontSize: 18, margin: 0 }}>{v}<span style={{ color: C.faint, fontSize: 12 }}>/10</span></p></Card>)}
        </div>
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "8px 16px" }}>{msgs.map((m, i) => <ChatBubble key={i} {...m} />)}</div>
      <div style={{ padding: "10px 16px 20px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
        <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask case a question…" style={{ flex: 1 }} />
        <button onClick={send} style={{ width: 42, height: 42, borderRadius: 14, background: C.brand, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", flexShrink: 0 }}><span style={{ color: "#fff", fontSize: 16 }}>↑</span></button>
      </div>
    </div>
  );
};

/* ── S16: Healer Post-Session ── */
const S16_HealerPostSession = ({ go }) => {
  const [notes, setNotes] = useState("");
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.dark, padding: "20px 24px 28px", overflowY: "auto" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: 999, background: `${C.brand}28`, border: `2px solid ${C.brand}55`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}><span style={{ fontSize: 24 }}>✨</span></div>
        <Tag>Session complete</Tag>
        <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 20, textAlign: "center", margin: "6px 0 0" }}>Session summary</h2>
      </div>
      <Card style={{ marginBottom: 14 }}>
        <p style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, margin: "0 0 8px" }}>Outcomes</p>
        {[["Neck", 7, 4], ["Back", 5, 3]].map(([k, b, a]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ color: "#fff", fontSize: 13 }}>{k}</span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}><span style={{ color: C.muted }}>{b}</span><span style={{ color: C.faint }}>→</span><span style={{ color: C.brand, fontWeight: 700 }}>{a}</span><Tag color="#22c55e">↓{b - a}</Tag></div>
          </div>
        ))}
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[["Total", "19"], ["Change rate", "73%"], ["Avg improv.", "3.2"]].map(([l, v], i) => (
          <Card key={i} style={{ textAlign: "center", padding: 10 }}>
            <p style={{ color: C.brand, fontWeight: 800, fontSize: 16, margin: 0 }}>{v}</p><p style={{ color: C.faint, fontSize: 10, margin: "2px 0 0" }}>{l}</p>
          </Card>
        ))}
      </div>
      <p style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>Private notes (optional)</p>
      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add any notes for your records…" style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, color: "#fff", fontSize: 13, outline: "none", fontFamily: font, minHeight: 70, resize: "none" }} />
      <div style={{ marginTop: "auto", paddingTop: 12 }}><Btn onClick={() => go("s13")}>Ready for another session?</Btn></div>
    </div>
  );
};

/* ── S17: Tier Selection (Paid) ── */
const S17_TierSelect = ({ go }) => {
  const tiers = [
    { name: "Standard", price: "$29", urgency: "Normal", wait: "20–40 min", desc: "Matched with a qualified healer" },
    { name: "Priority", price: "$49", urgency: "Fast", wait: "5–15 min", desc: "Skip the queue — faster matching", popular: true },
    { name: "Premium", price: "$99", urgency: "Immediate", wait: "< 5 min", desc: "Top-rated healer, instant match" },
  ];
  const [sel, setSel] = useState(null);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.dark, padding: "20px 24px 28px", overflowY: "auto" }}>
      <Header title="Book a paid session" sub="Choose your tier" onBack={() => go("s1")} />
      <div style={{ flex: 1, paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {tiers.map((t, i) => (
          <Card key={i} glow={sel === i} style={{ cursor: "pointer", border: sel === i ? `2px solid ${C.brand}` : undefined, position: "relative" }} onClick={() => setSel(i)}>
            {t.popular && <div style={{ position: "absolute", top: -1, right: 16, background: C.brand, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: "0 0 8px 8px" }}>Most popular</div>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div><p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>{t.name}</p><p style={{ color: C.muted, fontSize: 12, margin: "2px 0 0" }}>{t.desc}</p></div>
              <p style={{ color: C.brand, fontWeight: 900, fontSize: 20, margin: 0 }}>{t.price}</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}><Tag>{t.urgency}</Tag><Tag>~{t.wait}</Tag></div>
          </Card>
        ))}
      </div>
      <Btn disabled={sel === null} onClick={() => go("s18")} style={{ marginTop: 12 }}>Continue to payment</Btn>
    </div>
  );
};

/* ── S18: Payment ── */
const S18_Payment = ({ go }) => {
  const [card, setCard] = useState(""); const [save, setSave] = useState(false);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.dark, padding: "20px 24px 28px" }}>
      <Header title="Payment" sub="Priority session · $49" onBack={() => go("s17")} />
      <div style={{ flex: 1, paddingTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn primary={false} style={{ flex: 1, fontSize: 13 }}>🍎 Apple Pay</Btn>
          <Btn primary={false} style={{ flex: 1, fontSize: 13 }}>G  Google Pay</Btn>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ flex: 1, height: 1, background: C.border }} /><span style={{ color: C.faint, fontSize: 12 }}>or pay with card</span><div style={{ flex: 1, height: 1, background: C.border }} /></div>
        <div><label style={{ color: C.muted, fontSize: 12, marginBottom: 4, display: "block" }}>Card number</label><Input value={card} onChange={e => setCard(e.target.value)} placeholder="1234 5678 9012 3456" /></div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}><label style={{ color: C.muted, fontSize: 12, marginBottom: 4, display: "block" }}>Expiry</label><Input placeholder="MM/YY" /></div>
          <div style={{ flex: 1 }}><label style={{ color: C.muted, fontSize: 12, marginBottom: 4, display: "block" }}>CVC</label><Input placeholder="123" /></div>
        </div>
        <label style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }} onClick={() => setSave(s => !s)}>
          <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${save ? C.brand : "rgba(255,255,255,0.2)"}`, background: save ? C.brand : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{save && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}</div>
          <span style={{ color: C.muted, fontSize: 13 }}>Save card for future sessions</span>
        </label>
        <Card><p style={{ color: C.faint, fontSize: 11, margin: 0, lineHeight: 1.5 }}>Automatic refund if no match found, session fails, or safety stop.</p></Card>
      </div>
      <Btn onClick={() => go("s6")} style={{ marginTop: 12 }}>Pay $49 and join queue</Btn>
    </div>
  );
};

/* ── S19: Charlie In-Session Reveal ── */
const S19_CharlieReveal = ({ go }) => {
  const [accepted, setAccepted] = useState(null);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.dark, padding: "0 28px" }}>
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 300, height: 300, background: `${C.brand}15`, borderRadius: 999, filter: "blur(80px)" }} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, maxWidth: 320 }}>
        {accepted === null ? <>
          <div style={{ width: 72, height: 72, borderRadius: 999, background: `${C.brand}28`, border: `2px solid ${C.brand}66`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 32 }}>🌟</span></div>
          <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 20, textAlign: "center", margin: 0 }}>Your healer is Charlie Goldsmith</h2>
          <p style={{ color: C.muted, fontSize: 14, textAlign: "center", lineHeight: 1.5 }}>He'd like to continue this session on video. Would you like that?</p>
          <Card><p style={{ color: C.faint, fontSize: 11, margin: 0 }}>No recording. Video is optional.</p></Card>
          <Btn onClick={() => setAccepted(true)}>Yes — switch to video</Btn>
          <Btn primary={false} onClick={() => setAccepted(false)}>No thanks — continue anonymously</Btn>
        </> : accepted ? <>
          <div style={{ width: "100%", height: 200, borderRadius: 16, background: `${C.brand}15`, border: `1px solid ${C.brand}33`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: C.brand, fontSize: 14 }}>📹 Live video session</span></div>
          <p style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Connected with Charlie Goldsmith</p>
          <Btn primary={false} onClick={() => go("s10")}>End session</Btn>
        </> : <>
          <Tag>Continuing anonymously</Tag>
          <p style={{ color: C.muted, fontSize: 14, textAlign: "center" }}>Session continues as normal. Your healer is still working with you.</p>
          <Btn onClick={() => go("s9")}>Return to session</Btn>
        </>}
      </div>
    </div>
  );
};

/* ── S20: Profile & Settings ── */
const S20_Profile = ({ go }) => {
  const [role, setRole] = useState("case");
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.dark, padding: "20px 24px 28px", overflowY: "auto" }}>
      <Header title="Profile & settings" onBack={() => go("s1")} />
      <div style={{ flex: 1, paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 2 }}>Role</p>
        <div style={{ display: "flex", gap: 8 }}><Pill active={role === "case"} onClick={() => setRole("case")}>Case</Pill><Pill active={role === "healer"} onClick={() => setRole("healer")}>Healer</Pill></div>
        <p style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, marginTop: 8 }}>Account</p>
        {[["Display name", ""], ["Email", "user@example.com"], ["Language", "English"], ["Notifications", "On"], ["Accessibility", "Default"], ["Payment methods", "None saved"]].map(([label, val]) => (
          <Card key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14 }}>
            <span style={{ color: "#fff", fontSize: 13 }}>{label}</span>
            <span style={{ color: C.muted, fontSize: 13 }}>{val || "Not set"}</span>
          </Card>
        ))}
        <p style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, marginTop: 8 }}>Legal</p>
        <Card style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14, cursor: "pointer" }}>
          <span style={{ color: "#fff", fontSize: 13 }}>View consent history</span><span style={{ color: C.faint }}>→</span>
        </Card>
        <Card style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14, cursor: "pointer" }} onClick={() => go("s23")}>
          <span style={{ color: C.red, fontSize: 13 }}>Delete account</span><span style={{ color: C.faint }}>→</span>
        </Card>
      </div>
    </div>
  );
};

/* ── S21: Session History ── */
const S21_History = ({ go }) => {
  const sessions = [
    { date: "Today", issue: "Neck & back pain", before: [7, 5], after: [3, 2], dur: "12 min" },
    { date: "2 weeks ago", issue: "Shoulder tension", before: [6], after: [2], dur: "8 min" },
    { date: "1 month ago", issue: "Lower back pain", before: [8], after: [5], dur: "15 min" },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.dark }}>
      <div style={{ padding: "20px 24px 14px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 22, margin: 0 }}>Your sessions</h2>
          <div style={{ display: "flex", gap: 6 }}>
            <Pill active onClick={() => go("s1")}>Home</Pill>
            <Pill onClick={() => go("s20")}>Settings</Pill>
          </div>
        </div>
        <svg viewBox="0 0 300 50" style={{ width: "100%" }}><polyline points="30,40 150,20 270,8" fill="none" stroke={C.brand} strokeWidth="2" />{[["30","40","8"],["150","20","5"],["270","8","3"]].map(([x,y,v],i) => <g key={i}><circle cx={x} cy={y} r="3.5" fill={C.brand} /><text x={x} y={Number(y)-7} textAnchor="middle" fill={C.brand} fontSize="8" fontWeight="600">{v}</text></g>)}</svg>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 24px" }}>
        {sessions.map((s, i) => (
          <Card key={i} style={{ marginBottom: 10, cursor: "pointer" }} onClick={() => go("s11")}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div><p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: 0 }}>{s.issue}</p><p style={{ color: C.faint, fontSize: 12, margin: "2px 0 0" }}>{s.date} · {s.dur} · Healer anon</p></div>
              <Tag color="#22c55e">Improved</Tag>
            </div>
            <div style={{ display: "flex", gap: 8 }}>{s.before.map((b, j) => <div key={j} style={{ display: "flex", gap: 4, alignItems: "center" }}><span style={{ color: C.muted, fontSize: 12 }}>{b}</span><span style={{ color: C.faint, fontSize: 11 }}>→</span><span style={{ color: C.brand, fontWeight: 700, fontSize: 12 }}>{s.after[j]}</span></div>)}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

/* ── S22: Support & Reporting ── */
const S22_Support = ({ go }) => {
  const types = ["Safety issue", "Inappropriate behaviour", "Technical problem", "Payment issue", "Session feedback", "Request account data"];
  const [sel, setSel] = useState(null); const [sent, setSent] = useState(false);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.dark, padding: "20px 24px 28px", overflowY: "auto" }}>
      <Header title="Support & reporting" sub="How can we help?" onBack={() => go("s20")} />
      <div style={{ flex: 1, paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {!sent ? <>
          <p style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>What's this about?</p>
          {types.map((t, i) => (
            <Card key={i} glow={sel === i} style={{ cursor: "pointer", padding: 14 }} onClick={() => setSel(i)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#fff", fontSize: 13 }}>{t}</span>
                <div style={{ width: 18, height: 18, borderRadius: 999, border: `2px solid ${sel === i ? C.brand : "rgba(255,255,255,0.2)"}`, background: sel === i ? C.brand : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{sel === i && <div style={{ width: 8, height: 8, borderRadius: 999, background: "#fff" }} />}</div>
              </div>
            </Card>
          ))}
          {sel !== null && <textarea placeholder="Tell us more…" style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, color: "#fff", fontSize: 13, outline: "none", fontFamily: font, minHeight: 60, resize: "none" }} />}
        </> : <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: `${C.brand}28`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 24 }}>✓</span></div>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Report submitted</p>
          <p style={{ color: C.muted, fontSize: 13, textAlign: "center" }}>We'll respond within 24 hours. Urgent safety issues: call support directly.</p>
        </div>}
      </div>
      {!sent && <Btn disabled={sel === null} onClick={() => setSent(true)} style={{ marginTop: 12 }}>Submit report</Btn>}
      {sent && <Btn onClick={() => go("s20")} style={{ marginTop: 12 }}>Back to settings</Btn>}
    </div>
  );
};

/* ── S23: Account Deletion ── */
const S23_DeleteAccount = ({ go }) => {
  const [typed, setTyped] = useState(""); const [deleted, setDeleted] = useState(false);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.dark, padding: "20px 24px 28px" }}>
      <Header title="Delete account" onBack={() => go("s20")} />
      <div style={{ flex: 1, paddingTop: 24, display: "flex", flexDirection: "column" }}>
        {!deleted ? <>
          <Card style={{ marginBottom: 16, borderColor: `${C.red}33` }}>
            <p style={{ color: C.red, fontWeight: 600, fontSize: 14, margin: "0 0 6px" }}>This action is permanent</p>
            <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.5, margin: 0 }}>Your personal data will be removed or anonymised immediately. Financial and legal records may be retained as required by law.</p>
          </Card>
          <p style={{ color: "#fff", fontSize: 14, marginBottom: 8 }}>Type <strong style={{ color: C.red }}>DELETE</strong> to confirm</p>
          <Input value={typed} onChange={e => setTyped(e.target.value)} placeholder="Type DELETE" style={{ marginBottom: 16 }} />
          <Btn danger disabled={typed !== "DELETE"} onClick={() => setDeleted(true)}>Delete my account</Btn>
        </> : <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: `${C.red}22`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 24 }}>👋</span></div>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Account deleted</p>
          <p style={{ color: C.muted, fontSize: 13, textAlign: "center" }}>Your data has been removed. We're sorry to see you go.</p>
          <Btn primary={false} onClick={() => go("s1")} style={{ marginTop: 12 }}>Return to app</Btn>
        </div>}
      </div>
    </div>
  );
};

/* ── Admin Dashboard ── */
const AdminDash = ({ go }) => {
  const metrics = [
    { label: "Live queue", val: "34", sub: "12 free · 22 paid", color: C.brand },
    { label: "Avg wait", val: "14m", sub: "Free 18m · Paid 8m", color: C.brand },
    { label: "Active sessions", val: "8", sub: "3 free · 5 paid", color: "#818cf8" },
    { label: "Healers online", val: "12", sub: "4 qualified · 8 test", color: "#818cf8" },
    { label: "Failed matches", val: "2", sub: "Last hour", color: C.amber },
    { label: "Safety incidents", val: "0", sub: "Requiring action", color: "#22c55e" },
    { label: "Revenue today", val: "$1,247", sub: "Free: 34 · Paid: 22", color: C.brand },
    { label: "Session success", val: "68%", sub: "Meaningful change rate", color: "#22c55e" },
  ];
  const [role, setRole] = useState("super");
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.dark, overflowY: "auto" }}>
      <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div><Tag color="#818cf8">Admin</Tag><h2 style={{ color: "#fff", fontWeight: 900, fontSize: 20, margin: "6px 0 0" }}>ENNIE Dashboard</h2></div>
          <button onClick={() => go("s1")} style={{ color: C.brand, fontSize: 12, background: "none", border: "none", cursor: "pointer", fontFamily: font }}>← App</button>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["ops", "trust", "super"].map(r => <Pill key={r} active={role === r} onClick={() => setRole(r)}>{r === "ops" ? "Ops" : r === "trust" ? "Trust & Safety" : "Super admin"}</Pill>)}
        </div>
      </div>
      <div style={{ padding: "14px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {metrics.map((m, i) => (
          <Card key={i} style={{ padding: 14, cursor: "pointer" }}>
            <p style={{ color: m.color, fontWeight: 900, fontSize: 22, margin: 0 }}>{m.val}</p>
            <p style={{ color: "#fff", fontSize: 12, fontWeight: 600, margin: "2px 0" }}>{m.label}</p>
            <p style={{ color: C.faint, fontSize: 10, margin: 0 }}>{m.sub}</p>
          </Card>
        ))}
      </div>
      {role === "super" && <div style={{ padding: "6px 20px 20px" }}>
        <Card style={{ padding: 14 }}>
          <p style={{ color: "#fff", fontWeight: 600, fontSize: 13, margin: "0 0 10px" }}>Qualification thresholds</p>
          {[["Min sessions", 30, 50], ["Min change rate", 60, 100], ["Timer (seconds)", 300, 600]].map(([label, val, max]) => (
            <div key={label} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: C.muted, fontSize: 12 }}>{label}</span><span style={{ color: C.brand, fontSize: 12, fontWeight: 700 }}>{val}</span></div>
              <input type="range" min="0" max={max} value={val} readOnly style={{ width: "100%", accentColor: C.brand }} />
            </div>
          ))}
          <p style={{ color: C.faint, fontSize: 10, margin: "6px 0 0" }}>All changes logged with admin ID and timestamp</p>
        </Card>
      </div>}
    </div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN APP — screen navigator
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const SCREENS = {
  s1: { comp: S1_Landing, label: "1. Landing" },
  s2: { comp: S2_SignUp, label: "2. Sign Up" },
  s3: { comp: S3_AgeGate, label: "3. Age Gate" },
  s4: { comp: S4_Intake, label: "4. Intake" },
  s6: { comp: S6_Queue, label: "6. Choose Your Session" },
  s7: { comp: S7_ReadyNow, label: "7. Ready Now" },
  s8: { comp: S8_SymptomConfirm, label: "8. Symptom Confirm" },
  s9: { comp: S9_Session, label: "9. Live Session" },
  s10: { comp: S10_SessionEnd, label: "10. Session End" },
  s11: { comp: S11_FollowUp, label: "11. Follow-up" },
  s12: { comp: S12_HealerOnboard, label: "12. Healer Onboard" },
  s13: { comp: S13_HealerHome, label: "13. Healer Home" },
  s14: { comp: S14_MatchNotif, label: "14. Match Notif" },
  s15: { comp: S15_HealerSession, label: "15. Healer Session" },
  s16: { comp: S16_HealerPostSession, label: "16. Healer Post-Session" },
  s17: { comp: S17_TierSelect, label: "17. Tier Selection" },
  s18: { comp: S18_Payment, label: "18. Payment" },
  s19: { comp: S19_CharlieReveal, label: "19. Charlie Reveal" },
  s20: { comp: S20_Profile, label: "20. Profile & Settings" },
  s21: { comp: S21_History, label: "21. Session History" },
  s22: { comp: S22_Support, label: "22. Support" },
  s23: { comp: S23_DeleteAccount, label: "23. Delete Account" },
  admin: { comp: AdminDash, label: "Admin Dashboard" },
};

const GROUPS = [
  { title: "Case Journey", keys: ["s1","s2","s3","s4","s6","s7","s8","s9","s10","s11"] },
  { title: "Healer Journey", keys: ["s12","s13","s14","s15","s16"] },
  { title: "Paid Sessions", keys: ["s17","s18"] },
  { title: "Charlie Featured", keys: ["s19"] },
  { title: "Shared / Account", keys: ["s20","s21","s22","s23"] },
  { title: "Admin", keys: ["admin"] },
];

export default function ENNIEv1_3() {
  const [screen, setScreen] = useState("s1");
  const [navOpen, setNavOpen] = useState(false);
  const Comp = (SCREENS[screen] || SCREENS.s1).comp;
  const label = (SCREENS[screen] || SCREENS.s1).label;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.darker, padding: 12, fontFamily: font }}>
      {/* top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, width: 390 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 24, height: 24, borderRadius: 8, background: C.brand, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontWeight: 900, fontSize: 11 }}>E</span></div>
          <span style={{ color: C.brand, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>ENNIE v1.3</span>
        </div>
        <span style={{ color: C.faint, fontSize: 11, flex: 1, textAlign: "center" }}>{label}</span>
        <button onClick={() => setNavOpen(n => !n)} style={{ color: C.brand, fontSize: 12, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.brand}44`, borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontFamily: font, fontWeight: 600 }}>{navOpen ? "✕ Close" : "☰ All screens"}</button>
      </div>

      {/* phone or nav */}
      <div style={{ position: "relative", width: 390, height: 844, borderRadius: 48, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {navOpen ? (
          <div style={{ height: "100%", background: C.dark, overflowY: "auto", padding: "60px 24px 24px" }}>
            <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 20, marginBottom: 4 }}>All 23 screens + Admin</h2>
            <p style={{ color: C.muted, fontSize: 12, marginBottom: 16 }}>Master Spec v1.3 · Every decision locked</p>
            {GROUPS.map(g => (
              <div key={g.title} style={{ marginBottom: 16 }}>
                <p style={{ color: C.brand, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>{g.title}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {g.keys.map(k => (
                    <button key={k} onClick={() => { setScreen(k); setNavOpen(false); }} style={{
                      padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, transition: "all 0.2s",
                      background: screen === k ? C.brand : "rgba(255,255,255,0.06)", color: screen === k ? "#fff" : C.muted,
                      border: screen === k ? "none" : `1px solid ${C.border}`
                    }}>{SCREENS[k].label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <PhoneFrame label={label}>
            <Comp go={setScreen} />
          </PhoneFrame>
        )}
      </div>
      <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 11, marginTop: 10 }}>Interactive prototype · all decisions locked · not production code</div>
    </div>
  );
}
