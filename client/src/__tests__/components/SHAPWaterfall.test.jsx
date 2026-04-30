import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SHAPWaterfall from "../../components/SHAPWaterfall/SHAPWaterfall";

const MOCK_CONTRIBUTIONS = [
  { feature: "PAY_0", value: 2, shap_value: 0.18, direction: "positive", abs_importance: 0.18 },
  { feature: "LIMIT_BAL", value: 20000, shap_value: -0.12, direction: "negative", abs_importance: 0.12 },
  { feature: "AGE", value: 35, shap_value: 0.04, direction: "positive", abs_importance: 0.04 },
  { feature: "EDUCATION", value: 3, shap_value: 0.002, direction: "neutral", abs_importance: 0.002 },
];

describe("SHAPWaterfall", () => {
  it("renders without crashing", () => {
    render(<SHAPWaterfall contributions={MOCK_CONTRIBUTIONS} baseValue={0.22} />);
    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  it("renders the title", () => {
    render(<SHAPWaterfall contributions={MOCK_CONTRIBUTIONS} baseValue={0.22} />);
    expect(screen.getByText("Why this prediction?")).toBeInTheDocument();
  });

  it("renders null for empty contributions", () => {
    const { container } = render(<SHAPWaterfall contributions={[]} baseValue={0.22} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders null for null contributions", () => {
    const { container } = render(<SHAPWaterfall contributions={null} baseValue={0.22} />);
    expect(container.firstChild).toBeNull();
  });

  it("has accessible role", () => {
    render(<SHAPWaterfall contributions={MOCK_CONTRIBUTIONS} baseValue={0.22} />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("shows base value in chart", () => {
    render(<SHAPWaterfall contributions={MOCK_CONTRIBUTIONS} baseValue={0.22} />);
    expect(screen.getByText(/base: 0.220/)).toBeInTheDocument();
  });
});
