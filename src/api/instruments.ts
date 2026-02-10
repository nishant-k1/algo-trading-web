import { apiGet } from "./client";

export interface InstrumentSuggestion {
  symbol: string;
  exchange: string;
}

export async function suggestInstruments(
  q: string,
  exchange = "NSE",
  limit = 20
): Promise<InstrumentSuggestion[]> {
  if (!q.trim()) return [];
  const params = new URLSearchParams({ q: q.trim(), exchange, limit: String(limit) });
  return apiGet<InstrumentSuggestion[]>(`/api/instruments/suggest?${params}`);
}
