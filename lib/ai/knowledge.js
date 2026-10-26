import "server-only";

import { COLLECTIONS } from "@/constants/collections";
import { getPublished } from "@/lib/firebase/published";
import { formatPrice } from "@/lib/utils/format";
import { getFaqs, getSkills } from "@/services/content.service";
import { getPlans } from "@/services/pricing.service";
import { getPublishedProjects } from "@/services/projects.service";
import { getServices } from "@/services/services.service";

const MAX_CHUNKS = 6;
const MAX_CONTEXT_CHARS = 3500;
const MAX_CHUNK_CHARS = 900;
const PRICE_INTENT =
  /price|pricing|cost|budget|charge|rate|fee|quote|qeemat|kitna|paisa|\$/i;

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "you",
  "your",
  "are",
  "can",
  "how",
  "what",
  "does",
  "from",
  "that",
  "this",
  "have",
  "need",
  "want",
  "please",
  "hai",
  "ka",
  "ki",
  "ke",
  "ko",
  "se",
  "mein",
  "main",
  "kya",
  "aur",
  "mujhe",
  "chahiye",
]);

const tokenize = (text) =>
  String(text)
    .toLowerCase()
    .split(/[^a-z0-9$]+/)
    .map((token) => token.replace(/s$/, ""))
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

const list = (items) => (items?.length ? items.join("; ") : "");

async function buildChunks() {
  const [services, plans, faqs, projects, skills, extra] = await Promise.all([
    getServices(),
    getPlans(),
    getFaqs(),
    getPublishedProjects(),
    getSkills(),
    getPublished(COLLECTIONS.aiKnowledge, []),
  ]);

  const chunks = [];

  services.forEach((service) =>
    chunks.push({
      type: "service",
      title: service.title,
      text: `Service: ${service.title}. ${service.summary} Problem solved: ${service.problem} Deliverables: ${list(service.deliverables)}. Engagement: ${service.engagement}. Price: ${
        service.startingPrice == null
          ? "Request a quote"
          : `from ${formatPrice({ price: service.startingPrice, currency: service.currency })}`
      }.`,
    }),
  );

  plans.forEach((plan) =>
    chunks.push({
      type: "plan",
      title: `${plan.name} plan (${plan.category})`,
      text: `Pricing plan "${plan.name}" for ${plan.category === "web" ? "web development" : "chatbot automation"}: ${formatPrice(plan)} (${plan.billing}). ${plan.description} Includes: ${list(plan.features)}. ${
        plan.excludes?.length ? `Not included: ${list(plan.excludes)}.` : ""
      } Prices are starting prices, not final quotes.`,
    }),
  );

  faqs.forEach((faq) =>
    chunks.push({
      type: "faq",
      title: faq.question,
      text: `Q: ${faq.question} A: ${faq.answer}`,
    }),
  );

  projects.forEach((project) =>
    chunks.push({
      type: "project",
      title: project.title,
      text: `Project: ${project.title} (${project.category}). ${project.summary} Technologies: ${list(project.technologies)}.${
        project.outcome ? ` Outcome: ${project.outcome}` : ""
      }`,
    }),
  );

  if (skills.length > 0) {
    chunks.push({
      type: "skills",
      title: "Skills and technologies",
      text: `Skills and technologies: ${skills.map((skill) => skill.name).join(", ")}.`,
    });
  }

  extra.forEach((entry) =>
    chunks.push({
      type: "knowledge",
      title: entry.title,
      text: `${entry.title}: ${entry.content}`,
    }),
  );

  return chunks.map((chunk) => ({
    ...chunk,
    text: chunk.text.slice(0, MAX_CHUNK_CHARS),
    titleTokens: new Set(tokenize(chunk.title)),
    bodyTokens: new Set(tokenize(chunk.text)),
  }));
}

function score(chunk, queryTokens, wantsPrice) {
  let total = 0;
  queryTokens.forEach((token) => {
    if (chunk.titleTokens.has(token)) total += 3;
    else if (chunk.bodyTokens.has(token)) total += 1;
  });
  if (wantsPrice && chunk.type === "plan") total += 3;
  return total;
}

/** Sirf sawal se related chunks, size cap ke saath. */
export async function retrieveContext(query) {
  const chunks = await buildChunks();
  const queryTokens = [...new Set(tokenize(query))];
  const wantsPrice = PRICE_INTENT.test(query);

  let selected = chunks
    .map((chunk) => ({ chunk, score: score(chunk, queryTokens, wantsPrice) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CHUNKS)
    .map((entry) => entry.chunk);

  // Kuch match na ho (jaise "hello") to services ka overview.
  if (selected.length === 0)
    selected = chunks.filter((chunk) => chunk.type === "service").slice(0, 3);

  let used = 0;
  const kept = [];
  for (const chunk of selected) {
    if (used + chunk.text.length > MAX_CONTEXT_CHARS) break;
    used += chunk.text.length;
    kept.push(chunk);
  }

  return {
    text: kept.map((chunk) => `- ${chunk.text}`).join("\n"),
    titles: kept.map((chunk) => chunk.title),
  };
}
