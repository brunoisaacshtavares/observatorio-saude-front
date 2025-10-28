import { useMemo, useState, useEffect } from "react";
import PageHeader from "../components/common/PageHeader";
import BedsStatCard from "../components/leitos/BedsStatCard";
import BedsCapacityChart from "../components/leitos/BedsCapacityChart";
import BedsPer1000Chart from "../components/leitos/BedsPer1000Chart";
import HospitalsList from "../components/leitos/HospitalsList";
import RegionalAnalysis from "../components/leitos/RegionalAnalysis";
import HighOccupancyAlert from "../components/leitos/HighOccupancyAlert";
import BedTypeFilter from "../components/leitos/BedTypeFilter";
import RegionalOccupancyChart from "../components/leitos/RegionalOccupancyChart";
import { Bed, CheckCircle, Activity, AlertCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBedsByState, getBedsIndicators, getLeitosPage, getBedsByRegion } from "../services/beds";
import type { LeitoItem } from "../types/leitos";

export default function HospitaisLeitos() {
  const year = 2025;
  const [selectedBedType, setSelectedBedType] = useState<string>("");

  const {
    data: overview,
    isLoading: isLoadingOverview,
    error: overviewError,
  } = useQuery({
    queryKey: ["beds-indicators", year, selectedBedType],
    queryFn: () =>
      getBedsIndicators({
        year,
        tipoLeito: selectedBedType || undefined,
      }),
  });

  const {
    data: byState,
    isLoading: isLoadingState,
    error: byStateError,
  } = useQuery({
    queryKey: ["beds-by-state",year, selectedBedType],
    queryFn: () => getBedsByState(year, [], selectedBedType),
  });


  const {
    data: byRegion,
    isLoading: isLoadingRegional,
    error: byRegionError,
  } = useQuery({
    queryKey: ["beds-by-region", year, selectedBedType],
    queryFn: () =>
      getBedsByRegion({
        year,
        tipoLeito: selectedBedType || undefined,
      }),
  });

  const stateData = useMemo(() => {
    if (!byState) return [];
    return byState.map((s) => ({
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
    if (!byRegion) return [];
    return byRegion.map((r) => ({
      regiao: r.nomeRegiao,
      totalLeitos: r.totalLeitos,
      populacao: r.populacao,
      leitosPor1000: r.coberturaLeitosPor1kHab,
    }));
  }, [byRegion]);

  const [page, setPage] = useState(1);
  const [selectedUf, setSelectedUf] = useState<string | undefined>(undefined);
  const pageSize = 30;
  const queryClient = useQueryClient();

  const {
    data: leitosPage,
    isLoading: isLoadingLeitos,
    error: leitosError,
  } = useQuery({
    queryKey: ["leitos", { page, pageSize, selectedUf, selectedBedType }],
    queryFn: () => getLeitosPage({ pageNumber: page, pageSize, ufs: selectedUf ? [selectedUf] : undefined, tipoLeito: selectedBedType || undefined }),
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
    if (total === 0) return { count: 0, percentage: 0, recommendation: undefined as string | undefined };
    const count = list.filter((l) => (l.porcentagemOcupacao ?? 0) >= 80).length;
    const percentage = (count / total) * 100;
    let recommendation: string | undefined;
    if (percentage >= 90) recommendation = "Acione plano de contingência e amplie capacidade em regiões críticas.";
    else if (percentage >= 80) recommendation = "Acompanhar diariamente e redistribuir demanda para regiões menos pressionadas.";
    else if (percentage >= 60) recommendation = "Monitorar tendência e preparar expansão de leitos, se necessário.";
    return { count, percentage, recommendation };
  }, [leitosPage]);

  const isLoadingHighOccupancy = isLoadingLeitos;

  useEffect(() => {
    const nextPage = page + 1;
    const prevPage = page - 1;
    const totalPages = leitosPage?.totalPages || undefined;
    if (!totalPages || nextPage <= totalPages) {
      queryClient.prefetchQuery({ queryKey: ["leitos", { page: nextPage, pageSize, selectedUf, selectedBedType }], queryFn: () => getLeitosPage({ pageNumber: nextPage, pageSize, ufs: selectedUf ? [selectedUf] : undefined, tipoLeito: selectedBedType || undefined }), staleTime: 60 * 1000 });
    }
    if (prevPage >= 1) {
      queryClient.prefetchQuery({ queryKey: ["leitos", { page: prevPage, pageSize, selectedUf, selectedBedType }], queryFn: () => getLeitosPage({ pageNumber: prevPage, pageSize, ufs: selectedUf ? [selectedUf] : undefined, tipoLeito: selectedBedType || undefined }), staleTime: 60 * 1000 });
    }
  }, [page, pageSize, leitosPage?.totalPages, selectedUf, selectedBedType, queryClient]);

  useEffect(() => { setPage(1); }, [selectedUf, selectedBedType]);

  const ufOptions = useMemo(() => {
    return stateData.map((s) => ({ value: s.uf, label: `${s.uf} - ${s.estado}` })).sort((a, b) => a.label.localeCompare(b.label));
  }, [stateData]);

  const bedTypeOptions = useMemo(() => {
    return [{ value: "UTI_ADULTO", label: "UTI Adulto" }, { value: "UTI_NEONATAL", label: "UTI Neonatal" }, { value: "UTI_PEDIATRICO", label: "UTI Pediátrico" }, { value: "UTI_QUEIMADO", label: "UTI Queimado" }, { value: "UTI_CORONARIANA", label: "UTI Coronariana" }];
  }, []);

  const regionalOccupancyData = useMemo(() => {
    const dataSet = selectedBedType ? byRegion : byState?.map(s => ({...s, nomeRegiao: s.regiao}));
    if (!dataSet) return [];
  
    const regionalMap = new Map<string, { totalLeitos: number; leitosDisponiveis: number }>();
  
    dataSet.forEach((item) => {
      const regiao = item.nomeRegiao;
      if (!regiao) return;
  
      const existing = regionalMap.get(regiao) || { totalLeitos: 0, leitosDisponiveis: 0 };
      existing.totalLeitos += item.totalLeitos;
      existing.leitosDisponiveis += item.leitosDisponiveis;
      regionalMap.set(regiao, existing);
    });
  
    return Array.from(regionalMap.entries()).map(([regiao, data]) => {
      const leitosOcupados = data.totalLeitos - data.leitosDisponiveis;
      return {
        regiao,
        totalLeitos: data.totalLeitos,
        leitosDisponiveis: data.leitosDisponiveis,
        leitosOcupados,
        ocupacaoMedia: data.totalLeitos > 0 ? (leitosOcupados / data.totalLeitos) * 100 : 0,
      };
    });
  }, [byState, byRegion, selectedBedType]);
  
  return (
    <div className="space-y-6">
      <PageHeader title="Hospitais e Leitos" description="Monitoramento de capacidade hospitalar e disponibilidade de leitos" />

      {(overviewError || byStateError || leitosError || byRegionError) && (
        <div className="card p-4 border border-red-200 bg-red-50 text-red-700">
          <p className="text-sm font-medium">Falha ao carregar dados de leitos.</p>
          <p className="text-xs mt-1">
            {overviewError ? "Indicadores gerais indisponíveis. " : ""}
            {byStateError ? "Indicadores por estado indisponíveis. " : ""}
            {byRegionError ? "Indicadores por região indisponíveis. " : ""}
            {leitosError ? " Dados detalhados de leitos indisponíveis." : ""}
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BedsStatCard label="Total de Leitos" value={overview?.totalLeitos ?? 0} sublabel={selectedBedType ? "Do tipo selecionado" : "Em todo o Brasil"} icon={<Bed />} iconColor="blue" isLoading={isLoadingOverview} />
        <BedsStatCard label="Leitos Disponíveis" value={overview?.leitosDisponiveis ?? 0} sublabel="Prontos para uso" icon={<CheckCircle />} iconColor="green" isLoading={isLoadingOverview} />
        <BedsStatCard label="Ocupação Média" value={`${overview?.ocupacaoMedia ?? 0}%`} sublabel={selectedBedType ? "Do tipo selecionado" : "Taxa nacional"} icon={<Activity />} iconColor="yellow" isLoading={isLoadingOverview} />
        <BedsStatCard label="Críticos" value={overview?.criticos ?? 0} sublabel={selectedBedType ? "Do tipo selecionado" : "UTI e emergência"} icon={<AlertCircle />} iconColor="red" isLoading={isLoadingOverview} />
      </div>

      <BedTypeFilter value={selectedBedType} onChange={setSelectedBedType} options={bedTypeOptions} />
      
      <RegionalOccupancyChart data={regionalOccupancyData} isLoading={selectedBedType ? isLoadingRegional : isLoadingState} />

      <div className={`grid gap-4 ${selectedBedType ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}>
        <BedsCapacityChart data={stateData} isLoading={isLoadingState} />
        {!selectedBedType && (
          <BedsPer1000Chart data={stateData} isLoading={isLoadingState} />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <HospitalsList hospitals={hospitals} isLoading={isLoadingLeitos} page={page} totalPages={leitosPage?.totalPages} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => Math.min(leitosPage?.totalPages || p + 1, p + 1))} ufOptions={ufOptions} selectedUf={selectedUf} onChangeUf={(uf) => setSelectedUf(uf)} />
        <RegionalAnalysis data={regionalData} isLoading={isLoadingRegional} isFiltered={!!selectedBedType} />
      </div>

      <HighOccupancyAlert count={highOccupancy.count} percentage={highOccupancy.percentage} recommendation={highOccupancy.recommendation} isLoading={isLoadingHighOccupancy} />
    </div>
  );
}