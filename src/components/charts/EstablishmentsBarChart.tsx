import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getTotalEstabelecimentosPorEstado } from "../../services/establishments";
import { getRegionColor } from "../../utils/colors";
import { formatNumber } from "../../utils/formatters";

export default function EstablishmentsBarChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["estabelecimentos-por-estado"],
    queryFn: () => getTotalEstabelecimentosPorEstado(),
    select: (data) => {
      return data
        .sort((a, b) => b.totalEstabelecimentos - a.totalEstabelecimentos)
        .slice(0, 10)
        .map((item) => ({
          uf: item.siglaUf,
          estado: item.nomeUf,
          estabelecimentos: item.totalEstabelecimentos,
          regiao: item.regiao,
          color: getRegionColor(item.regiao),
        }));
    },
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0]?.payload;
      if (!p) return null;
      return <div className="rounded-md bg-white px-2.5 py-1.5 text-sm text-slate-800 shadow-md ring-1 ring-slate-200">{`${p.estado}: ${formatNumber(p.estabelecimentos)}`}</div>;
    }
    return null;
  };

  return (
    <div className="card p-4 h-[360px]">
      <h4 className="card-head mb-3">Estados com Maior Número de Estabelecimentos</h4>
      {isLoading ? (
        <p className="text-sm text-slate-500">Carregando…</p>
      ) : isError ? (
        <p className="text-sm text-red-600">Erro ao carregar dados do gráfico.</p>
      ) : data && data.length ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="uf" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} labelFormatter={() => ""} />
            <Bar dataKey="estabelecimentos">
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color || "#004F6D"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-slate-500">Sem dados suficientes.</p>
      )}
    </div>
  );
}
