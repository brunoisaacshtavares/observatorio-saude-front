import { Calendar } from "lucide-react";

interface YearFilterProps {
  value: number;
  onChange: (year: number) => void;
  minYear?: number;
  maxYear?: number;
}

export default function YearFilter({ value, onChange, minYear = 2020, maxYear = new Date().getFullYear() }: YearFilterProps) {
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Calendar className="w-5 h-5 text-gray-600" />
          <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
            Ano de Referência:
          </label>
        </div>
        <select id="year-select" value={value} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md" style={{ backgroundPosition: "right 0.75rem center" }}>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
