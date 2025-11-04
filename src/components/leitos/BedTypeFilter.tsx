import { Filter, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
};

export default function BedTypeFilter({ value, onChange, options }: Props) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="card p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-700">
            <Filter size={18} />
            <label htmlFor="bed-type-filter" className="font-medium text-sm">
              Tipo de Leito:
            </label>
          </div>
          <select id="bed-type-filter" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 px-4 py-2 pr-10 rounded-lg border border-gray-300 text-slate-700 bg-gradient-to-br from-white to-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm shadow-sm hover:shadow-md" style={{ backgroundPosition: "right 0.75rem center" }}>
            <option value="">Todos os tipos</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {value && (
            <button onClick={() => onChange("")} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition flex items-center gap-2" title="Limpar filtro">
              <X size={16} />
              Limpar
            </button>
          )}
        </div>
        {value && selectedOption && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Filter size={14} className="text-blue-600" />
            <p className="text-xs text-blue-800">
              <strong>Filtro ativo:</strong> Exibindo apenas dados de <strong>{selectedOption.label}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
