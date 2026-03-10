import { useState, useEffect, useRef } from 'react';
import {
  PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const API = "https://stunning-space-yodel-q7wq49gjx6wjf4jw5-3000.app.github.dev";

const FINLEY_MESSAGES = {
  happy: [
    "Hello! I'm Finley ❄️ Your finances are looking great today!",
    "Your savings rate is solid — keep it up! ✨",
    "You're on track! Want tips to grow your investments?",
    "Great job building your emergency fund! 🌟",
    "Your net worth is growing — you're doing amazing!",
    "Psst… have you reviewed your goals lately? You're so close! ❄️",
  ],
  neutral: [
    "Hello! I'm Finley ❄️ How can I help you stay financially healthy today?",
    "Your finances are okay, but there's room to grow! 💪",
    "A small budget tweak could make a big difference!",
    "Have you thought about cutting any subscriptions? 🤔",
    "Let's work on boosting that savings rate!",
    "Your emergency fund could use a little top-up ❄️",
  ],
  worried: [
    "Hi… I'm Finley ❄️ I'm a little worried about your finances. Let's chat!",
    "Your expenses are quite high — want to make a plan? 🌨️",
    "Let's tackle that debt together — I'm here to help!",
    "Your emergency runway is low. Let's fix that first ❄️",
    "Don't worry — small steps lead to big improvements! 💙",
    "Want me to help you build a better budget? Let's go!",
  ],
};

async function post(path, body) {
  const r = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

const DEFAULT_PROFILE = {
  assets: { savings: 18000, investments: 24000, cpf: 12000, insuranceValue: 4000 },
  liabilities: { debt: 6500 },
  monthly: { income: 4200, expenses: 2550, subscriptions: 4 },
  goals: [
    { name: "Emergency Fund", current: 18000, target: 25000, deadline: "Dec 2026" },
    { name: "Travel Fund", current: 2500, target: 6000, deadline: "Jun 2027" },
    { name: "House Downpayment", current: 12000, target: 60000, deadline: "2030" },
  ],
  reminders: [
    { name: "Credit Card Bill", due: "10 Mar", type: "Essential" },
    { name: "Phone Bill", due: "12 Mar", type: "Essential" },
    { name: "Netflix", due: "15 Mar", type: "Cuttable" },
    { name: "Spotify", due: "18 Mar", type: "Flexible" },
  ],
};

const TABS = [
  { id: "Overview",     icon: "⊞" },
  { id: "Health Score", icon: "♥" },
  { id: "Life Shock",   icon: "⚡" },
  { id: "Behaviour",    icon: "↗" },
  { id: "Macro",        icon: "🌐" },
  { id: "AI Advisor",   icon: "💬" },
  { id: "Profile",      icon: "👤" },
];

// ─── FINLEY SVG ───────────────────────────────────────────────────────────────
function Finley({ mood = "happy", size = 120 }) {
  const ink        = "#374151";
  const cream      = "#fdfdfb";
  const white      = "#ffffff";
  const innerEar   = "#f9d5d3";
  const eyeBlue    = "#60a5fa";
  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      <svg width="100%" height="100%" viewBox="0 0 120 120" fill="none">
        <defs>
          <radialGradient id="foxBg" cx="50%" cy="55%" r="50%">
            <stop offset="0%"   stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="64" r="52" fill="url(#foxBg)" />
        <ellipse cx="60" cy="112" rx="34" ry="6" fill="#60a5fa" opacity="0.2" />
        {/* tail */}
        <path d="M80,95 C105,100 115,80 110,65 C105,50 85,55 78,75 C72,92 58,110 62,110 C66,110 74,102 80,95"
          fill={cream} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M64,108 Q68,105 70,108" stroke={ink} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
        {/* body */}
        <path d="M45,85 Q40,112 60,112 Q80,112 75,85" fill={cream} stroke={ink} strokeWidth="2.5" />
        <path d="M78,102 Q83,105 81,110" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
        {/* legs */}
        <path d="M48,95 L46,108 Q46,112 52,112 L54,112 Q58,112 58,108 L56,95" fill={cream} stroke={ink} strokeWidth="2" />
        <path d="M48,112 Q48,110 49,112 M51,112 Q51,110 52,112 M54,112 Q54,110 55,112" stroke={ink} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M72,95 L74,108 Q74,112 68,112 L66,112 Q62,112 62,108 L64,95" fill={cream} stroke={ink} strokeWidth="2" />
        <path d="M72,112 Q72,110 71,112 M69,112 Q69,110 68,112 M66,112 Q66,110 65,112" stroke={ink} strokeWidth="1.2" strokeLinecap="round" />
        {/* chest */}
        <path d="M42,78 Q45,88 48,83 Q52,98 60,93 Q68,98 72,83 Q75,88 78,78 Q60,82 42,78"
          fill={white} stroke={ink} strokeWidth="2" strokeLinejoin="round" />
        {/* ears */}
        <path d="M32,45 Q15,0 52,25 Q58,35 55,50 Z" fill={cream} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M35,42 Q22,10 48,28 Q52,35 50,45 Z" fill={innerEar} />
        <path d="M88,45 Q105,0 68,25 Q62,35 65,50 Z" fill={cream} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M85,42 Q98,10 72,28 Q68,35 70,45 Z" fill={innerEar} />
        {/* head */}
        <path d="M30,50 Q25,65 40,75 Q50,80 60,80 Q70,80 80,75 Q95,65 90,50 Q85,25 60,25 Q35,25 30,50"
          fill={cream} stroke={ink} strokeWidth="2.5" />
        {/* brows */}
        <path d="M41,42 Q46,40 51,42" stroke={ink} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4" />
        <path d="M69,42 Q74,40 79,42" stroke={ink} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4" />
        {/* eyes — small, cute */}
        <circle cx="46" cy="55" r="5.5" fill="#111827" />
        <path d="M40,58 Q46,63 52,58" stroke={eyeBlue} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.3" />
        <circle cx="48.5" cy="52.5" r="1.8" fill="white" />
        <circle cx="74" cy="55" r="5.5" fill="#111827" />
        <path d="M68,58 Q74,63 80,58" stroke={eyeBlue} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.3" />
        <circle cx="76.5" cy="52.5" r="1.8" fill="white" />
        {/* nose */}
        <path d="M58,64 Q60,68 62,64 Q60,63 58,64 Z" fill="#374151" />
        {/* mouth */}
        <path d="M60,67 L60,69" stroke={ink} strokeWidth="2" strokeLinecap="round" />
        {mood === "happy"   && <path d="M54,69 Q57,73 60,69 Q63,73 66,69" stroke={ink} strokeWidth="2" strokeLinecap="round" fill="none" />}
        {mood === "neutral" && <path d="M55,70 Q60,71 65,70" stroke={ink} strokeWidth="2" strokeLinecap="round" fill="none" />}
        {mood === "worried" && <path d="M54,72 Q60,68 66,72" stroke={ink} strokeWidth="2" strokeLinecap="round" fill="none" />}
      </svg>
    </div>
  );
}

// ─── SCORE RING ───────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 140 }) {
  const r     = 44;
  const circ  = 2 * Math.PI * r;
  const dash  = (score / 100) * circ;
  const color = score >= 75 ? "#059669" : score >= 50 ? "#d97706" : "#dc2626";
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e0f2fe" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.5s ease" }} />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1 }}>
        <span style={{ fontSize: size * 0.2, fontWeight: 800, color: "#0c4a6e", fontFamily: "monospace" }}>{score}</span>
        <span style={{ fontSize: size * 0.09, color: "#7dd3fc", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginTop: 4 }}>Health</span>
      </div>
    </div>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
function Card({ children, title, icon, style = {} }) {
  return (
    <div style={{
      background: "white", borderRadius: 28, border: "1px solid #e0f2fe",
      boxShadow: "0 4px 24px rgba(14,165,233,0.07)", padding: "36px 40px",
      display: "flex", flexDirection: "column", ...style,
    }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
          <h3 style={{ fontSize: 12, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.2em", margin: 0 }}>{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

// ─── METRIC BOX ──────────────────────────────────────────────────────────────
function MetricBox({ label, value, sub, color = "#0c4a6e", bg = "#f0f9ff" }) {
  return (
    <div style={{ background: bg, borderRadius: 20, border: "1px solid #e0f2fe", padding: "28px 30px" }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 14 }}>{label}</p>
      <p style={{ fontSize: 32, fontWeight: 800, color, fontFamily: "monospace", letterSpacing: -0.5, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 10 }}>{sub}</p>}
    </div>
  );
}

// ─── INSIGHT ROW ─────────────────────────────────────────────────────────────
function InsightRow({ text }) {
  const good = /healthy|strong|positive|diversified|manageable|decent/i.test(text);
  const warn = /below|negative|high risk|low|falls|turns negative/i.test(text);
  const dot  = good ? "#10b981" : warn ? "#f59e0b" : "#0ea5e9";
  return (
    <div style={{ display: "flex", gap: 16, padding: "18px 22px", borderRadius: 18, background: "#f8fafc", border: "1px solid #e0f2fe", marginBottom: 12 }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: dot, flexShrink: 0, marginTop: 6 }} />
      <p style={{ fontSize: 15, color: "#334155", lineHeight: 1.7, margin: 0 }}>{text}</p>
    </div>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
function ProgressBar({ value, max, color = "#0ea5e9" }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div style={{ height: 12, background: "#e0f2fe", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 1s ease" }} />
      </div>
    </div>
  );
}

// ─── CHAT WIDGET ─────────────────────────────────────────────────────────────
function ChatWidget({ mood, scoreData, profile }) {
  const [open, setOpen]       = useState(false);
  const [msgIdx, setMsgIdx]   = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput]     = useState("");
  const [busy, setBusy]       = useState(false);
  const bottomRef             = useRef(null);
  const msgs                  = FINLEY_MESSAGES[mood];

  useEffect(() => {
    const t = setTimeout(() => setMessages([{ role: "finley", text: msgs[0] }]), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => (i + 1) % msgs.length), 8000);
    return () => clearInterval(t);
  }, [msgs.length]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    if (!input.trim()) return;
    const txt = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", text: txt }]);
    setBusy(true);
    try {
      const d = await post("/advisor", { prompt: txt, profile });
      setMessages(m => [...m, { role: "finley", text: d.reply }]);
    } catch {
      setMessages(m => [...m, { role: "finley", text: msgs[Math.floor(Math.random() * msgs.length)] + "\n(Make sure your backend is running!)" }]);
    }
    setBusy(false);
  }

  return (
    <div style={{ position: "fixed", bottom: 36, right: 36, zIndex: 9999 }}>
      {/* Bubble tooltip */}
      {!open && (
        <div style={{
          position: "absolute", bottom: 104, right: 0,
          background: "white", border: "1px solid #bae6fd", borderRadius: 20,
          padding: "12px 18px", fontSize: 13, color: "#0c4a6e", fontWeight: 600,
          maxWidth: 240, boxShadow: "0 8px 24px rgba(14,165,233,0.15)", lineHeight: 1.5,
        }}>
          {msgs[msgIdx]}
          <div style={{ position: "absolute", bottom: -8, right: 30, width: 0, height: 0,
            borderLeft: "8px solid transparent", borderRight: "8px solid transparent",
            borderTop: "8px solid #bae6fd" }} />
        </div>
      )}

      {/* Chat panel */}
      {open && (
        <div style={{
          position: "absolute", bottom: 104, right: 0, width: 420,
          background: "white", borderRadius: 32,
          boxShadow: "0 32px 80px rgba(12,74,110,0.18)", border: "1px solid #e0f2fe",
          display: "flex", flexDirection: "column", height: 580, overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ background: "#0c4a6e", padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, zIndex: 1, position: "relative" }}>
              <div style={{ width: 56, height: 56, background: "rgba(255,255,255,0.1)", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)" }}>
                <Finley mood={mood} size={56} />
              </div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 800, color: "white", margin: 0 }}>Finley</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399" }} />
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#7dd3fc", textTransform: "uppercase", letterSpacing: "0.15em", margin: 0 }}>Arctic AI Advisor</p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 22, cursor: "pointer", zIndex: 1, position: "relative", lineHeight: 1 }}>✕</button>
            <div style={{ position: "absolute", right: -40, top: -40, width: 160, height: 160, background: "rgba(14,165,233,0.15)", borderRadius: "50%", filter: "blur(40px)" }} />
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16, background: "#f8faff" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "82%", padding: "14px 18px", borderRadius: 20, fontSize: 14, lineHeight: 1.65,
                  ...(m.role === "user"
                    ? { background: "#0c4a6e", color: "white", borderTopRightRadius: 4, boxShadow: "0 4px 12px rgba(12,74,110,0.2)" }
                    : { background: "white", color: "#0c4a6e", borderTopLeftRadius: 4, border: "1px solid #e0f2fe" })
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {busy && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ background: "white", border: "1px solid #e0f2fe", borderTopLeftRadius: 4, borderRadius: 20, padding: "14px 18px", fontSize: 14, color: "#94a3b8" }}>Finley is thinking ❄️</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick chips */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid #f0f9ff", display: "flex", gap: 8, flexWrap: "wrap", background: "white", flexShrink: 0 }}>
            {["budget", "debt", "goals", "investments"].map(q => (
              <button key={q} onClick={() => setInput(`Tell me about my ${q}`)}
                style={{ background: "#f0f9ff", border: "1px solid #bae6fd", color: "#0ea5e9", fontSize: 12, padding: "6px 14px", borderRadius: 99, cursor: "pointer", fontWeight: 600 }}>
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "16px 20px 20px", background: "white", borderTop: "1px solid #f0f9ff", display: "flex", gap: 10, flexShrink: 0 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask Finley anything…"
              style={{ flex: 1, background: "#f0f9ff", border: "1px solid #e0f2fe", borderRadius: 16, padding: "13px 18px", fontSize: 14, outline: "none", fontFamily: "inherit", color: "#0c4a6e" }} />
            <button onClick={send} disabled={busy}
              style={{ width: 50, height: 50, background: "#0c4a6e", color: "white", border: "none", borderRadius: 16, cursor: "pointer", fontSize: 18, flexShrink: 0, boxShadow: "0 4px 12px rgba(12,74,110,0.3)" }}>
              →
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setOpen(o => !o)}
        style={{ width: 80, height: 80, background: "#0c4a6e", borderRadius: 24, border: "4px solid white", boxShadow: "0 16px 48px rgba(12,74,110,0.35)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", transition: "transform 0.18s" }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
        <div style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, background: "#f43f5e", borderRadius: "50%", border: "3px solid white", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: "white" }}>1</span>
        </div>
        <Finley mood={mood} size={64} />
      </button>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab,     setActiveTab]     = useState("Overview");
  const [profile,       setProfile]       = useState(DEFAULT_PROFILE);
  const [scoreData,     setScoreData]     = useState(null);
  const [shockData,     setShockData]     = useState(null);
  const [behaviourData, setBehaviourData] = useState(null);
  const [macroData,     setMacroData]     = useState(null);
  const [advisorReply,  setAdvisorReply]  = useState("");
  const [advisorInput,  setAdvisorInput]  = useState("");
  const [shockScenario, setShockScenario] = useState("jobloss");
  const [macroScenario, setMacroScenario] = useState("recession");
  const [loading,       setLoading]       = useState({});
  const [profileEdit,   setProfileEdit]   = useState(false);
  const [editDraft,     setEditDraft]     = useState(DEFAULT_PROFILE);

  useEffect(() => { fetchScore(); fetchBehaviour(); }, [profile]);

  async function fetchScore() {
    try { const d = await post("/score", { assets: profile.assets, liabilities: profile.liabilities, monthly: profile.monthly }); setScoreData(d); } catch {}
  }
  async function fetchBehaviour() {
    try { const d = await post("/behaviour", { monthly: profile.monthly, reminders: profile.reminders, goals: profile.goals }); setBehaviourData(d); } catch {}
  }
  async function fetchShock() {
    setLoading(l => ({ ...l, shock: true }));
    try { const d = await post("/shock", { scenario: shockScenario, savings: profile.assets.savings, investments: profile.assets.investments, income: profile.monthly.income, expenses: profile.monthly.expenses, debt: profile.liabilities.debt }); setShockData(d); } catch {}
    setLoading(l => ({ ...l, shock: false }));
  }
  async function fetchMacro() {
    setLoading(l => ({ ...l, macro: true }));
    try { const d = await post("/macro", { scenario: macroScenario, investments: profile.assets.investments, expenses: profile.monthly.expenses, debt: profile.liabilities.debt, income: profile.monthly.income }); setMacroData(d); } catch {}
    setLoading(l => ({ ...l, macro: false }));
  }
  async function fetchAdvisor() {
    if (!advisorInput.trim()) return;
    setLoading(l => ({ ...l, advisor: true }));
    try { const d = await post("/advisor", { prompt: advisorInput, profile }); setAdvisorReply(d.reply); } catch {}
    setLoading(l => ({ ...l, advisor: false }));
  }
  function saveProfile() { setProfile(editDraft); setProfileEdit(false); }

  const mood        = !scoreData ? "neutral" : scoreData.healthScore >= 75 ? "happy" : scoreData.healthScore >= 50 ? "neutral" : "worried";
  const moodColor   = mood === "happy" ? "#10b981" : mood === "neutral" ? "#f59e0b" : "#f43f5e";
  const moodText    = mood === "happy" ? "thriving" : mood === "neutral" ? "stable" : "under pressure";
  const moodDesc    = mood === "happy"
    ? "Finley is doing a happy dance! Your savings rate is exceptional this month. Consider increasing your investment contributions."
    : mood === "neutral"
    ? "The arctic winds are calm. You're on a steady course, but we could optimise your subscription spending."
    : "Brrr! It's getting cold. Finley is worried about your debt repayments. Let's make a plan together.";

  const totalAssets = profile.assets.savings + profile.assets.investments + profile.assets.cpf + profile.assets.insuranceValue;
  const netWorth    = totalAssets - profile.liabilities.debt;
  const surplus     = profile.monthly.income - profile.monthly.expenses;

  const pieData = [
    { name: "Savings",     value: profile.assets.savings,        color: "#0ea5e9" },
    { name: "Investments", value: profile.assets.investments,    color: "#6366f1" },
    { name: "CPF",         value: profile.assets.cpf,            color: "#8b5cf6" },
    { name: "Insurance",   value: profile.assets.insuranceValue, color: "#d946ef" },
  ].filter(d => d.value > 0);

  const cashFlow = [
    { name: "Oct", income: 4000, expenses: 2800 },
    { name: "Nov", income: 4200, expenses: 2500 },
    { name: "Dec", income: 4200, expenses: 3200 },
    { name: "Jan", income: 4500, expenses: 2400 },
    { name: "Feb", income: 4200, expenses: 2550 },
    { name: "Mar", income: profile.monthly.income, expenses: profile.monthly.expenses },
  ];

  // ── shared button styles ──
  const btnPrimary = {
    background: "linear-gradient(135deg,#0c4a6e,#0ea5e9)", color: "white",
    padding: "14px 28px", borderRadius: 14, fontSize: 15, fontWeight: 700,
    border: "none", cursor: "pointer", boxShadow: "0 8px 20px rgba(14,165,233,0.3)",
    display: "inline-flex", alignItems: "center", gap: 8,
  };
  const btnGhost = {
    background: "#f0f9ff", color: "#0c4a6e",
    padding: "14px 28px", borderRadius: 14, fontSize: 15, fontWeight: 700,
    border: "1px solid #e0f2fe", cursor: "pointer",
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans','Inter','Segoe UI',sans-serif; background: #f0f9ff; color: #0c4a6e; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #bae6fd; border-radius: 99px; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex" }}>

        {/* ═══════════ SIDEBAR ═══════════ */}
        <aside style={{ width: 280, background: "white", borderRight: "1px solid #e0f2fe", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
          {/* Logo */}
          <div style={{ padding: "36px 32px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
              <div style={{ width: 44, height: 44, background: "#0ea5e9", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(14,165,233,0.3)", fontSize: 22 }}>🛡</div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0c4a6e", letterSpacing: -0.5 }}>
                Wealth<span style={{ color: "#0ea5e9" }}>Wellness</span>
              </h1>
            </div>
            <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", paddingLeft: 2 }}>Arctic Finance Hub</p>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "0 16px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 14,
                padding: "15px 18px", borderRadius: 18, fontSize: 14, fontWeight: 700,
                border: "none", cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                background: activeTab === t.id ? "#0ea5e9" : "transparent",
                color:      activeTab === t.id ? "white"   : "#94a3b8",
                boxShadow:  activeTab === t.id ? "0 8px 20px rgba(14,165,233,0.25)" : "none",
              }}>
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                {t.id}
              </button>
            ))}
          </nav>

          {/* Finley badge */}
          <div style={{ padding: "20px 20px 28px" }}>
            <div style={{ background: "#f0f9ff", border: "1px solid #e0f2fe", borderRadius: 22, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "white", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 2px 8px rgba(14,165,233,0.1)" }}>
                <Finley mood={mood} size={52} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#0c4a6e" }}>Finley</p>
                <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 3 }}>Your Guide</p>
              </div>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: moodColor, boxShadow: `0 0 8px ${moodColor}` }} />
            </div>
          </div>
        </aside>

        {/* ═══════════ MAIN ═══════════ */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Header */}
          <header style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e0f2fe", padding: "0 44px", height: 88, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 40, flexShrink: 0 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0c4a6e", letterSpacing: -0.5 }}>{activeTab}</h2>
              <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 3 }}>Welcome back! Here's your arctic financial update.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", background: "#f0f9ff", borderRadius: 14, border: "1px solid #e0f2fe" }}>
                <span>📅</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0c4a6e" }}>March 8, 2026</span>
              </div>
              <div style={{ width: 1, height: 36, background: "#e0f2fe" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: "#0c4a6e" }}>Alex Chen</p>
                  <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 2 }}>Premium Member</p>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#e0f2fe,#bae6fd)", border: "1px solid #bae6fd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👤</div>
              </div>
            </div>
          </header>

          {/* ─── Page content ─── */}
          <div style={{ flex: 1, overflowY: "auto", padding: "44px" }}>

            {/* ════════ OVERVIEW ════════ */}
            {activeTab === "Overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>

                {/* Row 1 — hero + quick stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 32 }}>

                  {/* Hero */}
                  <div style={{ background: "linear-gradient(135deg,#0c4a6e 0%,#083344 100%)", borderRadius: 28, padding: "44px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", overflow: "hidden", position: "relative", boxShadow: "0 20px 60px rgba(12,74,110,0.22)" }}>
                    <div style={{ position: "relative", zIndex: 1, maxWidth: 460 }}>
                      <div style={{ display: "inline-flex", padding: "7px 16px", background: "rgba(255,255,255,0.1)", borderRadius: 99, border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", marginBottom: 20 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "#7dd3fc" }}>Financial Status</span>
                      </div>
                      <h3 style={{ fontSize: 36, fontWeight: 800, color: "white", letterSpacing: -0.5, marginBottom: 18, lineHeight: 1.2 }}>
                        Your finances are{" "}
                        <span style={{ color: moodColor, fontStyle: "italic" }}>{moodText}</span>
                      </h3>
                      <p style={{ color: "#bae6fd", fontSize: 15, lineHeight: 1.75, marginBottom: 36 }}>{moodDesc}</p>
                      <div style={{ display: "flex", gap: 16 }}>
                        <button style={btnPrimary} onClick={() => setActiveTab("Health Score")}>Deep Dive →</button>
                        <button style={{ ...btnGhost, background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.15)" }} onClick={() => setActiveTab("Profile")}>Settings</button>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, paddingRight: 8, position: "relative", zIndex: 1 }}>
                      <Finley mood={mood} size={220} />
                    </div>
                    <div style={{ position: "absolute", right: -80, top: -80, width: 340, height: 340, background: "rgba(14,165,233,0.12)", borderRadius: "50%", filter: "blur(80px)" }} />
                    <div style={{ position: "absolute", left: -60, bottom: -60, width: 280, height: 280, background: "rgba(99,102,241,0.08)", borderRadius: "50%", filter: "blur(60px)" }} />
                  </div>

                  {/* Quick stats column */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <Card title="Net Worth" icon="💰" style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                        <div>
                          <p style={{ fontSize: 44, fontWeight: 800, color: "#0c4a6e", fontFamily: "monospace", letterSpacing: -1.5, lineHeight: 1 }}>${(scoreData?.netWorth || netWorth).toLocaleString()}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
                            <span style={{ color: "#10b981", fontSize: 18 }}>↗</span>
                            <span style={{ color: "#10b981", fontSize: 14, fontWeight: 700 }}>+2.4% this month</span>
                          </div>
                        </div>
                        <div style={{ width: 56, height: 56, background: "#f0f9ff", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>↗</div>
                      </div>
                    </Card>

                    <Card title="Health Score" icon="♥" style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                        <div>
                          <p style={{ fontSize: 44, fontWeight: 800, color: "#0c4a6e", fontFamily: "monospace", letterSpacing: -1.5, lineHeight: 1 }}>{scoreData?.healthScore || 0}</p>
                          <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 12 }}>
                            {(scoreData?.healthScore || 0) >= 75 ? "Excellent" : (scoreData?.healthScore || 0) >= 50 ? "Moderate" : "Needs Work"}
                          </p>
                        </div>
                        <ScoreRing score={scoreData?.healthScore || 0} size={100} />
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Row 2 — charts */}
                <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 32 }}>
                  {/* Pie */}
                  <Card title="Asset Allocation" icon="🥧">
                    <div style={{ height: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} innerRadius={60} outerRadius={90} paddingAngle={6} dataKey="value" stroke="none">
                            {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 14, border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", fontSize: 13 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
                      {pieData.map(d => (
                        <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>{d.name}</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#0c4a6e" }}>${d.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Area chart */}
                  <Card title="Monthly Cash Flow" icon="📈">
                    <div style={{ height: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={cashFlow}>
                          <defs>
                            <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.12} />
                              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 700 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 700 }} />
                          <Tooltip contentStyle={{ borderRadius: 14, border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", fontSize: 13 }} />
                          <Area type="monotone" dataKey="income"   stroke="#0ea5e9" strokeWidth={3} fill="url(#gIncome)" />
                          <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2.5} strokeDasharray="6 4" fill="none" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: "flex", gap: 28, marginTop: 20 }}>
                      {[{ color: "#0ea5e9", label: "Income" }, { color: "#f43f5e", label: "Expenses" }].map(l => (
                        <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 24, height: 3, background: l.color, borderRadius: 99 }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em" }}>{l.label}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Row 3 — reminders */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0c4a6e" }}>📅 Upcoming Reminders</h3>
                    <button style={{ fontSize: 13, fontWeight: 700, color: "#0ea5e9", background: "none", border: "none", cursor: "pointer" }}>View Calendar →</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
                    {profile.reminders.map((r, i) => {
                      const s = r.type === "Essential"
                        ? { icon: "#10b981", tag: "#dcfce7", tagText: "#166534", border: "#bbf7d0" }
                        : r.type === "Cuttable"
                        ? { icon: "#f43f5e", tag: "#ffe4e6", tagText: "#9f1239", border: "#fecdd3" }
                        : { icon: "#f59e0b", tag: "#fef9c3", tagText: "#854d0e", border: "#fde68a" };
                      return (
                        <div key={i} style={{ background: "white", borderRadius: 24, border: "1px solid #e0f2fe", padding: "28px 30px", cursor: "default", transition: "all 0.2s" }}
                          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 36px rgba(14,165,233,0.13)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                            <div style={{ width: 50, height: 50, borderRadius: 16, background: "#f0f9ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>💳</div>
                            <span style={{ fontSize: 11, padding: "6px 14px", borderRadius: 99, background: s.tag, color: s.tagText, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", border: `1px solid ${s.border}` }}>{r.type}</span>
                          </div>
                          <h4 style={{ fontSize: 17, fontWeight: 800, color: "#0c4a6e", marginBottom: 12 }}>{r.name}</h4>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 14 }}>📅</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Due {r.due}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ════════ HEALTH SCORE ════════ */}
            {activeTab === "Health Score" && (
              <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 44 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <ScoreRing score={scoreData?.healthScore || 0} size={220} />
                  <h3 style={{ fontSize: 36, fontWeight: 800, color: "#0c4a6e", marginTop: 36, letterSpacing: -0.5 }}>
                    Your Health Score is {scoreData?.healthScore || 0}
                  </h3>
                  <p style={{ color: "#64748b", marginTop: 14, maxWidth: 500, lineHeight: 1.75, fontSize: 15 }}>
                    Finley has analysed your assets, liabilities, and spending habits to determine your financial resilience.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 }}>
                  {[
                    { label: "Savings Rate",      val: `${scoreData?.savingsRate || 0}%`,    target: "20%",  color: "#0ea5e9", pct: Math.min(100, ((scoreData?.savingsRate || 0) / 20) * 100) },
                    { label: "Emergency Runway",  val: `${scoreData?.runway || 0} mo`,       target: "6 mo", color: "#10b981", pct: Math.min(100, ((scoreData?.runway || 0) / 6) * 100) },
                    { label: "Debt Ratio",        val: `${scoreData?.debtRatio || 0}%`,      target: "<30%", color: "#f43f5e", pct: Math.max(0, 100 - (scoreData?.debtRatio || 0)) },
                  ].map(s => (
                    <Card key={s.label} title={s.label} icon="📊">
                      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22 }}>
                        <span style={{ fontSize: 48, fontWeight: 800, color: s.color, fontFamily: "monospace", lineHeight: 1 }}>{s.val}</span>
                        <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Target: {s.target}</span>
                      </div>
                      <ProgressBar value={s.pct} max={100} color={s.color} />
                    </Card>
                  ))}
                </div>

                <Card title="Finley's Detailed Analysis" icon="ℹ️">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {(scoreData?.insights || []).map((ins, i) => <InsightRow key={i} text={ins} />)}
                  </div>
                </Card>
              </div>
            )}

            {/* ════════ LIFE SHOCK ════════ */}
            {activeTab === "Life Shock" && (
              <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 40 }}>
                <div style={{ textAlign: "center" }}>
                  <h3 style={{ fontSize: 32, fontWeight: 800, color: "#0c4a6e", letterSpacing: -0.5 }}>Life Shock Simulator</h3>
                  <p style={{ color: "#64748b", marginTop: 12, fontSize: 15, lineHeight: 1.7 }}>Simulate unexpected events to see how resilient your finances are. Finley will help you prepare. ❄️</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
                  {[
                    { key: "jobloss",   label: "Job Loss",       icon: "💼", desc: "Losing primary income"      },
                    { key: "inflation", label: "Inflation",      icon: "📈", desc: "Rising cost of living"      },
                    { key: "market",    label: "Market Crash",   icon: "📉", desc: "30% investment drop"        },
                    { key: "medical",   label: "Medical",        icon: "🏥", desc: "Sudden $15k expense"        },
                    { key: "accident",  label: "Accident",       icon: "🚗", desc: "Unexpected repair costs"    },
                    { key: "disability",label: "Disability",     icon: "♿", desc: "Loss of work capacity"      },
                    { key: "repair",    label: "Major Repair",   icon: "🔧", desc: "Home or car repair"         },
                    { key: "family",    label: "Family Event",   icon: "👨‍👩‍👧", desc: "Family emergency"           },
                  ].map(sc => (
                    <button key={sc.key} onClick={() => setShockScenario(sc.key)} style={{
                      padding: "22px 20px", borderRadius: 20, background: "white",
                      border: `2px solid ${shockScenario === sc.key ? "#0ea5e9" : "#e0f2fe"}`,
                      cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                      boxShadow: shockScenario === sc.key ? "0 0 0 4px rgba(14,165,233,0.12)" : "none",
                    }}>
                      <div style={{ fontSize: 30, marginBottom: 14 }}>{sc.icon}</div>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#0c4a6e", marginBottom: 6 }}>{sc.label}</p>
                      <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{sc.desc}</p>
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button onClick={fetchShock} disabled={loading.shock} style={btnPrimary}>
                    {loading.shock ? "Simulating…" : "⚡ Run Simulation"}
                  </button>
                </div>

                {shockData && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
                    <Card title={`${shockData.label} — Impact`} icon="⚡">
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                        {[
                          { label: "Savings",     before: shockData.original.savings,     after: shockData.shocked.savings },
                          { label: "Investments", before: shockData.original.investments, after: shockData.shocked.investments },
                          { label: "Income",      before: shockData.original.income,      after: shockData.shocked.income },
                          { label: "Expenses",    before: shockData.original.expenses,    after: shockData.shocked.expenses },
                        ].map(m => (
                          <div key={m.label} style={{ background: "#f8fafc", borderRadius: 18, border: "1px solid #e0f2fe", padding: "22px 24px" }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>{m.label}</p>
                            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>Before: ${m.before.toLocaleString()}</p>
                            <p style={{ fontSize: 22, fontWeight: 800, color: m.after < m.before ? "#f43f5e" : "#10b981" }}>After: ${m.after.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                        <div style={{ background: shockData.monthlyBalance < 0 ? "#fff1f2" : "#f0fdf4", borderRadius: 18, border: `1px solid ${shockData.monthlyBalance < 0 ? "#fecdd3" : "#bbf7d0"}`, padding: "22px 24px" }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Monthly Balance</p>
                          <p style={{ fontSize: 28, fontWeight: 800, color: shockData.monthlyBalance < 0 ? "#f43f5e" : "#10b981" }}>${shockData.monthlyBalance.toLocaleString()}</p>
                        </div>
                        <div style={{ background: "#f8fafc", borderRadius: 18, border: "1px solid #e0f2fe", padding: "22px 24px" }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Runway</p>
                          <p style={{ fontSize: 28, fontWeight: 800, color: "#0c4a6e" }}>{shockData.emergencyRunway} mo</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 24, background: "#f8fafc", borderRadius: 18, border: "1px solid #e0f2fe", padding: "22px 24px" }}>
                        <ScoreRing score={shockData.healthScore} size={96} />
                        <div>
                          <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>Shock Health Score</p>
                          <p style={{ fontSize: 32, fontWeight: 800, color: "#0c4a6e" }}>{shockData.healthScore}/100</p>
                        </div>
                      </div>
                    </Card>
                    <Card title="Shock Insights" icon="💡">
                      {shockData.insights.map((ins, i) => <InsightRow key={i} text={ins} />)}
                    </Card>
                  </div>
                )}
              </div>
            )}

            {/* ════════ BEHAVIOUR ════════ */}
            {activeTab === "Behaviour" && (
              <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 36 }}>
                <div style={{ textAlign: "center" }}>
                  <h3 style={{ fontSize: 32, fontWeight: 800, color: "#0c4a6e" }}>Behavioural Finance</h3>
                  <p style={{ color: "#64748b", marginTop: 10, fontSize: 15 }}>Understanding your spending patterns and habits.</p>
                </div>
                {behaviourData ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 }}>
                      {[
                        { label: "Savings Ratio",  val: `${behaviourData.savingsRatio}%`, color: behaviourData.savingsRatio >= 20 ? "#10b981" : "#f43f5e", icon: "💰" },
                        { label: "Cuttable Subs",  val: behaviourData.cuttableCount,      color: "#f59e0b", icon: "✂️" },
                        { label: "Flexible Subs",  val: behaviourData.flexibleCount,      color: "#0ea5e9", icon: "🔄" },
                      ].map(m => (
                        <Card key={m.label} title={m.label} icon={m.icon}>
                          <p style={{ fontSize: 56, fontWeight: 800, color: m.color, fontFamily: "monospace", marginBottom: 16, lineHeight: 1 }}>{m.val}</p>
                          {m.label === "Savings Ratio" && (
                            <>
                              <ProgressBar value={behaviourData.savingsRatio} max={100} color={m.color} />
                              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                                <span style={{ fontSize: 13, color: "#94a3b8" }}>0%</span>
                                <span style={{ fontSize: 13, color: "#0ea5e9", fontWeight: 700 }}>Target: 20%</span>
                              </div>
                            </>
                          )}
                        </Card>
                      ))}
                    </div>

                    <Card title="Life Goals Progress" icon="🎯">
                      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                        {profile.goals.map(g => {
                          const pct = Math.min(100, Math.round((g.current / g.target) * 100));
                          const gc  = pct >= 75 ? "#10b981" : pct >= 40 ? "#0ea5e9" : "#f59e0b";
                          return (
                            <div key={g.name}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                <span style={{ fontSize: 17, fontWeight: 700, color: "#0c4a6e" }}>{g.name}</span>
                                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                                  <span style={{ fontSize: 14, color: "#94a3b8" }}>${g.current.toLocaleString()} / ${g.target.toLocaleString()}</span>
                                  <span style={{ fontSize: 18, fontWeight: 800, color: gc, minWidth: 48, textAlign: "right" }}>{pct}%</span>
                                </div>
                              </div>
                              <ProgressBar value={g.current} max={g.target} color={gc} />
                              <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 8 }}>Deadline: {g.deadline}</p>
                            </div>
                          );
                        })}
                      </div>
                    </Card>

                    <Card title="Finley's Behavioural Insights" icon="🧠">
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        {behaviourData.insights.map((ins, i) => <InsightRow key={i} text={ins} />)}
                      </div>
                    </Card>
                  </>
                ) : <p style={{ color: "#94a3b8", textAlign: "center", padding: 48, fontSize: 15 }}>Loading…</p>}
              </div>
            )}

            {/* ════════ MACRO ════════ */}
            {activeTab === "Macro" && (
              <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 36 }}>
                <div style={{ textAlign: "center" }}>
                  <h3 style={{ fontSize: 32, fontWeight: 800, color: "#0c4a6e" }}>Macro-Economic Impact</h3>
                  <p style={{ color: "#64748b", marginTop: 10, fontSize: 15 }}>See how global economic events affect your financial position.</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {[
                    { key: "inflation_rise", label: "📈 Inflation Rise", desc: "Rising prices erode purchasing power" },
                    { key: "rate_hike",      label: "🏦 Rate Hike",      desc: "Higher rates affect debt & savings" },
                    { key: "recession",      label: "📉 Recession",      desc: "Slowdown impacts income & investments" },
                    { key: "market_drop",    label: "💥 Market Drop",    desc: "Sharp decline in investment values" },
                  ].map(sc => (
                    <button key={sc.key} onClick={() => setMacroScenario(sc.key)} style={{
                      padding: "26px 28px", borderRadius: 20, background: "white",
                      border: `2px solid ${macroScenario === sc.key ? "#0ea5e9" : "#e0f2fe"}`,
                      cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                      boxShadow: macroScenario === sc.key ? "0 0 0 4px rgba(14,165,233,0.12)" : "none",
                    }}>
                      <p style={{ fontSize: 18, fontWeight: 800, color: "#0c4a6e", marginBottom: 8 }}>{sc.label}</p>
                      <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>{sc.desc}</p>
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button onClick={fetchMacro} disabled={loading.macro} style={btnPrimary}>
                    {loading.macro ? "Analysing…" : "🌐 Analyse Impact"}
                  </button>
                </div>
                {macroData && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
                    <Card title={macroData.label} icon="🌐">
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                        {[
                          { label: "Adj. Income",      val: macroData.adjustedIncome,      orig: profile.monthly.income },
                          { label: "Adj. Expenses",    val: macroData.adjustedExpenses,    orig: profile.monthly.expenses },
                          { label: "Adj. Investments", val: macroData.adjustedInvestments, orig: profile.assets.investments },
                          { label: "Monthly Balance",  val: macroData.newMonthlyBalance,   orig: surplus },
                        ].map(m => {
                          const delta = m.val - m.orig;
                          return (
                            <div key={m.label} style={{ background: "#f8fafc", borderRadius: 18, border: "1px solid #e0f2fe", padding: "22px 24px" }}>
                              <p style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>{m.label}</p>
                              <p style={{ fontSize: 24, fontWeight: 800, color: "#0c4a6e", marginBottom: 8 }}>${m.val.toLocaleString()}</p>
                              <p style={{ fontSize: 13, fontWeight: 700, color: delta >= 0 ? "#10b981" : "#f43f5e" }}>{delta >= 0 ? "+" : ""}${delta.toFixed(0)} vs baseline</p>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                    <Card title="Macro Insights" icon="💡">
                      {macroData.insights.map((ins, i) => <InsightRow key={i} text={ins} />)}
                    </Card>
                  </div>
                )}
              </div>
            )}

            {/* ════════ AI ADVISOR ════════ */}
            {activeTab === "AI Advisor" && (
              <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
                <div style={{ textAlign: "center" }}>
                  <h3 style={{ fontSize: 32, fontWeight: 800, color: "#0c4a6e" }}>AI Financial Advisor</h3>
                  <p style={{ color: "#64748b", marginTop: 10, fontSize: 15 }}>Ask Finley anything about your finances.</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 28 }}>
                  <Card title="Ask Finley" icon="💬">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
                      {["emergency fund", "debt", "investments", "budget", "net worth", "goals"].map(q => (
                        <button key={q} onClick={() => setAdvisorInput(`Tell me about my ${q}`)}
                          style={{ background: "#f0f9ff", border: "1px solid #bae6fd", color: "#0ea5e9", fontSize: 13, padding: "8px 16px", borderRadius: 99, cursor: "pointer", fontWeight: 700 }}>
                          {q}
                        </button>
                      ))}
                    </div>
                    <textarea value={advisorInput} onChange={e => setAdvisorInput(e.target.value)} rows={5}
                      placeholder="e.g. How is my emergency fund? What should I do about my debt?"
                      style={{ width: "100%", background: "#f8fafc", border: "1px solid #e0f2fe", borderRadius: 16, padding: "16px 18px", fontSize: 14, color: "#0c4a6e", outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }} />
                    <button onClick={fetchAdvisor} disabled={loading.advisor} style={{ ...btnPrimary, marginTop: 16 }}>
                      {loading.advisor ? "Thinking…" : "Get Advice →"}
                    </button>
                    {advisorReply && (
                      <div style={{ marginTop: 24, padding: "22px 24px", background: "#f0f9ff", borderRadius: 20, border: "1px solid #bae6fd" }}>
                        <p style={{ fontSize: 11, color: "#0ea5e9", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>Finley says</p>
                        <p style={{ fontSize: 14, color: "#0c4a6e", lineHeight: 1.75 }}>{advisorReply}</p>
                      </div>
                    )}
                  </Card>

                  <Card title="Your Profile Context" icon="👤">
                    {[
                      { label: "Total Assets",     val: `$${totalAssets.toLocaleString()}` },
                      { label: "Total Debt",        val: `$${profile.liabilities.debt.toLocaleString()}` },
                      { label: "Net Worth",         val: `$${netWorth.toLocaleString()}`, color: netWorth >= 0 ? "#10b981" : "#f43f5e" },
                      { label: "Monthly Income",    val: `$${profile.monthly.income.toLocaleString()}` },
                      { label: "Monthly Expenses",  val: `$${profile.monthly.expenses.toLocaleString()}` },
                      { label: "Monthly Surplus",   val: `$${surplus.toLocaleString()}`, color: "#0ea5e9" },
                    ].map(r => (
                      <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", borderBottom: "1px solid #f0f9ff" }}>
                        <span style={{ fontSize: 15, color: "#64748b" }}>{r.label}</span>
                        <span style={{ fontSize: 18, fontWeight: 800, color: r.color || "#0c4a6e" }}>{r.val}</span>
                      </div>
                    ))}
                  </Card>
                </div>
              </div>
            )}

            {/* ════════ PROFILE ════════ */}
            {activeTab === "Profile" && (
              <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <Card title="Your Financial Profile" icon="👤">
                  <p style={{ fontSize: 14, color: "#64748b", marginBottom: 28, lineHeight: 1.6 }}>Edit your numbers — all tabs update automatically.</p>
                  {!profileEdit ? (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 22, marginBottom: 32 }}>
                        {[
                          { label: "Savings",        val: profile.assets.savings },
                          { label: "Investments",    val: profile.assets.investments },
                          { label: "CPF",            val: profile.assets.cpf },
                          { label: "Insurance Val.", val: profile.assets.insuranceValue },
                          { label: "Debt",           val: profile.liabilities.debt },
                          { label: "Monthly Income", val: profile.monthly.income },
                          { label: "Monthly Expenses", val: profile.monthly.expenses },
                          { label: "Subscriptions #",  val: profile.monthly.subscriptions },
                        ].map(f => (
                          <div key={f.label} style={{ background: "#f8fafc", borderRadius: 20, border: "1px solid #e0f2fe", padding: "24px 26px" }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>{f.label}</p>
                            <p style={{ fontSize: 30, fontWeight: 800, color: "#0c4a6e", fontFamily: "monospace" }}>
                              {f.label === "Subscriptions #" ? f.val : `$${f.val.toLocaleString()}`}
                            </p>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => { setEditDraft(profile); setProfileEdit(true); }} style={btnPrimary}>Edit Profile</button>
                    </>
                  ) : (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 22, marginBottom: 32 }}>
                        {[
                          { label: "Savings",          path: ["assets", "savings"] },
                          { label: "Investments",      path: ["assets", "investments"] },
                          { label: "CPF",              path: ["assets", "cpf"] },
                          { label: "Insurance Val.",   path: ["assets", "insuranceValue"] },
                          { label: "Debt",             path: ["liabilities", "debt"] },
                          { label: "Monthly Income",   path: ["monthly", "income"] },
                          { label: "Monthly Expenses", path: ["monthly", "expenses"] },
                          { label: "Subscriptions #",  path: ["monthly", "subscriptions"] },
                        ].map(f => (
                          <div key={f.label}>
                            <label style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 10 }}>{f.label}</label>
                            <input type="number" value={editDraft[f.path[0]][f.path[1]]}
                              onChange={e => setEditDraft(d => ({ ...d, [f.path[0]]: { ...d[f.path[0]], [f.path[1]]: Number(e.target.value) } }))}
                              style={{ width: "100%", background: "#f8fafc", border: "1px solid #e0f2fe", borderRadius: 14, padding: "15px 18px", fontSize: 18, color: "#0c4a6e", outline: "none", fontFamily: "monospace", fontWeight: 700 }} />
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 14 }}>
                        <button onClick={saveProfile} style={btnPrimary}>Save & Refresh</button>
                        <button onClick={() => setProfileEdit(false)} style={btnGhost}>Cancel</button>
                      </div>
                    </>
                  )}
                </Card>
              </div>
            )}

          </div>
        </main>
      </div>

      <ChatWidget mood={mood} scoreData={scoreData} profile={profile} />
    </>
  );
}


