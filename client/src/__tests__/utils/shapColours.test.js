import { describe, expect, it } from "vitest";
import { shapDirectionBg, shapDirectionColour, shapValueToWidth } from "../../utils/shapColours";

describe("shapDirectionColour", () => {
  it("orange for positive", () => {
    expect(shapDirectionColour("positive")).toBe("#F97316");
  });
  it("indigo for negative", () => {
    expect(shapDirectionColour("negative")).toBe("#6366F1");
  });
  it("grey for neutral", () => {
    expect(shapDirectionColour("neutral")).toBe("#94A3B8");
  });
  it("grey for unknown direction", () => {
    expect(shapDirectionColour("unknown")).toBe("#94A3B8");
  });
});

describe("shapDirectionBg", () => {
  it("correct positive bg", () => {
    expect(shapDirectionBg("positive")).toBe("#FFF7ED");
  });
});

describe("shapValueToWidth", () => {
  it("returns max width for max value", () => {
    expect(shapValueToWidth(0.5, 0.5, 200)).toBe(200);
  });
  it("returns proportional width", () => {
    expect(shapValueToWidth(0.25, 0.5, 200)).toBe(100);
  });
  it("returns minimum 2px for tiny values", () => {
    expect(shapValueToWidth(0.0001, 1.0, 200)).toBeGreaterThanOrEqual(2);
  });
  it("returns 0 for zero maxAbs", () => {
    expect(shapValueToWidth(0.5, 0, 200)).toBe(0);
  });
  it("works for negative shap values (uses abs)", () => {
    expect(shapValueToWidth(-0.3, 0.3, 200)).toBe(200);
  });
});
