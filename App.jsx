import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const portfolioData = [
  { name: "Stocks", value: 70000, color: "#3b82f6" },
  { name: "Bonds", value: 40000, color: "#10b981" },
  { name: "Cash", value: 20000, color: "#f59e0b" },
  { name: "Crypto", value: 15000, color: "#8b5cf6" },
];

const netWorthData = [
  { month: "Oct", value: 105000 },
  { month: "Nov", value: 112000 },
  { month: "Dec", value: 118000 },
  { month: "Jan", value: 120000 },
  { month: "Feb", value: 130000 },
  { month: "Mar", value: 145000 },
];

const goals = [
  { label: "Emergency Fund", pct: 60, color: "#10b981" },
  { label: "House Deposit", pct: 35, color: "#3b82f6" },
  { label: "Retirement", pct: 20, color: "#8b5cf6" },
];

const accounts = [
  { name: "DBS", status: "connected", icon: "🏦" },
  { name: "Syfe", status: "connected", icon: "📈" },
  { name: "Binance", status: "connected", icon: "₿" },
  { name: "CPF", status: "pending", icon: "🏛️" },
];

const insights = [
  { text: "Moderate diversification", type: "neutral", icon: "◈" },
  { text: "High crypto exposure", type: "warn", icon: "⚠" },
  { text: "Liquidity is healthy", type: "good", icon: "✓" },
];

const recommendations = [
  {
    icon: "⚖️",
    title: "Rebalance Crypto",
    desc: "Your crypto allocation is at 10.3% — consider trimming to under 10% to reduce portfolio volatility.",
    tag: "Risk",
    tagColor: "#f59e0b",
    tagBg: "#1c1107",
  },
  {
    icon: "🏠",
    title: "Boost House Deposit",
    desc: "At 35% progress, increasing monthly contributions by $300 could hit your target 8 months earlier.",
    tag: "Goal",
    tagColor: "#3b82f6",
    tagBg: "#0c1d3a",
  },
  {
    icon: "🛡️",
    title: "Top Up Emergency Fund",
    desc: "You're 60% there. Aim for 3–6 months of expenses (~$15,000) as a safety buffer.",
    tag: "Safety",
    tagColor: "#10b981",
    tagBg: "#052e16",
  },
  {
    icon: "📊",
    title: "Consider Bond Ladder",
    desc: "With $40k in bonds, a laddering strategy could improve yield by 0.5–1% annually.",
    tag: "Optimize",
    tagColor: "#8b5cf6",
    tagBg: "#1a0e2e",
  },
];

const navItems = ["Overview", "Portfolio", "Budgets", "Goals", "Accounts"];

const payments = [
  { name: "Rent", amount: 1800, due: "Mar 8", daysLeft: 2, icon: "🏠", urgent: true },
  { name: "Credit Card", amount: 420, due: "Mar 12", daysLeft: 6, icon: "💳", urgent: false },
  { name: "Phone Bill", amount: 45, due: "Mar 15", daysLeft: 9, icon: "📱", urgent: false },
  { name: "Netflix", amount: 18, due: "Mar 20", daysLeft: 14, icon: "🎬", urgent: false },
  { name: "Insurance", amount: 210, due: "Mar 25", daysLeft: 19, icon: "🛡️", urgent: false },
];

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

function ScoreRing({ score }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
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

export default function App() {
  const [activeNav, setActiveNav] = useState("Overview");

  return (
    <div style={s.page}>
      <div style={s.grain} />

      {/* Header */}
      <header style={s.header}>
        <div>
          <div style={s.badge}>BETA</div>
          <h1 style={s.title}>Wealth<span style={s.accent}>Wellness</span></h1>
          <p style={s.sub}>Your financial health, at a glance</p>
        </div>
        <div style={s.headerRight}>
          <div style={s.dot} />
          <span style={{ color: "#64748b", fontSize: 13 }}>Live · Mar 2026</span>
        </div>
      </header>

      {/* Navigation */}
      <nav style={s.nav}>
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => setActiveNav(item)}
            style={{ ...s.navBtn, ...(activeNav === item ? s.navBtnActive : {}) }}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* Top KPIs */}
      <div style={s.grid3}>
        {/* Net Worth */}
        <div style={{ ...s.card, ...s.cardDark }}>
          <p style={s.label}>Total Net Worth</p>
          <p style={s.huge}><AnimatedNumber target={145000} prefix="$" /></p>
          <div style={s.pill}>↑ 11.5% this month</div>
        </div>

        {/* Health Score */}
        <div style={{ ...s.card, ...s.cardDark, alignItems: "center", justifyContent: "center", gap: 12 }}>
          <p style={s.label}>Health Score</p>
          <ScoreRing score={78} />
          <p style={{ color: "#10b981", fontSize: 13, margin: 0 }}>Good standing</p>
        </div>

        {/* Budget */}
        <div style={{ ...s.card, ...s.cardDark }}>
          <p style={s.label}>March Budget</p>
          <div style={s.budgetRow}>
            <span style={s.budgetLabel}>Income</span>
            <span style={s.budgetValue}>$5,000</span>
          </div>
          <div style={s.budgetRow}>
            <span style={s.budgetLabel}>Spent</span>
            <span style={{ ...s.budgetValue, color: "#ef4444" }}>$3,600</span>
          </div>
          <div style={{ height: 1, background: "#1e293b", margin: "10px 0" }} />
          <div style={s.budgetRow}>
            <span style={s.budgetLabel}>Saved</span>
            <span style={{ ...s.budgetValue, color: "#10b981", fontSize: 20 }}>$1,400</span>
          </div>
          <div style={s.barTrack}>
            <div style={{ ...s.barFill, width: "72%", background: "#ef4444" }} />
          </div>
          <p style={s.barCaption}>72% of monthly budget used</p>
        </div>
      </div>

      {/* Middle charts */}
      <div style={s.grid2}>
        {/* Portfolio */}
        <div style={{ ...s.card, ...s.cardDark }}>
          <p style={s.label}>Portfolio Distribution</p>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={portfolioData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                  {portfolioData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              {portfolioData.map((d) => (
                <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                    <span style={{ color: "#94a3b8", fontSize: 13 }}>{d.name}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ color: "white", fontWeight: 600, fontSize: 13 }}>${(d.value / 1000).toFixed(0)}k</span>
                    <span style={{ color: "#475569", fontSize: 11, marginLeft: 6 }}>{((d.value / 145000) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Net Worth Chart */}
        <div style={{ ...s.card, ...s.cardDark }}>
          <p style={s.label}>Net Worth Trend</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
            <p style={{ color: "white", fontSize: 28, fontWeight: 700, margin: 0, fontFamily: "'DM Mono', monospace" }}>$145,000</p>
            <span style={{ color: "#10b981", fontSize: 13 }}>+$25k in 6 months</span>
          </div>
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

      {/* Bottom row */}
      <div style={s.grid3}>
        {/* Goals */}
        <div style={{ ...s.card, ...s.cardDark }}>
          <p style={s.label}>Life Goals</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 4 }}>
            {goals.map((g) => (
              <div key={g.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ color: "#94a3b8", fontSize: 13 }}>{g.label}</span>
                  <span style={{ color: "white", fontSize: 13, fontWeight: 600 }}>{g.pct}%</span>
                </div>
                <div style={s.barTrack}>
                  <div style={{ ...s.barFill, width: `${g.pct}%`, background: g.color, transition: "width 1s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accounts */}
        <div style={{ ...s.card, ...s.cardDark }}>
          <p style={s.label}>Linked Accounts</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            {accounts.map((a) => (
              <div key={a.name} style={s.accountRow}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{a.icon}</span>
                  <span style={{ color: "white", fontSize: 14, fontWeight: 500 }}>{a.name}</span>
                </div>
                <span style={{
                  fontSize: 12, padding: "3px 10px", borderRadius: 20, fontWeight: 600,
                  background: a.status === "connected" ? "#052e16" : "#1c1917",
                  color: a.status === "connected" ? "#10b981" : "#f59e0b",
                }}>
                  {a.status === "connected" ? "Connected" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div style={{ ...s.card, ...s.cardDark }}>
          <p style={s.label}>Quick Insights</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            {insights.map((ins) => (
              <div key={ins.text} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", borderRadius: 10, background: "#0f172a",
                border: `1px solid ${ins.type === "good" ? "#052e16" : ins.type === "warn" ? "#1c1107" : "#1e293b"}`
              }}>
                <span style={{ fontSize: 16, color: ins.type === "good" ? "#10b981" : ins.type === "warn" ? "#f59e0b" : "#3b82f6" }}>{ins.icon}</span>
                <span style={{ color: "#cbd5e1", fontSize: 13 }}>{ins.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Reminders */}
      <div style={{ ...s.card, ...s.cardDark, marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ ...s.label, margin: 0 }}>Upcoming Payments</p>
          <span style={{ color: "#475569", fontSize: 12 }}>Next 30 days · ${payments.reduce((a, b) => a + b.amount, 0).toLocaleString()} total</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {payments.map((p) => (
            <div key={p.name} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px", borderRadius: 12, background: "#0f172a",
              border: `1px solid ${p.urgent ? "#3b1a1a" : "#1e293b"}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>{p.icon}</span>
                <div>
                  <p style={{ color: "white", fontSize: 14, fontWeight: 500, margin: 0 }}>{p.name}</p>
                  <p style={{ color: "#475569", fontSize: 12, margin: "2px 0 0" }}>Due {p.due}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ color: "white", fontWeight: 600, fontSize: 15 }}>${p.amount}</span>
                <span style={{
                  fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600,
                  background: p.urgent ? "#3b1a1a" : "#0f172a",
                  color: p.urgent ? "#ef4444" : "#475569",
                  border: `1px solid ${p.urgent ? "#7f1d1d" : "#1e293b"}`,
                }}>
                  {p.daysLeft <= 3 ? "⚠ " : ""}{p.daysLeft}d left
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div style={{ ...s.card, ...s.cardDark, marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ ...s.label, margin: 0 }}>Recommendations</p>
          <span style={{ color: "#475569", fontSize: 12 }}>Based on your portfolio · Mar 2026</span>
        </div>
        <div style={s.recGrid}>
          {recommendations.map((r) => (
            <div key={r.title} style={s.recCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>{r.icon}</span>
                <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 600, background: r.tagBg, color: r.tagColor }}>{r.tag}</span>
              </div>
              <p style={{ color: "white", fontSize: 14, fontWeight: 600, margin: "0 0 6px" }}>{r.title}</p>
              <p style={{ color: "#64748b", fontSize: 13, margin: 0, lineHeight: 1.6 }}>{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box",
    background: "#020818",
    padding: "32px",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  grain: {
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
    background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
    opacity: 0.4,
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, position: "relative", zIndex: 1 },
  badge: { display: "inline-block", fontSize: 10, letterSpacing: 2, color: "#3b82f6", background: "#0c1d3a", border: "1px solid #1e3a5f", padding: "3px 8px", borderRadius: 4, marginBottom: 8, fontWeight: 700 },
  title: { fontSize: 36, fontWeight: 800, color: "white", margin: 0, letterSpacing: -1, fontFamily: "'DM Sans', sans-serif" },
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
  navBtnActive: {
    background: "#0c1d3a", border: "1px solid #1e3a5f", color: "#3b82f6",
  },
  grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 16, position: "relative", zIndex: 1 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 16, position: "relative", zIndex: 1 },
  card: { borderRadius: 16, padding: "24px", display: "flex", flexDirection: "column", position: "relative", zIndex: 1 },
  cardDark: { background: "#0b1121", border: "1px solid #1e293b" },
  label: { color: "#475569", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600, margin: "0 0 12px" },
  huge: { fontSize: 42, fontWeight: 800, color: "white", margin: "0 0 12px", fontFamily: "'DM Mono', monospace", letterSpacing: -2 },
  pill: { display: "inline-block", background: "#052e16", color: "#10b981", fontSize: 12, padding: "4px 10px", borderRadius: 20, fontWeight: 600, width: "fit-content" },
  budgetRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0" },
  budgetLabel: { color: "#64748b", fontSize: 14 },
  budgetValue: { color: "white", fontWeight: 600, fontSize: 15 },
  barTrack: { height: 6, background: "#1e293b", borderRadius: 99, overflow: "hidden", marginTop: 4 },
  barFill: { height: "100%", borderRadius: 99, background: "#3b82f6" },
  barCaption: { color: "#475569", fontSize: 11, margin: "5px 0 0" },
  accountRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#0f172a", borderRadius: 10, border: "1px solid #1e293b" },
  recGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 },
  recCard: { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "16px" },
};


