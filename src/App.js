import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

const API = "http://localhost:3000";

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

async function post(path, body) {
  const r = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

function clr(score) {
  if (score >= 75) return "#10b981";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function AnimatedNumber({ target, prefix = "", suffix = "" }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCurrent(target); clearInterval(timer); }
      else setCurrent(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <>{prefix}{current.toLocaleString()}{suffix}</>;
}

function ScoreRing({ score, size = 120 }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = clr(score);
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
      <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 60 60)"
        style={{ transition: "stroke-dasharray 1.2s ease" }} />
      <text x="60" y="55" textAnchor="middle" fill="white" fontSize="22" fontWeight="700" fontFamily="'DM Mono', monospace">{score}</text>
      <text x="60" y="72" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="'DM Sans', sans-serif">/ 100</text>
    </svg>
  );
}

function Insight({ text }) {
  const warn = /below|negative|high risk|low|falls|turns negative/i.test(text);
  const good = /healthy|strong|positive|diversified|manageable|decent/i.test(text);
  const color = good ? "#10b981" : warn ? "#f59e0b" : "#3b82f6";
  const bg = good ? "#052e16" : warn ? "#1c1107" : "#0c1d3a";
  const border = good ? "#064e3b" : warn ? "#292524" : "#1e3a5f";
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", borderRadius: 10, background: bg, border: `1px solid ${border}`, marginBottom: 8 }}>
      <span style={{ color, fontSize: 14, marginTop: 1 }}>{good ? "✓" : warn ? "⚠" : "◈"}</span>
      <span style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "8px 14px" }}>
        <p style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>{payload[0].payload.month}</p>
        <p style={{ color: "white", fontSize: 15, fontWeight: 700, margin: "2px 0 0" }}>${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const TABS = ["Overview", "Health Score", "Life Shock", "Behaviour", "Macro", "AI Advisor", "Profile"];

export default function App() {
  const [tab, setTab] = useState("Overview");
  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  const [scoreData, setScoreData] = useState(null);
  const [shockData, setShockData] = useState(null);
  const [behaviourData, setBehaviourData] = useState(null);
  const [macroData, setMacroData] = useState(null);
  const [advisorReply, setAdvisorReply] = useState("");

  const [shockScenario, setShockScenario] = useState("jobloss");
  const [macroScenario, setMacroScenario] = useState("recession");
  const [advisorInput, setAdvisorInput] = useState("");
  const [loading, setLoading] = useState({});
  const [profileEdit, setProfileEdit] = useState(false);
  const [editDraft, setEditDraft] = useState(profile);

  useEffect(() => { fetchScore(); fetchBehaviour(); }, [profile]);

  async function fetchScore() {
    setLoading(l => ({ ...l, score: true }));
    try {
      const d = await post("/score", {
        assets: profile.assets,
        liabilities: profile.liabilities,
        monthly: profile.monthly,
      });
      setScoreData(d);
    } catch (e) { console.error(e); }
    setLoading(l => ({ ...l, score: false }));
  }

  async function fetchShock() {
    setLoading(l => ({ ...l, shock: true }));
    try {
      const d = await post("/shock", {
        scenario: shockScenario,
        savings: profile.assets.savings,
        investments: profile.assets.investments,
        income: profile.monthly.income,
        expenses: profile.monthly.expenses,
        debt: profile.liabilities.debt,
      });
      setShockData(d);
    } catch (e) { console.error(e); }
    setLoading(l => ({ ...l, shock: false }));
  }

  async function fetchBehaviour() {
    setLoading(l => ({ ...l, behaviour: true }));
    try {
      const d = await post("/behaviour", {
        monthly: profile.monthly,
        reminders: profile.reminders,
        goals: profile.goals,
      });
      setBehaviourData(d);
    } catch (e) { console.error(e); }
    setLoading(l => ({ ...l, behaviour: false }));
  }

  async function fetchMacro() {
    setLoading(l => ({ ...l, macro: true }));
    try {
      const d = await post("/macro", {
        scenario: macroScenario,
        investments: profile.assets.investments,
        expenses: profile.monthly.expenses,
        debt: profile.liabilities.debt,
        income: profile.monthly.income,
      });
      setMacroData(d);
    } catch (e) { console.error(e); }
    setLoading(l => ({ ...l, macro: false }));
  }

  async function fetchAdvisor() {
    if (!advisorInput.trim()) return;
    setLoading(l => ({ ...l, advisor: true }));
    try {
      const d = await post("/advisor", { prompt: advisorInput, profile });
      setAdvisorReply(d.reply);
    } catch (e) { console.error(e); }
    setLoading(l => ({ ...l, advisor: false }));
  }

  function saveProfile() {
    setProfile(editDraft);
    setProfileEdit(false);
  }

  const totalAssets = profile.assets.savings + profile.assets.investments + profile.assets.cpf + profile.assets.insuranceValue;
  const netWorth = totalAssets - profile.liabilities.debt;

  const pieData = [
    { name: "Savings", value: profile.assets.savings, color: "#3b82f6" },
    { name: "Investments", value: profile.assets.investments, color: "#10b981" },
    { name: "CPF", value: profile.assets.cpf, color: "#f59e0b" },
    { name: "Insurance", value: profile.assets.insuranceValue, color: "#8b5cf6" },
  ].filter(d => d.value > 0);

  const netWorthData = [
    { month: "Oct", value: 105000 },
    { month: "Nov", value: 112000 },
    { month: "Dec", value: 118000 },
    { month: "Jan", value: 120000 },
    { month: "Feb", value: 130000 },
    { month: "Mar", value: netWorth },
  ];

  return (
    <div style={s.page}>
      <div style={s.grain} />

      {/* HEADER */}
      <header style={s.header}>
        <div>
          <div style={s.badge}>WEALTH WELLNESS HUB</div>
          <h1 style={s.title}>Wealth<span style={s.accent}>Wellness</span></h1>
          <p style={s.sub}>Your financial health, at a glance</p>
        </div>
        <div style={s.headerRight}>
          <div style={s.dot} />
          <span style={{ color: "#64748b", fontSize: 13 }}>Live · Mar 2026</span>
        </div>
      </header>

      {/* NAV */}
      <nav style={s.nav}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ ...s.navBtn, ...(tab === t ? s.navBtnActive : {}) }}>
            {t}
          </button>
        ))}
      </nav>

      {/* ── OVERVIEW ── */}
      {tab === "Overview" && (
        <>
          <div style={s.grid3}>
            <div style={{ ...s.card, ...s.cardDark }}>
              <p style={s.label}>Total Net Worth</p>
              <p style={s.huge}><AnimatedNumber target={netWorth} prefix="$" /></p>
              <div style={s.pill}>Assets ${totalAssets.toLocaleString()} · Debt ${profile.liabilities.debt.toLocaleString()}</div>
            </div>

            <div style={{ ...s.card, ...s.cardDark, alignItems: "center", justifyContent: "center", gap: 12 }}>
              <p style={s.label}>Health Score</p>
              {scoreData
                ? <><ScoreRing score={scoreData.healthScore} /><p style={{ color: clr(scoreData.healthScore), fontSize: 13, margin: 0 }}>{scoreData.healthScore >= 75 ? "Good standing" : scoreData.healthScore >= 50 ? "Moderate" : "Needs Attention"}</p></>
                : <p style={{ color: "#475569" }}>Loading…</p>}
            </div>

            <div style={{ ...s.card, ...s.cardDark }}>
              <p style={s.label}>Monthly Budget</p>
              {[
                { label: "Income", val: profile.monthly.income, color: "white" },
                { label: "Expenses", val: profile.monthly.expenses, color: "#ef4444" },
                { label: "Saved", val: profile.monthly.income - profile.monthly.expenses, color: "#10b981" },
              ].map(r => (
                <div key={r.label} style={s.budgetRow}>
                  <span style={s.budgetLabel}>{r.label}</span>
                  <span style={{ ...s.budgetValue, color: r.color }}>${r.val.toLocaleString()}</span>
                </div>
              ))}
              <div style={s.barTrack}>
                <div style={{ ...s.barFill, width: `${Math.min(100, (profile.monthly.expenses / profile.monthly.income) * 100)}%`, background: "#ef4444" }} />
              </div>
              <p style={s.barCaption}>{((profile.monthly.expenses / profile.monthly.income) * 100).toFixed(0)}% of income spent</p>
            </div>
          </div>

          <div style={s.grid2}>
            <div style={{ ...s.card, ...s.cardDark }}>
              <p style={s.label}>Portfolio Distribution</p>
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                      {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {pieData.map(d => (
                    <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                        <span style={{ color: "#94a3b8", fontSize: 13 }}>{d.name}</span>
                      </div>
                      <span style={{ color: "white", fontWeight: 600, fontSize: 13 }}>${d.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ ...s.card, ...s.cardDark }}>
              <p style={s.label}>Net Worth Trend</p>
              <p style={{ color: "white", fontSize: 28, fontWeight: 700, margin: "0 0 16px", fontFamily: "'DM Mono', monospace" }}>${netWorth.toLocaleString()}</p>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={netWorthData}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={['dataMin - 10000', 'dataMax + 5000']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5}
                    dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "white", stroke: "#3b82f6", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={s.grid3}>
            <div style={{ ...s.card, ...s.cardDark }}>
              <p style={s.label}>Life Goals</p>
              {profile.goals.map(g => {
                const pct = Math.min(100, Math.round((g.current / g.target) * 100));
                const gc = pct >= 75 ? "#10b981" : pct >= 40 ? "#3b82f6" : "#f59e0b";
                return (
                  <div key={g.name} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ color: "#94a3b8", fontSize: 13 }}>{g.name}</span>
                      <span style={{ color: gc, fontSize: 13, fontWeight: 600 }}>{pct}%</span>
                    </div>
                    <div style={s.barTrack}>
                      <div style={{ ...s.barFill, width: `${pct}%`, background: gc, transition: "width 1s ease" }} />
                    </div>
                    <p style={{ color: "#475569", fontSize: 11, margin: "3px 0 0" }}>${g.current.toLocaleString()} of ${g.target.toLocaleString()} · {g.deadline}</p>
                  </div>
                );
              })}
            </div>

            <div style={{ ...s.card, ...s.cardDark }}>
              <p style={s.label}>Payment Reminders</p>
              {profile.reminders.map(r => {
                const tc = r.type === "Essential" ? "#10b981" : r.type === "Cuttable" ? "#ef4444" : "#f59e0b";
                const tb = r.type === "Essential" ? "#052e16" : r.type === "Cuttable" ? "#3b1a1a" : "#1c1107";
                return (
                  <div key={r.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1e293b" }}>
                    <div>
                      <p style={{ color: "white", fontSize: 14, margin: 0 }}>{r.name}</p>
                      <p style={{ color: "#475569", fontSize: 12, margin: "2px 0 0" }}>Due {r.due}</p>
                    </div>
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: tb, color: tc, fontWeight: 600 }}>{r.type}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ ...s.card, ...s.cardDark }}>
              <p style={s.label}>Quick Insights</p>
              {scoreData
                ? scoreData.insights.slice(0, 4).map((ins, i) => <Insight key={i} text={ins} />)
                : <p style={{ color: "#475569" }}>Loading…</p>}
            </div>
          </div>
        </>
      )}

      {/* ── HEALTH SCORE ── */}
      {tab === "Health Score" && (
        <div style={s.grid2}>
          <div style={{ ...s.card, ...s.cardDark }}>
            <p style={s.label}>Financial Health Score</p>
            {scoreData ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
                  <ScoreRing score={scoreData.healthScore} />
                  <div>
                    <p style={{ color: clr(scoreData.healthScore), fontSize: 26, fontWeight: 700, margin: "0 0 4px" }}>
                      {scoreData.healthScore >= 75 ? "Strong" : scoreData.healthScore >= 50 ? "Moderate" : "At Risk"}
                    </p>
                    <p style={{ color: "#475569", fontSize: 13, margin: 0 }}>Overall financial health</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Net Worth", val: `$${scoreData.netWorth.toLocaleString()}` },
                    { label: "Savings Rate", val: `${scoreData.savingsRate}%` },
                    { label: "Emergency Runway", val: `${scoreData.runway} months` },
                    { label: "Diversification", val: `${scoreData.diversificationCount} / 4` },
                  ].map(m => (
                    <div key={m.label} style={{ padding: "14px", background: "#0f172a", borderRadius: 10, border: "1px solid #1e293b" }}>
                      <p style={{ color: "#475569", fontSize: 11, margin: "0 0 4px", textTransform: "uppercase" }}>{m.label}</p>
                      <p style={{ color: "white", fontSize: 20, fontWeight: 700, margin: 0, fontFamily: "'DM Mono',monospace" }}>{m.val}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : <p style={{ color: "#475569" }}>Loading…</p>}
          </div>

          <div style={{ ...s.card, ...s.cardDark }}>
            <p style={s.label}>Score Breakdown</p>
            {scoreData?.insights.map((ins, i) => <Insight key={i} text={ins} />)}
          </div>
        </div>
      )}

      {/* ── LIFE SHOCK ── */}
      {tab === "Life Shock" && (
        <>
          <div style={{ ...s.card, ...s.cardDark, marginBottom: 16 }}>
            <p style={s.label}>Life Shock Simulator</p>
            <p style={{ color: "#475569", fontSize: 13, margin: "0 0 16px" }}>Pick a scenario to see how it impacts your finances</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {[
                { key: "jobloss", label: "💼 Job Loss" },
                { key: "inflation", label: "📈 Inflation" },
                { key: "market", label: "📉 Market Crash" },
                { key: "medical", label: "🏥 Medical Emergency" },
                { key: "accident", label: "🚗 Accident" },
                { key: "disability", label: "♿ Disability" },
                { key: "repair", label: "🔧 Major Repair" },
                { key: "family", label: "👨‍👩‍👧 Family Emergency" },
              ].map(sc => (
                <button key={sc.key} onClick={() => setShockScenario(sc.key)}
                  style={{ ...s.chip, ...(shockScenario === sc.key ? s.chipActive : {}) }}>
                  {sc.label}
                </button>
              ))}
            </div>
            <button onClick={fetchShock} disabled={loading.shock} style={s.btn}>
              {loading.shock ? "Simulating…" : "Run Simulation →"}
            </button>
          </div>

          {shockData && (
            <div style={s.grid2}>
              <div style={{ ...s.card, ...s.cardDark }}>
                <p style={s.label}>{shockData.label} — Impact</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                  {[
                    { label: "Savings", before: shockData.original.savings, after: shockData.shocked.savings },
                    { label: "Investments", before: shockData.original.investments, after: shockData.shocked.investments },
                    { label: "Income", before: shockData.original.income, after: shockData.shocked.income },
                    { label: "Expenses", before: shockData.original.expenses, after: shockData.shocked.expenses },
                  ].map(m => (
                    <div key={m.label} style={{ padding: "12px", background: "#0f172a", borderRadius: 10, border: "1px solid #1e293b" }}>
                      <p style={{ color: "#475569", fontSize: 11, margin: "0 0 6px", textTransform: "uppercase" }}>{m.label}</p>
                      <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 2px" }}>Before: ${m.before.toLocaleString()}</p>
                      <p style={{ color: m.after < m.before ? "#ef4444" : "#10b981", fontWeight: 700, fontSize: 15, margin: 0 }}>
                        After: ${m.after.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                  <div style={{ padding: "14px", background: "#0f172a", borderRadius: 10, border: `1px solid ${shockData.monthlyBalance < 0 ? "#7f1d1d" : "#064e3b"}` }}>
                    <p style={{ color: "#475569", fontSize: 11, margin: "0 0 4px" }}>MONTHLY BALANCE</p>
                    <p style={{ color: shockData.monthlyBalance < 0 ? "#ef4444" : "#10b981", fontSize: 22, fontWeight: 700, margin: 0 }}>
                      ${shockData.monthlyBalance.toLocaleString()}
                    </p>
                  </div>
                  <div style={{ padding: "14px", background: "#0f172a", borderRadius: 10, border: "1px solid #1e293b" }}>
                    <p style={{ color: "#475569", fontSize: 11, margin: "0 0 4px" }}>EMERGENCY RUNWAY</p>
                    <p style={{ color: clr(shockData.emergencyRunway >= 6 ? 80 : shockData.emergencyRunway >= 3 ? 55 : 20), fontSize: 22, fontWeight: 700, margin: 0 }}>
                      {shockData.emergencyRunway} mo
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px", background: "#0f172a", borderRadius: 10, border: "1px solid #1e293b" }}>
                  <ScoreRing score={shockData.healthScore} size={90} />
                  <div>
                    <p style={{ color: "#475569", fontSize: 12, margin: "0 0 4px" }}>SHOCK HEALTH SCORE</p>
                    <p style={{ color: clr(shockData.healthScore), fontSize: 22, fontWeight: 700, margin: 0 }}>{shockData.healthScore}/100</p>
                  </div>
                </div>
              </div>

              <div style={{ ...s.card, ...s.cardDark }}>
                <p style={s.label}>Shock Insights</p>
                {shockData.insights.map((ins, i) => <Insight key={i} text={ins} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── BEHAVIOUR ── */}
      {tab === "Behaviour" && (
        <div style={s.grid2}>
          <div style={{ ...s.card, ...s.cardDark }}>
            <p style={s.label}>Behavioural Finance Analysis</p>
            {behaviourData ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Savings Ratio", val: `${behaviourData.savingsRatio}%`, color: behaviourData.savingsRatio >= 20 ? "#10b981" : "#ef4444" },
                    { label: "Cuttable", val: behaviourData.cuttableCount, color: "#f59e0b" },
                    { label: "Flexible", val: behaviourData.flexibleCount, color: "#3b82f6" },
                  ].map(m => (
                    <div key={m.label} style={{ padding: "14px", background: "#0f172a", borderRadius: 10, border: "1px solid #1e293b", textAlign: "center" }}>
                      <p style={{ color: "#475569", fontSize: 11, margin: "0 0 6px", textTransform: "uppercase" }}>{m.label}</p>
                      <p style={{ color: m.color, fontSize: 24, fontWeight: 700, margin: 0 }}>{m.val}</p>
                    </div>
                  ))}
                </div>
                <p style={{ color: "#475569", fontSize: 12, margin: "0 0 8px", textTransform: "uppercase" }}>Savings Ratio Progress</p>
                <div style={s.barTrack}>
                  <div style={{ ...s.barFill, width: `${Math.min(100, behaviourData.savingsRatio)}%`, background: behaviourData.savingsRatio >= 20 ? "#10b981" : "#ef4444" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ color: "#475569", fontSize: 11 }}>0%</span>
                  <span style={{ color: "#3b82f6", fontSize: 11 }}>Target: 20%</span>
                  <span style={{ color: "#475569", fontSize: 11 }}>100%</span>
                </div>
                <div style={{ marginTop: 20 }}>
                  <p style={{ color: "#475569", fontSize: 12, margin: "0 0 8px", textTransform: "uppercase" }}>Goals Below 50% Progress</p>
                  <p style={{ color: behaviourData.lowProgressGoals >= 2 ? "#f59e0b" : "#10b981", fontSize: 32, fontWeight: 700, margin: 0 }}>
                    {behaviourData.lowProgressGoals} <span style={{ fontSize: 14, fontWeight: 400, color: "#475569" }}>goals need attention</span>
                  </p>
                </div>
              </>
            ) : <p style={{ color: "#475569" }}>Loading…</p>}
          </div>

          <div style={{ ...s.card, ...s.cardDark }}>
            <p style={s.label}>Behavioural Insights</p>
            {behaviourData?.insights.map((ins, i) => <Insight key={i} text={ins} />)}
          </div>
        </div>
      )}

      {/* ── MACRO ── */}
      {tab === "Macro" && (
        <>
          <div style={{ ...s.card, ...s.cardDark, marginBottom: 16 }}>
            <p style={s.label}>Macro-Economic Impact Analyser</p>
            <p style={{ color: "#475569", fontSize: 13, margin: "0 0 16px" }}>See how global economic events affect your financial position</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {[
                { key: "inflation_rise", label: "📈 Inflation Rise" },
                { key: "rate_hike", label: "🏦 Rate Hike" },
                { key: "recession", label: "📉 Recession" },
                { key: "market_drop", label: "💥 Market Drop" },
              ].map(sc => (
                <button key={sc.key} onClick={() => setMacroScenario(sc.key)}
                  style={{ ...s.chip, ...(macroScenario === sc.key ? s.chipActive : {}) }}>
                  {sc.label}
                </button>
              ))}
            </div>
            <button onClick={fetchMacro} disabled={loading.macro} style={s.btn}>
              {loading.macro ? "Analyzing…" : "Analyze Impact →"}
            </button>
          </div>

          {macroData && (
            <div style={s.grid2}>
              <div style={{ ...s.card, ...s.cardDark }}>
                <p style={s.label}>{macroData.label}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Adj. Income", val: macroData.adjustedIncome, orig: profile.monthly.income },
                    { label: "Adj. Expenses", val: macroData.adjustedExpenses, orig: profile.monthly.expenses },
                    { label: "Adj. Investments", val: macroData.adjustedInvestments, orig: profile.assets.investments },
                    { label: "Monthly Balance", val: macroData.newMonthlyBalance, orig: profile.monthly.income - profile.monthly.expenses },
                  ].map(m => {
                    const delta = m.val - m.orig;
                    return (
                      <div key={m.label} style={{ padding: "14px", background: "#0f172a", borderRadius: 10, border: "1px solid #1e293b" }}>
                        <p style={{ color: "#475569", fontSize: 11, margin: "0 0 4px", textTransform: "uppercase" }}>{m.label}</p>
                        <p style={{ color: "white", fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>${m.val.toLocaleString()}</p>
                        <p style={{ color: delta >= 0 ? "#10b981" : "#ef4444", fontSize: 12, margin: 0 }}>
                          {delta >= 0 ? "+" : ""}${delta.toFixed(0)} vs baseline
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ ...s.card, ...s.cardDark }}>
                <p style={s.label}>Macro Insights</p>
                {macroData.insights.map((ins, i) => <Insight key={i} text={ins} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── AI ADVISOR ── */}
      {tab === "AI Advisor" && (
        <div style={s.grid2}>
          <div style={{ ...s.card, ...s.cardDark }}>
            <p style={s.label}>AI Financial Advisor</p>
            <p style={{ color: "#475569", fontSize: 13, margin: "0 0 16px" }}>Ask anything about your finances — the advisor uses your live profile</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {["emergency fund", "debt", "investments", "budget", "net worth", "goals"].map(q => (
                <button key={q} onClick={() => setAdvisorInput(`Tell me about my ${q}`)} style={s.chip}>{q}</button>
              ))}
            </div>
            <textarea
              value={advisorInput}
              onChange={e => setAdvisorInput(e.target.value)}
              placeholder="e.g. How is my emergency fund? What should I do about my debt?"
              style={s.textarea}
              rows={4}
            />
            <button onClick={fetchAdvisor} disabled={loading.advisor} style={{ ...s.btn, marginTop: 12 }}>
              {loading.advisor ? "Thinking…" : "Get Advice →"}
            </button>
            {advisorReply && (
              <div style={{ marginTop: 20, padding: 18, background: "#0f172a", borderRadius: 12, border: "1px solid #1e3a5f" }}>
                <p style={{ color: "#3b82f6", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px" }}>Advisor Response</p>
                <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{advisorReply}</p>
              </div>
            )}
          </div>

          <div style={{ ...s.card, ...s.cardDark }}>
            <p style={s.label}>Your Profile Context</p>
            {[
              { label: "Total Assets", val: `$${totalAssets.toLocaleString()}` },
              { label: "Total Debt", val: `$${profile.liabilities.debt.toLocaleString()}` },
              { label: "Net Worth", val: `$${netWorth.toLocaleString()}`, color: netWorth >= 0 ? "#10b981" : "#ef4444" },
              { label: "Monthly Income", val: `$${profile.monthly.income.toLocaleString()}` },
              { label: "Monthly Expenses", val: `$${profile.monthly.expenses.toLocaleString()}` },
              { label: "Monthly Surplus", val: `$${(profile.monthly.income - profile.monthly.expenses).toLocaleString()}`, color: "#3b82f6" },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e293b" }}>
                <span style={{ color: "#64748b", fontSize: 13 }}>{r.label}</span>
                <span style={{ color: r.color || "white", fontWeight: 600 }}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PROFILE ── */}
      {tab === "Profile" && (
        <div style={{ ...s.card, ...s.cardDark }}>
          <p style={s.label}>Your Financial Profile</p>
          <p style={{ color: "#475569", fontSize: 13, margin: "0 0 20px" }}>Edit your numbers — all tabs update automatically</p>
          {!profileEdit ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Savings", val: profile.assets.savings },
                  { label: "Investments", val: profile.assets.investments },
                  { label: "CPF", val: profile.assets.cpf },
                  { label: "Insurance Value", val: profile.assets.insuranceValue },
                  { label: "Debt", val: profile.liabilities.debt },
                  { label: "Monthly Income", val: profile.monthly.income },
                  { label: "Monthly Expenses", val: profile.monthly.expenses },
                  { label: "Subscriptions #", val: profile.monthly.subscriptions },
                ].map(f => (
                  <div key={f.label} style={{ padding: "14px", background: "#0f172a", borderRadius: 10, border: "1px solid #1e293b" }}>
                    <p style={{ color: "#475569", fontSize: 11, margin: "0 0 4px", textTransform: "uppercase" }}>{f.label}</p>
                    <p style={{ color: "white", fontSize: 20, fontWeight: 700, margin: 0, fontFamily: "'DM Mono',monospace" }}>
                      {f.label === "Subscriptions #" ? f.val : `$${f.val.toLocaleString()}`}
                    </p>
                  </div>
                ))}
              </div>
              <button onClick={() => { setEditDraft(profile); setProfileEdit(true); }} style={s.btn}>Edit Profile</button>
            </>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Savings", path: ["assets", "savings"] },
                  { label: "Investments", path: ["assets", "investments"] },
                  { label: "CPF", path: ["assets", "cpf"] },
                  { label: "Insurance Value", path: ["assets", "insuranceValue"] },
                  { label: "Debt", path: ["liabilities", "debt"] },
                  { label: "Monthly Income", path: ["monthly", "income"] },
                  { label: "Monthly Expenses", path: ["monthly", "expenses"] },
                  { label: "Subscriptions #", path: ["monthly", "subscriptions"] },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", marginBottom: 6, display: "block" }}>{f.label}</label>
                    <input
                      type="number"
                      value={editDraft[f.path[0]][f.path[1]]}
                      onChange={e => setEditDraft(d => ({
                        ...d,
                        [f.path[0]]: { ...d[f.path[0]], [f.path[1]]: Number(e.target.value) }
                      }))}
                      style={s.input}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={saveProfile} style={s.btn}>Save & Refresh</button>
                <button onClick={() => setProfileEdit(false)} style={{ ...s.btn, background: "#1e293b", color: "#94a3b8", borderColor: "#334155" }}>Cancel</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh", width: "100%", boxSizing: "border-box",
    background: "#020818", padding: "32px",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: "relative", overflow: "hidden",
  },
  grain: {
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
    background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
    opacity: 0.4,
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, position: "relative", zIndex: 1 },
  badge: { display: "inline-block", fontSize: 10, letterSpacing: 2, color: "#3b82f6", background: "#0c1d3a", border: "1px solid #1e3a5f", padding: "3px 8px", borderRadius: 4, marginBottom: 8, fontWeight: 700 },
  title: { fontSize: 36, fontWeight: 800, color: "white", margin: 0, letterSpacing: -1 },
  accent: { color: "#3b82f6", marginLeft: 6 },
  sub: { color: "#475569", fontSize: 14, margin: "6px 0 0" },
  headerRight: { display: "flex", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" },
  nav: { display: "flex", gap: 8, marginBottom: 24, position: "relative", zIndex: 1, flexWrap: "wrap" },
  navBtn: {
    background: "transparent", border: "1px solid #1e293b", color: "#64748b",
    padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
  },
  navBtnActive: { background: "#0c1d3a", border: "1px solid #1e3a5f", color: "#3b82f6" },
  grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 16, position: "relative", zIndex: 1 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 16, position: "relative", zIndex: 1 },
  card: { borderRadius: 16, padding: "24px", display: "flex", flexDirection: "column", position: "relative", zIndex: 1, marginBottom: 0 },
  cardDark: { background: "#0b1121", border: "1px solid #1e293b" },
  label: { color: "#475569", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600, margin: "0 0 12px" },
  huge: { fontSize: 42, fontWeight: 800, color: "white", margin: "0 0 12px", fontFamily: "'DM Mono', monospace", letterSpacing: -2 },
  pill: { display: "inline-block", background: "#052e16", color: "#10b981", fontSize: 12, padding: "4px 10px", borderRadius: 20, fontWeight: 600, width: "fit-content" },
  budgetRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #1e293b" },
  budgetLabel: { color: "#64748b", fontSize: 14 },
  budgetValue: { color: "white", fontWeight: 600, fontSize: 15 },
  barTrack: { height: 6, background: "#1e293b", borderRadius: 99, overflow: "hidden", marginTop: 4 },
  barFill: { height: "100%", borderRadius: 99, background: "#3b82f6", transition: "width 1s ease" },
  barCaption: { color: "#475569", fontSize: 11, margin: "5px 0 0" },
  chip: {
    background: "#0f172a", border: "1px solid #1e293b", color: "#64748b",
    padding: "7px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
  },
  chipActive: { background: "#0c1d3a", border: "1px solid #1e3a5f", color: "#3b82f6" },
  btn: {
    background: "#1d4ed8", color: "white", border: "none",
    padding: "10px 22px", borderRadius: 10, fontSize: 14, fontWeight: 600,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif", width: "fit-content",
  },
  textarea: {
    width: "100%", background: "#0f172a", border: "1px solid #1e293b",
    borderRadius: 10, color: "white", fontSize: 13, padding: "12px 14px",
    fontFamily: "'DM Sans', sans-serif", resize: "vertical", outline: "none",
    boxSizing: "border-box",
  },
  input: {
    width: "100%", background: "#0f172a", border: "1px solid #1e293b",
    borderRadius: 8, color: "white", fontSize: 15, padding: "10px 12px",
    fontFamily: "'DM Mono', monospace", outline: "none", boxSizing: "border-box",
  },
};
