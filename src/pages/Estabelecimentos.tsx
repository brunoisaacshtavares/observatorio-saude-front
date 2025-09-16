import PageHeader from "../components/common/PageHeader";
import SearchBar from "../components/estabelecimentos/SearchBar";
import RankingBarChart from "../components/estabelecimentos/RankingBarChart";
import ScatterChartCard from "../components/estabelecimentos/ScatterChartCard";
import StateTable from "../components/estabelecimentos/StateTable";
import StatGradientCard from "../components/cards/StatGradientCard";
import { Building2, UsersRound, Filter } from "lucide-react";
import { useMemo, useState } from "react";
import { formatNumber, UF_METADATA } from "../utils/formatters";
import { useQuery } from "@tanstack/react-query";
import { getUFCountsByAmostra, getEstabelecimentos, getEstabelecimentosPorUF } from "../services/establishments";
import { useState as useReactState } from "react";

function useUFData() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["uf-counts-amostra"],
    queryFn: () => getUFCountsByAmostra(600),
  });

  const rows = useMemo(() => {
    if (!data) return [] as { uf: string; estado: string; regiao: string; estabelecimentos: number; populacao: number }[];
    return data
      .filter((d) => d.meta)
      .map((d) => ({
        uf: d.meta!.sigla,
        estado: d.meta!.nome,
        regiao: d.meta!.regiao,
        estabelecimentos: d.qty,
        populacao: d.meta!.populacao,
      }));
  }, [data]);

  return { rows, isLoading, isError };
}

export default function Estabelecimentos() {
  const [q, setQ] = useState("");
  const [estadoSelecionado, setEstadoSelecionado] = useState<string | null>(null);
  const { rows, isLoading, isError } = useUFData();
  const [selectedRegiao, setSelectedRegiao] = useReactState<string | null>(null);
  const [selectedUfs, setSelectedUfs] = useReactState<string[]>([]);
  const [appliedRegiao, setAppliedRegiao] = useReactState<string | null>(null);
  const [appliedUfs, setAppliedUfs] = useReactState<string[]>([]);
  const [draftRegiao, setDraftRegiao] = useReactState<string | null>(null);
  const [draftUfs, setDraftUfs] = useReactState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useReactState(false);

  const {
    data: totalResp,
    isLoading: isLoadingTotal,
    isError: isErrorTotal,
  } = useQuery({
    queryKey: ["estabelecimentos-total-nacional"],
    queryFn: () => getEstabelecimentos(1, 1),
  });

  const filtered = useMemo(() => {
    if (appliedUfs.length === 0 && !appliedRegiao && !q) return [] as typeof rows;

    let base = [...rows];
    if (appliedUfs.length > 0) {
      base = base.filter((s) => appliedUfs.includes(s.uf));
    } else if (appliedRegiao) {
      base = base.filter((s) => s.regiao === appliedRegiao);
    }
    if (q) {
      const term = q.toLowerCase();
      base = base.filter((s) => s.estado.toLowerCase().includes(term) || s.regiao.toLowerCase().includes(term) || s.uf.toLowerCase().includes(term));
    }
    return base;
  }, [q, rows, appliedRegiao, appliedUfs]);

  const filterLabel = useMemo(() => {
    if (selectedUfs.length === 0 && !selectedRegiao) return "Todos os Estados";
    if (selectedUfs.length > 0) return selectedUfs.length === 1 ? selectedUfs[0] : `${selectedUfs[0]} +${selectedUfs.length - 1}`;
    return selectedRegiao!;
  }, [selectedRegiao, selectedUfs]);

  const ufOptions = useMemo(() => {
    const all = rows.map((s) => s.uf);
    const unique = [...new Set(all)].sort();
    if (!draftRegiao) return unique;
    return unique.filter((sigla) => {
      const meta = Object.values(UF_METADATA).find((m) => m.sigla === sigla);
      return meta?.regiao === draftRegiao;
    });
  }, [rows, draftRegiao]);

  const totalNacional = useMemo(() => rows.reduce((acc, s) => acc + s.estabelecimentos, 0), [rows]);
  const estabPor100k = (s: (typeof rows)[number]) => s.estabelecimentos / (s.populacao / 100_000);

  const { data: estabUF, isLoading: loadingUF } = useQuery({
    queryKey: ["estabelecimentos-por-uf", estadoSelecionado],
    queryFn: () => (estadoSelecionado ? getEstabelecimentosPorUF(estadoSelecionado, 100) : Promise.resolve([])),
  });

  return (
    <div className="space-y-4">
      {}
      <PageHeader title="Estabelecimentos de Saúde" description="Análise detalhada dos estabelecimentos cadastrados no CNES por região." />

      {}
      <div className="relative">
        <SearchBar
          value={q}
          onChange={setQ}
          onClear={() => setQ("")}
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
                setAppliedRegiao(selectedRegiao);
                setAppliedUfs(selectedUfs);
              },
            },
          ]}
        />

        {isFilterOpen && (
          <div className="absolute right-0 z-10 mt-2 w-full max-w-lg">
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
                  <label className="block text-xs font-medium text-slate-600 mb-1">UF</label>
                  <div className="flex flex-wrap gap-2">
                    {ufOptions.map((sigla) => {
                      const active = draftUfs.includes(sigla);
                      return (
                        <button
                          key={sigla}
                          type="button"
                          title={Object.values(UF_METADATA).find((m) => m.sigla === sigla)?.nome || sigla}
                          className={`px-2 py-1 rounded-md border text-xs ${active ? "bg-[#004F6D] text-white border-[#004F6D]" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                          onClick={() => {
                            setDraftUfs((prev) => (prev.includes(sigla) ? prev.filter((s) => s !== sigla) : [...prev, sigla]));
                          }}
                        >
                          {sigla}
                        </button>
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

      {}
      <section className="grid gap-4 lg:grid-cols-2">
        {isLoading ? (
          <div className="card p-4 text-sm text-slate-500">Carregando…</div>
        ) : isError ? (
          <div className="card p-4 text-sm text-red-600">Erro ao carregar dados.</div>
        ) : (
          <RankingBarChart
            title="Ranking de Estados por Número de Estabelecimentos"
            data={filtered.map((s) => ({
              estado: s.estado,
              uf: s.uf,
              estabelecimentos: s.estabelecimentos,
            }))}
          />
        )}

        {isLoading ? (
          <div className="card p-4 text-sm text-slate-500">Carregando…</div>
        ) : isError ? (
          <div className="card p-4 text-sm text-red-600">Erro ao carregar dados.</div>
        ) : (
          <ScatterChartCard
            title="Relação População x Estabelecimentos"
            data={filtered.map((s) => ({
              estado: s.estado,
              populacao: s.populacao,
              estabelecimentos: s.estabelecimentos,
            }))}
          />
        )}
      </section>

      {}
      <section className="card p-0 overflow-hidden">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base md:text-lg font-semibold text-slate-900">Detalhes por Estado</h3>
            {estadoSelecionado ? <span className="text-xs text-slate-500">UF selecionada: {estadoSelecionado}</span> : null}
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
              estPor100k: s.estabelecimentos / (s.populacao / 100_000),
            }))}
            onSelectUF={setEstadoSelecionado}
            selectedUF={estadoSelecionado}
            estabelecimentosUF={estabUF}
            loadingEstabelecimentos={loadingUF}
          />
        )}
      </section>

      {}
      <section className="grid gap-4 md:grid-cols-3">
        <StatGradientCard title="Total Nacional" value={isLoadingTotal ? "…" : isErrorTotal ? "Erro" : formatNumber(totalResp?.totalCount ?? 0)} sublabel="Estabelecimentos" gradientFrom="#004F6D" gradientTo="#003A52" icon={<Building2 />} />
        <StatGradientCard title="Média Nacional" value={isLoading ? "…" : isError ? "Erro" : formatNumber(rows.length ? Math.round(totalNacional / rows.length) : 0)} sublabel="Por estado" gradientFrom="#00A67D" gradientTo="#008A67" icon={<UsersRound />} />
        <StatGradientCard title="Cobertura Média" value={isLoading ? "…" : isError ? "Erro" : rows.length ? (rows.reduce((acc, s) => acc + estabPor100k(s), 0) / rows.length).toFixed(1) : "0.0"} sublabel="Est./100k hab." gradientFrom="#FFD166" gradientTo="#E6BC5A" icon={<Filter />} />
      </section>
    </div>
  );
}
