import { apiGet, apiPatch, apiPost } from "./client";

export interface TradingModeOption {
  id: number;
  name: string;
  segment: string;
  product: string;
  exchange: string;
}

export interface SettingsResponse {
  active_broker_id: string;
  paper_live: string;
  brokers_available: string[];
  active_trading_mode_id: number | null;
  kill_switch: boolean;
  max_position_value: number | null;
  max_orders_per_day: number | null;
  daily_loss_limit_pct: number | null;
}

export interface SettingsUpdate {
  active_broker_id?: string;
  paper_live?: string;
  active_trading_mode_id?: number | null;
  kill_switch?: boolean;
  max_position_value?: number | null;
  max_orders_per_day?: number | null;
  daily_loss_limit_pct?: number | null;
  zerodha_access_token?: string | null;
  groww_access_token?: string | null;
}

export interface TestConnectionResponse {
  broker_id: string;
  connected: boolean;
  message: string;
}

export function getSettings() {
  return apiGet<SettingsResponse>("/api/settings");
}

export function updateSettings(body: SettingsUpdate) {
  return apiPatch<SettingsResponse>("/api/settings", body);
}

export function getTradingModes() {
  return apiGet<TradingModeOption[]>("/api/settings/trading-modes");
}

export function testConnection() {
  return apiPost<TestConnectionResponse>("/api/settings/test-connection");
}
