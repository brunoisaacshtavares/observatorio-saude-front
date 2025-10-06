import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type BedsPer1000Data = {
  uf: string;
  estado: string;
  leitosPor1000: number;
};

type Props = {
  data: BedsPer1000Data[];
  isLoading?: boolean;
};

export default function BedsPer1000Chart({ data, isLoading = false }: Props) {
  const sortedData = [...data].sort((a, b) => b.leitosPor1000 - a.leitosPor1000).slice(0, 10);

  if (isLoading) {
    return (
      <div className="card p-5">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Leitos por 1000 Habitantes</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm text-slate-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="text-base font-semibold text-slate-900 mb-4">Leitos por 1000 Habitantes</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="uf" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, "dataMax + 0.5"]} tickFormatter={(value) => value.toFixed(1)} />
            <Tooltip
              formatter={(value: number) => [value.toFixed(2), "Leitos/1000 hab."]}
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
            <Bar dataKey="leitosPor1000" fill="#FFD166" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#FFD166] rounded" />
          <span className="text-xs text-slate-600">Leitos por 1000 habitantes</span>
        </div>
      </div>
    </div>
  );
}
