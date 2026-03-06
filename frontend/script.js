const API_BASE = "https://stunning-couscous-4jx7vg95rwj92jxj5-3000.app.github.dev";

const demoProfile = {
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
};

async function getData(path) {
  try {
    const response = await fetch(`${API_BASE}${path}`);
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

async function postData(path, payload) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

function showOutput(elementId, data) {
  document.getElementById(elementId).textContent = JSON.stringify(data, null, 2);
}

async function getDemoProfile() {
  const data = await getData("/demo-profile");
  showOutput("demoOutput", data);
}

async function testScore() {
  const data = await postData("/score", {
    assets: demoProfile.assets,
    liabilities: demoProfile.liabilities,
    monthly: demoProfile.monthly
  });
  showOutput("scoreOutput", data);
}

async function testShock() {
  const scenario = document.getElementById("scenario").value;

  const data = await postData("/shock", {
    scenario,
    savings: demoProfile.assets.savings,
    investments: demoProfile.assets.investments,
    income: demoProfile.monthly.income,
    expenses: demoProfile.monthly.expenses,
    debt: demoProfile.liabilities.debt
  });

  showOutput("shockOutput", data);
}

async function testBehaviour() {
  const data = await postData("/behaviour", {
    monthly: demoProfile.monthly,
    reminders: demoProfile.reminders,
    goals: demoProfile.goals
  });
  showOutput("behaviourOutput", data);
}

async function testMacro() {
  const scenario = document.getElementById("macroScenario").value;

  const data = await postData("/macro", {
    scenario,
    investments: demoProfile.assets.investments,
    expenses: demoProfile.monthly.expenses,
    debt: demoProfile.liabilities.debt,
    income: demoProfile.monthly.income
  });

  showOutput("macroOutput", data);
}

async function testAdvisor() {
  const prompt = document.getElementById("advisorPrompt").value;

  const data = await postData("/advisor", {
    prompt,
    profile: demoProfile
  });

  showOutput("advisorOutput", data);
}
