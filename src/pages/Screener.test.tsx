import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import * as screenerApi from "../api/screener";
import Screener from "./Screener";

vi.mock("../api/screener", () => ({
  getGainers: vi.fn(),
  getLosers: vi.fn(),
  getVolumeShockers: vi.fn(),
  getMostActive: vi.fn(),
  getDemandZones: vi.fn(),
  getSupplyZones: vi.fn(),
}));

describe("Screener", () => {
  it("shows error when scan API fails", async () => {
    vi.mocked(screenerApi.getGainers).mockRejectedValueOnce(new Error("Server error"));
    render(<Screener />);
    await userEvent.click(screen.getByRole("button", { name: /run scan/i }));
    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });

  it("shows table when scan succeeds", async () => {
    vi.mocked(screenerApi.getGainers).mockResolvedValueOnce({
      scan: "gainers",
      exchange: "NSE",
      rows: [{ exchange: "NSE", symbol: "REL", value: 2.5, extra: null }],
      message: null,
    });
    render(<Screener />);
    await userEvent.click(screen.getByRole("button", { name: /run scan/i }));
    await waitFor(() => {
      expect(screen.getByText("REL")).toBeInTheDocument();
    });
  });
});
