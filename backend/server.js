require("dotenv").config(); // Load .env into process.env

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
// Optional future imports
const OpenAI = require("openai");
// const mongoose = require("mongoose");
const { google } = require("googleapis");

app.use(cors());
app.use(express.json());

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

/*
  HEALTH SCORE
  Input shape:
  {
    assets: {
      savings,
      investments,
      cpf,
      insuranceValue
    },
    liabilities: {
      debt
    },
    monthly: {
      income,
      expenses
    }
  }
*/
app.post("/score", (req, res) => {
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
  const diversificationCount = [
    savings,
    investments,
    cpf,
    insuranceValue
  ].filter((v) => v > 0).length;

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
});

/*
  LIFE SHOCK ANALYSIS
  Input shape:
  {
    scenario,
    savings,
    investments,
    income,
    expenses,
    debt
  }
*/
app.post("/shock", (req, res) => {
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
      insights.push("Some personal goals may need temporary reprioritization.");
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
});

/*
  BEHAVIOURAL FINANCE ANALYSIS
  Input shape:
  {
    monthly: {
      income,
      expenses,
      subscriptions
    },
    reminders: [{ name, due, type }],
    goals: [{ name, current, target, deadline }]
  }
*/
app.post("/behaviour", (req, res) => {
  const { monthly = {}, reminders = [], goals = [] } = req.body;

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
    insights.push(`You also have ${flexible} flexible payment(s) that can be optimized.`);
  }

  if (lowProgressGoals >= 2) {
    insights.push("You are pursuing several long-term goals at once, so prioritization may improve success.");
  }

  insights.push("Automating savings immediately after payday can reduce behavioural overspending.");
  insights.push("Reviewing expenses right after large income days may help control impulse spending.");

  res.json({
    savingsRatio: Number((savingsRatio * 100).toFixed(0)),
    cuttableCount: cuttable,
    flexibleCount: flexible,
    lowProgressGoals,
    insights
  });
});

/*
  MACRO-ECONOMIC IMPACT ANALYSIS
  Input shape:
  {
    scenario,
    investments,
    expenses,
    debt,
    income
  }
*/
app.post("/macro", (req, res) => {
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
});

/*
  AI ADVISOR
  Input shape:
  {
    prompt,
    profile: {
      assets,
      liabilities,
      monthly,
      goals
    }
  }
*/
app.post("/advisor", (req, res) => {
  const prompt = String(req.body.prompt || "").toLowerCase();
  const profile = req.body.profile || {};

  const savings = toNumber(profile.assets?.savings);
  const investments = toNumber(profile.assets?.investments);
  const cpf = toNumber(profile.assets?.cpf);
  const insuranceValue = toNumber(profile.assets?.insuranceValue);
  const debt = toNumber(profile.liabilities?.debt);
  const income = toNumber(profile.monthly?.income);
  const expenses = toNumber(profile.monthly?.expenses);

  const totalAssets = savings + investments + cpf + insuranceValue;
  const netWorth = totalAssets - debt;
  const runway = expenses > 0 ? savings / expenses : 0;
  const monthlyBalance = income - expenses;

  let reply =
    "Based on your current profile, your financial position is reasonably stable, but there is still room to improve resilience.";

  if (prompt.includes("emergency") || prompt.includes("savings")) {
    reply = `You currently have about ${runway.toFixed(
      1
    )} months of emergency runway. A strong next step would be to build this toward at least 6 months of expenses.`;
  } else if (prompt.includes("debt")) {
    reply = `Your current debt is $${debt.toLocaleString()}. Focus on paying down the highest-interest debt first before increasing discretionary spending.`;
  } else if (prompt.includes("invest") || prompt.includes("portfolio")) {
    reply = `You currently hold $${investments.toLocaleString()} in investments. Make sure your portfolio is diversified and that your emergency fund is secure before taking additional risk.`;
  } else if (prompt.includes("budget")) {
    reply = `Your monthly balance is $${monthlyBalance.toLocaleString()}. Keep fixed expenses controlled and review cuttable subscriptions first when optimizing your budget.`;
  } else if (prompt.includes("net worth")) {
    reply = `Your estimated net worth is $${netWorth.toLocaleString()}. Growing assets consistently while controlling debt will improve this over time.`;
  } else if (prompt.includes("goal")) {
    reply =
      "For life goals, break each goal into a target amount, deadline, and required monthly contribution. Prioritize your emergency fund before aggressive long-term goals.";
  } else if (prompt.includes("shock") || prompt.includes("job loss") || prompt.includes("medical")) {
    reply =
      "For shock preparedness, strengthen your emergency fund, reduce non-essential recurring costs, and make sure your insurance coverage is adequate for medical and disability scenarios.";
  }

  res.json({
    reply
  });
});

/*
  OPTIONAL: DEMO PROFILE
  This lets you test from the browser quickly.
*/
app.get("/demo-profile", (req, res) => {
  res.json({
    assets: {
      savings: 18000,
      investments: 24000,
      cpf: 12000,
      insuranceValue: 4000
    },
    liabilities: {
      debt: 6500
    },
    monthly: {
      income: 4200,
      expenses: 2550,
      subscriptions: 4
    },
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



