import { useCallback, useEffect, useRef, useState } from "react";
import {
  listWatchlists,
  createWatchlist,
  updateWatchlist,
  deleteWatchlist,
  addSymbolToWatchlist,
  removeSymbolFromWatchlist,
  type WatchlistResponse,
} from "../api/watchlists";
import { suggestInstruments, type InstrumentSuggestion } from "../api/instruments";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const SUGGEST_DEBOUNCE_MS = 300;

export default function Watchlists() {
  const [watchlists, setWatchlists] = useState<WatchlistResponse[]>([]);
  const [selected, setSelected] = useState<WatchlistResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [addSymbol, setAddSymbol] = useState("");
  const [suggestions, setSuggestions] = useState<InstrumentSuggestion[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const suggestTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback((q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      setSuggestOpen(false);
      return;
    }
    suggestInstruments(q, "NSE", 15)
      .then((list) => {
        setSuggestions(list);
        setSuggestOpen(list.length > 0);
      })
      .catch(() => {
        setSuggestions([]);
        setSuggestOpen(false);
      });
  }, []);

  useEffect(() => {
    if (suggestTimeoutRef.current) clearTimeout(suggestTimeoutRef.current);
    if (!addSymbol.trim()) {
      setSuggestions([]);
      setSuggestOpen(false);
      return;
    }
    suggestTimeoutRef.current = setTimeout(() => fetchSuggestions(addSymbol), SUGGEST_DEBOUNCE_MS);
    return () => {
      if (suggestTimeoutRef.current) clearTimeout(suggestTimeoutRef.current);
    };
  }, [addSymbol, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (inputContainerRef.current && !inputContainerRef.current.contains(e.target as Node)) {
        setSuggestOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const load = () => {
    setLoading(true);
    listWatchlists()
      .then(setWatchlists)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (selected && watchlists.length) {
      const updated = watchlists.find((w) => w.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [watchlists]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    setError(null);
    createWatchlist({ name: newName.trim() })
      .then((w) => {
        setWatchlists((prev) => [...prev, w]);
        setNewName("");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Create failed"));
  };

  const handleSetAuto = (w: WatchlistResponse) => {
    setError(null);
    updateWatchlist(w.id, { is_auto_for_screener: true })
      .then(() => load())
      .catch((e) => setError(e instanceof Error ? e.message : "Update failed"));
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this watchlist?")) return;
    setError(null);
    deleteWatchlist(id)
      .then(() => {
        setWatchlists((prev) => prev.filter((w) => w.id !== id));
        if (selected?.id === id) setSelected(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Delete failed"));
  };

  const handleAddSymbol = () => {
    if (!selected || !addSymbol.trim()) return;
    setError(null);
    addSymbolToWatchlist(selected.id, "NSE", addSymbol.trim().toUpperCase())
      .then(() => {
        setAddSymbol("");
        load();
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Add failed"));
  };

  const handleRemoveSymbol = (symbol: string) => {
    if (!selected) return;
    setError(null);
    removeSymbolFromWatchlist(selected.id, "NSE", symbol)
      .then(() => load())
      .catch((e) => setError(e instanceof Error ? e.message : "Remove failed"));
  };

  if (loading && watchlists.length === 0) {
    return <LoadingSpinner label="Loading watchlists" />;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-terminal-fg mt-0 mb-1">Watchlists</h1>
      <p className="text-terminal-muted text-sm mb-4">
        Create watchlists and add symbols. Set one as &quot;Auto for screener&quot; to use it as the screener universe.
      </p>
      {error && <p className="text-loss text-sm mb-4">{error}</p>}

      <section className="mb-6 flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="New watchlist name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          className="px-3 py-2 rounded border border-terminal-border bg-terminal-panel text-terminal-fg placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-groww/50 w-48"
        />
        <button
          type="button"
          onClick={handleCreate}
          className="px-3 py-2 rounded text-sm font-medium bg-groww text-terminal-bg hover:bg-groww-hover transition-colors"
        >
          Create
        </button>
      </section>

      <div className="flex gap-8 flex-wrap">
        <div className="min-w-[200px]">
          <h2 className="text-sm font-semibold text-terminal-fg mb-2">Your watchlists</h2>
          <ul className="list-none p-0 m-0 space-y-1">
            {watchlists.map((w) => (
              <li
                key={w.id}
                className={`rounded px-3 py-2 cursor-pointer transition-colors ${
                  selected?.id === w.id
                    ? "bg-terminal-panel border border-groww/50"
                    : "border border-transparent hover:bg-terminal-panel/70"
                }`}
              >
                <div
                  className="flex justify-between items-center"
                  onClick={() => setSelected(w)}
                >
                  <span className="text-terminal-fg text-sm">
                    {w.name}
                    {w.is_auto_for_screener && " (Auto)"}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(w.id);
                    }}
                    className="px-2 py-0.5 text-xs rounded text-terminal-muted hover:text-loss hover:bg-loss/10 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {selected && (
          <div className="flex-1 min-w-[280px] rounded-lg border border-terminal-border bg-terminal-panel p-4">
            <h2 className="text-sm font-semibold text-terminal-fg mb-2">{selected.name}</h2>
            <button
              type="button"
              onClick={() => handleSetAuto(selected)}
              disabled={selected.is_auto_for_screener}
              className="mb-3 px-2.5 py-1.5 rounded text-xs font-medium bg-terminal-surface border border-terminal-border text-terminal-fg hover:bg-terminal-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {selected.is_auto_for_screener ? "Auto for screener" : "Set as auto for screener"}
            </button>
            <div className="mb-3" ref={inputContainerRef}>
              <div className="relative inline-block">
                <input
                  type="text"
                  placeholder="Add symbol (e.g. RELIANCE)"
                  value={addSymbol}
                  onChange={(e) => setAddSymbol(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSymbol()}
                  onFocus={() => suggestions.length > 0 && setSuggestOpen(true)}
                  className="px-3 py-2 rounded border border-terminal-border bg-terminal-surface text-terminal-fg placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-groww/50 w-52 mr-2"
                  autoComplete="off"
                />
                {suggestOpen && suggestions.length > 0 && (
                  <ul
                    className="suggest-dropdown absolute left-0 top-full mt-1.5 list-none p-1 m-0 rounded-lg border border-terminal-border bg-terminal-panel max-h-56 overflow-y-auto z-20 min-w-[220px]"
                    role="listbox"
                  >
                    {suggestions.map((s) => (
                      <li
                        key={`${s.exchange}-${s.symbol}`}
                        role="option"
                        className="px-3 py-2.5 rounded-md cursor-pointer text-terminal-fg text-sm font-medium transition-colors duration-150 hover:bg-groww/15 hover:text-groww"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setAddSymbol(s.symbol);
                          setSuggestOpen(false);
                        }}
                      >
                        {s.symbol}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="button"
                onClick={handleAddSymbol}
                className="px-3 py-2 rounded text-sm font-medium bg-groww text-terminal-bg hover:bg-groww-hover transition-colors"
              >
                Add
              </button>
            </div>
            <ul className="list-none p-0 m-0">
              {selected.symbols.map((s) => (
                <li
                  key={`${s.exchange}-${s.symbol}`}
                  className="flex justify-between items-center py-2 border-b border-terminal-border/50 last:border-0 text-terminal-fg text-sm"
                >
                  <span>{s.symbol}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSymbol(s.symbol)}
                    className="px-2 py-0.5 text-xs rounded text-terminal-muted hover:text-loss hover:bg-loss/10 transition-colors"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            {selected.symbols.length === 0 && (
              <p className="text-terminal-muted text-sm py-2">No symbols. Add some above.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
