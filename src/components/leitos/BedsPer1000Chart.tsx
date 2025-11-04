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

const COLORS = [
  "#0088FE", // Azul
  "#00C49F", // Verde
  "#FFBB28", // Amarelo
  "#FF8042", // Laranja
  "#8884D8", // Roxo
  "#82CA9D", // Verde claro
  "#FFC658", // Amarelo claro
  "#FF6B9D", // Rosa
  "#8DD1E1", // Azul claro
  "#A4DE6C", // Verde lima
];

export default function BedsPer1000Chart({ data, isLoading = false }: Props) {
  const sortedData = [...data]
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

  if (!data || data.length === 0) {
    return (
      <div className="card p-5">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Leitos por 1000 Habitantes</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm text-slate-500">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="text-base font-semibold text-slate-900 mb-4">Leitos por 1000 Habitantes - Top 10 Estados</h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sortedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {sortedData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, _name, props) => [
                `${value.toFixed(2)} leitos/1000 hab.`,
                props.payload.fullName,
              ]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "8px",
              }}
            />
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
