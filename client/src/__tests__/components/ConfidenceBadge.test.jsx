import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ConfidenceBadge from "../../components/ConfidenceBadge/ConfidenceBadge";

describe("ConfidenceBadge", () => {
  it("renders high confidence", () => {
    render(<ConfidenceBadge confidence="high" probability={0.82} />);
    expect(screen.getByText(/high/i)).toBeInTheDocument();
    expect(screen.getByText(/82/)).toBeInTheDocument();
  });

  it("renders medium confidence", () => {
    render(<ConfidenceBadge confidence="medium" probability={0.63} />);
    expect(screen.getByText(/medium/i)).toBeInTheDocument();
  });

  it("renders low confidence", () => {
    render(<ConfidenceBadge confidence="low" probability={0.51} />);
    expect(screen.getByText(/low/i)).toBeInTheDocument();
  });

  it("handles null probability gracefully", () => {
    expect(() => render(<ConfidenceBadge confidence="high" probability={null} />)).not.toThrow();
  });
});
