import { useEffect, useState } from "react";
import {
  getSettings,
  updateSettings,
  getTradingModes,
  testConnection,
  type SettingsResponse,
  type TestConnectionResponse,
  type TradingModeOption,
} from "../api/settings";
import { ChoicePills } from "../components/ui/ChoicePills";
import { CustomSelect } from "../components/ui/CustomSelect";

export default function Settings() {
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [modes, setModes] = useState<TradingModeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<TestConnectionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [riskForm, setRiskForm] = useState({
    max_position_value: "",
    max_orders_per_day: "",
    daily_loss_limit_pct: "",
  });
  const [zerodhaToken, setZerodhaToken] = useState("");
  const [growwToken, setGrowwToken] = useState("");
  const [savingTokens, setSavingTokens] = useState(false);

  useEffect(() => {
    Promise.all([getSettings(), getTradingModes()])
      .then(([s, m]) => {
        setSettings(s);
        setModes(m);
        setRiskForm({
          max_position_value: s.max_position_value != null ? String(s.max_position_value) : "",
          max_orders_per_day: s.max_orders_per_day != null ? String(s.max_orders_per_day) : "",
          daily_loss_limit_pct: s.daily_loss_limit_pct != null ? String(s.daily_loss_limit_pct) : "",
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const handleBrokerChange = (active_broker_id: string) => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    updateSettings({ active_broker_id })
      .then(setSettings)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to update"))
      .finally(() => setSaving(false));
  };

  const handlePaperLiveChange = (paper_live: "paper" | "live") => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    updateSettings({ paper_live })
      .then(setSettings)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to update"))
      .finally(() => setSaving(false));
  };

  const handleTradingModeChange = (active_trading_mode_id: number | null) => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    updateSettings({ active_trading_mode_id })
      .then(setSettings)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to update"))
      .finally(() => setSaving(false));
  };

  const handleKillSwitch = () => {
    if (!settings) return;
    const next = !settings.kill_switch;
    if (next && !confirm("Turn ON kill switch? This will block new orders until you turn it off.")) return;
    setSaving(true);
    setError(null);
    updateSettings({ kill_switch: next })
      .then(setSettings)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to update"))
      .finally(() => setSaving(false));
  };

  const handleSaveRisk = () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    updateSettings({
      max_position_value: riskForm.max_position_value ? Number(riskForm.max_position_value) : null,
      max_orders_per_day: riskForm.max_orders_per_day ? Number(riskForm.max_orders_per_day) : null,
      daily_loss_limit_pct: riskForm.daily_loss_limit_pct ? Number(riskForm.daily_loss_limit_pct) : null,
    })
      .then((s) => {
        setSettings(s);
        setRiskForm({
          max_position_value: s.max_position_value != null ? String(s.max_position_value) : "",
          max_orders_per_day: s.max_orders_per_day != null ? String(s.max_orders_per_day) : "",
          daily_loss_limit_pct: s.daily_loss_limit_pct != null ? String(s.daily_loss_limit_pct) : "",
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to update"))
      .finally(() => setSaving(false));
  };

  const handleSaveTokens = () => {
    setSavingTokens(true);
    setError(null);
    const body: Parameters<typeof updateSettings>[0] = {};
    if (settings?.active_broker_id === "zerodha" && zerodhaToken) body.zerodha_access_token = zerodhaToken;
    if (settings?.active_broker_id === "groww" && growwToken) body.groww_access_token = growwToken;
    if (zerodhaToken) body.zerodha_access_token = zerodhaToken;
    if (growwToken) body.groww_access_token = growwToken;
    updateSettings(body)
      .then(() => {
        setZerodhaToken("");
        setGrowwToken("");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to save"))
      .finally(() => setSavingTokens(false));
  };

  const handleTestConnection = () => {
    setTestResult(null);
    setError(null);
    testConnection()
      .then(setTestResult)
      .catch((e) => setError(e instanceof Error ? e.message : "Test failed"));
  };

  if (loading || !settings) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-terminal-fg mt-0">Settings</h1>
        <p className="text-terminal-muted">Loading settings…</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-terminal-fg mt-0 mb-2">Settings</h1>
      {error && <p className="text-loss text-sm mb-4">{error}</p>}

      <section className="rounded-lg border border-terminal-border bg-terminal-panel p-4 mb-6">
        <h2 className="text-sm font-semibold text-terminal-fg mb-2">Broker</h2>
        <div className="flex flex-wrap items-center gap-3">
          <ChoicePills
            options={settings.brokers_available.map((b) => ({
              value: b,
              label: b === "zerodha" ? "Zerodha" : b === "groww" ? "Groww" : b,
            }))}
            value={settings.active_broker_id}
            onChange={handleBrokerChange}
            disabled={saving}
            aria-label="Select broker"
          />
          <button
            type="button"
            onClick={handleTestConnection}
            className="px-3 py-2 rounded text-sm font-medium bg-terminal-surface border border-terminal-border text-terminal-fg hover:bg-terminal-border hover:text-groww transition-colors"
          >
            Test connection
          </button>
        </div>
        {testResult && (
          <p className={`mt-2 text-sm ${testResult.connected ? "text-profit" : "text-loss"}`}>
            {testResult.broker_id}: {testResult.message}
          </p>
        )}
        <div className="mt-4">
          <p className="text-terminal-muted text-sm mb-2">Broker tokens (paste and save)</p>
          <div className="flex flex-col gap-2 max-w-md">
            <label className="text-terminal-fg text-sm">
              Zerodha access token:{" "}
              <input
                type="password"
                value={zerodhaToken}
                onChange={(e) => setZerodhaToken(e.target.value)}
                placeholder="Paste token from Kite"
                className="w-full mt-1 px-3 py-2 rounded border border-terminal-border bg-terminal-surface text-terminal-fg placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-groww/50"
              />
            </label>
            <label className="text-terminal-fg text-sm">
              Groww access token:{" "}
              <input
                type="password"
                value={growwToken}
                onChange={(e) => setGrowwToken(e.target.value)}
                placeholder="Use Test connection to refresh"
                className="w-full mt-1 px-3 py-2 rounded border border-terminal-border bg-terminal-surface text-terminal-fg placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-groww/50"
              />
            </label>
            <button
              type="button"
              onClick={handleSaveTokens}
              disabled={savingTokens}
              className="px-3 py-2 rounded text-sm font-medium bg-groww text-terminal-bg hover:bg-groww-hover disabled:opacity-60 w-fit transition-colors"
            >
              Save tokens
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-terminal-border bg-terminal-panel p-4 mb-6">
        <h2 className="text-sm font-semibold text-terminal-fg mb-2">Paper / Live</h2>
        <ChoicePills
          options={[
            { value: "paper", label: "Paper" },
            { value: "live", label: "Live" },
          ]}
          value={settings.paper_live}
          onChange={(v) => handlePaperLiveChange(v as "paper" | "live")}
          disabled={saving}
          aria-label="Paper or Live trading"
        />
        <p className="mt-2 text-terminal-muted text-sm">
          Paper: simulated orders. Live: real broker orders.
        </p>
      </section>

      <section className="rounded-lg border border-terminal-border bg-terminal-panel p-4 mb-6">
        <h2 className="text-sm font-semibold text-terminal-fg mb-2">Trading type</h2>
        <CustomSelect
          options={modes.map((m) => ({ value: m.id, label: `${m.name} (${m.product})` }))}
          value={settings.active_trading_mode_id ?? ""}
          onChange={(v) => handleTradingModeChange(v === "" ? null : Number(v))}
          placeholder="— Select —"
          disabled={saving}
          aria-label="Trading type"
          className="min-w-[200px]"
        />
        <p className="mt-2 text-terminal-muted text-sm">
          Intraday (MIS), Swing/Positional (CNC), F&amp;O (NRML).
        </p>
      </section>

      <section className="rounded-lg border border-terminal-border bg-terminal-panel p-4 mb-6">
        <h2 className="text-sm font-semibold text-terminal-fg mb-2">Risk limits</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <label className="text-terminal-fg text-sm">
            Max position (₹):{" "}
            <input
              type="number"
              min={0}
              value={riskForm.max_position_value}
              onChange={(e) => setRiskForm((p) => ({ ...p, max_position_value: e.target.value }))}
              className="w-28 ml-1 px-2 py-1.5 rounded border border-terminal-border bg-terminal-surface text-terminal-fg text-sm focus:outline-none focus:ring-2 focus:ring-groww/50"
            />
          </label>
          <label className="text-terminal-fg text-sm">
            Max orders/day:{" "}
            <input
              type="number"
              min={0}
              value={riskForm.max_orders_per_day}
              onChange={(e) => setRiskForm((p) => ({ ...p, max_orders_per_day: e.target.value }))}
              className="w-20 ml-1 px-2 py-1.5 rounded border border-terminal-border bg-terminal-surface text-terminal-fg text-sm focus:outline-none focus:ring-2 focus:ring-groww/50"
            />
          </label>
          <label className="text-terminal-fg text-sm">
            Daily loss limit (%):{" "}
            <input
              type="number"
              min={0}
              step={0.5}
              value={riskForm.daily_loss_limit_pct}
              onChange={(e) => setRiskForm((p) => ({ ...p, daily_loss_limit_pct: e.target.value }))}
              className="w-20 ml-1 px-2 py-1.5 rounded border border-terminal-border bg-terminal-surface text-terminal-fg text-sm focus:outline-none focus:ring-2 focus:ring-groww/50"
            />
          </label>
          <button
            type="button"
            onClick={handleSaveRisk}
            disabled={saving}
            className="px-3 py-2 rounded text-sm font-medium bg-groww text-terminal-bg hover:bg-groww-hover disabled:opacity-60 transition-colors"
          >
            Save limits
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-terminal-border bg-terminal-panel p-4">
        <h2 className="text-sm font-semibold text-terminal-fg mb-2">Kill switch</h2>
        <button
          type="button"
          onClick={handleKillSwitch}
          disabled={saving}
          className={`px-4 py-2 rounded font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-terminal-bg disabled:opacity-60 transition-colors ${
            settings.kill_switch ? "bg-loss hover:bg-loss/90" : "bg-profit hover:bg-groww-hover"
          }`}
        >
          {settings.kill_switch ? "Kill switch ON (blocking orders)" : "Kill switch OFF"}
        </button>
        <p className="mt-2 text-terminal-muted text-sm">
          When ON, new orders are rejected until you turn it off.
        </p>
      </section>
    </div>
  );
}
