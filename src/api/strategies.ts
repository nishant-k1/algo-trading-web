import { apiGet, apiPatch, apiPost, apiDelete } from "./client";

export interface StrategyOption {
  key: string;
  name: string;
}

export interface StrategyConfigResponse {
  id: number;
  name: string;
  strategy_key: string;
  params: Record<string, unknown>;
  watchlist_id: number;
  is_active: boolean;
}

export interface StrategyConfigCreate {
  name: string;
  strategy_key: string;
  params?: Record<string, unknown>;
  watchlist_id: number;
}

export interface StrategyConfigUpdate {
  name?: string;
  params?: Record<string, unknown>;
  watchlist_id?: number;
  is_active?: boolean;
}

export interface SignalResponse {
  exchange: string;
  symbol: string;
  side: string;
  reason: string;
  score: number;
  meta: Record<string, unknown> | null;
}

export interface StrategyRunResponse {
  signals: SignalResponse[];
  symbols_scanned: number;
  symbols_filtered_by_gap: number;
}

export function getStrategies() {
  return apiGet<StrategyOption[]>("/api/strategies");
}

export function getConfigs() {
  return apiGet<StrategyConfigResponse[]>("/api/strategies/configs");
}

export function getActiveConfig() {
  return apiGet<StrategyConfigResponse | null>("/api/strategies/configs/active");
}

export function createConfig(body: StrategyConfigCreate) {
  return apiPost<StrategyConfigResponse>("/api/strategies/configs", body);
}

export function updateConfig(configId: number, body: StrategyConfigUpdate) {
  return apiPatch<StrategyConfigResponse>(`/api/strategies/configs/${configId}`, body);
}

export function deleteConfig(configId: number) {
  return apiDelete(`/api/strategies/configs/${configId}`);
}

export function runStrategy() {
  return apiPost<StrategyRunResponse>("/api/strategies/run");
}
