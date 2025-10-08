import { useMemo, useState, useEffect } from "react";
import PageHeader from "../components/common/PageHeader";
import BedsStatCard from "../components/leitos/BedsStatCard";
import BedsCapacityChart from "../components/leitos/BedsCapacityChart";
import BedsPer1000Chart from "../components/leitos/BedsPer1000Chart";
import HospitalsList from "../components/leitos/HospitalsList";
import RegionalAnalysis from "../components/leitos/RegionalAnalysis";
import HighOccupancyAlert from "../components/leitos/HighOccupancyAlert";
import { Bed, CheckCircle, Activity, AlertCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBedsByState, getBedsIndicators, getLeitosPage } from "../services/beds";
import type { BedsByState, LeitoItem } from "../types/leitos";

export default function HospitaisLeitos() {
  const year = 2025;

  const {
    data: overview,
    isLoading: isLoadingOverview,
    error: overviewError,
  } = useQuery({
    queryKey: ["beds-indicators", year],
    queryFn: () => getBedsIndicators(year),
  });

  const {
    data: byState,
    isLoading: isLoadingState,
    error: byStateError,
  } = useQuery({
    queryKey: ["beds-by-state", year],
    queryFn: () => getBedsByState(year),
  });

  const stateData = useMemo(() => {
    const list = (byState || []) as BedsByState[];
    return list.map((s) => ({
      uf: s.siglaUf,
      estado: s.nomeUf,
      total: s.totalLeitos,
      disponiveis: s.leitosDisponiveis,
      regiao: s.regiao,
      populacao: s.populacao,
      leitosPor1000: s.coberturaLeitosPor1kHab,
    }));
  }, [byState]);

  const regionalData = useMemo(() => {
    const grouped = new Map<string, { totalLeitos: number; populacao: number }>();
    stateData.forEach((s) => {
      const key = s.regiao;
      const acc = grouped.get(key) || { totalLeitos: 0, populacao: 0 };
      acc.totalLeitos += s.total;
      acc.populacao += s.populacao;
      grouped.set(key, acc);
    });
    return Array.from(grouped.entries()).map(([regiao, vals]) => ({
      regiao,
      totalLeitos: vals.totalLeitos,
      populacao: vals.populacao,
      leitosPor1000: vals.populacao > 0 ? (vals.totalLeitos / vals.populacao) * 1000 : 0,
    }));
  }, [stateData]);

  const [page, setPage] = useState(1);
  const pageSize = 30;
  const queryClient = useQueryClient();

  const {
    data: leitosPage,
    isLoading: isLoadingLeitos,
    error: leitosError,
  } = useQuery({
    queryKey: ["leitos", { page, pageSize }],
    queryFn: () => getLeitosPage({ pageNumber: page, pageSize }),
    placeholderData: (prev) => prev,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const hospitals = useMemo(() => {
    const list = (leitosPage?.items || []) as LeitoItem[];
    return list.map((h, idx) => ({
      id: String(h.codCnes ?? `${page}-${idx}`),
      nome: h.nomeEstabelecimento ?? "Estabelecimento",
      localizacao: `${h.enderecoCompleto ?? ""}${h.localizacaoUf ? ` - ${h.localizacaoUf}` : ""}`.trim(),
      leitosTotal: h.totalLeitos ?? 0,
      leitosDisponiveis: h.leitosDisponiveis ?? 0,
      percentualOcupacao: Number(h.porcentagemOcupacao ?? 0),
    }));
  }, [leitosPage, page]);
  const highOccupancy = useMemo(() => {
    const list = (leitosPage?.items || []) as LeitoItem[];
    const total = list.length;
    if (total === 0) {
      return { count: 0, percentage: 0, recommendation: undefined as string | undefined };
    }

    const count = list.filter((l) => (l.porcentagemOcupacao ?? 0) >= 80).length;
    const percentage = (count / total) * 100;

    let recommendation: string | undefined;
    if (percentage >= 90) {
      recommendation = "Acione plano de contingência e amplie capacidade em regiões críticas.";
    } else if (percentage >= 80) {
      recommendation = "Acompanhar diariamente e redistribuir demanda para regiões menos pressionadas.";
    } else if (percentage >= 60) {
      recommendation = "Monitorar tendência e preparar expansão de leitos, se necessário.";
    }

    return { count, percentage, recommendation };
  }, [leitosPage]);
  const isLoadingHighOccupancy = isLoadingLeitos;

  const isLoadingRegional = isLoadingState;

  useEffect(() => {
    const nextPage = page + 1;
    const prevPage = page - 1;
    const totalPages = leitosPage?.totalPages || undefined;

    if (!totalPages || nextPage <= totalPages) {
      queryClient.prefetchQuery({
        queryKey: ["leitos", { page: nextPage, pageSize }],
        queryFn: () => getLeitosPage({ pageNumber: nextPage, pageSize }),
        staleTime: 60 * 1000,
      });
    }

    if (prevPage >= 1) {
      queryClient.prefetchQuery({
        queryKey: ["leitos", { page: prevPage, pageSize }],
        queryFn: () => getLeitosPage({ pageNumber: prevPage, pageSize }),
        staleTime: 60 * 1000,
      });
    }
  }, [page, pageSize, leitosPage?.totalPages, queryClient]);

  return (
    <div className="space-y-6">
      {}
      <PageHeader title="Hospitais e Leitos" description="Monitoramento de capacidade hospitalar e disponibilidade de leitos" />

      {}
      {(overviewError || byStateError || leitosError) && (
        <div className="card p-4 border border-red-200 bg-red-50 text-red-700">
          <p className="text-sm font-medium">Falha ao carregar dados de leitos.</p>
          <p className="text-xs mt-1">
            {overviewError ? "Indicadores gerais indisponíveis. " : ""}
            {byStateError ? "Indicadores por estado indisponíveis." : ""}
            {leitosError ? " Dados detalhados de leitos indisponíveis." : ""}
          </p>
        </div>
      )}

      {}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BedsStatCard label="Total de Leitos" value={overview?.totalLeitos ?? 0} sublabel="Em todo o Brasil" icon={<Bed />} iconColor="blue" isLoading={isLoadingOverview} />
        <BedsStatCard label="Leitos Disponíveis" value={overview?.leitosDisponiveis ?? 0} sublabel="Prontos para uso" icon={<CheckCircle />} iconColor="green" isLoading={isLoadingOverview} />
        <BedsStatCard label="Ocupação Média" value={`${overview?.ocupacaoMedia ?? 0}%`} sublabel="Taxa nacional" icon={<Activity />} iconColor="yellow" isLoading={isLoadingOverview} />
        <BedsStatCard label="Críticos" value={overview?.criticos ?? 0} sublabel="UTI e emergência" icon={<AlertCircle />} iconColor="red" isLoading={isLoadingOverview} />
      </div>

      {}
      <div className="grid gap-4 lg:grid-cols-2">
        <BedsCapacityChart data={stateData} isLoading={isLoadingState} />
        <BedsPer1000Chart data={stateData} isLoading={isLoadingState} />
      </div>

      {}
      <div className="grid gap-4 lg:grid-cols-2">
        <HospitalsList hospitals={hospitals} isLoading={isLoadingLeitos} page={page} totalPages={leitosPage?.totalPages} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => Math.min(leitosPage?.totalPages || p + 1, p + 1))} />
        <RegionalAnalysis data={regionalData} isLoading={isLoadingRegional} />
      </div>

      {}
      <HighOccupancyAlert count={highOccupancy.count} percentage={highOccupancy.percentage} recommendation={highOccupancy.recommendation} isLoading={isLoadingHighOccupancy} />
    </div>
  );
}
