import { describe, expect, it } from "vitest";

import { toCsv } from "@/lib/utils/csv";
import { fromLocalInput, toLocalInput } from "@/lib/utils/dates";
import { formatPrice } from "@/lib/utils/format";
import { isValidDocId, slugify } from "@/lib/utils/slugs";

describe("slugify", () => {
  it("makes clean URL slugs", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
    expect(slugify("  Café   Menu  ")).toBe("cafe-menu");
  });

  it("falls back for empty input and trims long slugs without a trailing dash", () => {
    expect(slugify("???")).toBe("item");
    expect(slugify(null)).toBe("item");
    const long = slugify(`${"a".repeat(59)} b c`);
    expect(long.length).toBeLessThanOrEqual(60);
    expect(long.endsWith("-")).toBe(false);
  });
});

describe("isValidDocId", () => {
  it("accepts safe IDs and rejects path tricks", () => {
    expect(isValidDocId("abc_123-XYZ")).toBe(true);
    ["", "a/b", "../x", "a b", "a".repeat(101), null, undefined, 5].forEach(
      (value) => {
        expect(isValidDocId(value)).toBe(false);
      },
    );
  });
});

describe("toCsv", () => {
  const columns = [
    { key: "name", label: "Name" },
    { key: "note", label: "Note" },
  ];

  it("escapes quotes, commas and newlines", () => {
    const csv = toCsv(columns, [{ name: 'A "B"', note: "x,y\nz" }]);
    expect(csv).toBe('Name,Note\r\n"A ""B""","x,y\nz"');
  });

  it("neutralises spreadsheet formulas", () => {
    const csv = toCsv(columns, [
      { name: "=HYPERLINK(1)", note: "+1" },
      { name: "-2", note: "@x" },
    ]);
    expect(csv).toContain("'=HYPERLINK(1)");
    expect(csv).toContain("'+1");
    expect(csv).toContain("'-2");
    expect(csv).toContain("'@x");
  });

  it("handles missing values", () => {
    expect(toCsv(columns, [{ name: null }])).toBe("Name,Note\r\n,");
  });
});

describe("formatPrice", () => {
  it("shows a quote request when there is no price", () => {
    expect(formatPrice({ price: null })).toBe("Request a quote");
    expect(formatPrice({})).toBe("Request a quote");
  });

  it("formats starting and fixed prices", () => {
    expect(
      formatPrice({ price: 99, currency: "USD", isStartingPrice: true }),
    ).toBe("$99+");
    expect(
      formatPrice({ price: 99, currency: "USD", isStartingPrice: false }),
    ).toBe("$99");
  });
});

describe("datetime-local helpers", () => {
  it("round-trips and handles empty values", () => {
    const iso = "2026-03-10T09:30:00.000Z";
    expect(fromLocalInput(toLocalInput(iso))).toBe(iso);
    expect(toLocalInput(null)).toBe("");
    expect(fromLocalInput("")).toBeNull();
  });
});
