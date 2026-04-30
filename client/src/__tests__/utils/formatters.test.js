import { describe, expect, it } from "vitest";
import { formatNumber, formatProbability, formatPSI, formatSHAP, truncate } from "../../utils/formatters";

describe("formatProbability", () => {
  it("formats 0.82 as 82.0%", () => {
    expect(formatProbability(0.82)).toBe("82.0%");
  });
  it("formats 0 as 0.0%", () => {
    expect(formatProbability(0)).toBe("0.0%");
  });
  it("formats 1 as 100.0%", () => {
    expect(formatProbability(1)).toBe("100.0%");
  });
  it("returns dash for null", () => {
    expect(formatProbability(null)).toBe("—");
  });
  it("returns dash for undefined", () => {
    expect(formatProbability(undefined)).toBe("—");
  });
});

describe("formatSHAP", () => {
  it("adds + for positive values", () => {
    expect(formatSHAP(0.1234)).toBe("+0.1234");
  });
  it("no + for negative values", () => {
    expect(formatSHAP(-0.1234)).toBe("-0.1234");
  });
  it("4 decimal places", () => {
    expect(formatSHAP(0.1)).toBe("+0.1000");
  });
  it("returns dash for null", () => {
    expect(formatSHAP(null)).toBe("—");
  });
});

describe("formatPSI", () => {
  it("stable for low PSI", () => {
    expect(formatPSI(0.05)).toContain("stable");
  });
  it("caution for moderate PSI", () => {
    expect(formatPSI(0.15)).toContain("caution");
  });
  it("alert for high PSI", () => {
    expect(formatPSI(0.3)).toContain("alert");
  });
  it("dash for null", () => {
    expect(formatPSI(null)).toBe("—");
  });
});

describe("truncate", () => {
  it("truncates long strings", () => {
    const result = truncate("a".repeat(30), 20);
    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(23);
  });
  it("returns short strings unchanged", () => {
    expect(truncate("short", 20)).toBe("short");
  });
  it("handles null", () => {
    expect(truncate(null)).toBe("");
  });
});

describe("formatNumber", () => {
  it("formats with locale separators", () => {
    expect(formatNumber(1000000)).toBe("1,000,000");
  });
  it("dash for null", () => {
    expect(formatNumber(null)).toBe("—");
  });
  it("respects decimals param", () => {
    expect(formatNumber(3.14159, 2)).toBe("3.14");
  });
});
