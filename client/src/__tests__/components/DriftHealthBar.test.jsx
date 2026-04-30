import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DriftHealthBar from "../../components/DriftHealthBar/DriftHealthBar";

describe("DriftHealthBar", () => {
  it("renders feature name", () => {
    render(<DriftHealthBar feature="PAY_0" ks_statistic={0.3} psi={0.15} severity="medium" mean_shift_pct={15} />);
    expect(screen.getByText("PAY_0")).toBeInTheDocument();
  });

  it("shows PSI and KS values", () => {
    render(<DriftHealthBar feature="AGE" ks_statistic={0.25} psi={0.18} severity="medium" mean_shift_pct={-10} />);
    expect(screen.getByText(/PSI: 0.180/)).toBeInTheDocument();
    expect(screen.getByText(/KS: 0.250/)).toBeInTheDocument();
  });

  it("shows alert dot for high severity", () => {
    render(<DriftHealthBar feature="LIMIT_BAL" ks_statistic={0.6} psi={0.35} severity="high" mean_shift_pct={40} />);
    expect(screen.getByLabelText("Alert")).toBeInTheDocument();
  });

  it("does not show alert dot for none severity", () => {
    render(<DriftHealthBar feature="SEX" ks_statistic={0.05} psi={0.02} severity="none" mean_shift_pct={1} />);
    expect(screen.queryByLabelText("Alert")).not.toBeInTheDocument();
  });

  it("shows mean shift direction", () => {
    render(<DriftHealthBar feature="AGE" ks_statistic={0.1} psi={0.08} severity="low" mean_shift_pct={25} />);
    expect(screen.getByText(/↑25.0%/)).toBeInTheDocument();
  });

  it("has correct ARIA attributes on bar", () => {
    render(<DriftHealthBar feature="BILL_AMT1" ks_statistic={0.4} psi={0.3} severity="critical" mean_shift_pct={60} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow");
  });
});
