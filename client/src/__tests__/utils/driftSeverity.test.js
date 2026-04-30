import { describe, expect, it } from "vitest";
import {
  SEVERITY_ORDER,
  isAlertLevel,
  severityToBg,
  severityToColour,
  severityToLabel,
} from "../../utils/driftSeverity";

describe("severityToColour", () => {
  it("returns green for none", () => {
    expect(severityToColour("none")).toBe("#1A7F37");
  });
  it("returns red for high", () => {
    expect(severityToColour("high")).toBe("#CF222E");
  });
  it("returns dark red for critical", () => {
    expect(severityToColour("critical")).toBe("#82071E");
  });
  it("returns fallback for unknown", () => {
    expect(severityToColour("unknown")).toBe("#94A3B8");
  });
});

describe("severityToLabel", () => {
  it("returns No Drift for none", () => {
    expect(severityToLabel("none")).toBe("No Drift");
  });
  it("returns Critical for critical", () => {
    expect(severityToLabel("critical")).toBe("Critical");
  });
});

describe("isAlertLevel", () => {
  it("true for high", () => {
    expect(isAlertLevel("high")).toBe(true);
  });
  it("true for critical", () => {
    expect(isAlertLevel("critical")).toBe(true);
  });
  it("false for medium", () => {
    expect(isAlertLevel("medium")).toBe(false);
  });
  it("false for low", () => {
    expect(isAlertLevel("low")).toBe(false);
  });
  it("false for none", () => {
    expect(isAlertLevel("none")).toBe(false);
  });
});

describe("SEVERITY_ORDER", () => {
  it("none is lowest", () => {
    expect(SEVERITY_ORDER.none).toBe(0);
  });
  it("critical is highest", () => {
    expect(SEVERITY_ORDER.critical).toBe(4);
  });
  it("high > medium", () => {
    expect(SEVERITY_ORDER.high).toBeGreaterThan(SEVERITY_ORDER.medium);
  });
  it("has bg function", () => {
    expect(severityToBg("critical")).toContain("FF");
  });
});
