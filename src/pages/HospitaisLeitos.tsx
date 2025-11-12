import { useMemo, useState, useEffect } from "react";
import PageHeader from "../components/common/PageHeader";
import BedsStatCard from "../components/leitos/BedsStatCard";
import BedsCapacityChart from "../components/leitos/BedsCapacityChart";
import BedsPer1000Chart from "../components/leitos/BedsPer1000Chart";
import HospitalsList from "../components/leitos/HospitalsList";
import RegionalAnalysis from "../components/leitos/RegionalAnalysis";
import BedTypeFilter from "../components/leitos/BedTypeFilter";
import YearFilter from "../components/leitos/YearFilter";
import MonthFilter from "../components/leitos/MonthFilter";
import { Bed, AlertCircle, Ambulance } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBedsByState, getBedsIndicators, getLeitosPage, getBedsByRegion, getLeitosPageDetailed } from "../services/beds";
import type { LeitoItem } from "../types/leitos";
import { useDebounce } from "../hooks/useDebounce";

export default function HospitaisLeitos() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedBedType, setSelectedBedType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const {
    data: overview,
    isLoading: isLoadingOverview,
    error: overviewError,
  } = useQuery({
    queryKey: ["beds-indicators", selectedYear, selectedMonth, selectedBedType],
    queryFn: () =>
      getBedsIndicators({
        year: selectedYear,
        month: selectedMonth ?? undefined,
        tipoLeito: selectedBedType || undefined,
      }),
  });

  const {
    data: byState,
    isLoading: isLoadingState,
    error: byStateError,
  } = useQuery({
    queryKey: ["beds-by-state", selectedYear, selectedMonth, selectedBedType],
    queryFn: () => getBedsByState(selectedYear, [], selectedBedType, selectedMonth ?? undefined),
  });

  const {
    data: byRegion,
    isLoading: isLoadingRegional,
    error: byRegionError,
  } = useQuery({
    queryKey: ["beds-by-region", selectedYear, selectedMonth, selectedBedType],
    queryFn: () =>
      getBedsByRegion({
        year: selectedYear,
        month: selectedMonth ?? undefined,
        tipoLeito: selectedBedType || undefined,
      }),
  });

  const stateData = useMemo(() => {
    if (!byState) return [];
    return byState.map((s) => ({
      uf: s.siglaUf || "",
      estado: s.nomeUf || "",
      total: s.totalLeitos || 0,
      leitosSus: s.leitosSus || 0,
      regiao: s.regiao || "",
      populacao: s.populacao || 0,
      leitosPor1000: s.coberturaLeitosPor1kHab || 0,
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
    queryKey: ["leitos", { page, pageSize, selectedUf, selectedBedType, selectedYear, selectedMonth }],
    queryFn: () => 
      getLeitosPage({ 
        pageNumber: page, 
        pageSize, 
        ufs: selectedUf ? [selectedUf] : undefined, 
        tipoLeito: selectedBedType || undefined,
        year: selectedYear, 
        month: selectedMonth ?? undefined
      }),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    enabled: !debouncedSearchQuery,
  });

  const {
    data: leitosPageDetailed,
    isLoading: isLoadingLeitosDetailed,
    error: leitosErrorDetailed,
  } = useQuery({
    queryKey: ["leitosDetailed", { page, pageSize, debouncedSearchQuery, selectedYear, selectedMonth, selectedBedType, selectedUf }],
    queryFn: () => {
      const isCnesSearch = /^\d+$/.test(debouncedSearchQuery);
      return getLeitosPageDetailed({
        pageNumber: page,
        pageSize,
        ufs: selectedUf ? [selectedUf] : undefined, 
        year: selectedYear,
        month: selectedMonth ?? undefined,
        tipoLeito: selectedBedType || undefined,
        codCnes: isCnesSearch ? Number(debouncedSearchQuery) : undefined,
        nomeEstabelecimento: !isCnesSearch ? debouncedSearchQuery : undefined,
      });
    },
    enabled: !!debouncedSearchQuery,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const isSearching = !!debouncedSearchQuery;
  
  const activeData = isSearching ? leitosPageDetailed : leitosPage;
  const isLoadingList = isSearching ? isLoadingLeitosDetailed : isLoadingLeitos;
  const listError = isSearching ? leitosErrorDetailed : leitosError;

  const hospitals = useMemo(() => {
    const list = (activeData?.items || []) as LeitoItem[];
    return list.map((h, idx) => ({
      id: String(h.codCnes ?? `${page}-${idx}`),
      nome: h.nomeEstabelecimento ?? "Estabelecimento",
      localizacao: `${h.enderecoCompleto ?? ""}${h.localizacaoUf ? ` - ${h.localizacaoUf}` : ""}`.trim(),
      leitosTotal: h.totalLeitos ?? 0,
      leitosSus: h.leitosSus ?? 0,
    }));
  }, [activeData, page]);

useEffect(() => {
    const nextPage = page + 1;
    const prevPage = page - 1;
    const totalPages = activeData?.totalPages || undefined;

    const queryOptions = {
      page: nextPage, 
      pageSize, 
      selectedUf, 
      selectedBedType,
      selectedYear,
      selectedMonth
    };

    const queryFnParams = {
      pageSize, 
      ufs: selectedUf ? [selectedUf] : undefined, 
      tipoLeito: selectedBedType || undefined,
      year: selectedYear, 
      month: selectedMonth ?? undefined
    };

    const isCnesSearch = /^\d+$/.test(debouncedSearchQuery);
    const searchKeyParams = { ...queryOptions, debouncedSearchQuery };
    const searchFnParams = {
      ...queryFnParams,
      codCnes: isCnesSearch ? Number(debouncedSearchQuery) : undefined,
      nomeEstabelecimento: !isCnesSearch ? debouncedSearchQuery : undefined,
    };

    const prefetch = (pageNum: number) => {
      if (isSearching) {
        queryClient.prefetchQuery({ 
          queryKey: ["leitosDetailed", { ...searchKeyParams, page: pageNum }],
          queryFn: () => getLeitosPageDetailed({ ...searchFnParams, pageNumber: pageNum }),
          staleTime: 60 * 1000 
        });
      } else {
        queryClient.prefetchQuery({ 
          queryKey: ["leitos", { ...queryOptions, page: pageNum }],
          queryFn: () => getLeitosPage({ ...queryFnParams, pageNumber: pageNum }),
          staleTime: 60 * 1000 
        });
      }
    };

    if (!totalPages || nextPage <= totalPages) {
      prefetch(nextPage);
    }
    if (prevPage >= 1) {
      prefetch(prevPage);
    }
  }, [
    page, 
    pageSize, 
    activeData?.totalPages, 
    selectedUf, 
    selectedBedType, 
    selectedYear,
    selectedMonth,
    debouncedSearchQuery, 
    isSearching,
    queryClient
  ]);

  useEffect(() => {
    setPage(1);
  }, [selectedUf, selectedBedType, selectedYear, selectedMonth, debouncedSearchQuery]);

  const ufOptions = useMemo(() => {
    return stateData.map((s) => ({ value: s.uf, label: `${s.uf} - ${s.estado}` })).sort((a, b) => a.label.localeCompare(b.label));
  }, [stateData]);

  const bedTypeOptions = useMemo(() => {
    return [
      { value: "UTI_ADULTO", label: "UTI Adulto" },
      { value: "UTI_NEONATAL", label: "UTI Neonatal" },
      { value: "UTI_PEDIATRICO", label: "UTI Pediátrico" },
      { value: "UTI_QUEIMADO", label: "UTI Queimado" },
      { value: "UTI_CORONARIANA", label: "UTI Coronariana" },
    ];
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Hospitais e Leitos" description="Monitoramento de capacidade hospitalar" />

      {(overviewError || byStateError || listError || byRegionError) && (
        <div className="card p-4 border border-red-200 bg-red-50 text-red-700">
          <p className="text-sm font-medium">Falha ao carregar dados de leitos.</p>
          <p className="text-xs mt-1">
            {overviewError ? "Indicadores gerais indisponíveis. " : ""}
            {byStateError ? "Indicadores por estado indisponíveis. " : ""}
            {byRegionError ? "Indicadores por região indisponíveis. " : ""}
            {listError ? " Dados detalhados de leitos indisponíveis." : ""}
          </p>
        </div>
      )}

      {/* Filtros de Ano e Mês */}
      <div className="grid gap-4 lg:grid-cols-3">
        <YearFilter value={selectedYear} onChange={setSelectedYear} minYear={2020} />
        <MonthFilter value={selectedMonth} onChange={setSelectedMonth} year={selectedYear} />
        <BedTypeFilter value={selectedBedType} onChange={setSelectedBedType} options={bedTypeOptions} />
      </div>

      {/* Cards de Indicadores - 3 cards maiores */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BedsStatCard label="Total de Leitos" value={overview?.totalLeitos ?? 0} sublabel={selectedBedType ? "Do tipo selecionado" : "Em todo o Brasil"} icon={<Bed />} iconColor="blue" isLoading={isLoadingOverview} />
        <BedsStatCard label="Leitos SUS" value={overview?.leitosSus ?? 0} sublabel={selectedBedType ? "Do tipo selecionado" : "Sistema Único de Saúde"} icon={<Ambulance />} iconColor="green" isLoading={isLoadingOverview} />
        <BedsStatCard label="Críticos" value={overview?.criticos ?? 0} sublabel="UTI e emergência" icon={<AlertCircle />} iconColor="red" isLoading={isLoadingOverview} />
      </div>

      <div className={`grid gap-4 ${selectedBedType ? "lg:grid-cols-1" : "lg:grid-cols-2"}`}>
        <BedsCapacityChart data={stateData} isLoading={isLoadingState} />
        {!selectedBedType && <BedsPer1000Chart data={stateData} isLoading={isLoadingState} />}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <HospitalsList hospitals={hospitals} isLoading={isLoadingList} page={page} totalPages={activeData?.totalPages} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => Math.min(activeData?.totalPages || p + 1, p + 1))} ufOptions={ufOptions} selectedUf={selectedUf} onChangeUf={(uf) => setSelectedUf(uf)} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <RegionalAnalysis data={regionalData} isLoading={isLoadingRegional} isFiltered={!!selectedBedType} />
      </div>
    </div>
  );
}
