import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

type BedsPer1000Data = {
  uf: string;
  estado: string;
  leitosPor1000: number;
};

type Props = {
  data: BedsPer1000Data[];
  isLoading?: boolean;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF6B9D", "#8DD1E1", "#A4DE6C"];

export default function BedsPer1000Chart({ data, isLoading = false }: Props) {
  const validData = [...data].filter((item) => {
    const hasValidValue = item.leitosPor1000 !== null && item.leitosPor1000 !== undefined && !isNaN(item.leitosPor1000) && item.leitosPor1000 > 0;

    const hasValidNames = item.uf && item.estado && item.uf !== "" && item.estado !== "";

    return hasValidValue && hasValidNames;
  });

  const sortedData = validData
    .sort((a, b) => b.leitosPor1000 - a.leitosPor1000)
    .slice(0, 10)
    .map((item) => ({
      name: item.uf,
      value: parseFloat(item.leitosPor1000.toFixed(2)),
      fullName: item.estado,
    }));

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

  if (!data || data.length === 0 || sortedData.length === 0) {
    return (
      <div className="card p-5">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Leitos por 1000 Habitantes</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm text-slate-500">Nenhum dado disponível para este período</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="text-base font-semibold text-slate-900 mb-4">Leitos por 1000 Habitantes - Top 10 Estados</h3>
      <p className="text-xs text-slate-500 mb-3">Distribuição dos estados com maior disponibilidade de leitos por habitante</p>
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sortedData}
              cx="50%"
              cy="45%"
              labelLine={true}
              label={({ name, value, percent }) => {
                const validValue = typeof value === "number" && !isNaN(value) ? value.toFixed(1) : "0.0";
                const validPercent = typeof percent === "number" && !isNaN(percent) ? (percent * 100).toFixed(1) : "0.0";
                return `${name}: ${validValue} (${validPercent}%)`;
              }}
              outerRadius={100}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {sortedData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, _name, props) => {
                const validValue = typeof value === "number" && !isNaN(value) ? value : 0;
                return [`${validValue.toFixed(2)} leitos/1000 hab.`, props?.payload?.fullName || "Desconhecido"];
              }}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "8px",
              }}
            />
            <Legend layout="horizontal" align="center" verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", paddingTop: "15px" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
