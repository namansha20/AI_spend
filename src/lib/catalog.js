export const TOOL_CATALOG = {
  cursor: {
    name: "Cursor",
    vendor: "Cursor",
    plans: {
      Hobby: { monthlyPerSeat: 0, seatCap: 1 },
      Pro: { monthlyPerSeat: 20 },
      Business: { monthlyPerSeat: 40 },
      Enterprise: { monthlyPerSeat: 60 },
    },
  },
  copilot: {
    name: "GitHub Copilot",
    vendor: "GitHub",
    plans: {
      Individual: { monthlyPerSeat: 10 },
      Business: { monthlyPerSeat: 19 },
      Enterprise: { monthlyPerSeat: 39 },
    },
  },
  claude: {
    name: "Claude",
    vendor: "Anthropic",
    plans: {
      Free: { monthlyPerSeat: 0, seatCap: 1 },
      Pro: { monthlyPerSeat: 20 },
      Max: { monthlyPerSeat: 100 },
      Team: { monthlyPerSeat: 30, minSeats: 5 },
      Enterprise: { monthlyPerSeat: 60 },
      "API direct": { monthlyPerSeat: 0, apiOnly: true },
    },
  },
  chatgpt: {
    name: "ChatGPT",
    vendor: "OpenAI",
    plans: {
      Plus: { monthlyPerSeat: 20 },
      Team: { monthlyPerSeat: 30, minSeats: 2 },
      Enterprise: { monthlyPerSeat: 60 },
      "API direct": { monthlyPerSeat: 0, apiOnly: true },
    },
  },
  anthropicApi: {
    name: "Anthropic API direct",
    vendor: "Anthropic",
    plans: {
      "API direct": { monthlyPerSeat: 0, apiOnly: true },
    },
  },
  openaiApi: {
    name: "OpenAI API direct",
    vendor: "OpenAI",
    plans: {
      "API direct": { monthlyPerSeat: 0, apiOnly: true },
    },
  },
  gemini: {
    name: "Gemini",
    vendor: "Google",
    plans: {
      Pro: { monthlyPerSeat: 20 },
      Ultra: { monthlyPerSeat: 250 },
      API: { monthlyPerSeat: 0, apiOnly: true },
    },
  },
  windsurf: {
    name: "Windsurf",
    vendor: "Codeium",
    plans: {
      Free: { monthlyPerSeat: 0, seatCap: 1 },
      Pro: { monthlyPerSeat: 15 },
      Teams: { monthlyPerSeat: 30 },
      Enterprise: { monthlyPerSeat: 45 },
    },
  },
};

export const USE_CASE_OPTIONS = ["coding", "writing", "data", "research", "mixed"];

export const ALTERNATIVES = {
  coding: [
    { toolKey: "copilot", plan: "Individual", monthlyPerSeat: 10 },
    { toolKey: "windsurf", plan: "Pro", monthlyPerSeat: 15 },
  ],
  writing: [{ toolKey: "claude", plan: "Pro", monthlyPerSeat: 20 }],
  data: [
    { toolKey: "chatgpt", plan: "Plus", monthlyPerSeat: 20 },
    { toolKey: "gemini", plan: "Pro", monthlyPerSeat: 20 },
  ],
  research: [
    { toolKey: "claude", plan: "Pro", monthlyPerSeat: 20 },
    { toolKey: "chatgpt", plan: "Plus", monthlyPerSeat: 20 },
  ],
  mixed: [
    { toolKey: "chatgpt", plan: "Team", monthlyPerSeat: 30 },
    { toolKey: "claude", plan: "Team", monthlyPerSeat: 30 },
  ],
};
