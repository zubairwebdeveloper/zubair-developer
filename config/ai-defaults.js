// AI default par band hai. Owner admin panel se khud enable karta hai.
export const DEFAULT_AI_SETTINGS = {
  enabled: false,
  name: "Zubair's Assistant",
  welcomeMessage:
    "Hi! I can answer questions about services and pricing, or help you shape a project brief.",
  tone: "Friendly, clear and professional. Short, practical answers.",
  languages: ["English", "Roman Urdu"],
  suggestedPrompts: [
    "I need a business website.",
    "Help me automate Instagram DMs.",
    "Which service is right for my business?",
    "How much might my project cost?",
    "I want to discuss a custom project.",
  ],
  qualificationQuestions: [
    "What kind of business do you run?",
    "What do you want this project to achieve?",
    "Which features are essential?",
    "What budget range do you have in mind?",
    "What timeline are you aiming for?",
    "Do you have an existing website or tools to integrate?",
    "How would you like to be contacted?",
  ],
  pricingGuidance: "",
  handoffMessage:
    "Prefer to talk to a person? Use the contact form or send a project brief and I will reply personally.",
  extraInstructions: "",
  perIpPer10Min: 15,
  perSessionPerHour: 30,
  dailyMessages: 300,
  storeConversations: false,
  retentionDays: 30,
  version: 0,
};
