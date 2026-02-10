import { useEffect, useState } from "react";
import { listOrders, cancelOrderPaper, cancelOrderLive, type OrderRow } from "../api/orders";
import LoadingSpinner from "../components/ui/LoadingSpinner";

function formatTime(s: string | null) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s;
  }
}

export default function Orders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [cancelling, setCancelling] = useState<string | number | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    listOrders()
      .then(setOrders)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = (o: OrderRow) => {
    const key = o.paper_live === "paper" ? o.id : o.broker_order_id;
    if (!key) return;
    if (o.status !== "PENDING" && o.status !== "OPEN" && o.status !== "TRIGGER PENDING") return;
    setCancelling(key);
    const promise =
      o.paper_live === "paper"
        ? cancelOrderPaper(o.id)
        : cancelOrderLive(o.broker_order_id!);
    promise
      .then(load)
      .catch((e) => setError(e instanceof Error ? e.message : "Cancel failed"))
      .finally(() => setCancelling(null));
  };

  const filtered =
    statusFilter === ""
      ? orders
      : orders.filter((o) => o.status.toLowerCase().includes(statusFilter.toLowerCase()));

  if (loading) {
    return <LoadingSpinner label="Loading orders" />;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-terminal-fg mt-0 mb-2">Orders</h1>
      {error && <p className="text-loss text-sm mb-4">{error}</p>}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <label className="text-terminal-muted text-sm">
          Filter by status:{" "}
          <input
            type="text"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="e.g. COMPLETE, PENDING"
            className="ml-1 px-2 py-1.5 rounded border border-terminal-border bg-terminal-panel text-terminal-fg w-36 text-sm focus:outline-none focus:ring-2 focus:ring-groww/50"
          />
        </label>
        <button
          type="button"
          onClick={load}
          className="px-3 py-1.5 rounded text-sm font-medium bg-terminal-surface border border-terminal-border text-terminal-fg hover:bg-terminal-border hover:text-groww transition-colors"
        >
          Refresh
        </button>
      </div>
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
              <th className="text-left py-2 px-3 text-terminal-muted font-medium">Mode</th>
              <th className="text-left py-2 px-3 text-terminal-muted font-medium"></th>
            </tr>
          </thead>
          <tbody className="bg-terminal-panel">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-3 px-3 text-terminal-muted text-sm">
                  No orders
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr
                  key={`${o.id}-${o.client_order_id}-${o.broker_order_id || ""}`}
                  className="border-b border-terminal-border/50"
                >
                  <td className="py-2 px-3 text-terminal-muted text-xs">{formatTime(o.created_at)}</td>
                  <td className="py-2 px-3 text-terminal-fg">{o.symbol}</td>
                  <td className="py-2 px-3 text-terminal-fg">{o.side}</td>
                  <td className="py-2 px-3 text-terminal-fg">{o.quantity}</td>
                  <td className="py-2 px-3 text-terminal-fg">{o.status}</td>
                  <td className="py-2 px-3 text-terminal-fg">
                    {o.average_price != null
                      ? `₹${o.average_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                      : "—"}
                  </td>
                  <td className="py-2 px-3 text-terminal-muted">{o.paper_live}</td>
                  <td className="py-2 px-3">
                    {["PENDING", "OPEN", "TRIGGER PENDING"].includes(o.status) && (
                      <button
                        type="button"
                        onClick={() => handleCancel(o)}
                        disabled={cancelling !== null}
                        className="px-2 py-1 rounded text-xs font-medium text-loss hover:bg-loss/10 disabled:opacity-50 transition-colors"
                      >
                        {cancelling === (o.paper_live === "paper" ? o.id : o.broker_order_id)
                          ? "…"
                          : "Cancel"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
