/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, type ReactNode } from 'react';
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

// --- AI Advisor Logic ---
async function getFinleyAdvice(prompt: string, profile: any) {
  if (!process.env.GEMINI_API_KEY) {
    return "I'm Finley! I'd love to help, but I need a Gemini API key to think clearly. ❄️";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `You are Finley, a friendly and wise arctic fox financial advisor. 
      The user's financial profile: ${JSON.stringify(profile)}.
      User question: ${prompt}.
      Give a concise, helpful, and encouraging response in Finley's voice (use ice/arctic metaphors occasionally).`
    });
    return response.text;
  } catch (error) {
    console.error(error);
    return "Snowstorm in my brain! Try again in a moment. 🌨️";
  }
}

import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, Shield, AlertTriangle, Zap, 
  Settings, User, LayoutDashboard, HeartPulse, 
  CloudRain, Globe, MessageCircle, X, Send,
  ArrowRight, ChevronRight, Info, Wallet,
  Calendar, CreditCard, PieChart as PieIcon,
  ArrowUpRight, ArrowDownRight, Sparkles, Clock
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types & Constants ---

const TABS = [
  { id: "Overview", icon: LayoutDashboard },
  { id: "Health Score", icon: HeartPulse },
  { id: "Life Shock", icon: Zap },
  { id: "Behaviour", icon: TrendingUp },
  { id: "Macro", icon: Globe },
  { id: "AI Advisor", icon: MessageCircle },
  { id: "Profile", icon: User },
];

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

// --- Components ---

function Finley({ mood = "happy", size = 120 }: { mood?: "happy" | "neutral" | "worried", size?: number }) {
  const ink = "#374151"; // Dark grey outline (medium thickness)
  const creamWhite = "#fdfdfb"; // Pale cream white
  const brightWhite = "#ffffff"; // Brighter white for chest
  const innerEar = "#f9d5d3"; // Soft pink
  const eyeBlue = "#60a5fa"; // Bluish reflection

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width="100%" height="100%" viewBox="0 0 120 120" fill="none">
        <defs>
          <radialGradient id="bgCircle" cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </radialGradient>
        </defs>

        {/* Background Circle */}
        <circle cx="60" cy="64" r="52" fill="url(#bgCircle)" />
        <ellipse cx="60" cy="112" rx="34" ry="6" fill="#60a5fa" opacity="0.2" />

        {/* 13. TAIL - Thinner and more tapered at the tip */}
        <motion.path 
          animate={{ 
            rotate: mood === 'happy' ? [0, 2, -2, 0] : [0, 0.5, -0.5, 0],
            scale: mood === 'happy' ? [1, 1.01, 1] : 1
          }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          style={{ transformOrigin: '80px 100px' }}
          d="M80,95 
             C105,100 115,80 110,65 
             C105,50 85,55 78,75 
             C72,92 58,110 62,110
             C66,110 74,102 80,95"
          fill={creamWhite} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" 
        />
        {/* Subtle fur detail on tail */}
        <path d="M64,108 Q68,105 70,108" stroke={ink} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />

        {/* 10. BODY - Small rounded oval, sitting upright */}
        <path 
          d="M45,85 Q40,112 60,112 Q80,112 75,85" 
          fill={creamWhite} stroke={ink} strokeWidth="2.5" 
        />

        {/* 12. BACK LEG LINE (Subtle) */}
        <path d="M78,102 Q83,105 81,110" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />

        {/* 11. FRONT LEGS - Short rounded rectangles, tapered */}
        <g>
          {/* Left Leg */}
          <path d="M48,95 L46,108 Q46,112 52,112 L54,112 Q58,112 58,108 L56,95" fill={creamWhite} stroke={ink} strokeWidth="2" />
          {/* Toe bumps */}
          <path d="M48,112 Q48,110 49,112 M51,112 Q51,110 52,112 M54,112 Q54,110 55,112" stroke={ink} strokeWidth="1.2" strokeLinecap="round" />
          
          {/* Right Leg */}
          <path d="M72,95 L74,108 Q74,112 68,112 L66,112 Q62,112 62,108 L64,95" fill={creamWhite} stroke={ink} strokeWidth="2" />
          {/* Toe bumps */}
          <path d="M72,112 Q72,110 71,112 M69,112 Q69,110 68,112 M66,112 Q66,110 65,112" stroke={ink} strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* 9. CHEST FUR - Fluffy triangle, brighter white, jagged curves */}
        <path 
          d="M42,78 Q45,88 48,83 Q52,98 60,93 Q68,98 72,83 Q75,88 78,78 Q60,82 42,78" 
          fill={brightWhite} stroke={ink} strokeWidth="2" strokeLinejoin="round" 
        />

        {/* 3. EARS - Slightly bigger triangular, rounded corners, pink inner */}
        <g>
          {/* Left Ear */}
          <path d="M32,45 Q15,0 52,25 Q58,35 55,50 Z" fill={creamWhite} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M35,42 Q22,10 48,28 Q52,35 50,45 Z" fill={innerEar} />
          
          {/* Right Ear */}
          <path d="M88,45 Q105,0 68,25 Q62,35 65,50 Z" fill={creamWhite} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M85,42 Q98,10 72,28 Q68,35 70,45 Z" fill={innerEar} />
        </g>

        {/* 2 & 8. HEAD - Large oval, cheek fluff bulges */}
        <motion.path 
          animate={{ 
            y: mood === 'happy' ? [0, -1.5, 0] : mood === 'worried' ? [0, 1, 0] : 0,
          }}
          transition={{ repeat: Infinity, duration: 3 }}
          d="M30,50 Q25,65 40,75 Q50,80 60,80 Q70,80 80,75 Q95,65 90,50 Q85,25 60,25 Q35,25 30,50"
          fill={creamWhite} stroke={ink} strokeWidth="2.5" 
        />

        {/* FACE */}
        <g>
          {/* 7. EYEBROWS - Small arcs */}
          <path d="M41,42 Q46,40 51,42" stroke={ink} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4" />
          <path d="M69,42 Q74,40 79,42" stroke={ink} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4" />

          {/* 4. EYES - Large circular, shiny with blue reflection */}
          <g>
            {/* Left Eye */}
            <circle cx="46" cy="55" r="9" fill="#111827" />
            <path d="M40,58 Q46,63 52,58" stroke={eyeBlue} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.3" />
            <circle cx="49" cy="51" r="3" fill="white" />
            
            {/* Right Eye */}
            <circle cx="74" cy="55" r="9" fill="#111827" />
            <path d="M68,58 Q74,63 80,58" stroke={eyeBlue} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.3" />
            <circle cx="77" cy="51" r="3" fill="white" />
          </g>

          {/* 5. NOSE - Small rounded triangle */}
          <path d="M58,64 Q60,68 62,64 Q60,63 58,64 Z" fill="#374151" />

          {/* 6. MOUTH - Vertical line then split smiling shape */}
          <g>
            <path d="M60,67 L60,69" stroke={ink} strokeWidth="2" strokeLinecap="round" />
            {mood === "happy" ? (
              <path d="M54,69 Q57,73 60,69 Q63,73 66,69" stroke={ink} strokeWidth="2" strokeLinecap="round" fill="none" />
            ) : mood === "neutral" ? (
              <path d="M55,70 Q60,71 65,70" stroke={ink} strokeWidth="2" strokeLinecap="round" fill="none" />
            ) : (
              <path d="M54,72 Q60,68 66,72" stroke={ink} strokeWidth="2" strokeLinecap="round" fill="none" />
            )}
          </g>
        </g>
      </svg>
    </motion.div>
  );
}

function ScoreRing({ score, size = 120 }: { score: number, size?: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 75 ? "#059669" : score >= 50 ? "#d97706" : "#dc2626";
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 120 120" className="transform -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e0f2fe" strokeWidth="10" />
        <motion.circle 
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" 
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-arctic-900 font-mono">{score}</span>
        <span className="text-[10px] text-arctic-400 font-medium uppercase tracking-wider">Health</span>
      </div>
    </div>
  );
}

function Card({ children, title, icon: Icon, className = "", delay = 0 }: { children: ReactNode, title?: string, icon?: any, className?: string, delay?: number, key?: any }) {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      className={cn("arctic-card p-6", className)}
    >
      {title && (
        <div className="flex items-center gap-2 mb-4">
          {Icon && <Icon className="w-4 h-4 text-arctic-500" />}
          <h3 className="text-xs font-bold text-arctic-400 uppercase tracking-widest">{title}</h3>
        </div>
      )}
      {children}
    </motion.div>
  );
}

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [profile, setProfile] = useState({ ...DEFAULT_PROFILE, name: "Alex" });
  const [scoreData, setScoreData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: "finley", text: "Hello! I'm Finley, your arctic fox financial guide. How can I help you stay financially healthy today? ❄️" }
  ]);
  const [shockResult, setShockResult] = useState<any>(null);
  const [behaviourData, setBehaviourData] = useState<any>(null);
  const [macroData, setMacroData] = useState<any>(null);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Save initial profile to backend
    saveProfile(profile);
    fetchScore();
  }, []);

  useEffect(() => {
    // Check for calendar connection in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('calendar') === 'connected') {
      setCalendarConnected(true);
      fetchCalendarEvents();
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const saveProfile = async (p: any) => {
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
    } catch (e) {
      console.error("Failed to save profile:", e);
    }
  };

  const fetchScore = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          assets: profile.assets, 
          liabilities: profile.liabilities, 
          monthly: profile.monthly 
        }),
      });
      const data = await res.json();
      setScoreData(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const runSimulation = async (scenario: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/shock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          savings: profile.assets.savings,
          investments: profile.assets.investments,
          income: profile.monthly.income,
          expenses: profile.monthly.expenses,
          debt: profile.liabilities.debt
        }),
      });
      const data = await res.json();
      setShockResult(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const runBehaviourAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/behaviour", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          monthly: profile.monthly,
          reminders: profile.reminders,
          goals: profile.goals,
          assets: profile.assets,
          liabilities: profile.liabilities
        }),
      });
      const data = await res.json();
      setBehaviourData(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const runMacroAnalysis = async (scenario: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/macro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          investments: profile.assets.investments,
          expenses: profile.monthly.expenses,
          income: profile.monthly.income,
          debt: profile.liabilities.debt
        }),
      });
      const data = await res.json();
      setMacroData(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const connectGoogleCalendar = async () => {
    try {
      const res = await fetch(`/api/auth/google?name=${encodeURIComponent(profile.name)}`);
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (e) {
      console.error("Failed to connect Google Calendar:", e);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      const res = await fetch(`/api/calendar/events?name=${encodeURIComponent(profile.name)}`);
      const data = await res.json();
      if (data.events) {
        setCalendarEvents(data.events);
      }
    } catch (e) {
      console.error("Failed to fetch calendar events:", e);
    }
  };

  const syncReminderToCalendar = async (reminder: any) => {
    if (!calendarConnected) {
      alert("Please connect your Google Calendar first in the Profile tab.");
      setActiveTab("Profile");
      return;
    }

    setLoading(true);
    try {
      // Parse "10 Mar" to a date. Assume current year 2026.
      const [day, monthStr] = reminder.due.split(" ");
      const monthMap: { [key: string]: number } = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
      };
      const month = monthMap[monthStr] || 2;
      const startDate = new Date(2026, month, parseInt(day), 9, 0, 0); // 9 AM
      const endDate = new Date(2026, month, parseInt(day), 10, 0, 0); // 10 AM

      const res = await fetch("/api/calendar/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          summary: `Payment Reminder: ${reminder.name}`,
          description: `Arctic Finance Hub reminder for ${reminder.name} (${reminder.type})`,
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Successfully synced ${reminder.name} to your Google Calendar!`);
        fetchCalendarEvents();
      } else {
        alert(data.error || "Failed to sync to calendar.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while syncing.");
    }
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name, prompt: userMsg }),
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: "finley", text: data.reply || "I'm having trouble thinking right now. 🌨️" }]);
    } catch (e) {
      console.error(e);
      setChatMessages(prev => [...prev, { role: "finley", text: "Snowstorm in my brain! Try again in a moment. 🌨️" }]);
    }
  };

  const mood = !scoreData ? "neutral" : scoreData.healthScore >= 75 ? "happy" : scoreData.healthScore >= 50 ? "neutral" : "worried";

  return (
    <div className="min-h-screen flex bg-arctic-50 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-arctic-100 flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-arctic-500 rounded-2xl flex items-center justify-center shadow-lg shadow-arctic-500/20">
                <Shield className="text-white w-6 h-6" />
              </div>
              <h1 className="text-xl font-black text-arctic-900 tracking-tight leading-none uppercase">
                Arctic <span className="text-arctic-500 block text-sm tracking-[0.3em]">Finance Hub</span>
              </h1>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group",
                activeTab === t.id 
                  ? "bg-arctic-500 text-white shadow-xl shadow-arctic-500/20" 
                  : "text-arctic-400 hover:bg-arctic-50 hover:text-arctic-900"
              )}
            >
              <t.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", activeTab === t.id ? "text-white" : "text-arctic-300")} />
              {t.id}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="arctic-glass p-5 rounded-3xl flex items-center gap-4 border-arctic-200/50">
            <div className="w-14 h-14 rounded-2xl bg-arctic-100 flex items-center justify-center overflow-hidden shadow-inner">
              <Finley mood={mood} size={56} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-arctic-900 truncate">Finley</p>
              <p className="text-[10px] text-arctic-400 font-bold uppercase tracking-widest">Your Guide</p>
            </div>
            <div className={cn("w-2 h-2 rounded-full", mood === 'happy' ? 'bg-emerald-500' : mood === 'neutral' ? 'bg-amber-500' : 'bg-rose-500')} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-arctic-100 px-10 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h2 className="text-2xl font-bold text-arctic-900 tracking-tight">{activeTab}</h2>
            <p className="text-xs text-arctic-400 font-medium">Welcome back, {profile.name}! Here's your arctic financial update.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-arctic-50 rounded-2xl border border-arctic-100">
              <Calendar className="w-4 h-4 text-arctic-400" />
              <span className="text-xs font-bold text-arctic-900">March 7, 2026</span>
            </div>
            <div className="h-10 w-px bg-arctic-100" />
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-bold text-arctic-900">{profile.name}</p>
                <p className="text-[10px] text-arctic-400 font-bold uppercase tracking-widest">Premium Member</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-arctic-100 to-arctic-200 border border-arctic-200 shadow-sm overflow-hidden flex items-center justify-center">
                <User className="text-arctic-400 w-6 h-6" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          {activeTab === "Overview" && (
            <div className="grid grid-cols-12 gap-10">
              {/* Hero Card */}
              <Card className="col-span-12 lg:col-span-8 flex flex-col md:flex-row items-center justify-between overflow-hidden relative border-none bg-gradient-to-br from-arctic-900 to-arctic-950 text-white shadow-2xl shadow-arctic-900/20">
                <div className="relative z-10 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm border border-white/10">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-arctic-300">Financial Status</span>
                    </div>
                  </div>
                  <h3 className="text-4xl font-bold mb-4 tracking-tight">
                    Your finances are <span className={cn(
                      "italic",
                      mood === 'happy' ? 'text-emerald-400' : mood === 'neutral' ? 'text-amber-400' : 'text-rose-400'
                    )}>
                      {mood === 'happy' ? 'thriving' : mood === 'neutral' ? 'stable' : 'under pressure'}
                    </span>
                  </h3>
                  <p className="text-arctic-200 text-sm max-w-md mb-8 leading-relaxed">
                    {mood === 'happy' ? "Finley is doing a happy dance! Your savings rate is exceptional this month. Consider increasing your investment contributions." : 
                     mood === 'neutral' ? "The arctic winds are calm. You're maintaining a steady course, but we could optimize your subscription spending." : 
                     "Brrr! It's getting cold. Finley is worried about your upcoming debt repayments. Let's look at a plan together."}
                  </p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setActiveTab("Health Score")}
                      className="bg-arctic-500 text-white px-8 py-3.5 rounded-2xl text-sm font-bold hover:bg-arctic-400 transition-all shadow-lg shadow-arctic-500/30 flex items-center gap-2"
                    >
                      Deep Dive <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setActiveTab("Profile")}
                      className="bg-white/10 text-white px-8 py-3.5 rounded-2xl text-sm font-bold hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10"
                    >
                      Settings
                    </button>
                  </div>
                </div>
                <div className="hidden md:block relative z-10 pr-4">
                  <Finley mood={mood} size={220} />
                </div>
                {/* Decorative elements */}
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-arctic-500/20 rounded-full blur-[100px]" />
                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
              </Card>

              {/* Quick Stats Sidebar */}
              <div className="col-span-12 lg:col-span-4 space-y-8">
                <Card title="Net Worth" icon={Wallet} className="bg-white">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-4xl font-bold text-arctic-900 font-mono tracking-tighter">${(scoreData?.netWorth || 0).toLocaleString()}</span>
                      <div className="flex items-center gap-1 mt-1">
                        <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500 text-xs font-bold">+2.4% this month</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-arctic-50 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="text-arctic-500 w-6 h-6" />
                    </div>
                  </div>
                </Card>
                <Card title="Health Score" icon={HeartPulse}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-bold text-arctic-900 font-mono tracking-tighter">{scoreData?.healthScore || 0}</span>
                        <span className="text-arctic-400 text-sm font-bold mb-1.5">/ 100</span>
                      </div>
                      <p className="text-[10px] text-arctic-400 font-bold uppercase tracking-widest mt-1">Excellent Standing</p>
                    </div>
                    <ScoreRing score={scoreData?.healthScore || 0} size={80} />
                  </div>
                </Card>
              </div>

              {/* Charts Row */}
              <Card title="Asset Allocation" icon={PieIcon} className="col-span-12 lg:col-span-4">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Savings', value: profile.assets.savings },
                          { name: 'Investments', value: profile.assets.investments },
                          { name: 'CPF', value: profile.assets.cpf },
                          { name: 'Insurance', value: profile.assets.insuranceValue },
                        ]}
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill="#0ea5e9" />
                        <Cell fill="#6366f1" />
                        <Cell fill="#8b5cf6" />
                        <Cell fill="#d946ef" />
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 mt-4">
                  {[
                    { name: 'Savings', color: 'bg-arctic-500', val: profile.assets.savings },
                    { name: 'Investments', color: 'bg-indigo-500', val: profile.assets.investments },
                  ].map(item => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", item.color)} />
                        <span className="text-xs text-arctic-400 font-bold">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold text-arctic-900">${item.val.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Monthly Cash Flow" icon={TrendingUp} className="col-span-12 lg:col-span-8">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { name: 'Oct', income: 4000, expenses: 2800 },
                      { name: 'Nov', income: 4200, expenses: 2500 },
                      { name: 'Dec', income: 4200, expenses: 3200 },
                      { name: 'Jan', income: 4500, expenses: 2400 },
                      { name: 'Feb', income: 4200, expenses: 2550 },
                      { name: 'Mar', income: 4200, expenses: 2550 },
                    ]}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      />
                      <Area type="monotone" dataKey="income" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                      <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-arctic-500 rounded-full" />
                    <span className="text-[10px] font-bold text-arctic-400 uppercase tracking-widest">Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-rose-500 rounded-full opacity-50" />
                    <span className="text-[10px] font-bold text-arctic-400 uppercase tracking-widest">Expenses</span>
                  </div>
                </div>
              </Card>

              {/* Reminders Section */}
              <div className="col-span-12">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-arctic-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-arctic-500" />
                    Upcoming Reminders {calendarConnected && "& Events"}
                  </h3>
                  <button 
                    onClick={() => setActiveTab("Profile")}
                    className="text-xs font-bold text-arctic-500 hover:text-arctic-600 flex items-center gap-1"
                  >
                    {calendarConnected ? "Manage Calendar" : "Connect Calendar"} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {profile.reminders.map((r, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ y: -5 }}
                      className="p-6 rounded-3xl bg-white border border-arctic-100 shadow-sm hover:shadow-xl transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          r.type === 'Essential' ? 'bg-emerald-50 text-emerald-500' : 
                          r.type === 'Cuttable' ? 'bg-rose-50 text-rose-500' : 
                          'bg-amber-50 text-amber-500'
                        )}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest",
                          r.type === 'Essential' ? 'bg-emerald-100 text-emerald-700' : 
                          r.type === 'Cuttable' ? 'bg-rose-100 text-rose-700' : 
                          'bg-amber-100 text-amber-700'
                        )}>
                          {r.type}
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-arctic-900 group-hover:text-arctic-500 transition-colors">{r.name}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 text-arctic-400">
                          <Calendar className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Due {r.due}</span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            syncReminderToCalendar(r);
                          }}
                          className="p-1.5 bg-arctic-50 text-arctic-400 rounded-lg hover:bg-arctic-900 hover:text-white transition-all group/btn"
                          title="Sync to Google Calendar"
                        >
                          <Zap className="w-3 h-3 group-hover/btn:animate-pulse" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {calendarEvents.slice(0, 4).map((event, i) => (
                    <motion.div 
                      key={`event-${i}`} 
                      whileHover={{ y: -5 }}
                      className="p-6 rounded-3xl bg-arctic-900 text-white border-none shadow-xl transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-arctic-300" />
                        </div>
                        <div className="px-3 py-1 bg-arctic-500 rounded-full text-[9px] font-bold uppercase tracking-widest">
                          Google
                        </div>
                      </div>
                      <h4 className="text-sm font-bold truncate">{event.summary}</h4>
                      <div className="flex items-center gap-2 mt-2 text-arctic-400">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {new Date(event.start.dateTime || event.start.date).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "Health Score" && (
            <div className="max-w-5xl mx-auto space-y-12">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <ScoreRing score={scoreData?.healthScore || 0} size={240} />
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="absolute -top-6 -right-6 bg-white p-3 rounded-2xl shadow-xl border border-arctic-100"
                  >
                    <Sparkles className="w-6 h-6 text-amber-400" />
                  </motion.div>
                </div>
                <h3 className="text-4xl font-bold text-arctic-900 mt-10 tracking-tight">Your Health Score is {scoreData?.healthScore}</h3>
                <p className="text-arctic-400 mt-4 max-w-lg leading-relaxed">Finley has analyzed your assets, liabilities, and spending habits to determine your financial resilience.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: "Savings Rate", val: `${scoreData?.savingsRate}%`, target: "20%", icon: TrendingUp, color: "text-arctic-500" },
                  { label: "Emergency Runway", val: `${scoreData?.runway} Mo`, target: "6 Mo", icon: Shield, color: "text-emerald-500" },
                  { label: "Debt Ratio", val: `${scoreData?.debtRatio}%`, target: "<30%", icon: AlertTriangle, color: "text-rose-500" },
                ].map((stat, i) => (
                  <Card key={i} title={stat.label} icon={stat.icon}>
                    <div className="flex items-end justify-between mb-4">
                      <span className={cn("text-3xl font-bold font-mono", stat.color)}>{stat.val}</span>
                      <span className="text-[10px] text-arctic-400 font-bold uppercase">Target: {stat.target}</span>
                    </div>
                    <div className="h-2 bg-arctic-50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: stat.label === "Debt Ratio" ? `${Math.max(0, 100 - Number(stat.val.replace('%', '')))}%` : `${Math.min(100, (Number(stat.val.split(' ')[0]) / Number(stat.target.split(' ')[0])) * 100)}%` }}
                        className={cn("h-full", stat.color.replace('text', 'bg'))}
                      />
                    </div>
                  </Card>
                ))}
              </div>

              <Card title="Finley's Detailed Analysis" icon={Info}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {scoreData?.insights.map((insight: string, i: number) => (
                    <motion.div 
                      key={i} 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4 p-5 rounded-3xl bg-arctic-50 border border-arctic-100 hover:border-arctic-300 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                        <Info className="w-5 h-5 text-arctic-500" />
                      </div>
                      <p className="text-sm text-arctic-700 leading-relaxed font-medium">{insight}</p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "AI Advisor" && (
            <div className="max-w-5xl mx-auto h-[70vh] flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-6 p-4">
                {chatMessages.map((m, i) => (
                  <div key={i} className={cn("flex", m.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      "max-w-[80%] p-6 rounded-3xl text-sm leading-relaxed shadow-sm",
                      m.role === 'user' 
                        ? 'bg-arctic-900 text-white rounded-tr-none' 
                        : 'bg-white text-arctic-900 rounded-tl-none border border-arctic-100'
                    )}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-6 bg-white rounded-3xl border border-arctic-100 shadow-xl mt-6">
                <div className="relative flex items-center gap-4">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask Finley for financial advice..."
                    className="flex-1 bg-arctic-50 border border-arctic-100 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-arctic-500/20 transition-all font-medium"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="w-14 h-14 bg-arctic-900 text-white rounded-2xl flex items-center justify-center hover:bg-arctic-800 transition-all shadow-lg shadow-arctic-900/20"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "Life Shock" && (
            <div className="max-w-5xl mx-auto space-y-10">
              <div className="text-center max-w-2xl mx-auto">
                <h3 className="text-3xl font-bold text-arctic-900 tracking-tight">Life Shock Simulator</h3>
                <p className="text-arctic-400 mt-3 leading-relaxed">Simulate unexpected events to see how resilient your finances are. Finley will help you prepare for the cold storms. ❄️</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { id: 'jobloss', label: 'Job Loss', icon: Shield, color: 'rose', desc: 'Simulate losing your primary income immediately.' },
                  { id: 'market', label: 'Market Crash', icon: TrendingUp, color: 'amber', desc: 'See the impact of a 25% drop in your investments.' },
                  { id: 'medical', label: 'Medical Emergency', icon: HeartPulse, color: 'orange', desc: 'A sudden $6,000 medical expense.' },
                ].map((s) => (
                  <motion.button 
                    key={s.id}
                    onClick={() => runSimulation(s.id)}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="arctic-card p-8 text-left hover:border-arctic-300 group transition-all relative overflow-hidden"
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform",
                      s.color === 'rose' ? 'bg-rose-50 text-rose-500' : 
                      s.color === 'amber' ? 'bg-amber-50 text-amber-500' : 
                      'bg-orange-50 text-orange-500'
                    )}>
                      <s.icon className="w-7 h-7" />
                    </div>
                    <h4 className="text-lg font-bold text-arctic-900">{s.label}</h4>
                    <p className="text-xs text-arctic-400 mt-3 leading-relaxed">{s.desc}</p>
                    <div className="mt-6 flex items-center gap-2 text-arctic-500 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Run Simulation <ChevronRight className="w-4 h-4" />
                    </div>
                  </motion.button>
                ))}
              </div>

              {shockResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <Card title={`Simulation Result: ${shockResult.label}`} icon={Zap} className="bg-arctic-900 text-white border-none">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                      <div>
                        <p className="text-[10px] text-arctic-400 font-bold uppercase tracking-widest mb-1">New Health Score</p>
                        <span className="text-4xl font-bold font-mono text-arctic-300">{shockResult.healthScore}</span>
                      </div>
                      <div>
                        <p className="text-[10px] text-arctic-400 font-bold uppercase tracking-widest mb-1">Monthly Balance</p>
                        <span className={cn("text-2xl font-bold font-mono", shockResult.monthlyBalance < 0 ? "text-rose-400" : "text-emerald-400")}>
                          ${shockResult.monthlyBalance.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] text-arctic-400 font-bold uppercase tracking-widest mb-1">Remaining Savings</p>
                        <span className="text-2xl font-bold font-mono">${shockResult.remainingSavings.toLocaleString()}</span>
                      </div>
                      <div>
                        <p className="text-[10px] text-arctic-400 font-bold uppercase tracking-widest mb-1">Emergency Runway</p>
                        <span className="text-2xl font-bold font-mono">{shockResult.emergencyRunway} Mo</span>
                      </div>
                    </div>
                  </Card>

                  <Card title="Finley's Shock Analysis" icon={Info}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {shockResult.insights.map((insight: string, i: number) => (
                        <div key={i} className="flex gap-3 p-4 bg-arctic-50 rounded-2xl border border-arctic-100">
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-sm text-arctic-700 font-medium">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === "Behaviour" && (
            <div className="max-w-5xl mx-auto space-y-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-arctic-900 tracking-tight">Behavioural Analysis</h3>
                  <p className="text-arctic-400 mt-2">Understand your spending habits and financial psychology.</p>
                </div>
                <button 
                  onClick={runBehaviourAnalysis}
                  className="bg-arctic-900 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-arctic-800 transition-all shadow-xl shadow-arctic-900/20"
                >
                  <TrendingUp className="w-4 h-4" /> Analyze Behaviour
                </button>
              </div>

              {behaviourData && (
                <div className="grid grid-cols-12 gap-8">
                  <Card title="Spending Profile" className="col-span-12 lg:col-span-4">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-arctic-400">Savings Ratio</span>
                        <span className="text-lg font-bold text-arctic-900 font-mono">{behaviourData.savingsRatio}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-arctic-400">Cuttable Subscriptions</span>
                        <span className="text-lg font-bold text-arctic-900 font-mono">{behaviourData.cuttableCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-arctic-400">Flexible Expenses</span>
                        <span className="text-lg font-bold text-arctic-900 font-mono">{behaviourData.flexibleCount}</span>
                      </div>
                    </div>
                  </Card>

                  <Card title="AI Behavioural Insight" icon={Sparkles} className="col-span-12 lg:col-span-8 bg-gradient-to-br from-indigo-50 to-arctic-50">
                    <p className="text-arctic-700 leading-relaxed italic">"{behaviourData.aiBehaviouralInsight}"</p>
                    <div className="mt-6 flex items-center gap-2">
                      <div className="px-2 py-0.5 bg-indigo-100 rounded text-[8px] font-bold text-indigo-600 uppercase tracking-widest">
                        Source: {behaviourData.aiSource}
                      </div>
                    </div>
                  </Card>

                  <Card title="Behavioural Insights" icon={Info} className="col-span-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {behaviourData.insights.map((insight: string, i: number) => (
                        <div key={i} className="p-4 bg-white rounded-2xl border border-arctic-100 flex gap-3">
                          <Zap className="w-4 h-4 text-arctic-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-arctic-700 font-medium leading-relaxed">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {activeTab === "Macro" && (
            <div className="max-w-5xl mx-auto space-y-10">
              <div className="text-center max-w-2xl mx-auto">
                <h3 className="text-3xl font-bold text-arctic-900 tracking-tight">Macro-Economic Impact</h3>
                <p className="text-arctic-400 mt-3 leading-relaxed">How do global economic shifts affect your personal wallet? Finley tracks the arctic winds of the economy. 🌬️</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { id: 'inflation_rise', label: 'Inflation Rise', icon: TrendingUp, desc: 'Prices rise by 15%.' },
                  { id: 'rate_hike', label: 'Rate Hike', icon: ArrowUpRight, desc: 'Debt costs increase.' },
                  { id: 'recession', label: 'Recession', icon: CloudRain, desc: 'Income & markets drop.' },
                  { id: 'market_drop', label: 'Market Drop', icon: ArrowDownRight, desc: '20% portfolio dip.' },
                ].map((s) => (
                  <button 
                    key={s.id}
                    onClick={() => runMacroAnalysis(s.id)}
                    className="p-6 bg-white rounded-3xl border border-arctic-100 hover:border-arctic-300 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-arctic-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <s.icon className="w-5 h-5 text-arctic-500" />
                    </div>
                    <h4 className="text-sm font-bold text-arctic-900">{s.label}</h4>
                    <p className="text-[10px] text-arctic-400 mt-1">{s.desc}</p>
                  </button>
                ))}
              </div>

              {macroData && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  <Card title={`Macro Result: ${macroData.label}`} icon={Globe} className="bg-arctic-900 text-white border-none">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-arctic-400 font-bold uppercase tracking-widest">Adj. Income</span>
                        <span className="text-lg font-bold font-mono">${macroData.adjustedIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-arctic-400 font-bold uppercase tracking-widest">Adj. Expenses</span>
                        <span className="text-lg font-bold font-mono text-rose-400">${macroData.adjustedExpenses.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-arctic-400 font-bold uppercase tracking-widest">Adj. Investments</span>
                        <span className="text-lg font-bold font-mono">${macroData.adjustedInvestments.toLocaleString()}</span>
                      </div>
                      <div className="h-px bg-white/10 my-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-arctic-300 font-bold uppercase tracking-widest">New Balance</span>
                        <span className={cn("text-xl font-bold font-mono", macroData.newMonthlyBalance < 0 ? "text-rose-400" : "text-emerald-400")}>
                          ${macroData.newMonthlyBalance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Card>

                  <Card title="Finley's Macro Advice" icon={MessageCircle}>
                    <div className="space-y-4">
                      {macroData.insights.map((insight: string, i: number) => (
                        <div key={i} className="flex gap-3 p-4 bg-arctic-50 rounded-2xl border border-arctic-100">
                          <Info className="w-4 h-4 text-arctic-500 shrink-0 mt-0.5" />
                          <p className="text-sm text-arctic-700 font-medium">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === "Profile" && (
            <div className="max-w-3xl mx-auto space-y-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-arctic-900 tracking-tight">Your Profile</h3>
                  <p className="text-arctic-400 mt-2">Manage your financial data and connections.</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/demo-profile");
                        const data = await res.json();
                        setProfile(data);
                        await saveProfile(data);
                        fetchScore();
                      } catch (e) {
                        console.error("Failed to load demo profile:", e);
                      }
                    }}
                    className="bg-arctic-100 text-arctic-900 px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-arctic-200 transition-all"
                  >
                    <Info className="w-4 h-4" /> Load Demo Data
                  </button>
                  <button 
                    onClick={() => {
                      saveProfile(profile);
                      fetchScore();
                    }}
                    className="bg-arctic-500 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-arctic-400 transition-all shadow-xl shadow-arctic-500/20"
                  >
                    <Shield className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card title="Personal Info" icon={User}>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-arctic-400 uppercase tracking-widest mb-1.5 block">Name</label>
                      <input 
                        type="text" 
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full bg-arctic-50 border border-arctic-100 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-arctic-500/20"
                      />
                    </div>
                  </div>
                </Card>

                <Card title="Connections" icon={Zap}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-arctic-50 rounded-2xl border border-arctic-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <Calendar className="w-5 h-5 text-arctic-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-arctic-900">Google Calendar</p>
                          <p className="text-[10px] text-arctic-400 font-bold uppercase tracking-widest">
                            {calendarConnected ? "Connected" : "Not Connected"}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={connectGoogleCalendar}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                          calendarConnected ? "bg-emerald-50 text-emerald-600" : "bg-arctic-900 text-white hover:bg-arctic-800"
                        )}
                      >
                        {calendarConnected ? "Reconnect" : "Connect"}
                      </button>
                    </div>
                  </div>
                </Card>
              </div>

              <Card title="Financial Assets" icon={Wallet}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {Object.entries(profile.assets).map(([key, val]) => (
                    <div key={key}>
                      <label className="text-[10px] font-bold text-arctic-400 uppercase tracking-widest mb-1.5 block capitalize">{key}</label>
                      <input 
                        type="number" 
                        value={val}
                        onChange={(e) => setProfile({ 
                          ...profile, 
                          assets: { ...profile.assets, [key]: Number(e.target.value) } 
                        })}
                        className="w-full bg-arctic-50 border border-arctic-100 rounded-xl px-4 py-2.5 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-arctic-500/20"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Chat Widget */}
      <div className="fixed bottom-10 right-10 z-50">
        <AnimatePresence>
          {chatOpen && (
            <motion.div 
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              className="absolute bottom-28 right-0 w-[420px] bg-white rounded-[32px] shadow-2xl border border-arctic-100 overflow-hidden flex flex-col"
              style={{ height: '600px' }}
            >
              {/* Chat Header */}
              <div className="bg-arctic-900 p-8 flex items-center justify-between relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center overflow-hidden backdrop-blur-md border border-white/10">
                    <Finley mood={mood} size={48} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Finley</h4>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <p className="text-arctic-300 text-[10px] font-bold uppercase tracking-widest">Arctic AI Advisor</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-white/40 hover:text-white transition-colors relative z-10">
                  <X className="w-6 h-6" />
                </button>
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-arctic-500/20 rounded-full blur-3xl" />
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-arctic-50/30">
                {chatMessages.map((m, i) => (
                  <div key={i} className={cn("flex", m.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      "max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed shadow-sm",
                      m.role === 'user' 
                        ? 'bg-arctic-900 text-white rounded-tr-none shadow-arctic-900/10' 
                        : 'bg-white text-arctic-900 rounded-tl-none border border-arctic-100'
                    )}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-6 bg-white border-t border-arctic-100">
                <div className="relative flex items-center gap-3">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask Finley anything..."
                    className="flex-1 bg-arctic-50 border border-arctic-100 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-arctic-500/20 transition-all font-medium"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="w-14 h-14 bg-arctic-900 text-white rounded-2xl flex items-center justify-center hover:bg-arctic-800 transition-all shadow-lg shadow-arctic-900/20 active:scale-95"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button 
          onClick={() => setChatOpen(!chatOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-20 h-20 bg-arctic-900 rounded-3xl shadow-2xl flex items-center justify-center transition-all group relative border-4 border-white"
        >
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">1</span>
          </div>
          <Finley mood={mood} size={64} />
        </motion.button>
      </div>
    </div>
  );
}
