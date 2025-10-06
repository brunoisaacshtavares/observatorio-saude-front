import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getRegionColor } from "../../utils/colors";

type BedsCapacityData = {
  uf: string;
  estado: string;
  total: number;
  disponiveis: number;
  regiao?: string;
};

type Props = {
  data: BedsCapacityData[];
  isLoading?: boolean;
};

export default function BedsCapacityChart({ data, isLoading = false }: Props) {
  const sortedData = [...data].sort((a, b) => b.total - a.total).slice(0, 10);

  if (isLoading) {
    return (
      <div className="card p-5">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Capacidade de Leitos por Estado</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm text-slate-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="text-base font-semibold text-slate-900 mb-4">Capacidade de Leitos por Estado</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="uf" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => (value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value)} />
            <Tooltip
              formatter={(value: number, name: string) => [value.toLocaleString("pt-BR"), name === "total" ? "Total de Leitos" : "Leitos Disponíveis"]}
              labelFormatter={(label) => {
                const item = sortedData.find((d) => d.uf === label);
                return item ? item.estado : label;
              }}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "8px",
              }}
            />
            <Bar dataKey="total" fill="#004F6D" radius={[4, 4, 0, 0]} name="total">
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getRegionColor(entry.regiao)} />
              ))}
            </Bar>
            <Bar dataKey="disponiveis" fill="#00A67D" radius={[4, 4, 0, 0]} name="disponiveis" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#004F6D] rounded" />
          <span className="text-xs text-slate-600">Total de Leitos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#00A67D] rounded" />
          <span className="text-xs text-slate-600">Leitos Disponíveis</span>
        </div>
      </div>
    </div>
  );
}
