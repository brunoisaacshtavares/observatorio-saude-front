import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type Props = {
  data: {
    ano: number;
    "Total de Leitos": number;
    "Leitos SUS": number;
    "Leitos Críticos": number;
  }[];
};

const formatadorY = (value: number) => {
  if (value >= 1000) return `${(value / 1000).toLocaleString("pt-BR")}k`;
  return value.toLocaleString("pt-BR");
};

export default function TendenciaLeitosChart({ data }: Props) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="ano" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} tickFormatter={formatadorY} />
          <Tooltip 
            formatter={(value: number) => value.toLocaleString('pt-BR')} 
            labelClassName="font-bold"
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="Total de Leitos" stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Leitos SUS" stroke="#16a34a" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Leitos Críticos" stroke="#ef4444" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}