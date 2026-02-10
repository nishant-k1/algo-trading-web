import { apiGet } from "./client";

export interface ScanRow {
  exchange: string;
  symbol: string;
  value: number;
  extra: Record<string, number | string> | null;
}

export interface ScanResponse {
  scan: string;
  exchange: string;
  rows: ScanRow[];
  message: string | null;
}

const queryString = (params: { exchange?: string; limit?: number; symbols?: string }) => {
  const sp = new URLSearchParams();
  if (params.exchange) sp.set("exchange", params.exchange);
  if (params.limit != null) sp.set("limit", String(params.limit));
  if (params.symbols) sp.set("symbols", params.symbols);
  const q = sp.toString();
  return q ? `?${q}` : "";
};

export function getGainers(params?: { exchange?: string; limit?: number; symbols?: string }) {
  return apiGet<ScanResponse>(`/api/screener/gainers${queryString(params || {})}`);
}

export function getLosers(params?: { exchange?: string; limit?: number; symbols?: string }) {
  return apiGet<ScanResponse>(`/api/screener/losers${queryString(params || {})}`);
}

export function getVolumeShockers(params?: { exchange?: string; limit?: number; symbols?: string }) {
  return apiGet<ScanResponse>(`/api/screener/volume-shockers${queryString(params || {})}`);
}

export function getMostActive(params?: { exchange?: string; limit?: number; symbols?: string }) {
  return apiGet<ScanResponse>(`/api/screener/most-active${queryString(params || {})}`);
}

export function getDemandZones(params?: { exchange?: string; limit?: number; symbols?: string }) {
  return apiGet<ScanResponse>(`/api/screener/demand-zones${queryString(params || {})}`);
}

export function getSupplyZones(params?: { exchange?: string; limit?: number; symbols?: string }) {
  return apiGet<ScanResponse>(`/api/screener/supply-zones${queryString(params || {})}`);
}
