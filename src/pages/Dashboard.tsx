import React from "react";
import Header from "../components/layout/Header";
import StatCard from "../components/cards/StatCard";
import { Building2, Bed, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatNumber } from "../utils/formatters";
import InteractiveMap from "../components/map/InteractiveMap";
import ChoroplethMap from "../components/map/ChoroplethMap";
import UpdatesList from "../components/news/UpdatesList";
import { getTotalEstabelecimentos, getTotalEstabelecimentosPorEstado } from "../services/establishments";

export default function Dashboard() {
  const { data: ufCounts, isLoading: isLoadingUfs, isError: isErrorUfs } = useQuery({
    queryKey: ["estabelecimentos-por-estado"],
    queryFn: () => getTotalEstabelecimentosPorEstado(),
    select: (data) => {
      return data
        .map((item) => ({
          uf: item.codUf,
          qty: item.totalEstabelecimentos,
          sigla: item.siglaUf,
          nome: item.nomeUf,
          regiao: item.regiao,
          populacao: item.populacao,
          cobertura: item.coberturaEstabelecimentos,
        }))
        .sort((a, b) => b.qty - a.qty);
    },
  });
  
  const { data: totalData, isLoading: isLoadingTotal, isError: isErrorTotal } = useQuery({
    queryKey: ["contagem-total"],
    queryFn: () => getTotalEstabelecimentos(),
  });

  const stateChoroplethData = React.useMemo(() => {
    if (!ufCounts) return [];
    return ufCounts.map(state => ({
      uf: state.sigla,
      valor: state.cobertura,
      regiao: state.regiao
    }));
  }, [ufCounts]);

  const { melhorCobertura, piorCobertura } = React.useMemo(() => {
    if (!ufCounts) return { melhorCobertura: null, piorCobertura: null };
    const sortedData = [...ufCounts].sort((a, b) => a.cobertura - b.cobertura);
    return {
      piorCobertura: sortedData[0],
      melhorCobertura: sortedData[sortedData.length - 1],
    };
  }, [ufCounts]);

  const updates = [
    {
      title: "Novos dados CNES disponibilizados",
      description: "Atualização mensal com dados de dezembro de 2024.",
      date: "2025-09-07",
      color: "green" as const,
    },
    {
      title: "Expansão de leitos em São Paulo",
      description: "Aumento de 5% na capacidade hospitalar.",
      date: "2025-09-04",
      color: "amber" as const,
    },
    {
      title: "Relatório regional Norte publicado",
      description: "Análise detalhada da cobertura na região Norte.",
      date: "2025-09-02",
      color: "sky" as const,
    },
  ];

  return (
    <div className="space-y-4">
      <Header />

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total de Estabelecimentos" value={isLoadingTotal ? "…" : isErrorTotal ? "Erro" : formatNumber(totalData?.totalEstabelecimentos ?? 0)} icon={<Building2 />} iconBgClass="bg-[#004F6D]" hint="Cadastrados no CNES" />
        <StatCard label="Total de Leitos" value="—" hint="Aguardando endpoint de leitos" icon={<Bed />} iconBgClass="bg-[#00A67D]" />
        <StatCard label="Melhor Cobertura" value={isLoadingUfs ? "…" : isErrorUfs ? "Erro" : melhorCobertura?.nome ?? "N/A"} icon={<TrendingUp />} iconBgClass="bg-[#22C55E]" hint={melhorCobertura ? `${melhorCobertura.cobertura.toFixed(1)} por 100k hab.` : ""} />
        <StatCard label="Pior Cobertura" value={isLoadingUfs ? "…" : isErrorUfs ? "Erro" : piorCobertura?.nome ?? "N/A"} icon={<TrendingDown />} iconBgClass="bg-amber-400" hint={piorCobertura ? `${piorCobertura.cobertura.toFixed(1)} por 100k hab.` : ""} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: '500px' }}>
        
        <div className="card p-4 flex flex-col">
          <h2 className="text-base font-semibold text-slate-800 mb-1">
            Cobertura por Estado
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Análise da cobertura de estabelecimentos por 100 mil habitantes.
          </p>
          <div className="flex-grow">
            <ChoroplethMap
              data={stateChoroplethData}
              isLoading={isLoadingUfs}
              isError={isErrorUfs}
              min={piorCobertura?.cobertura}
              max={melhorCobertura?.cobertura}
            />
          </div>
        </div>

        <div className="card p-4 flex flex-col">
          <h2 className="text-base font-semibold text-slate-800 mb-1">
            Distribuição de Estabelecimentos
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Explore os pontos de estabelecimentos de saúde no mapa.
          </p>
          <div className="flex-grow">
            <InteractiveMap />
          </div>
        </div>
      </section>

      <section>
        <UpdatesList items={updates} />
      </section>
    </div>
  );
}