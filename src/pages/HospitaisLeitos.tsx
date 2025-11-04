import { useMemo, useState, useEffect } from "react";
import PageHeader from "../components/common/PageHeader";
import BedsStatCard from "../components/leitos/BedsStatCard";
import BedsCapacityChart from "../components/leitos/BedsCapacityChart";
import BedsPer1000Chart from "../components/leitos/BedsPer1000Chart";
import HospitalsList from "../components/leitos/HospitalsList";
import RegionalAnalysis from "../components/leitos/RegionalAnalysis";
import HighOccupancyAlert from "../components/leitos/HighOccupancyAlert";
import BedTypeFilter from "../components/leitos/BedTypeFilter";
import YearFilter from "../components/leitos/YearFilter";
import MonthFilter from "../components/leitos/MonthFilter";
import RegionalOccupancyChart from "../components/leitos/RegionalOccupancyChart";
import { Bed, CheckCircle, Activity, AlertCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBedsByState, getBedsIndicators, getLeitosPage } from "../services/beds";
import type { BedsByState, LeitoItem } from "../types/leitos";

export default function HospitaisLeitos() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedBedType, setSelectedBedType] = useState<string>("");

  const safeNumber = (value: number | undefined | null, defaultValue: number = 0): number => {
    if (value === null || value === undefined || isNaN(value)) {
      return defaultValue;
    }
    return value;
  };

  const {
    data: overview,
    isLoading: isLoadingOverview,
    error: overviewError,
  } = useQuery({
    queryKey: ["beds-indicators", selectedYear, selectedMonth, selectedBedType],
    queryFn: async () => {
      const data = await getBedsIndicators(selectedYear, selectedMonth ?? undefined);
      return data;
    },
    enabled: !selectedBedType,
  });

  const {
    data: byState,
    isLoading: isLoadingState,
    error: byStateError,
  } = useQuery({
    queryKey: ["beds-by-state", selectedYear, selectedMonth, selectedBedType],
    queryFn: async () => {
      const data = await getBedsByState(selectedYear, undefined, selectedMonth ?? undefined);
      return data;
    },
    enabled: !selectedBedType,
  });

  const { data: allFilteredBeds, isLoading: isLoadingFiltered } = useQuery({
    queryKey: ["all-filtered-beds", selectedBedType, selectedYear, selectedMonth],
    queryFn: async () => {
      if (!selectedBedType) return null;
      const pages = await Promise.all([getLeitosPage({ pageNumber: 1, pageSize: 100, tipoLeito: selectedBedType, year: selectedYear, month: selectedMonth ?? undefined }), getLeitosPage({ pageNumber: 2, pageSize: 100, tipoLeito: selectedBedType, year: selectedYear, month: selectedMonth ?? undefined }), getLeitosPage({ pageNumber: 3, pageSize: 100, tipoLeito: selectedBedType, year: selectedYear, month: selectedMonth ?? undefined })]);
      return pages.flatMap((p) => p.items);
    },
    enabled: !!selectedBedType,
  });

  const filteredOverview = useMemo(() => {
    if (!selectedBedType || !allFilteredBeds || allFilteredBeds.length === 0) return null;

    const total = allFilteredBeds.reduce((sum, bed) => sum + (bed.totalLeitos || 0), 0);
    const leitosSus = allFilteredBeds.reduce((sum, bed) => sum + ((bed as any).leitosSus || 0), 0);
    const estabelecimentos = allFilteredBeds.length;

    return {
      totalLeitos: total,
      leitosDisponiveis: leitosSus,
      ocupacaoMedia: total > 0 ? (leitosSus / total) * 100 : 0,
      criticos: estabelecimentos,
    };
  }, [selectedBedType, allFilteredBeds]);

  const filteredStateData = useMemo(() => {
    if (!selectedBedType || !allFilteredBeds || allFilteredBeds.length === 0) return null;

    const populationMap = new Map<string, { estado: string; regiao: string; populacao: number }>();
    if (byState) {
      (byState as BedsByState[]).forEach((state) => {
        populationMap.set(state.siglaUf, {
          estado: state.nomeUf,
          regiao: state.regiao,
          populacao: state.populacao,
        });
      });
    }

    const stateMap = new Map<
      string,
      {
        total: number;
        disponiveis: number;
        uf: string;
        count: number;
      }
    >();

    allFilteredBeds.forEach((bed) => {
      const uf = bed.localizacaoUf || "Desconhecido";
      const existing = stateMap.get(uf) || { total: 0, disponiveis: 0, uf, count: 0 };
      existing.total += bed.totalLeitos || 0;
      existing.disponiveis += (bed as any).leitosSus || 0;
      existing.count += 1;
      stateMap.set(uf, existing);
    });

    return Array.from(stateMap.entries()).map(([uf, data]) => {
      const popData = populationMap.get(uf);
      return {
        uf,
        estado: popData?.estado || uf,
        total: data.total,
        disponiveis: data.disponiveis,
        regiao: popData?.regiao || "",
        populacao: popData?.populacao || 0,
        leitosPor1000: popData && popData.populacao > 0 ? (data.total / popData.populacao) * 1000 : 0,
      };
    });
  }, [selectedBedType, allFilteredBeds, byState]);

  const stateData = useMemo(() => {
    if (selectedBedType && filteredStateData) return filteredStateData;

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
  }, [byState, selectedBedType, filteredStateData]);

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
        month: selectedMonth ?? undefined,
      }),
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
        queryKey: ["leitos", { page: nextPage, pageSize, selectedUf, selectedBedType, selectedYear, selectedMonth }],
        queryFn: () =>
          getLeitosPage({
            pageNumber: nextPage,
            pageSize,
            ufs: selectedUf ? [selectedUf] : undefined,
            tipoLeito: selectedBedType || undefined,
            year: selectedYear,
            month: selectedMonth ?? undefined,
          }),
        staleTime: 60 * 1000,
      });
    }

    if (prevPage >= 1) {
      queryClient.prefetchQuery({
        queryKey: ["leitos", { page: prevPage, pageSize, selectedUf, selectedBedType, selectedYear, selectedMonth }],
        queryFn: () =>
          getLeitosPage({
            pageNumber: prevPage,
            pageSize,
            ufs: selectedUf ? [selectedUf] : undefined,
            tipoLeito: selectedBedType || undefined,
            year: selectedYear,
            month: selectedMonth ?? undefined,
          }),
        staleTime: 60 * 1000,
      });
    }
  }, [page, pageSize, leitosPage?.totalPages, selectedUf, selectedBedType, selectedYear, selectedMonth, queryClient]);

  useEffect(() => {
    setPage(1);
  }, [selectedUf, selectedBedType, selectedYear, selectedMonth]);

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

  const regionalOccupancyData = useMemo(() => {
    if (selectedBedType && allFilteredBeds && allFilteredBeds.length > 0) {
      const ufToRegion: Record<string, string> = {
        AC: "Norte",
        AP: "Norte",
        AM: "Norte",
        PA: "Norte",
        RO: "Norte",
        RR: "Norte",
        TO: "Norte",
        AL: "Nordeste",
        BA: "Nordeste",
        CE: "Nordeste",
        MA: "Nordeste",
        PB: "Nordeste",
        PE: "Nordeste",
        PI: "Nordeste",
        RN: "Nordeste",
        SE: "Nordeste",
        DF: "Centro-Oeste",
        GO: "Centro-Oeste",
        MT: "Centro-Oeste",
        MS: "Centro-Oeste",
        ES: "Sudeste",
        MG: "Sudeste",
        RJ: "Sudeste",
        SP: "Sudeste",
        PR: "Sul",
        RS: "Sul",
        SC: "Sul",
      };

      const regionalMap = new Map<string, { totalLeitos: number; leitosSus: number }>();

      allFilteredBeds.forEach((bed) => {
        const uf = bed.localizacaoUf || "";
        const regiao = ufToRegion[uf] || "Desconhecido";

        const existing = regionalMap.get(regiao) || { totalLeitos: 0, leitosSus: 0 };
        existing.totalLeitos += bed.totalLeitos || 0;
        existing.leitosSus += (bed as any).leitosSus || 0;
        regionalMap.set(regiao, existing);
      });

      return Array.from(regionalMap.entries())
        .filter(([regiao]) => regiao !== "Desconhecido")
        .map(([regiao, data]) => ({
          regiao,
          totalLeitos: data.totalLeitos,
          leitosDisponiveis: data.leitosSus,
          leitosOcupados: 0,
          ocupacaoMedia: data.totalLeitos > 0 ? (data.leitosSus / data.totalLeitos) * 100 : 0,
        }));
    }

    if (!byState) return [];

    const regionalMap = new Map<
      string,
      {
        totalLeitos: number;
        leitosSus: number;
      }
    >();

    (byState as BedsByState[]).forEach((state) => {
      const existing = regionalMap.get(state.regiao) || {
        totalLeitos: 0,
        leitosSus: 0,
      };

      existing.totalLeitos += state.totalLeitos || 0;
      existing.leitosSus += (state as any).leitosSus || state.leitosDisponiveis || 0;

      regionalMap.set(state.regiao, existing);
    });

    return Array.from(regionalMap.entries()).map(([regiao, data]) => ({
      regiao,
      totalLeitos: data.totalLeitos,
      leitosDisponiveis: data.leitosSus,
      leitosOcupados: 0,
      ocupacaoMedia: data.totalLeitos > 0 ? (data.leitosSus / data.totalLeitos) * 100 : 0,
    }));
  }, [byState, selectedBedType, allFilteredBeds]);

  return (
    <div className="space-y-6">
      {}
      <PageHeader title="Hospitais e Leitos" description="Monitoramento de capacidade hospitalar e disponibilidade de leitos" />

      {}
      {(overviewError || byStateError || leitosError || (selectedBedType && !isLoadingFiltered && !allFilteredBeds)) && (
        <div className="card p-4 border border-red-200 bg-red-50 text-red-700">
          <p className="text-sm font-medium">Falha ao carregar dados de leitos.</p>
          <p className="text-xs mt-1">
            {overviewError ? "Indicadores gerais indisponíveis. " : ""}
            {byStateError ? "Indicadores por estado indisponíveis. " : ""}
            {leitosError ? " Dados detalhados de leitos indisponíveis." : ""}
            {selectedBedType && !isLoadingFiltered && !allFilteredBeds ? " Não foi possível carregar dados filtrados." : ""}
          </p>
        </div>
      )}

      {}
      <div className="grid gap-4 lg:grid-cols-3">
        <YearFilter value={selectedYear} onChange={setSelectedYear} minYear={2020} />
        <MonthFilter value={selectedMonth} onChange={setSelectedMonth} year={selectedYear} />
        <BedTypeFilter value={selectedBedType} onChange={setSelectedBedType} options={bedTypeOptions} />
      </div>

      {}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BedsStatCard label="Total de Leitos" value={safeNumber(selectedBedType ? filteredOverview?.totalLeitos : overview?.totalLeitos)} sublabel={selectedBedType ? "Do tipo selecionado" : "Em todo o Brasil"} icon={<Bed />} iconColor="blue" isLoading={selectedBedType ? isLoadingFiltered : isLoadingOverview} />
        <BedsStatCard label="Leitos SUS" value={safeNumber(selectedBedType ? filteredOverview?.leitosDisponiveis : (overview as any)?.leitosSus)} sublabel={selectedBedType ? "Do tipo selecionado" : "Sistema Único de Saúde"} icon={<CheckCircle />} iconColor="green" isLoading={selectedBedType ? isLoadingFiltered : isLoadingOverview} />
        <BedsStatCard
          label="Cobertura SUS"
          value={(() => {
            if (selectedBedType && filteredOverview) {
              const total = safeNumber(filteredOverview.totalLeitos);
              const sus = safeNumber(filteredOverview.leitosDisponiveis);
              if (total > 0) {
                return `${((sus / total) * 100).toFixed(1)}%`;
              }
              return "0.0%";
            }
            const total = safeNumber(overview?.totalLeitos);
            const sus = safeNumber((overview as any)?.leitosSus);
            if (total > 0) {
              return `${((sus / total) * 100).toFixed(1)}%`;
            }
            return "0.0%";
          })()}
          sublabel={selectedBedType ? "Do tipo selecionado" : "Leitos disponíveis pelo SUS"}
          icon={<Activity />}
          iconColor="blue"
          isLoading={selectedBedType ? isLoadingFiltered : isLoadingOverview}
        />
        <BedsStatCard label="Estabelecimentos" value={safeNumber(selectedBedType ? filteredOverview?.criticos : overview?.criticos)} sublabel={selectedBedType ? "Com leitos do tipo" : "Total cadastrados"} icon={<AlertCircle />} iconColor="red" isLoading={selectedBedType ? isLoadingFiltered : isLoadingOverview} />
      </div>

      {}
      <RegionalOccupancyChart data={regionalOccupancyData} isLoading={selectedBedType ? isLoadingFiltered : isLoadingState} />

      {}
      <div className="grid gap-4 lg:grid-cols-2">
        <BedsCapacityChart data={stateData} isLoading={isLoadingState} />
        <BedsPer1000Chart data={stateData} isLoading={isLoadingState} />
      </div>

      {}
      <div className="grid gap-4 lg:grid-cols-2">
        <HospitalsList hospitals={hospitals} isLoading={isLoadingLeitos} page={page} totalPages={leitosPage?.totalPages} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => Math.min(leitosPage?.totalPages || p + 1, p + 1))} ufOptions={ufOptions} selectedUf={selectedUf} onChangeUf={(uf) => setSelectedUf(uf)} />
        <RegionalAnalysis data={regionalData} isLoading={isLoadingRegional} />
      </div>

      {}
      <HighOccupancyAlert count={highOccupancy.count} percentage={highOccupancy.percentage} recommendation={highOccupancy.recommendation} isLoading={isLoadingHighOccupancy} />
    </div>
  );
}
