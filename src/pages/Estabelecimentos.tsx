import PageHeader from "../components/common/PageHeader";
import SearchBar from "../components/estabelecimentos/SearchBar";
import RankingBarChart from "../components/estabelecimentos/RankingBarChart";
import ScatterChartCard from "../components/estabelecimentos/ScatterChartCard";
import { getRegionColor } from "../utils/colors";
import StateTable from "../components/estabelecimentos/StateTable";
import StatGradientCard from "../components/cards/StatGradientCard";
import { Building2, UsersRound, Filter } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { formatNumber, UF_METADATA } from "../utils/formatters";
import { useQuery, useQueries } from "@tanstack/react-query";
import { 
  getTotalEstabelecimentos, 
  getTotalEstabelecimentosPorEstado, 
  getEstabelecimentosPorUFPage,
  exportEstabelecimentos
} from "../services/establishments";
import { useState as useReactState } from "react";
import html2canvas from 'html2canvas';
import ExportButton from "../components/estabelecimentos/ExportButton";

function useUFData() {
  const { data, isLoading, isError } = useQuery({
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

  const rows = useMemo(() => {
    if (!data) return [] as { uf: string; estado: string; regiao: string; estabelecimentos: number; populacao: number; estPor100k: number }[];
    return data.map((d) => ({
      uf: d.sigla,
      estado: d.nome,
      regiao: d.regiao,
      estabelecimentos: d.qty,
      populacao: d.populacao,
      estPor100k: d.cobertura,
    }));
  }, [data]);

  return { rows, isLoading, isError };
}

const FILTERS_STORAGE_KEY = "estabelecimentos-filtros-v1";

export default function Estabelecimentos() {
  const loadFilters = () => {
    const defaults = {
      selectedRegiao: null as string | null,
      selectedUfs: [] as string[],
      appliedRegiao: null as string | null,
      appliedUfs: [] as string[],
      q: "",
      showAllWhenEmpty: true as boolean,
    };
    try {
      if (typeof window === "undefined") return defaults;
      const raw = localStorage.getItem(FILTERS_STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw) as Partial<typeof defaults>;
      const selReg = parsed.selectedRegiao ?? null;
      const selUfs = Array.isArray(parsed.selectedUfs) ? parsed.selectedUfs : [];
      const appReg = parsed.appliedRegiao ?? selReg ?? null;
      const appUfs = Array.isArray(parsed.appliedUfs) && parsed.appliedUfs.length > 0 ? parsed.appliedUfs : selUfs;
      return {
        selectedRegiao: selReg,
        selectedUfs: selUfs,
        appliedRegiao: appReg,
        appliedUfs: appUfs,
        q: typeof parsed.q === "string" ? parsed.q : "",
        showAllWhenEmpty: typeof parsed.showAllWhenEmpty === "boolean" ? parsed.showAllWhenEmpty : true,
      };
    } catch {
      return defaults;
    }
  };

  const init = loadFilters();
  const [q, setQ] = useState(init.q);
  const [openUFs, setOpenUFs] = useState<string[]>([]);
  const [ufPageByUF, setUfPageByUF] = useState<Record<string, number>>({});
  const { rows, isLoading, isError } = useUFData();
  const [selectedRegiao, setSelectedRegiao] = useReactState<string | null>(() => init.selectedRegiao);
  const [selectedUfs, setSelectedUfs] = useReactState<string[]>(() => init.selectedUfs);
  const [appliedRegiao, setAppliedRegiao] = useReactState<string | null>(() => init.appliedRegiao);
  const [appliedUfs, setAppliedUfs] = useReactState<string[]>(() => init.appliedUfs);
  const [showAllWhenEmpty, setShowAllWhenEmpty] = useReactState<boolean>(() => init.showAllWhenEmpty);
  const [draftRegiao, setDraftRegiao] = useReactState<string | null>(null);
  const [draftUfs, setDraftUfs] = useReactState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useReactState(false);
  const [sortAsc, setSortAsc] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const rankingChartRef = useRef<HTMLDivElement>(null);
  const scatterChartRef = useRef<HTMLDivElement>(null);

  const handleExportData = async (format: 'csv' | 'xlsx') => {
    setIsExporting(true);
    try {
      await exportEstabelecimentos({
        format,
        ufs: appliedUfs,
      });
    } catch (error) {
      console.error("Falha ao exportar dados:", error);
      alert("Ocorreu um erro ao gerar o arquivo. Tente novamente.");
    } finally {
      setTimeout(() => {
        setIsExporting(false);
      }, 500);
    }
  };

  const handleExportChart = async (chartRef: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!chartRef.current) {
      console.error("Erro: Elemento do gráfico não encontrado para exportação.");
      return;
    }
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2 
      });
      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Falha ao exportar o gráfico como imagem:", error);
    }
  };

  useEffect(() => {
      const payload = {
        selectedRegiao,
        selectedUfs,
        appliedRegiao,
        appliedUfs,
        q,
        showAllWhenEmpty,
      };
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(payload));
  }, [selectedRegiao, selectedUfs, appliedRegiao, appliedUfs, q, showAllWhenEmpty]);

  const {
    data: totalResp,
    isLoading: isLoadingTotal,
    isError: isErrorTotal,
  } = useQuery({
    queryKey: ["contagem-total"],
    queryFn: () => getTotalEstabelecimentos(),
  });

  const filtered = useMemo(() => {
    if (appliedUfs.length === 0 && !appliedRegiao) return showAllWhenEmpty ? rows : ([] as typeof rows);

    let base = [...rows];
    if (appliedUfs.length > 0) {
      base = base.filter((s) => appliedUfs.includes(s.uf));
    } else if (appliedRegiao) {
      base = base.filter((s) => s.regiao === appliedRegiao);
    }
    return base;
  }, [rows, appliedRegiao, appliedUfs, showAllWhenEmpty]);

  const filterLabel = useMemo(() => {
    if (selectedUfs.length === 0 && !selectedRegiao) return "Selecione os Estados";
    if (selectedUfs.length > 0) return selectedUfs.length === 1 ? selectedUfs[0] : `${selectedUfs[0]} +${selectedUfs.length - 1}`;
    return selectedRegiao!;
  }, [selectedRegiao, selectedUfs]);

  const ufOptions = useMemo(() => {
    let filteredRows = rows;

    if (draftRegiao) {
      filteredRows = rows.filter((s) => s.regiao === draftRegiao);
    }
    const ufs = filteredRows.map((s) => s.uf);
    return [...new Set(ufs)].sort();
  }, [rows, draftRegiao]);

  const ufSiglaToNome = useMemo(() => {
    const map: Record<string, string> = {};
    Object.values(UF_METADATA).forEach((m) => {
      map[m.sigla] = m.nome;
    });
    return map;
  }, []);

  const selectedVisibleCount = useMemo(() => {
    return draftUfs.filter((u) => ufOptions.includes(u)).length;
  }, [draftUfs, ufOptions]);

  const resolveUFByInput = useMemo(() => {
    const normalize = (s: string) =>
      s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
    const entries = Object.values(UF_METADATA);
    return (raw: string): string | null => {
      const n = normalize(raw);
      if (!n) return null;
      const exactSigla = entries.find((e) => e.sigla.toLowerCase() === n)?.sigla;
      if (exactSigla) return exactSigla;
      const exactNome = entries.find((e) => normalize(e.nome) === n)?.sigla;
      if (exactNome) return exactNome;
      return null;
    };
  }, []);

  const totalNacional = useMemo(() => rows.reduce((acc, s) => acc + s.estabelecimentos, 0), [rows]);

  const ufQueries = useQueries({
    queries: openUFs.map((uf) => ({
      queryKey: ["estabelecimentos-por-uf", uf, ufPageByUF[uf] || 1] as const,
      queryFn: () => getEstabelecimentosPorUFPage(uf, ufPageByUF[uf] || 1, 30),
      placeholderData: (prev: any) => prev,
    })),
  });

  useMemo(() => {
    openUFs.forEach((uf) => {
      const nextPage = (ufPageByUF[uf] || 1) + 1;
      getEstabelecimentosPorUFPage(uf, nextPage, 30).catch(() => {});
      const nextNextPage = nextPage + 1;
      getEstabelecimentosPorUFPage(uf, nextNextPage, 30).catch(() => {});
    });
  }, [openUFs, ufPageByUF]);

  const dataByUF = useMemo(() => {
    const map: Record<string, any> = {};
    openUFs.forEach((uf, idx) => {
      const d = ufQueries[idx]?.data as { items?: any[] } | undefined;
      map[uf] = d?.items ?? [];
    });
    return map as Record<string, any[]>;
  }, [openUFs, ufQueries]);

  const loadingByUF = useMemo(() => {
    const map: Record<string, boolean> = {};
    openUFs.forEach((uf, idx) => {
      map[uf] = Boolean(ufQueries[idx]?.isLoading);
    });
    return map;
  }, [openUFs, ufQueries]);

  const hasNextByUF = useMemo(() => {
    const map: Record<string, boolean> = {};
    openUFs.forEach((uf, idx) => {
      map[uf] = Boolean(ufQueries[idx]?.data?.hasNextPage);
    });
    return map;
  }, [openUFs, ufQueries]);

  const isSelectionEmpty = useMemo(() => appliedUfs.length === 0 && !appliedRegiao, [appliedUfs, appliedRegiao]);

  return (
    <div className="space-y-4">
      <PageHeader title="Estabelecimentos de Saúde" description="Análise detalhada dos estabelecimentos cadastrados no CNES por região." />

      <div className="relative">
        <SearchBar
          value={q}
          onChange={setQ}
          onClear={() => setQ("")}
          hidePlaceholder={selectedUfs.length >= Object.keys(UF_METADATA).length}
          chips={selectedUfs.map((u) => {
            const row = rows.find((r) => r.uf === u);
            return { label: u, value: u, color: getRegionColor(row?.regiao), title: row?.estado || u };
          })}
          onRemoveChip={(uf) => {
            setSelectedUfs((prev) => {
              const next = prev.filter((x) => x !== uf);
              setAppliedUfs(next);
              return next;
            });
          }}
          onEnter={() => {
            const uf = resolveUFByInput(q);
            if (!uf) return;
            setSelectedUfs((prev) => (prev.includes(uf) ? prev : [...prev, uf]));
            setAppliedUfs((prev) => (prev.includes(uf) ? prev : [...prev, uf]));
            setQ("");
          }}
          rightButtons={[
            {
              label: filterLabel,
              variant: "ghost",
              className: "min-w-[180px] justify-center",
              onClick: () => {
                setDraftRegiao(selectedRegiao);
                setDraftUfs(selectedUfs);
                setIsFilterOpen((v) => !v);
              },
            },
            {
              label: "Filtrar",
              variant: "primary",
              icon: <Filter size={16} />,
              onClick: () => {
                const reg = isFilterOpen ? draftRegiao : selectedRegiao;
                const ufs = isFilterOpen ? draftUfs : selectedUfs;
                if (isFilterOpen) {
                  setSelectedRegiao(draftRegiao);
                  setSelectedUfs(draftUfs);
                  setIsFilterOpen(false);
                }
                setAppliedRegiao(reg);
                setAppliedUfs(ufs);
              },
            },
            {
              component: (
                <ExportButton
                  isLoading={isExporting}
                  onExportCSV={() => handleExportData('csv')}
                  onExportExcel={() => handleExportData('xlsx')}
                  onExportRankingPNG={() => handleExportChart(rankingChartRef, 'ranking_estados_cnes.png')}
                  onExportScatterPNG={() => handleExportChart(scatterChartRef, 'dispersao_populacao_estabelecimentos.png')}
                />
              ),
            },
          ]}
        />

        {isFilterOpen && (
          <div className="absolute right-0 z-50 mt-2 w-full max-w-lg">
            <div className="rounded-xl bg-white shadow-xl ring-1 ring-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900">Filtros</p>
                <p className="text-xs text-slate-500">Refine a visualização dos estados</p>
              </div>

              <div className="p-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Região</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004F6D]/20 focus:border-[#004F6D]" value={draftRegiao ?? ""} onChange={(e) => setDraftRegiao(e.target.value || null)}>
                    <option value="">Todas</option>
                    <option>Norte</option>
                    <option>Nordeste</option>
                    <option>Centro-Oeste</option>
                    <option>Sudeste</option>
                    <option>Sul</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-slate-600">UF</label>
                    <button
                      type="button"
                      className="text-xs text-[#004F6D]"
                      onClick={() => {
                        setDraftUfs((prev) => {
                          const anyVisibleSelected = prev.some((u) => ufOptions.includes(u));
                          if (anyVisibleSelected) {
                            return prev.filter((u) => !ufOptions.includes(u));
                          }
                          const merged = Array.from(new Set([...prev, ...ufOptions]));
                          return merged;
                        });
                      }}
                    >
                      {selectedVisibleCount > 0 ? "Limpar" : "Todos"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {ufOptions.map((sigla) => {
                      const active = draftUfs.includes(sigla);
                      return (
                        <div key={sigla} className="relative group">
                          <button
                            type="button"
                            aria-describedby={`tooltip-uf-${sigla}`}
                            className={`px-2 py-1 rounded-md border text-xs ${active ? "bg-[#004F6D] text-white border-[#004F6D]" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                            onClick={() => {
                              setDraftUfs((prev) => (prev.includes(sigla) ? prev.filter((s) => s !== sigla) : [...prev, sigla]));
                            }}
                          >
                            {sigla}
                          </button>
                          <div id={`tooltip-uf-${sigla}`} className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-8 whitespace-nowrap rounded-md bg-slate-800 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100 z-20 shadow-md">
                            {ufSiglaToNome[sigla] || sigla}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-800" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                  onClick={() => {
                    setDraftRegiao(null);
                    setDraftUfs([]);
                    setSelectedRegiao(null);
                    setSelectedUfs([]);
                    setAppliedRegiao(null);
                    setAppliedUfs([]);
                    setShowAllWhenEmpty(false);
                    setIsFilterOpen(false);
                  }}
                >
                  Limpar
                </button>
                <button
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white bg-[#004F6D] hover:opacity-95 transition"
                  onClick={() => {
                    setSelectedRegiao(draftRegiao);
                    setSelectedUfs(draftUfs);
                    setIsFilterOpen(false);
                  }}
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <section className="grid gap-4 lg:grid-cols-2">
          {isLoading ? (
            <div className="card p-4 text-sm text-slate-500">Carregando…</div>
          ) : isError ? (
            <div className="card p-4 text-sm text-red-600">Erro ao carregar dados.</div>
          ) : (
            <RankingBarChart
              ref={rankingChartRef}
              title="Ranking de Estados por Número de Estabelecimentos"
              data={filtered.map((s) => ({
                estado: s.estado,
                uf: s.uf,
                regiao: s.regiao,
                color: getRegionColor(s.regiao),
                estabelecimentos: s.estabelecimentos,
              }))}
              asc={sortAsc}
              onToggleAsc={() => setSortAsc((v) => !v)}
              onBarClick={({ uf, estado }) => {
                const resolvedUf = uf ?? filtered.find((f) => f.estado === estado)?.uf;
                if (!resolvedUf) return;
                setOpenUFs((prev) => (prev.includes(resolvedUf) ? prev : [...prev, resolvedUf]));
                setUfPageByUF((prev) => ({ ...prev, [resolvedUf]: 1 }));
                const section = document.getElementById("detalhes-por-estado");
                if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
                setTimeout(() => {
                  const row = document.getElementById(`state-row-${resolvedUf}`);
                  if (row) row.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 250);
              }}
            />
          )}

          {isLoading ? (
            <div className="card p-4 text-sm text-slate-500">Carregando…</div>
          ) : isError ? (
            <div className="card p-4 text-sm text-red-600">Erro ao carregar dados.</div>
          ) : (
            <ScatterChartCard
              ref={scatterChartRef}
              title="Relação População x Estabelecimentos"
              data={filtered.map((s) => ({
                estado: s.estado,
                regiao: s.regiao,
                color: getRegionColor(s.regiao),
                populacao: s.populacao,
                estabelecimentos: s.estabelecimentos,
              }))}
            />
          )}
        </section>

        {isSelectionEmpty && !isLoading && !isError ? (
          <>
            <div className="pointer-events-none absolute inset-0 z-10 rounded-xl bg-white/70 backdrop-blur-sm" />
            <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
              <div className="max-w-md w-full rounded-xl border border-slate-200 bg-white/95 backdrop-blur p-6 text-center shadow-xl">
                <p className="text-sm font-semibold text-slate-900">Selecione os Estados</p>
                <p className="mt-1 text-xs text-slate-600">Escolha um ou mais estados e clique em “Filtrar” para visualizar os gráficos.</p>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <section id="detalhes-por-estado" className="card p-0 overflow-hidden">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base md:text-lg font-semibold text-slate-900">Detalhes por Estado</h3>
            {openUFs.length ? <span className="text-xs text-slate-500">UFs abertas: {openUFs.join(", ")}</span> : null}
          </div>
        </div>
        {isLoading ? (
          <div className="px-5 py-4 text-sm text-slate-500">Carregando…</div>
        ) : isError ? (
          <div className="px-5 py-4 text-sm text-red-600">Erro ao carregar dados.</div>
        ) : (
          <StateTable
            rows={filtered.map((s) => ({
              ...s,
              estPor100k: s.estPor100k,
            }))}
            asc={sortAsc}
            onToggleUF={(uf) => {
              setOpenUFs((prev) => (prev.includes(uf) ? prev.filter((x) => x !== uf) : [...prev, uf]));
              setUfPageByUF((prev) => ({ ...prev, [uf]: 1 }));
            }}
            openUFs={openUFs}
            dataByUF={dataByUF as any}
            loadingByUF={loadingByUF}
            pageByUF={ufPageByUF}
            hasNextByUF={hasNextByUF}
            onChangePageForUF={(uf, page) => setUfPageByUF((prev) => ({ ...prev, [uf]: page }))}
          />
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatGradientCard title="Total Nacional" value={isLoadingTotal ? "…" : isErrorTotal ? "Erro" : formatNumber(totalResp?.totalEstabelecimentos ?? 0)} sublabel="Estabelecimentos" gradientFrom="#004F6D" gradientTo="#003A52" icon={<Building2 />} />
        <StatGradientCard title="Média Nacional" value={isLoading ? "…" : isError ? "Erro" : formatNumber(rows.length ? Math.round(totalNacional / rows.length) : 0)} sublabel="Por estado" gradientFrom="#00A67D" gradientTo="#008A67" icon={<UsersRound />} />
        <StatGradientCard title="Cobertura Média" value={isLoading ? "…" : isError ? "Erro" : rows.length ? (rows.reduce((acc, s) => acc + s.estPor100k, 0) / rows.length).toFixed(1) : "0.0"} sublabel="Est./100k hab." gradientFrom="#FFD166" gradientTo="#E6BC5A" icon={<Filter />} />
      </section>
    </div>
  );
}
