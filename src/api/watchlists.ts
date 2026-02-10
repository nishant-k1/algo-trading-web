import { apiGet, apiPatch, apiPost, apiDelete } from "./client";

export interface WatchlistSymbolItem {
  exchange: string;
  symbol: string;
}

export interface WatchlistResponse {
  id: number;
  user_id: number;
  name: string;
  is_auto_for_screener: boolean;
  symbols: WatchlistSymbolItem[];
}

export interface WatchlistCreate {
  name: string;
}

export interface WatchlistUpdate {
  name?: string;
  is_auto_for_screener?: boolean;
}

export interface UniverseResponse {
  watchlist_id: number;
  symbols: WatchlistSymbolItem[];
}

export function listWatchlists() {
  return apiGet<WatchlistResponse[]>("/api/watchlists");
}

export function createWatchlist(body: WatchlistCreate) {
  return apiPost<WatchlistResponse>("/api/watchlists", body);
}

export function getWatchlist(id: number) {
  return apiGet<WatchlistResponse>(`/api/watchlists/${id}`);
}

export function updateWatchlist(id: number, body: WatchlistUpdate) {
  return apiPatch<WatchlistResponse>(`/api/watchlists/${id}`, body);
}

export function deleteWatchlist(id: number) {
  return apiDelete(`/api/watchlists/${id}`);
}

export function addSymbolToWatchlist(watchlistId: number, exchange: string, symbol: string) {
  return apiPost<{ status: string }>(`/api/watchlists/${watchlistId}/symbols`, { exchange, symbol });
}

export function removeSymbolFromWatchlist(watchlistId: number, exchange: string, symbol: string) {
  return apiDelete(
    `/api/watchlists/${watchlistId}/symbols?exchange=${encodeURIComponent(exchange)}&symbol=${encodeURIComponent(symbol)}`
  );
}

export function getWatchlistUniverse(watchlistId: number) {
  return apiGet<UniverseResponse>(`/api/watchlists/${watchlistId}/universe`);
}

export function getAutoUniverse() {
  return apiGet<UniverseResponse>("/api/watchlists/auto/universe");
}
