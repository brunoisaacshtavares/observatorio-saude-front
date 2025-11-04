import { CalendarDays } from "lucide-react";

interface MonthFilterProps {
  value: number | null;
  onChange: (month: number | null) => void;
  year: number;
}

export default function MonthFilter({ value, onChange, year }: MonthFilterProps) {
  const months = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ];

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const availableMonths = year === currentYear ? months.filter((m) => m.value <= currentMonth) : months;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <CalendarDays className="w-5 h-5 text-gray-600" />
          <label htmlFor="month-select" className="text-sm font-medium text-gray-700">
            Mês (Opcional):
          </label>
        </div>
        <select id="month-select" value={value ?? ""} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm">
          <option value="">Todos os meses</option>
          {availableMonths.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>
      {value && (
        <p className="text-xs text-gray-500 mt-2">
          Consultando dados de {months.find((m) => m.value === value)?.label}/{year}
        </p>
      )}
    </div>
  );
}
