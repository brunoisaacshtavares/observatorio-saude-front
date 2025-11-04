import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

type RegionalOccupancyData = {
  regiao: string;
  totalLeitos: number;
  leitosDisponiveis: number;
  leitosOcupados: number;
  ocupacaoMedia: number;
};

type Props = {
  data: RegionalOccupancyData[];
  isLoading?: boolean;
};

const getCoverageColor = (percentage: number) => {
  if (percentage >= 80) return "#00A67D";
  if (percentage >= 60) return "#10B981";
  if (percentage >= 40) return "#F59E0B";
  return "#DC2626";
};

export default function RegionalOccupancyChart({ data, isLoading = false }: Props) {
  const sortedData = [...data].sort((a, b) => b.ocupacaoMedia - a.ocupacaoMedia);

  if (isLoading) {
    return (
      <div className="card p-5">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Cobertura SUS por Região</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm text-slate-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card p-5">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Cobertura SUS por Região</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm text-slate-500">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="text-base font-semibold text-slate-900 mb-4">Cobertura SUS por Região</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="regiao" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}%`, "Cobertura SUS"]}
              labelFormatter={(label) => `Região ${label}`}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "8px",
              }}
            />
            <Bar dataKey="ocupacaoMedia" radius={[4, 4, 0, 0]} name="coberturaSus">
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getCoverageColor(entry.ocupacaoMedia)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-4 mt-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#DC2626] rounded" />
          <span className="text-xs text-slate-600">Muito Baixa (&lt; 40%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#F59E0B] rounded" />
          <span className="text-xs text-slate-600">Baixa (40-60%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#10B981] rounded" />
          <span className="text-xs text-slate-600">Boa (60-80%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#00A67D] rounded" />
          <span className="text-xs text-slate-600">Excelente (&gt; 80%)</span>
        </div>
      </div>
    </div>
  );
}
