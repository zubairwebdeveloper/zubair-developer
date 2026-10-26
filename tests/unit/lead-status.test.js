import { describe, expect, it } from "vitest";

import {
  canTransition,
  LEAD_STATUS,
  LEAD_TRANSITIONS,
} from "@/constants/lead-status";

const statuses = Object.values(LEAD_STATUS);

describe("lead status transitions", () => {
  it("defines transitions for every status", () => {
    statuses.forEach((status) =>
      expect(LEAD_TRANSITIONS).toHaveProperty(status),
    );
  });

  it("only points to valid statuses and never to itself", () => {
    Object.entries(LEAD_TRANSITIONS).forEach(([from, targets]) => {
      targets.forEach((to) => {
        expect(statuses).toContain(to);
        expect(to).not.toBe(from);
      });
    });
  });

  it("allows the normal sales flow", () => {
    expect(canTransition("new", "contacted")).toBe(true);
    expect(canTransition("qualified", "proposal_sent")).toBe(true);
    expect(canTransition("negotiation", "won")).toBe(true);
  });

  it("blocks skipping straight to won", () => {
    expect(canTransition("new", "won")).toBe(false);
    expect(canTransition("contacted", "won")).toBe(false);
  });

  it("lets a won lead only be archived", () => {
    expect(LEAD_TRANSITIONS.won).toEqual(["archived"]);
  });

  it("lets an archived lead be reopened", () => {
    expect(canTransition("archived", "new")).toBe(true);
  });

  it("rejects unknown statuses", () => {
    expect(canTransition("bogus", "new")).toBe(false);
    expect(canTransition("new", "bogus")).toBe(false);
  });
});
