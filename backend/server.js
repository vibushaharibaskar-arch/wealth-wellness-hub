require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const { google } = require("googleapis");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
  })
);
app.use(express.json());

/* =========================
   MONGODB SETUP
   ========================= */
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/wealthhub";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

/* =========================
   MONGOOSE SCHEMAS
   ========================= */
const profileSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  assets: { type: Object, default: {} },
  liabilities: { type: Object, default: {} },
  monthly: { type: Object, default: {} },
  goals: { type: Array, default: [] },
  reminders: { type: Array, default: [] }
});

const tokenSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  tokens: { type: Object, required: true }
});

const Profile = mongoose.model("Profile", profileSchema);
const GoogleToken = mongoose.model("GoogleToken", tokenSchema);

/* =========================
   OPENAI SETUP
   ========================= */
const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
const openai = hasOpenAI
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/* =========================
   GOOGLE OAUTH
   ========================= */
const hasGoogleOAuth =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET) &&
  Boolean(process.env.GOOGLE_REDIRECT_URI);

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

/* =========================
   HELPERS
   ========================= */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function normaliseName(name) {
  return String(name || "").trim().toLowerCase();
}

function buildFinancialSnapshot(profile = {}) {
  const savings = toNumber(profile.assets?.savings);
  const investments = toNumber(profile.assets?.investments);
  const cpf = toNumber(profile.assets?.cpf);
  const insuranceValue = toNumber(profile.assets?.insuranceValue);
  const debt = toNumber(profile.liabilities?.debt);
  const income = toNumber(profile.monthly?.income);
  const expenses = toNumber(profile.monthly?.expenses);
  const subscriptions = toNumber(profile.monthly?.subscriptions);

  const totalAssets = savings + investments + cpf + insuranceValue;
  const netWorth = totalAssets - debt;
  const runway = expenses > 0 ? savings / expenses : 0;
  const monthlyBalance = income - expenses;
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

  return {
    name: profile.name || "",
    savings,
    investments,
    cpf,
    insuranceValue,
    debt,
    income,
    expenses,
    subscriptions,
    totalAssets: Number(totalAssets.toFixed(2)),
    netWorth: Number(netWorth.toFixed(2)),
    runway: Number(runway.toFixed(1)),
    monthlyBalance: Number(monthlyBalance.toFixed(2)),
    savingsRate: Number(savingsRate.toFixed(0)),
    reminders: Array.isArray(profile.reminders) ? profile.reminders : [],
    goals: Array.isArray(profile.goals) ? profile.goals : []
  };
}

function getRuleBasedAdvice(prompt, profile = {}) {
  const s = buildFinancialSnapshot(profile);
  const p = String(prompt || "").toLowerCase();

  if (p.includes("emergency") || p.includes("savings")) {
    return `You currently have about ${s.runway.toFixed(
      1
    )} months of emergency runway. Build this towards at least 6 months if possible.`;
  }

  if (p.includes("debt")) {
    return `Your current debt is $${s.debt.toLocaleString()}. Prioritise the highest-interest debt first before increasing non-essential spending.`;
  }

  if (p.includes("invest") || p.includes("portfolio")) {
    return `You currently hold $${s.investments.toLocaleString()} in investments. Keep your emergency fund stable before taking additional portfolio risk.`;
  }

  if (p.includes("budget")) {
    return `Your monthly balance is $${s.monthlyBalance.toLocaleString()}. Review subscriptions and flexible spending first when tightening your budget.`;
  }

  if (p.includes("net worth")) {
    return `Your estimated net worth is $${s.netWorth.toLocaleString()}. Increasing assets steadily while controlling debt will improve this over time.`;
  }

  if (p.includes("behaviour") || p.includes("spending")) {
    return "Your best behavioural next step is to automate savings right after payday and review recurring subscriptions every month.";
  }

  return "Your finances look reasonably stable, but improving emergency runway and keeping recurring spending disciplined would strengthen resilience.";
}

async function generateAIAdvice({ prompt, profile, mode = "advisor" }) {
  if (!openai || !process.env.OPENAI_MODEL) {
    return {
      source: "rule-based",
      text: getRuleBasedAdvice(prompt, profile)
    };
  }

  const snapshot = buildFinancialSnapshot(profile);

  const systemInstruction =
    mode === "behaviour"
      ? `
You are a practical personal finance coach.
Give behavioural-finance insights only.
Focus on habits, overspending patterns, subscription creep, goal prioritisation, automation, and emotional spending.
Do not make legal, tax, or regulated financial claims.
Keep the answer concise, specific, and useful.
Use plain English.
`
      : `
You are a practical personal finance coach.
Answer based only on the user's financial data.
Do not invent numbers.
Focus on resilience, net worth, budget, debt, emergency runway, and goal progress.
Do not make legal, tax, or regulated financial claims.
Keep the answer concise, specific, and useful.
Use plain English.
`;

  const userInput = `
User prompt:
${String(prompt || "")}

Financial profile:
${JSON.stringify(snapshot, null, 2)}
`;

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL,
    input: [
      {
        role: "system",
        content: systemInstruction
      },
      {
        role: "user",
        content: userInput
      }
    ]
  });

  return {
    source: "openai",
    text: response.output_text?.trim() || getRuleBasedAdvice(prompt, profile)
  };
}

/* =========================
   PROFILE / USER ROUTES (ALL USE DB)
   ========================= */
app.post("/profile", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    if (!name) return res.status(400).json({ error: "Name is required." });

    const profileData = {
      name: normaliseName(name),
      assets: req.body.assets || {},
      liabilities: req.body.liabilities || {},
      monthly: req.body.monthly || {},
      goals: Array.isArray(req.body.goals) ? req.body.goals : [],
      reminders: Array.isArray(req.body.reminders) ? req.body.reminders : []
    };

    const profile = await Profile.findOneAndUpdate(
      { name: normaliseName(name) },
      profileData,
      { upsert: true, new: true }
    );

    res.json({ message: "Profile saved successfully.", profile });
  } catch (error) {
    console.error("/profile error:", error);
    res.status(500).json({ error: "Failed to save profile." });
  }
});

app.get("/profile/:name", async (req, res) => {
  try {
    const profile = await Profile.findOne({ name: normaliseName(req.params.name) });
    if (!profile) return res.status(404).json({ error: "Profile not found." });
    res.json(profile);
  } catch (error) {
    console.error("/profile/:name error:", error);
    res.status(500).json({ error: "Failed to fetch profile." });
  }
});

app.get("/profile/:name/net-worth", async (req, res) => {
  try {
    const profile = await Profile.findOne({ name: normaliseName(req.params.name) });
    if (!profile) return res.status(404).json({ error: "Profile not found." });

    const snapshot = buildFinancialSnapshot(profile);

    res.json({
      name: profile.name,
      totalAssets: snapshot.totalAssets,
      totalDebt: Number(snapshot.debt.toFixed(2)),
      netWorth: snapshot.netWorth,
      runway: snapshot.runway,
      monthlyBalance: snapshot.monthlyBalance,
      savingsRate: snapshot.savingsRate
    });
  } catch (error) {
    console.error("/profile/:name/net-worth error:", error);
    res.status(500).json({ error: "Failed to fetch net worth." });
  }
});

/* =========================
   HEALTH SCORE
   ========================= */
app.post("/score", async (req, res) => {
  try {
    const { assets = {}, liabilities = {}, monthly = {} } = req.body;

    const savings = toNumber(assets.savings);
    const investments = toNumber(assets.investments);
    const cpf = toNumber(assets.cpf);
    const insuranceValue = toNumber(assets.insuranceValue);
    const debt = toNumber(liabilities.debt);
    const income = toNumber(monthly.income);
    const expenses = toNumber(monthly.expenses);

    const totalAssets = savings + investments + cpf + insuranceValue;
    const netWorth = totalAssets - debt;
    const runway = expenses > 0 ? savings / expenses : 0;
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
    const diversificationCount = [savings, investments, cpf, insuranceValue].filter(
      (v) => v > 0
    ).length;

    let healthScore = 100;
    const insights = [];

    if (savingsRate < 20) {
      healthScore -= 15;
      insights.push("Savings rate is below 20%, which may weaken long-term resilience.");
    } else {
      insights.push("Savings rate is healthy for long-term progress.");
    }

    if (runway < 3) {
      healthScore -= 25;
      insights.push("Emergency runway is below 3 months.");
    } else if (runway < 6) {
      healthScore -= 10;
      insights.push("Emergency runway exists, but could be stronger.");
    } else {
      insights.push("Emergency runway is in a strong range.");
    }

    if (debt > totalAssets * 0.4 && totalAssets > 0) {
      healthScore -= 20;
      insights.push("Debt is high relative to assets.");
    } else {
      insights.push("Debt level is manageable relative to assets.");
    }

    if (diversificationCount < 3) {
      healthScore -= 10;
      insights.push("Portfolio diversification can be improved.");
    } else {
      insights.push("Asset mix is reasonably diversified.");
    }

    if (netWorth < 0) {
      healthScore -= 20;
      insights.push("Net worth is negative, which is a risk signal.");
    } else {
      insights.push("Net worth is positive.");
    }

    healthScore = clamp(Math.round(healthScore), 0, 100);

    res.json({
      totalAssets: Number(totalAssets.toFixed(2)),
      totalDebt: Number(debt.toFixed(2)),
      netWorth: Number(netWorth.toFixed(2)),
      runway: Number(runway.toFixed(1)),
      savingsRate: Number(savingsRate.toFixed(0)),
      diversificationCount,
      healthScore,
      insights
    });
  } catch (error) {
    console.error("/score error:", error);
    res.status(500).json({ error: "Failed to calculate health score." });
  }
});

/* =========================
   LIFE SHOCK ANALYSIS
   ========================= */
app.post("/shock", async (req, res) => {
  try {
    const scenario = String(req.body.scenario || "").toLowerCase();

    const originalSavings = toNumber(req.body.savings);
    const originalInvestments = toNumber(req.body.investments);
    const originalIncome = toNumber(req.body.income);
    const originalExpenses = toNumber(req.body.expenses);
    const debt = toNumber(req.body.debt);

    let newSavings = originalSavings;
    let newInvestments = originalInvestments;
    let newIncome = originalIncome;
    let newExpenses = originalExpenses;

    let label = "Life Shock Analysis";
    const insights = [];

    switch (scenario) {
      case "jobloss":
        label = "Job Loss";
        newIncome = 0;
        insights.push("Primary income drops to zero immediately.");
        insights.push("Emergency fund becomes the main source of survival.");
        break;

      case "inflation":
        label = "Inflation Shock";
        newExpenses *= 1.2;
        insights.push("Monthly expenses increase by 20%.");
        insights.push("Purchasing power drops unless income rises too.");
        break;

      case "market":
        label = "Market Crash";
        newInvestments *= 0.75;
        insights.push("Investment portfolio falls by 25%.");
        insights.push("Long-term goals may be delayed if recovery is slow.");
        break;

      case "medical":
        label = "Medical Emergency";
        newSavings -= 6000;
        newExpenses += 500;
        insights.push("Large immediate medical costs reduce liquid cash.");
        insights.push("Short-term recurring health expenses also rise.");
        break;

      case "accident":
        label = "Accident";
        newSavings -= 8000;
        newIncome *= 0.7;
        insights.push("Unexpected accident costs hit savings quickly.");
        insights.push("Temporary work disruption reduces income.");
        break;

      case "disability":
        label = "Temporary Disability";
        newIncome *= 0.5;
        newExpenses += 300;
        insights.push("Income capacity drops significantly.");
        insights.push("Care-related costs increase monthly outflow.");
        break;

      case "repair":
        label = "Major Repair";
        newSavings -= 3500;
        insights.push("Unexpected repair costs reduce emergency cash.");
        insights.push("This tests whether your emergency fund is sufficient.");
        break;

      case "family":
        label = "Family Emergency";
        newSavings -= 5000;
        newExpenses += 700;
        insights.push("Support or caregiving responsibilities increase expenses.");
        insights.push("Some personal goals may need temporary reprioritisation.");
        break;

      default:
        insights.push("No valid scenario selected.");
        break;
    }

    newSavings = Math.max(0, newSavings);
    newInvestments = Math.max(0, newInvestments);

    const monthlyBalance = newIncome - newExpenses;
    const emergencyRunway = newExpenses > 0 ? newSavings / newExpenses : 0;

    let healthScore = 100;

    if (monthlyBalance < 0) healthScore -= 30;
    if (emergencyRunway < 3) healthScore -= 30;
    if (debt > 20000) healthScore -= 15;
    if (newInvestments < originalInvestments) healthScore -= 10;

    healthScore = clamp(Math.round(healthScore), 0, 100);

    if (monthlyBalance < 0) {
      insights.push("Your monthly cash flow turns negative under this scenario.");
      insights.push("Cuttable subscriptions and discretionary expenses should go first.");
    }

    if (emergencyRunway < 3) {
      insights.push("Emergency runway falls below 3 months, which is a high-risk zone.");
    }

    res.json({
      label,
      original: {
        savings: Number(originalSavings.toFixed(2)),
        investments: Number(originalInvestments.toFixed(2)),
        income: Number(originalIncome.toFixed(2)),
        expenses: Number(originalExpenses.toFixed(2))
      },
      shocked: {
        savings: Number(newSavings.toFixed(2)),
        investments: Number(newInvestments.toFixed(2)),
        income: Number(newIncome.toFixed(2)),
        expenses: Number(newExpenses.toFixed(2))
      },
      monthlyBalance: Number(monthlyBalance.toFixed(2)),
      remainingSavings: Number(newSavings.toFixed(2)),
      investmentValue: Number(newInvestments.toFixed(2)),
      emergencyRunway: Number(emergencyRunway.toFixed(1)),
      healthScore,
      insights
    });
  } catch (error) {
    console.error("/shock error:", error);
    res.status(500).json({ error: "Failed to perform life shock analysis." });
  }
});

/* =========================
   BEHAVIOURAL ANALYSIS
   ========================= */
app.post("/behaviour", async (req, res) => {
  try {
    const { monthly = {}, reminders = [], goals = [], name = "" } = req.body;

    const income = toNumber(monthly.income);
    const expenses = toNumber(monthly.expenses);
    const subscriptions = toNumber(monthly.subscriptions);

    const savingsRatio = income > 0 ? (income - expenses) / income : 0;
    const cuttable = reminders.filter((r) => r.type === "Cuttable").length;
    const flexible = reminders.filter((r) => r.type === "Flexible").length;
    const lowProgressGoals = goals.filter((g) => {
      const current = toNumber(g.current);
      const target = toNumber(g.target, 1);
      return current / target < 0.5;
    }).length;

    const insights = [];

    if (savingsRatio < 0.2) {
      insights.push("Your monthly surplus is relatively tight, so spending discipline matters more.");
    } else {
      insights.push("You maintain a decent monthly surplus, which supports consistent goal progress.");
    }

    if (subscriptions >= 4) {
      insights.push("You appear to have multiple recurring subscriptions that can be reviewed.");
    }

    if (cuttable > 0) {
      insights.push(`You have ${cuttable} clearly cuttable recurring payment(s), which gives flexibility during shocks.`);
    }

    if (flexible > 0) {
      insights.push(`You also have ${flexible} flexible payment(s) that can be optimised.`);
    }

    if (lowProgressGoals >= 2) {
      insights.push("You are pursuing several long-term goals at once, so prioritisation may improve success.");
    }

    insights.push("Automating savings immediately after payday can reduce behavioural overspending.");
    insights.push("Reviewing expenses right after large income days may help control impulse spending.");

    // Fetch profile from DB
    const profile = await Profile.findOne({ name: normaliseName(name) });

    const ai = await generateAIAdvice({
      prompt:
        "Give behavioural finance insights based on this user's spending, subscriptions, reminders, and goal progress.",
      profile: profile || { name, monthly, reminders, goals },
      mode: "behaviour"
    });

    res.json({
      savingsRatio: Number((savingsRatio * 100).toFixed(0)),
      cuttableCount: cuttable,
      flexibleCount: flexible,
      lowProgressGoals,
      insights,
      aiBehaviouralInsight: ai.text,
      aiSource: ai.source
    });
  } catch (error) {
    console.error("/behaviour error:", error);
    res.status(500).json({ error: "Failed to perform behavioural analysis." });
  }
});

/* =========================
   MACRO IMPACT
   ========================= */
app.post("/macro", (req, res) => {
  try {
    const scenario = String(req.body.scenario || "").toLowerCase();

    const originalInvestments = toNumber(req.body.investments);
    const originalExpenses = toNumber(req.body.expenses);
    const originalIncome = toNumber(req.body.income);
    const debt = toNumber(req.body.debt);

    let adjustedInvestments = originalInvestments;
    let adjustedExpenses = originalExpenses;
    let adjustedIncome = originalIncome;

    let label = "Macro-Economic Impact";
    const insights = [];

    switch (scenario) {
      case "inflation_rise":
        label = "Inflation Rise";
        adjustedExpenses *= 1.15;
        insights.push("Basic living costs rise and reduce monthly surplus.");
        insights.push("Cash loses purchasing power faster in inflationary conditions.");
        break;

      case "rate_hike":
        label = "Interest Rate Hike";
        adjustedExpenses += debt * 0.01;
        insights.push("Debt servicing becomes more expensive.");
        insights.push("Loan-heavy households feel pressure sooner.");
        break;

      case "recession":
        label = "Recession";
        adjustedIncome *= 0.9;
        adjustedInvestments *= 0.88;
        insights.push("Income stability may weaken during a recession.");
        insights.push("Investment growth may slow or reverse in the short term.");
        break;

      case "market_drop":
        label = "Market Drop";
        adjustedInvestments *= 0.8;
        insights.push("Portfolio value drops sharply in the short term.");
        insights.push("Panic-driven selling may damage long-term recovery.");
        break;

      default:
        insights.push("No valid macro scenario selected.");
        break;
    }

    const newMonthlyBalance = adjustedIncome - adjustedExpenses;

    res.json({
      label,
      adjustedIncome: Number(adjustedIncome.toFixed(2)),
      adjustedExpenses: Number(adjustedExpenses.toFixed(2)),
      adjustedInvestments: Number(adjustedInvestments.toFixed(2)),
      newMonthlyBalance: Number(newMonthlyBalance.toFixed(2)),
      insights
    });
  } catch (error) {
    console.error("/macro error:", error);
    res.status(500).json({ error: "Failed to calculate macro impact." });
  }
});
/* =========================
   AI CHATBOT
   ========================= */
app.post("/ai/chat", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const prompt = String(req.body.prompt || "").trim();

    if (!name) {
      return res.status(400).json({ error: "Name is required." });
    }
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    // Fetch the user profile from MongoDB
    const profile = await Profile.findOne({ name: normaliseName(name) });

    if (!profile) {
      return res.status(404).json({
        error: "No saved profile found for this name. Save the profile first."
      });
    }

    const ai = await generateAIAdvice({
      prompt,
      profile,
      mode: "advisor" // same mode as original
    });

    res.json({
      name,
      reply: ai.text,
      source: ai.source,
      snapshot: buildFinancialSnapshot(profile)
    });
  } catch (error) {
    console.error("/ai/chat error:", error);
    res.status(500).json({ error: "Failed to generate AI response." });
  }
});

/* =========================
   AI ADVISOR
   ========================= */
app.post("/advisor", async (req, res) => {
  try {
    const prompt = String(req.body.prompt || "").trim();
    const profile = req.body.profile || {};

    const ai = await generateAIAdvice({
      prompt,
      profile,
      mode: "advisor"
    });

    res.json({
      reply: ai.text,
      source: ai.source
    });
  } catch (error) {
    console.error("/advisor error:", error);
    res.status(500).json({ error: "Failed to generate advisor response." });
  }
});

/* =========================
   GOOGLE CALENDAR CONNECT
   Tokens stored in DB
   ========================= */
app.get("/auth/google", (req, res) => {
  try {
    if (!hasGoogleOAuth) {
      return res.status(500).json({ error: "Google OAuth is not configured in .env" });
    }

    const name = String(req.query.name || "").trim();
    if (!name) return res.status(400).json({ error: "name query parameter is required." });

    const oauth2Client = getOAuthClient();
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events"
      ],
      state: name
    });

    res.json({ authUrl });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ error: "Failed to start Google authentication." });
  }
});

app.get("/auth/google/callback", async (req, res) => {
  try {
    if (!hasGoogleOAuth) return res.status(500).send("Google OAuth is not configured.");

    const code = String(req.query.code || "");
    const name = String(req.query.state || "").trim();

    if (!code || !name) return res.status(400).send("Missing code or state.");

    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    await GoogleToken.findOneAndUpdate(
      { name: normaliseName(name) },
      { tokens },
      { upsert: true }
    );

    const redirectBase = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(
      `${redirectBase}/?calendar=connected&name=${encodeURIComponent(name)}`
    );
  } catch (error) {
    console.error("Google callback error:", error);
    res.status(500).send("Failed to complete Google authentication.");
  }
});

/* =========================
   LIST CALENDAR EVENTS
   ========================= */
app.get("/calendar/events", async (req, res) => {
  try {
    const name = String(req.query.name || "").trim();
    if (!name) return res.status(400).json({ error: "name query parameter is required." });

    const tokenDoc = await GoogleToken.findOne({ name: normaliseName(name) });
    if (!tokenDoc) return res.status(401).json({ error: "Google Calendar not connected for this user." });

    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials(tokenDoc.tokens);

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime"
    });

    const events = (response.data.items || []).map((event) => ({
      id: event.id,
      summary: event.summary || "Untitled Event",
      description: event.description || "",
      start: event.start?.dateTime || event.start?.date || null,
      end: event.end?.dateTime || event.end?.date || null,
      htmlLink: event.htmlLink || null
    }));

    res.json({ connected: true, count: events.length, events });
  } catch (error) {
    console.error("/calendar/events error:", error);
    res.status(500).json({ error: "Failed to fetch calendar events." });
  }
});

/* =========================
   CREATE CALENDAR EVENT
   ========================= */
app.post("/calendar/create-event", async (req, res) => {
  try {
    const { name, summary, description, start, end } = req.body;

    if (!name || !summary || !start || !end) {
      return res.status(400).json({ error: "name, summary, start and end are required." });
    }

    const tokenDoc = await GoogleToken.findOne({ name: normaliseName(name) });
    if (!tokenDoc) return res.status(401).json({ error: "Google Calendar not connected for this user." });

    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials(tokenDoc.tokens);

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
      requestBody: { summary, description, start: { dateTime: start }, end: { dateTime: end } }
    });

    res.json({
      message: "Event created successfully.",
      event: {
        id: response.data.id,
        summary: response.data.summary,
        htmlLink: response.data.htmlLink,
        start: response.data.start,
        end: response.data.end
      }
    });
  } catch (error) {
    console.error("/calendar/create-event error:", error);
    res.status(500).json({ error: "Failed to create calendar event." });
  }
});

/* =========================
   HOME & DEMO
   ========================= */
app.get("/demo-profile", (req, res) => {
  res.json({
    name: "Anjali",
    assets: { savings: 18000, investments: 24000, cpf: 12000, insuranceValue: 4000 },
    liabilities: { debt: 6500 },
    monthly: { income: 4200, expenses: 2550, subscriptions: 4 },
    goals: [
      { name: "Emergency Fund", current: 18000, target: 25000, deadline: "Dec 2026" },
      { name: "Travel Fund", current: 2500, target: 6000, deadline: "Jun 2027" },
      { name: "House Downpayment", current: 12000, target: 60000, deadline: "2030" }
    ],
    reminders: [
      { name: "Credit Card Bill", due: "10 Mar", type: "Essential" },
      { name: "Phone Bill", due: "12 Mar", type: "Essential" },
      { name: "Netflix", due: "15 Mar", type: "Cuttable" },
      { name: "Spotify", due: "18 Mar", type: "Flexible" }
    ]
  });
});

app.get("/", (req, res) => {
  res.send("Wealth Wellness Hub backend is running.");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
