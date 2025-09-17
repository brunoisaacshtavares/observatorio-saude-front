import type { ReactNode } from "react";
import { Search } from "lucide-react";

type ButtonSpec = {
  label: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: "ghost" | "primary";
  className?: string;
};

type Props = {
  value: string;
  onChange: (v: string) => void;
  onClear?: () => void;
  rightButtons?: ButtonSpec[];
  chips?: { label: string; value: string; color?: string; title?: string }[];
  onRemoveChip?: (value: string) => void;
  onEnter?: () => void;
  hidePlaceholder?: boolean;
};

export default function SearchBar({ value, onChange, onClear, rightButtons = [], chips = [], onRemoveChip, onEnter, hidePlaceholder = false }: Props) {
  return (
    <section className="card p-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <div className="w-full pl-10 pr-10 py-2 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-slate-200 flex flex-wrap gap-2 items-center min-h-[40px]">
              {chips.map((chip) => (
                <span
                  key={chip.value}
                  role="button"
                  tabIndex={0}
                  onClick={() => onRemoveChip?.(chip.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRemoveChip?.(chip.value);
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-white text-slate-900 border border-slate-200 cursor-pointer hover:bg-[rgba(148,163,184,0.12)] transition"
                  title={chip.title || chip.label}
                >
                  {chip.label}
                  <span className="text-slate-900 pointer-events-none">×</span>
                </span>
              ))}
              <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onEnter?.();
                  }
                }}
                placeholder={hidePlaceholder ? "" : "Buscar por estado..."}
                className="flex-1 min-w-[120px] outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
              />
            </div>
            {value && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={onClear} aria-label="Limpar">
                ×
              </button>
            )}
          </div>
        </div>

        {}
        <div className="flex gap-2 md:justify-end">
          {rightButtons.map((b, i) => {
            const base = b.variant === "primary" ? "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white bg-[#004F6D] hover:opacity-95 transition" : "inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition";
            return (
              <button key={i} onClick={b.onClick} className={`${base} ${b.className ?? ""} overflow-hidden text-ellipsis whitespace-nowrap`}>
                {b.icon} {b.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
