import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Settings from "./Settings";

vi.mock("../api/settings", () => ({
  getSettings: vi.fn().mockResolvedValue({
    active_broker_id: "zerodha",
    paper_live: "paper",
    active_trading_mode_id: null,
    brokers_available: ["zerodha", "groww"],
    kill_switch: false,
    max_position_value: null,
    max_orders_per_day: null,
    daily_loss_limit_pct: null,
  }),
  getTradingModes: vi.fn().mockResolvedValue([
    { id: 1, name: "MIS", product: "MIS", segment: "EQ", exchange: "NSE" },
    { id: 2, name: "CNC", product: "CNC", segment: "EQ", exchange: "NSE" },
  ]),
  testConnection: vi.fn(),
  updateSettings: vi.fn(),
}));

describe("Settings", () => {
  it("matches snapshot when loaded", async () => {
    const { container } = render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );
    await screen.findByText(/paper \/ live/i);
    expect(container).toMatchSnapshot();
  });
});
