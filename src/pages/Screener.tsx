import { useState } from "react";
import { Link } from "react-router-dom";
import {
  getGainers,
  getLosers,
  getVolumeShockers,
  getMostActive,
  getDemandZones,
  getSupplyZones,
  type ScanResponse,
} from "../api/screener";

type TabId =
  | "gainers"
  | "losers"
  | "volume-shockers"
  | "most-active"
  | "demand-zones"
  | "supply-zones";

const TABS: { id: TabId; label: string; fetch: (p?: { exchange?: string; limit?: number }) => Promise<ScanResponse> }[] = [
  { id: "gainers", label: "Gainers", fetch: getGainers },
  { id: "losers", label: "Losers", fetch: getLosers },
  { id: "volume-shockers", label: "Volume shockers", fetch: getVolumeShockers },
  { id: "most-active", label: "Most active", fetch: getMostActive },
  { id: "demand-zones", label: "Demand zones", fetch: getDemandZones },
  { id: "supply-zones", label: "Supply zones", fetch: getSupplyZones },
];

export default function Screener() {
  const [activeTab, setActiveTab] = useState<TabId>("gainers");
  const [data, setData] = useState<ScanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runScan = () => {
    const tab = TABS.find((t) => t.id === activeTab);
    if (!tab) return;
    setLoading(true);
    setError(null);
    tab
      .fetch({ exchange: "NSE", limit: 20 })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Scan failed"))
      .finally(() => setLoading(false));
  };

  const valueLabel =
    activeTab === "gainers" || activeTab === "losers"
      ? "% change"
      : activeTab === "volume-shockers"
        ? "Vol ratio"
        : activeTab === "most-active"
          ? "Volume"
          : "Level";

  return (
    <div>
      <h1 className="text-xl font-semibold text-terminal-fg mt-0 mb-1">Screener</h1>
      <p className="text-terminal-muted text-sm mb-4">
        Run scans on the default NSE universe. Configure broker in Settings for live data.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              activeTab === t.id
                ? "bg-groww text-terminal-bg"
                : "bg-terminal-panel border border-terminal-border text-terminal-fg hover:border-groww/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={runScan}
        disabled={loading}
        className="px-4 py-2 rounded font-medium bg-groww text-terminal-bg hover:bg-groww-hover disabled:opacity-60 transition-colors mb-4"
      >
        {loading ? "Running…" : "Run scan"}
      </button>

      {error && <p className="text-loss text-sm mb-4">{error}</p>}
      {data?.message && data.rows.length === 0 && (
        <p className="text-terminal-muted text-sm mb-4">
          {data.message}
          {data.message.toLowerCase().includes("broker") && (
            <> — <Link to="/settings" className="text-groww hover:underline">Connect broker in Settings</Link></>
          )}
        </p>
      )}

      {data && data.rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-terminal-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-terminal-border bg-terminal-surface">
                <th className="text-left py-2 px-3 text-terminal-muted font-medium">Symbol</th>
                <th className="text-left py-2 px-3 text-terminal-muted font-medium">{valueLabel}</th>
                {data.rows[0]?.extra && (
                  <th className="text-left py-2 px-3 text-terminal-muted font-medium">Extra</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-terminal-panel">
              {data.rows.map((r) => (
                <tr key={r.symbol} className="border-b border-terminal-border/50">
                  <td className="py-2 px-3 text-terminal-fg">{r.symbol}</td>
                  <td className="py-2 px-3 text-terminal-fg">{r.value}</td>
                  {r.extra && (
                    <td className="py-2 px-3 text-terminal-muted text-xs">
                      {Object.entries(r.extra)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
