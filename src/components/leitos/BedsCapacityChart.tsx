import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type BedsCapacityData = {
  uf: string;
  estado: string;
  total: number;
  leitosSus: number;
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
      <h3 className="text-base font-semibold text-slate-900 mb-3">Capacidade de Leitos por Estado</h3>
      <p className="text-xs text-slate-500 mb-3">Top 10 estados com maior número de leitos</p>
      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="uf" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => (value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value)} />
            <Tooltip
              formatter={(value: number, name: string) => [value.toLocaleString("pt-BR"), name === "total" ? "Total de Leitos" : "Leitos SUS"]}
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
            <Bar dataKey="total" fill="#004F6D" radius={[4, 4, 0, 0]} name="total" />
            <Bar dataKey="leitosSus" fill="#00A67D" radius={[4, 4, 0, 0]} name="leitosSus" />
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
          <span className="text-xs text-slate-600">Leitos SUS</span>
        </div>
      </div>
    </div>
  );
}
