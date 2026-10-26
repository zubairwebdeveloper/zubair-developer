export const serviceCategoryOptions = [
  { value: "web-development", label: "Web development" },
  { value: "chatbot-automation", label: "Chatbot & social media automation" },
  { value: "ai-assistant", label: "Website AI assistant" },
  { value: "custom", label: "Custom solution" },
  { value: "other", label: "Something else" },
];

export const budgetOptions = [
  { value: "under-200", label: "Under $200" },
  { value: "200-500", label: "$200 – $500" },
  { value: "500-1500", label: "$500 – $1,500" },
  { value: "1500-plus", label: "$1,500+" },
  { value: "not-sure", label: "Not sure yet" },
];

export const timelineOptions = [
  { value: "asap", label: "As soon as possible" },
  { value: "1-month", label: "Within 1 month" },
  { value: "1-3-months", label: "1 – 3 months" },
  { value: "flexible", label: "Flexible" },
];

export const contactMethodOptions = [
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "call", label: "Phone call" },
];
export const labelFor = (options, value) =>
  options.find((option) => option.value === value)?.label ?? value ?? "—";
export const getValues = (options) => options.map((option) => option.value);
