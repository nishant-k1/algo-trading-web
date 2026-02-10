/**
 * List-style choice for 2–4 options (Groww-style). Options always visible as pills; no dropdown.
 */
export type ChoiceOption = { value: string; label: string };

type Props = {
  options: ChoiceOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  "aria-label"?: string;
};

export function ChoicePills({
  options,
  value,
  onChange,
  disabled = false,
  "aria-label": ariaLabel,
}: Props) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="listbox"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="option"
            aria-selected={isSelected}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={
              "px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 " +
              (isSelected
                ? "bg-groww text-terminal-bg"
                : "bg-terminal-surface border border-terminal-border text-terminal-fg hover:border-groww/50 hover:text-groww")
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
