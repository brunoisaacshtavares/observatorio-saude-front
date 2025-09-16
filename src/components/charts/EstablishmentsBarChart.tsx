import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getTotalEstabelecimentosPorEstado } from "../../services/establishments";

export default function EstablishmentsBarChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["estabelecimentos-por-estado"], 
    queryFn: () => getTotalEstabelecimentosPorEstado(),
    select: (data) => {
      return data
        .sort((a, b) => b.totalEstabelecimentos - a.totalEstabelecimentos)
        .slice(0, 10)
        .map(item => ({
          uf: item.siglaUf,
          estabelecimentos: item.totalEstabelecimentos
        }));
    },
  });

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
            <Tooltip />
            <Bar dataKey="estabelecimentos" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-slate-500">Sem dados suficientes.</p>
      )}
    </div>
  );
}
