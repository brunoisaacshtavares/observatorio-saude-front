import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
const regionColors = ["#3b82f6", "#16a34a", "#ef4444", "#f97316", "#8b5cf6"];
const regions = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];

type Props = {
  data: Record<string, number | string>[];
};

export default function RegionalTrendChart({ data }: Props) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="ano" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => v.toFixed(1)} />
          <Tooltip 
            formatter={(value: number) => value.toFixed(2)} 
            labelClassName="font-bold"
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {regions.map((region, index) => (
            <Line
              key={region}
              type="monotone"
              dataKey={region}
              stroke={regionColors[index % regionColors.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}