import { useMemo, useState, useEffect } from "react";
import PageHeader from "../components/common/PageHeader";
import BedsStatCard from "../components/leitos/BedsStatCard";
import BedsCapacityChart from "../components/leitos/BedsCapacityChart";
import BedsPer1000Chart from "../components/leitos/BedsPer1000Chart";
import HospitalsList from "../components/leitos/HospitalsList";
import RegionalAnalysis from "../components/leitos/RegionalAnalysis";
import BedTypeFilter from "../components/leitos/BedTypeFilter";
import { Bed, AlertCircle, Ambulance } from "lucide-react";
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
      leitosSus: s.leitosSus,
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
      leitosSus: h.leitosSus ?? 0,
    }));
  }, [leitosPage, page]);

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
  
  return (
    <div className="space-y-6">
      <PageHeader title="Hospitais e Leitos" description="Monitoramento de capacidade hospitalar" />

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
        <BedsStatCard label="Leitos Sus" value={overview?.leitosSus ?? 0} sublabel={selectedBedType ? "Do tipo selecionado" : "Em todo o Brasil"} icon={<Ambulance />} iconColor="green" isLoading={isLoadingOverview} />
        <BedsStatCard label="Críticos" value={overview?.criticos ?? 0} sublabel={"UTI e emergência"} icon={<AlertCircle />} iconColor="red" isLoading={isLoadingOverview} />
      </div>

      <BedTypeFilter value={selectedBedType} onChange={setSelectedBedType} options={bedTypeOptions} />
      
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
    </div>
  );
}
