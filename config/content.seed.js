export const seedServices = [
  {
    slug: "business-websites",
    category: "web-development",
    icon: "web",
    title: "Business Websites & Landing Pages",
    summary:
      "Fast, clear, conversion-focused websites that present your business properly.",
    problem:
      "Your business needs a credible online presence that turns visitors into enquiries.",
    description:
      "Corporate websites, landing pages and redesigns built with modern, performant technology, with SEO and accessibility handled from the start.",
    deliverables: [
      "Responsive design for mobile, tablet and desktop",
      "SEO-ready structure and metadata",
      "Contact and enquiry forms",
      "Performance and accessibility optimization",
    ],
    engagement: "Fixed-scope project",
    startingPrice: 99,
    currency: "USD",
  },
  {
    slug: "saas-web-applications",
    category: "web-development",
    icon: "saas",
    title: "SaaS & Custom Web Applications",
    summary:
      "Authentication, dashboards, APIs and subscription-ready products.",
    problem:
      "You have a product idea or internal process that needs a real, scalable application.",
    description:
      "Custom web applications with secure authentication, database design, REST APIs, admin dashboards and third-party integrations.",
    deliverables: [
      "Authentication and role-based access",
      "Database and backend architecture",
      "Admin dashboard and analytics",
      "API and third-party integrations",
    ],
    engagement: "Discovery, then scoped project",
    startingPrice: null,
    currency: "USD",
  },
  {
    slug: "chatbot-automation",
    category: "chatbot-automation",
    icon: "chat",
    title: "Chatbot & Social Media Automation",
    summary:
      "ManyChat, Instagram and Messenger flows that capture and qualify leads.",
    problem:
      "Customer messages and comments pile up and leads are lost to slow replies.",
    description:
      "Automation for Instagram DMs, Messenger and comment-to-DM campaigns, with FAQ handling, lead capture, booking flows and Google Sheets or CRM integration.",
    deliverables: [
      "Conversation flow design",
      "Lead capture and qualification",
      "Google Sheets / CRM integration",
      "Testing and handover guide",
    ],
    engagement: "Fixed-scope setup",
    startingPrice: 99,
    currency: "USD",
  },
  {
    slug: "website-ai-assistants",
    category: "ai-assistant",
    icon: "ai",
    title: "Website AI Assistants",
    summary:
      "An assistant that answers visitor questions using your approved business information.",
    problem:
      "Visitors leave with unanswered questions and you have no way to qualify them.",
    description:
      "AI chat experiences trained on approved content, with lead qualification, human handoff and safe fallback when the AI is unavailable.",
    deliverables: [
      "Approved knowledge setup",
      "Lead qualification questions",
      "Human handoff to your inbox",
      "Usage and safety controls",
    ],
    engagement: "Discovery, then scoped project",
    startingPrice: null,
    currency: "USD",
  },
];

export const seedPlans = [
  {
    slug: "web-starter",
    category: "web",
    name: "Starter",
    price: 99,
    currency: "USD",
    isStartingPrice: true,
    billing: "one-time",
    badge: null,
    description: "A focused site or landing page.",
    features: [
      "Single landing page",
      "Responsive layout",
      "Contact form",
      "Basic SEO setup",
    ],
    excludes: ["Custom backend", "Online payments"],
    ctaLabel: "Choose Starter",
  },
  {
    slug: "web-business",
    category: "web",
    name: "Business",
    price: 199,
    currency: "USD",
    isStartingPrice: true,
    billing: "one-time",
    badge: "Popular",
    description: "A multi-page business website.",
    features: [
      "Multi-page website",
      "Content structure and SEO",
      "Contact and enquiry forms",
      "Performance optimization",
    ],
    excludes: ["Full online store"],
    ctaLabel: "Choose Business",
  },
  {
    slug: "web-ecommerce",
    category: "web",
    name: "E-commerce",
    price: 399,
    currency: "USD",
    isStartingPrice: true,
    billing: "one-time",
    badge: null,
    description: "An online store with product management.",
    features: [
      "Product catalogue",
      "Cart and checkout flow",
      "Admin product management",
      "Payment integration (scope-based)",
    ],
    excludes: ["Custom marketplace logic"],
    ctaLabel: "Choose E-commerce",
  },
  {
    slug: "bot-starter",
    category: "automation",
    name: "Starter",
    price: 99,
    currency: "USD",
    isStartingPrice: true,
    billing: "one-time",
    badge: null,
    description: "A simple automation flow.",
    features: [
      "One platform (Instagram or Messenger)",
      "FAQ replies",
      "Basic lead capture",
    ],
    excludes: ["CRM integration", "Booking workflows"],
    ctaLabel: "Choose Starter",
  },
  {
    slug: "bot-business",
    category: "automation",
    name: "Business",
    price: 199,
    currency: "USD",
    isStartingPrice: true,
    billing: "one-time",
    badge: "Popular",
    description: "Lead capture with integrations.",
    features: [
      "Comment-to-DM campaign",
      "Lead qualification flow",
      "Google Sheets integration",
    ],
    excludes: ["Custom AI model training"],
    ctaLabel: "Choose Business",
  },
  {
    slug: "bot-advanced",
    category: "automation",
    name: "Advanced",
    price: 399,
    currency: "USD",
    isStartingPrice: true,
    billing: "one-time",
    badge: null,
    description: "Multi-flow automation for larger needs.",
    features: [
      "Multiple flows and platforms",
      "Booking workflows",
      "CRM integration",
      "Follow-up automation",
    ],
    excludes: [],
    ctaLabel: "Choose Advanced",
  },
];

export const seedProcessSteps = [
  {
    title: "Discovery",
    description: "We discuss your goals, audience and constraints.",
  },
  {
    title: "Requirements & proposal",
    description: "Scope, timeline and pricing are agreed in writing.",
  },
  {
    title: "Design & planning",
    description: "Structure, visual direction and technical plan.",
  },
  {
    title: "Development & integration",
    description: "Building the product and connecting required services.",
  },
  {
    title: "Testing & review",
    description: "Quality checks and your feedback before launch.",
  },
  {
    title: "Deployment & handover",
    description: "Go-live, documentation and a walkthrough.",
  },
  {
    title: "Optional maintenance",
    description: "Ongoing updates and support if you need them.",
  },
];

export const seedFaqs = [
  {
    id: "faq-pricing",
    question: "Are the listed prices final?",
    answer:
      "Listed prices are starting prices. Final cost depends on scope, so projects that need discovery are quoted after a short conversation.",
  },
  {
    id: "faq-start",
    question: "How do I start a project?",
    answer:
      "Use the Start a Project form. Share your goals, budget range and timeline, and you will get a reply to discuss next steps.",
  },
  {
    id: "faq-services",
    question: "What do you build?",
    answer:
      "Business websites, e-commerce, SaaS and custom web applications, plus chatbot and social media automation and website AI assistants.",
  },
  {
    id: "faq-maintenance",
    question: "Do you offer maintenance after launch?",
    answer:
      "Yes, maintenance and support can be added as an optional engagement after delivery.",
  },
];

export const techStack = [
  "Next.js",
  "React",
  "Tailwind CSS",
  "Firebase",
  "Node.js",
  "REST APIs",
  "Gemini API",
  "ManyChat",
];

// Fake projects mat dalein. Asli projects Phase 3/4 ma Firestore + admin se aayenge.
export const seedProjects = [];
