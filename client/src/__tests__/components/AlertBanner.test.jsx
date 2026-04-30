import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AlertBanner from "../../components/AlertBanner/AlertBanner";

vi.mock("../../utils/api", () => ({
  api: vi.fn().mockResolvedValue({ success: true }),
}));

const MOCK_ALERT = {
  id: "a1",
  severity: "high",
  message: "HIGH drift detected in PAY_0, LIMIT_BAL",
  drift_score: 68.4,
  timestamp: new Date().toISOString(),
  resolved: false,
};

describe("AlertBanner", () => {
  it("renders alert message", () => {
    render(<AlertBanner alert={MOCK_ALERT} />);
    expect(screen.getByText(/HIGH drift detected/)).toBeInTheDocument();
  });

  it("shows severity label", () => {
    render(<AlertBanner alert={MOCK_ALERT} />);
    expect(screen.getByText("HIGH")).toBeInTheDocument();
  });

  it("shows drift score", () => {
    render(<AlertBanner alert={MOCK_ALERT} />);
    expect(screen.getByText(/68.4/)).toBeInTheDocument();
  });

  it("shows resolve button for unresolved alert", () => {
    render(<AlertBanner alert={MOCK_ALERT} />);
    expect(screen.getByText("Resolve")).toBeInTheDocument();
  });

  it("does not show resolve button for resolved alert", () => {
    render(<AlertBanner alert={{ ...MOCK_ALERT, resolved: true }} />);
    expect(screen.queryByText("Resolve")).not.toBeInTheDocument();
  });

  it("calls onResolved callback after resolving", async () => {
    const handler = vi.fn();
    render(<AlertBanner alert={MOCK_ALERT} onResolved={handler} />);
    fireEvent.click(screen.getByText("Resolve"));
    await waitFor(() => expect(handler).toHaveBeenCalledWith("a1"));
  });

  it("renders as alert role", () => {
    render(<AlertBanner alert={MOCK_ALERT} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
