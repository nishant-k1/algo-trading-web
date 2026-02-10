import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";

vi.mock("../api/dashboard", () => ({
  getDashboardSummary: vi.fn().mockResolvedValue({
    paper_live: "paper",
    kill_switch: false,
    daily_realized_pnl: null,
    last_run: { run_at: "2025-01-15T10:00:00Z", signals_count: 2, symbols_scanned: 10, symbols_filtered_by_gap: 1 },
    positions: [],
    orders: [],
  }),
  getPnlHistory: vi.fn().mockResolvedValue([]),
}));

vi.mock("../api/settings", () => ({
  testConnection: vi.fn().mockResolvedValue({ connected: true, message: "OK", broker_id: "zerodha" }),
}));

describe("Dashboard", () => {
  it("matches snapshot when loaded", async () => {
    const { container } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    await screen.findByRole("heading", { name: /positions/i, level: 2 });
    expect(container).toMatchSnapshot();
  });
});
