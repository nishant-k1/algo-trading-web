import { apiGet } from "./client";

export interface DashboardLastRun {
  run_at: string;
  signals_count: number;
  symbols_scanned: number;
  symbols_filtered_by_gap: number;
}

export interface DashboardPosition {
  symbol: string;
  exchange: string;
  side: string;
  quantity: number;
  average_price: number;
  product: string;
  paper_live: string;
}

export interface DashboardOrder {
  id: number;
  client_order_id: string;
  broker_order_id: string | null;
  symbol: string;
  exchange: string;
  side: string;
  quantity: number;
  product: string;
  order_type: string;
  status: string;
  paper_live: string;
  filled_quantity: number;
  average_price: number | null;
  created_at: string | null;
}

export interface DashboardSummary {
  paper_live: string;
  kill_switch: boolean;
  positions: DashboardPosition[];
  orders: DashboardOrder[];
  daily_realized_pnl: number | null;
  last_run: DashboardLastRun | null;
}

export interface PnlHistoryEntry {
  date: string;
  realized_pnl: number;
}

export function getDashboardSummary() {
  return apiGet<DashboardSummary>("/api/dashboard");
}

export function getPnlHistory(days: number = 7) {
  return apiGet<PnlHistoryEntry[]>(`/api/dashboard/pnl-history?days=${days}`);
}
