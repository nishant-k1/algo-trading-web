import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getDashboardSummary,
  getPnlHistory,
  type DashboardSummary,
  type PnlHistoryEntry,
} from "../api/dashboard";
import { runStrategy } from "../api/strategies";
import { testConnection } from "../api/settings";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [pnlHistory, setPnlHistory] = useState<PnlHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);
  const [runningStrategy, setRunningStrategy] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    getDashboardSummary()
      .then(setSummary)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
    getPnlHistory(7)
      .then(setPnlHistory)
      .catch(() => setPnlHistory([]));
  };

  useEffect(() => {
    load();
  }, []);

  const handleTestConnection = () => {
    setConnectionMessage(null);
    testConnection()
      .then((r) =>
        setConnectionMessage(
          r.connected ? `Connected: ${r.message}` : `Failed: ${r.message}`
        )
      )
      .catch((e) =>
        setConnectionMessage(e instanceof Error ? e.message : "Test failed")
      );
  };

  const formatTime = (s: string | null) => {
    if (!s) return "—";
    try {
      const d = new Date(s);
      return d.toLocaleString();
    } catch {
      return s;
    }
  };

  if (loading || !summary) {
    return <LoadingSpinner label="Loading dashboard" />;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-terminal-fg mt-0 mb-2">Dashboard</h1>
      {error && <p className="text-loss text-sm mb-4">{error}</p>}

      <section className="flex flex-wrap gap-3 mb-6">
        <div className="min-w-[140px] rounded-lg border border-terminal-border bg-terminal-panel p-4">
          <div className="text-terminal-muted text-xs uppercase tracking-wide mb-1">Mode</div>
          <div className="font-semibold text-terminal-fg">
            {summary.paper_live === "paper" ? "Paper" : "Live"}
          </div>
        </div>
        <div className="min-w-[140px] rounded-lg border border-terminal-border bg-terminal-panel p-4">
          <div className="text-terminal-muted text-xs uppercase tracking-wide mb-1">Kill switch</div>
          <div
            className={`font-semibold ${summary.kill_switch ? "text-loss" : "text-profit"}`}
          >
            {summary.kill_switch ? "ON" : "OFF"}
          </div>
        </div>
        {summary.daily_realized_pnl != null && (
          <div className="min-w-[160px] rounded-lg border border-terminal-border bg-terminal-panel p-4">
            <div className="text-terminal-muted text-xs uppercase tracking-wide mb-1">
              Today’s realized P&L
            </div>
            <div
              className={
                summary.daily_realized_pnl >= 0 ? "font-semibold text-profit" : "font-semibold text-loss"
              }
            >
              ₹{summary.daily_realized_pnl.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          </div>
        )}
        <div className="rounded-lg border border-terminal-border bg-terminal-panel p-4">
          <button
            type="button"
            onClick={handleTestConnection}
            className="px-3 py-1.5 rounded text-sm font-medium bg-terminal-surface border border-terminal-border text-terminal-fg hover:bg-terminal-border hover:text-groww transition-colors"
          >
            Test connection
          </button>
          {connectionMessage && (
            <p className="mt-2 text-terminal-muted text-xs">{connectionMessage}</p>
          )}
        </div>
        <div className="rounded-lg border border-terminal-border bg-terminal-panel p-4 self-start">
          <button
            type="button"
            onClick={load}
            className="px-3 py-1.5 rounded text-sm font-medium bg-terminal-surface border border-terminal-border text-terminal-fg hover:bg-terminal-border hover:text-groww transition-colors"
          >
            Refresh
          </button>
        </div>
        <div className="rounded-lg border border-terminal-border bg-terminal-panel p-4 self-start">
          <Link to="/strategies" className="font-semibold text-groww hover:text-groww-hover">
            Strategies →
          </Link>
          <p className="mt-1 text-terminal-muted text-xs">Run scans, view signals</p>
        </div>
        {summary.last_run && (
          <div className="min-w-[200px] rounded-lg border border-terminal-border bg-terminal-panel p-4">
            <div className="text-terminal-muted text-xs uppercase tracking-wide mb-1">
              Last strategy run
            </div>
            <div className="font-semibold text-terminal-fg">{summary.last_run.signals_count} signals</div>
            <div className="text-terminal-muted text-xs mt-1">
              {formatTime(summary.last_run.run_at)}
            </div>
            <div className="text-terminal-muted text-xs mt-0.5">
              Scanned: {summary.last_run.symbols_scanned} · Gap filtered:{" "}
              {summary.last_run.symbols_filtered_by_gap}
            </div>
            <button
              type="button"
              onClick={() => {
                setRunningStrategy(true);
                runStrategy()
                  .then(load)
                  .catch(() => {})
                  .finally(() => setRunningStrategy(false));
              }}
              disabled={runningStrategy}
              className="mt-2 px-2.5 py-1 rounded text-xs font-medium bg-groww text-terminal-bg hover:bg-groww-hover disabled:opacity-60 transition-colors"
            >
              {runningStrategy ? "Running…" : "Run again"}
            </button>
          </div>
        )}
      </section>

      {pnlHistory.length > 0 && (
        <section className="rounded-lg border border-terminal-border bg-terminal-panel p-4 mb-6">
          <h2 className="text-sm font-semibold text-terminal-fg mb-2">
            Realized P&L (last 7 days)
          </h2>
          <div className="flex items-end gap-1 h-20 mt-2">
            {pnlHistory.map((e) => {
              const maxAbs = Math.max(
                1,
                ...pnlHistory.map((x) => Math.abs(x.realized_pnl))
              );
              const h = Math.max(4, (Math.abs(e.realized_pnl) / maxAbs) * 60);
              const isNeg = e.realized_pnl < 0;
              return (
                <div
                  key={e.date}
                  className="flex-1 flex flex-col items-center min-w-8"
                >
                  <div
                    className={`w-full max-w-6 rounded-t ${isNeg ? "bg-loss" : "bg-profit"}`}
                    style={{ height: h }}
                  />
                  <span className="text-terminal-muted text-[10px] mt-1">
                    {new Date(e.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="mb-6">
        <h2 className="text-sm font-semibold text-terminal-fg mb-2">Positions</h2>
        <div className="overflow-x-auto rounded-lg border border-terminal-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-terminal-border bg-terminal-surface">
                <th className="text-left py-2 px-3 text-terminal-muted font-medium">Symbol</th>
                <th className="text-left py-2 px-3 text-terminal-muted font-medium">Exchange</th>
                <th className="text-left py-2 px-3 text-terminal-muted font-medium">Side</th>
                <th className="text-left py-2 px-3 text-terminal-muted font-medium">Qty</th>
                <th className="text-left py-2 px-3 text-terminal-muted font-medium">Avg price</th>
                <th className="text-left py-2 px-3 text-terminal-muted font-medium">Product</th>
              </tr>
            </thead>
            <tbody className="bg-terminal-panel">
              {summary.positions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-3 px-3 text-terminal-muted text-sm">
                    No positions
                  </td>
                </tr>
              ) : (
                summary.positions.map((p) => (
                  <tr
                    key={`${p.symbol}-${p.exchange}-${p.side}`}
                    className="border-b border-terminal-border/50"
                  >
                    <td className="py-2 px-3 text-terminal-fg">{p.symbol}</td>
                    <td className="py-2 px-3 text-terminal-muted">{p.exchange}</td>
                    <td className="py-2 px-3 text-terminal-fg">{p.side}</td>
                    <td className="py-2 px-3 text-terminal-fg">{p.quantity}</td>
                    <td className="py-2 px-3 text-terminal-fg">
                      ₹{p.average_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-terminal-muted">{p.product}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-terminal-fg mb-2">Recent orders</h2>
        <div className="overflow-x-auto rounded-lg border border-terminal-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-terminal-border bg-terminal-surface">
                <th className="text-left py-2 px-3 text-terminal-muted font-medium">Time</th>
                <th className="text-left py-2 px-3 text-terminal-muted font-medium">Symbol</th>
                <th className="text-left py-2 px-3 text-terminal-muted font-medium">Side</th>
                <th className="text-left py-2 px-3 text-terminal-muted font-medium">Qty</th>
                <th className="text-left py-2 px-3 text-terminal-muted font-medium">Status</th>
                <th className="text-left py-2 px-3 text-terminal-muted font-medium">Avg price</th>
              </tr>
            </thead>
            <tbody className="bg-terminal-panel">
              {summary.orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-3 px-3 text-terminal-muted text-sm">
                    No orders
                  </td>
                </tr>
              ) : (
                summary.orders.map((o) => (
                  <tr
                    key={o.client_order_id || o.id}
                    className="border-b border-terminal-border/50"
                  >
                    <td className="py-2 px-3 text-terminal-muted text-xs">
                      {formatTime(o.created_at)}
                    </td>
                    <td className="py-2 px-3 text-terminal-fg">{o.symbol}</td>
                    <td className="py-2 px-3 text-terminal-fg">{o.side}</td>
                    <td className="py-2 px-3 text-terminal-fg">{o.quantity}</td>
                    <td className="py-2 px-3 text-terminal-fg">{o.status}</td>
                    <td className="py-2 px-3 text-terminal-fg">
                      {o.average_price != null
                        ? `₹${o.average_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
