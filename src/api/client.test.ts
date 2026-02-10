import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiDelete, apiGet, apiPatch, apiPost } from "./client";

describe("api client", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    localStorage.clear();
  });

  it("apiGet sends GET with auth header when token exists", async () => {
    localStorage.setItem("access_token", "fake-token");
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: 1 }),
    });
    const result = await apiGet("/api/health");
    expect(result).toEqual({ data: 1 });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/health"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer fake-token" }),
      })
    );
  });

  it("apiGet throws on non-ok response", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      statusText: "Forbidden",
      json: () => Promise.resolve({ detail: "Forbidden" }),
    });
    await expect(apiGet("/api/settings")).rejects.toThrow("Forbidden");
  });

  it("apiPost sends POST with JSON body", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    });
    const result = await apiPost("/api/watchlists", { name: "My List" });
    expect(result).toEqual({ id: 1 });
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "My List" }),
      })
    );
  });

  it("apiPatch sends PATCH with body", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ updated: true }),
    });
    await apiPatch("/api/settings", { paper_live: "paper" });
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ paper_live: "paper" }),
      })
    );
  });

  it("apiDelete sends DELETE and returns void on success", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true });
    await expect(apiDelete("/api/watchlists/1")).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/watchlists/1"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("apiGet throws with server message on 500", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      statusText: "Internal Server Error",
      json: () => Promise.resolve({ detail: "Internal server error" }),
    });
    await expect(apiGet("/api/settings")).rejects.toThrow("Internal server error");
  });

  it("apiGet throws on network failure", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));
    await expect(apiGet("/api/health")).rejects.toThrow("Network error");
  });

  it("apiGet uses statusText when error response is not JSON", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      statusText: "Gateway Timeout",
      json: () => Promise.reject(new Error("Invalid JSON")),
    });
    await expect(apiGet("/api/settings")).rejects.toThrow("Gateway Timeout");
  });
});
