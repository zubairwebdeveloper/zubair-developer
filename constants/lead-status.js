export const LEAD_STATUS = {
  NEW: "new",
  CONTACTED: "contacted",
  QUALIFIED: "qualified",
  PROPOSAL_SENT: "proposal_sent",
  NEGOTIATION: "negotiation",
  WON: "won",
  LOST: "lost",
  ARCHIVED: "archived",
};

// Sirf in transitions ki ijazat hai. Phase 4 ma server isay enforce karega.
export const LEAD_TRANSITIONS = {
  new: ["contacted", "qualified", "lost", "archived"],
  contacted: ["qualified", "proposal_sent", "lost", "archived"],
  qualified: ["proposal_sent", "negotiation", "lost", "archived"],
  proposal_sent: ["negotiation", "won", "lost", "archived"],
  negotiation: ["proposal_sent", "won", "lost", "archived"],
  won: ["archived"],
  lost: ["contacted", "archived"],
  archived: ["new"],
};
export const LEAD_STATUS_LABELS = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal_sent: "Proposal sent",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
  archived: "Archived",
};

export const LEAD_PRIORITIES = ["low", "medium", "high"];

export const CLOSED_LEAD_STATUSES = ["won", "lost", "archived"];
export function canTransition(from, to) {
  return LEAD_TRANSITIONS[from]?.includes(to) ?? false;
}
