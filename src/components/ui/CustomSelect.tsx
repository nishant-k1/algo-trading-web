/**
 * Custom dropdown with animated list (same style as symbol suggest). Replaces native select.
 */
import { useEffect, useRef, useState } from "react";

export type SelectOption = { value: string | number; label: string };

type Props = {
  options: SelectOption[];
  value: string | number | "";
  onChange: (value: string | number | "") => void;
  placeholder?: string;
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
};

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  disabled = false,
  "aria-label": ariaLabel,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = value === "" ? null : options.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={
          "flex items-center justify-between gap-2 px-3 py-2 rounded border text-left text-sm min-w-[140px] transition-colors " +
          (open
            ? "border-groww ring-2 ring-groww/50 bg-terminal-panel"
            : "border-terminal-border bg-terminal-surface text-terminal-fg hover:border-groww/50 focus:outline-none focus:ring-2 focus:ring-groww/50") +
          (selectedOption ? " text-terminal-fg" : " text-terminal-muted") +
          (disabled ? " opacity-50 cursor-not-allowed" : "")
        }
      >
        <span className="truncate">{displayLabel}</span>
        <span
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 4.5 L6 7.5 L9 4.5" />
          </svg>
        </span>
      </button>
      {open && (
        <ul
          className="suggest-dropdown absolute left-0 top-full mt-1.5 list-none p-1 m-0 rounded-lg border border-terminal-border bg-terminal-panel max-h-56 overflow-y-auto z-20 min-w-[200px]"
          role="listbox"
        >
          <li
            role="option"
            aria-selected={value === ""}
            className="px-3 py-2.5 rounded-md cursor-pointer text-sm font-medium transition-colors duration-150 hover:bg-groww/15 hover:text-groww text-terminal-muted"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            {placeholder}
          </li>
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={String(opt.value)}
                role="option"
                aria-selected={isSelected}
                className={`px-3 py-2.5 rounded-md cursor-pointer text-sm font-medium transition-colors duration-150 hover:bg-groww/15 hover:text-groww ${isSelected ? "bg-groww/15 text-groww" : "text-terminal-fg"}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
