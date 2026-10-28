import { serviceCategoryOptions } from "@/constants/options";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  faqSchema,
  planSchema,
  projectSchema,
  serviceSchema,
  skillSchema,
  testimonialSchema,
  blogSchema,
  experienceSchema,
  aiKnowledgeSchema,
} from "@/lib/validations/content.schema";
import { slugify } from "@/lib/utils/slugs";

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

// Image fields are optional everywhere they are used (pricing, blog).
const imageFields = [
  { name: "coverImage", label: "Cover image (optional)", type: "image" },
  {
    name: "coverAlt",
    label: "Cover image description (optional)",
    type: "text",
    description:
      "Screen reader ke liye chhoti si description. Image na ho to khali chhorein.",
  },
];
const currencyOptions = ["USD", "PKR", "EUR", "GBP"].map((value) => ({
  value,
  label: value,
}));

const statusField = {
  name: "status",
  label: "Status",
  type: "select",
  options: statusOptions,
  defaultValue: "draft",
};
const orderField = {
  name: "order",
  label: "Display order",
  type: "number",
  defaultValue: 0,
  description: "Lower numbers appear first.",
};

export const CONTENT_CONFIG = {
  projects: {
    resource: "projects",
    collection: "projects",
    label: "Projects",
    singular: "project",
    permission: PERMISSIONS.PROJECTS_MANAGE,
    schema: projectSchema,
    titleField: "title",
    slugFrom: (data) => slugify(data.title),
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "summary", label: "Summary", type: "textarea", rows: 3 },
      {
        name: "category",
        label: "Category",
        type: "text",
        description: "e.g. Web app, Automation",
      },
      { name: "technologies", label: "Technologies", type: "lines" },
      { name: "problem", label: "Challenge", type: "textarea" },
      { name: "solution", label: "Solution", type: "textarea" },
      {
        name: "outcome",
        label: "Outcome",
        type: "textarea",
        description: "Sirf verified results likhein.",
      },
      { name: "liveUrl", label: "Live URL (optional)", type: "text" },
      { name: "repoUrl", label: "Repository URL (optional)", type: "text" },
      {
        name: "featured",
        label: "Featured on homepage",
        type: "switch",
        defaultValue: false,
      },
      statusField,
      orderField,
    ],
  },

  services: {
    resource: "services",
    collection: "services",
    label: "Services",
    singular: "service",
    permission: PERMISSIONS.SERVICES_MANAGE,
    schema: serviceSchema,
    titleField: "title",
    slugFrom: (data) => slugify(data.title),
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "summary", label: "Summary", type: "textarea", rows: 2 },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: serviceCategoryOptions.filter((o) => o.value !== "other"),
      },
      {
        name: "icon",
        label: "Icon",
        type: "select",
        defaultValue: "web",
        options: [
          { value: "web", label: "Code" },
          { value: "saas", label: "Layers" },
          { value: "chat", label: "Message" },
          { value: "ai", label: "CPU" },
        ],
      },
      {
        name: "problem",
        label: "Problem it solves",
        type: "textarea",
        rows: 3,
      },
      { name: "description", label: "Description", type: "textarea", rows: 5 },
      { name: "deliverables", label: "Deliverables", type: "lines" },
      {
        name: "engagement",
        label: "Engagement type",
        type: "text",
        description: "e.g. Fixed-scope project",
      },
      {
        name: "startingPrice",
        label: "Starting price (optional)",
        type: "number",
        description: "Khali chhorein to 'Request a quote' dikhega.",
      },
      {
        name: "currency",
        label: "Currency",
        type: "select",
        options: currencyOptions,
        defaultValue: "USD",
      },
      statusField,
      orderField,
    ],
  },

  pricing: {
    resource: "pricing",
    collection: "pricingPlans",
    label: "Pricing plans",
    singular: "plan",
    permission: PERMISSIONS.SERVICES_MANAGE,
    schema: planSchema,
    titleField: "name",
    slugFrom: (data) => slugify(`${data.category}-${data.name}`),
    fields: [
      {
        name: "category",
        label: "Group",
        type: "select",
        options: [
          { value: "web", label: "Web development" },
          { value: "automation", label: "Chatbot automation" },
        ],
      },
      ...imageFields,
      { name: "name", label: "Plan name", type: "text" },
      {
        name: "price",
        label: "Price (optional)",
        type: "number",
        description: "Khali = 'Request a quote'.",
      },
      {
        name: "currency",
        label: "Currency",
        type: "select",
        options: currencyOptions,
        defaultValue: "USD",
      },
      {
        name: "isStartingPrice",
        label: "Show as starting price (e.g. $99+)",
        type: "switch",
        defaultValue: true,
      },
      {
        name: "billing",
        label: "Billing",
        type: "select",
        defaultValue: "one-time",
        options: [
          { value: "one-time", label: "One-time" },
          { value: "monthly", label: "Monthly" },
        ],
      },
      {
        name: "badge",
        label: "Badge (optional)",
        type: "text",
        description: "e.g. Popular",
      },
      {
        name: "description",
        label: "Short description",
        type: "textarea",
        rows: 2,
      },
      { name: "features", label: "Included features", type: "lines" },
      { name: "excludes", label: "Not included", type: "lines" },
      {
        name: "ctaLabel",
        label: "Button label",
        type: "text",
        defaultValue: "Get started",
      },
      statusField,
      orderField,
    ],
  },

  faq: {
    resource: "faq",
    collection: "faqs",
    label: "FAQ",
    singular: "question",
    permission: PERMISSIONS.CONTENT_MANAGE,
    schema: faqSchema,
    titleField: "question",
    slugFrom: null, // Auto ID
    fields: [
      { name: "question", label: "Question", type: "text" },
      { name: "answer", label: "Answer", type: "textarea", rows: 5 },
      statusField,
      orderField,
    ],
  },
  blog: {
    resource: "blog",
    collection: "blogPosts",
    label: "Blog posts",
    singular: "post",
    permission: PERMISSIONS.CONTENT_MANAGE,
    schema: blogSchema,
    titleField: "title",
    slugFrom: (data) => slugify(data.title),
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "excerpt", label: "Excerpt", type: "textarea", rows: 2 },
      {
        name: "content",
        label: "Content",
        type: "textarea",
        rows: 14,
        description:
          "Paragraphs ke darmiyan khali line chhorein. " +
          "## / ### lines section headings aur article contents banati hain. HTML support nahi.",
      },
      { name: "tags", label: "Tags", type: "lines" },
      ...imageFields,
      statusField,
    ],
  },

  testimonials: {
    resource: "testimonials",
    collection: "testimonials",
    label: "Testimonials",
    singular: "testimonial",
    permission: PERMISSIONS.CONTENT_MANAGE,
    schema: testimonialSchema,
    titleField: "authorName",
    slugFrom: null,
    fields: [
      { name: "authorName", label: "Client name", type: "text" },
      { name: "authorRole", label: "Role (optional)", type: "text" },
      { name: "company", label: "Company (optional)", type: "text" },
      {
        name: "quote",
        label: "Testimonial",
        type: "textarea",
        rows: 4,
        description:
          "Sirf asli feedback, client ki ijazat ke saath. Publish karna hi approval hai.",
      },
      statusField,
      orderField,
    ],
  },

  skills: {
    resource: "skills",
    collection: "skills",
    label: "Skills",
    singular: "skill",
    permission: PERMISSIONS.CONTENT_MANAGE,
    schema: skillSchema,
    titleField: "name",
    slugFrom: (data) => slugify(data.name),
    fields: [
      { name: "name", label: "Skill", type: "text" },
      {
        name: "category",
        label: "Group",
        type: "text",
        description: "e.g. Frontend, Backend, Automation",
      },
      statusField,
      orderField,
    ],
  },

  experience: {
    resource: "experience",
    collection: "experience",
    label: "Experience",
    singular: "entry",
    permission: PERMISSIONS.CONTENT_MANAGE,
    schema: experienceSchema,
    titleField: "role",
    slugFrom: (data) => slugify(`${data.company}-${data.role}`),
    fields: [
      { name: "role", label: "Role", type: "text" },
      { name: "company", label: "Company / client", type: "text" },
      {
        name: "period",
        label: "Period",
        type: "text",
        description: "e.g. 2023 – Present",
      },
      {
        name: "description",
        label: "Description (optional)",
        type: "textarea",
        rows: 4,
      },
      statusField,
      orderField,
    ],
  },
  "ai-knowledge": {
    resource: "ai-knowledge",
    collection: "aiKnowledge",
    label: "AI knowledge",
    singular: "entry",
    permission: PERMISSIONS.AI_MANAGE,
    schema: aiKnowledgeSchema,
    titleField: "title",
    slugFrom: (data) => slugify(data.title),
    fields: [
      { name: "title", label: "Title", type: "text" },
      {
        name: "content",
        label: "Approved information",
        type: "textarea",
        rows: 6,
        description:
          "Sirf wo baatein jo assistant ko batani hain (policies, hours, turnaround). Published entries hi use hoti hain. Secrets ya private data mat likhein.",
      },
      statusField,
      orderField,
    ],
  },
};

export function getContentConfig(resource) {
  return Object.hasOwn(CONTENT_CONFIG, resource)
    ? CONTENT_CONFIG[resource]
    : null;
}
