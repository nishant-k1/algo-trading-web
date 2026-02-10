import { useEffect, useState } from "react";
import {
  getStrategies,
  getConfigs,
  createConfig,
  updateConfig,
  deleteConfig,
  runStrategy,
  type StrategyOption,
  type StrategyConfigResponse,
  type StrategyRunResponse,
} from "../api/strategies";
import { listWatchlists } from "../api/watchlists";
import { CustomSelect } from "../components/ui/CustomSelect";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function Strategies() {
  const [strategies, setStrategies] = useState<StrategyOption[]>([]);
  const [configs, setConfigs] = useState<StrategyConfigResponse[]>([]);
  const [watchlists, setWatchlists] = useState<{ id: number; name: string }[]>([]);
  const [runResult, setRunResult] = useState<StrategyRunResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createName, setCreateName] = useState("");
  const [createStrategyKey, setCreateStrategyKey] = useState("");
  const [createWatchlistId, setCreateWatchlistId] = useState<number | "">("");

  const load = () => {
    setError(null);
    Promise.all([getStrategies(), getConfigs(), listWatchlists()])
      .then(([s, c, w]) => {
        setStrategies(s);
        setConfigs(c);
        setWatchlists(w.map((x) => ({ id: x.id, name: x.name })));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSetActive = (configId: number) => {
    setError(null);
    updateConfig(configId, { is_active: true })
      .then(() => load())
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to set active"));
  };

  const handleCreate = () => {
    if (!createName.trim() || !createStrategyKey || createWatchlistId === "") {
      setError("Name, strategy and watchlist required");
      return;
    }
    setError(null);
    createConfig({
      name: createName.trim(),
      strategy_key: createStrategyKey,
      watchlist_id: createWatchlistId as number,
    })
      .then(() => {
        setCreateName("");
        setCreateStrategyKey("");
        setCreateWatchlistId("");
        load();
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to create"));
  };

  const handleDelete = (configId: number) => {
    if (!confirm("Delete this strategy config?")) return;
    setError(null);
    deleteConfig(configId)
      .then(() => load())
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to delete"));
  };

  const handleRun = () => {
    const active = configs.find((c) => c.is_active);
    if (!active) {
      setError("Set an active config first.");
      return;
    }
    setError(null);
    setRunning(true);
    setRunResult(null);
    runStrategy()
      .then(setRunResult)
      .catch((e) => setError(e instanceof Error ? e.message : "Run failed"))
      .finally(() => setRunning(false));
  };

  if (loading) {
    return <LoadingSpinner label="Loading strategies" />;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-terminal-fg mt-0 mb-2">Strategies</h1>
      {error && <p className="text-loss text-sm mb-4">{error}</p>}

      <section className="rounded-lg border border-terminal-border bg-terminal-panel p-4 mb-6">
        <h2 className="text-sm font-semibold text-terminal-fg mb-2">Create config</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            placeholder="Config name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            className="px-3 py-2 rounded border border-terminal-border bg-terminal-surface text-terminal-fg placeholder-terminal-muted w-40 text-sm focus:outline-none focus:ring-2 focus:ring-groww/50"
          />
          <CustomSelect
            options={strategies.map((s) => ({ value: s.key, label: s.name }))}
            value={createStrategyKey}
            onChange={(v) => setCreateStrategyKey(v === "" ? "" : String(v))}
            placeholder="— Strategy —"
            aria-label="Strategy"
            className="min-w-[180px]"
          />
          <CustomSelect
            options={watchlists.map((w) => ({ value: w.id, label: w.name }))}
            value={createWatchlistId}
            onChange={(v) => setCreateWatchlistId(v === "" ? "" : Number(v))}
            placeholder="— Watchlist —"
            aria-label="Watchlist"
            className="min-w-[140px]"
          />
          <button
            type="button"
            onClick={handleCreate}
            className="px-3 py-2 rounded text-sm font-medium bg-groww text-terminal-bg hover:bg-groww-hover transition-colors"
          >
            Create
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-terminal-border bg-terminal-panel p-4 mb-6">
        <h2 className="text-sm font-semibold text-terminal-fg mb-2">Your configs</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-terminal-border bg-terminal-surface">
                <th className="text-left py-2 px-3 text-terminal-muted font-medium">Name</th>
                <th className="text-left py-2 px-3 text-terminal-muted font-medium">Strategy</th>
                <th className="text-left py-2 px-3 text-terminal-muted font-medium">Watchlist</th>
                <th className="text-left py-2 px-3 text-terminal-muted font-medium">Active</th>
                <th className="text-left py-2 px-3 text-terminal-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {configs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-3 px-3 text-terminal-muted text-sm">
                    No configs. Create one above.
                  </td>
                </tr>
              ) : (
                configs.map((c) => (
                  <tr key={c.id} className="border-b border-terminal-border/50">
                    <td className="py-2 px-3 text-terminal-fg">{c.name}</td>
                    <td className="py-2 px-3 text-terminal-fg">{c.strategy_key}</td>
                    <td className="py-2 px-3 text-terminal-muted">#{c.watchlist_id}</td>
                    <td className="py-2 px-3 text-terminal-fg">{c.is_active ? "Yes" : "—"}</td>
                    <td className="py-2 px-3">
                      {!c.is_active && (
                        <button
                          type="button"
                          onClick={() => handleSetActive(c.id)}
                          className="mr-2 px-2 py-1 rounded text-xs font-medium bg-groww text-terminal-bg hover:bg-groww-hover transition-colors"
                        >
                          Set active
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="px-2 py-1 rounded text-xs font-medium text-terminal-muted hover:text-loss hover:bg-loss/10 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-terminal-border bg-terminal-panel p-4">
        <h2 className="text-sm font-semibold text-terminal-fg mb-2">Run strategy</h2>
        <p className="text-terminal-muted text-sm mb-3">
          Runs the active config on its watchlist (daily candles, gap filter, then strategy).
        </p>
        <button
          type="button"
          onClick={handleRun}
          disabled={running || !configs.some((c) => c.is_active)}
          className="px-4 py-2 rounded font-medium bg-groww text-terminal-bg hover:bg-groww-hover disabled:opacity-50 transition-colors"
        >
          {running ? "Running…" : "Run"}
        </button>
        {runResult && (
          <div className="mt-4">
            <p className="text-terminal-fg text-sm mb-2">
              Signals: {runResult.signals.length} | Scanned: {runResult.symbols_scanned} |
              Filtered by gap: {runResult.symbols_filtered_by_gap}
            </p>
            {runResult.signals.length > 0 && (
              <div className="overflow-x-auto rounded border border-terminal-border mt-2">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-terminal-border bg-terminal-surface">
                      <th className="text-left py-2 px-3 text-terminal-muted font-medium">Symbol</th>
                      <th className="text-left py-2 px-3 text-terminal-muted font-medium">Side</th>
                      <th className="text-left py-2 px-3 text-terminal-muted font-medium">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="bg-terminal-panel">
                    {runResult.signals.map((s, i) => (
                      <tr key={i} className="border-b border-terminal-border/50">
                        <td className="py-2 px-3 text-terminal-fg">{s.symbol}</td>
                        <td className="py-2 px-3 text-profit">{s.side}</td>
                        <td className="py-2 px-3 text-terminal-muted text-xs">{s.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
