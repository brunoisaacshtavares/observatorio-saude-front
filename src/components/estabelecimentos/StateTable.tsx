import { formatNumber } from "../../utils/formatters";
import { getRegionColor } from "../../utils/colors";
import { useEffect, useRef } from "react";
import type { EstabelecimentoItem } from "../../types/cnes";

export type Row = {
  uf: string;
  estado: string;
  regiao: "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul" | string;
  estabelecimentos: number;
  populacao: number;
  estPor100k: number;
};

type Props = {
  rows: Row[];
  openUFs?: string[];
  onToggleUF?: (uf: string) => void;
  dataByUF?: Record<string, EstabelecimentoItem[] | undefined>;
  loadingByUF?: Record<string, boolean | undefined>;
  pageByUF?: Record<string, number | undefined>;
  hasNextByUF?: Record<string, boolean | undefined>;
  onChangePageForUF?: (uf: string, page: number) => void;
  asc?: boolean;
};

function getDotColorByRegion(regiao: Row["regiao"]): string {
  return getRegionColor(regiao);
}

export default function StateTable({ rows, openUFs = [], onToggleUF, dataByUF = {}, loadingByUF = {}, pageByUF = {}, hasNextByUF = {}, onChangePageForUF, asc = false }: Props) {
  const sorted = [...rows].sort((a, b) => (asc ? a.estabelecimentos - b.estabelecimentos : b.estabelecimentos - a.estabelecimentos));
  const listContainerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastHeightsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    sorted.forEach((r) => {
      const el = listContainerRefs.current[r.uf];
      if (el && !loadingByUF[r.uf]) {
        lastHeightsRef.current[r.uf] = el.clientHeight;
      }
    });
  }, [sorted, dataByUF, loadingByUF]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="text-left bg-slate-50 border-y border-slate-100">
          <tr className="text-slate-500">
            <th className="py-3 pl-5 pr-3 font-medium">Estado</th>
            <th className="py-3 px-3 font-medium">Região</th>
            <th className="py-3 px-3 font-medium">Estabelecimentos</th>
            <th className="py-3 px-3 font-medium">População</th>
            <th className="py-3 px-3 font-medium">Est./100k hab.</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const dotColor = getDotColorByRegion(r.regiao);
            const selected = openUFs.includes(r.uf);
            return (
              <>
                <tr id={`state-row-${r.uf}`} key={r.uf} className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition ${selected ? "bg-slate-50" : ""}`} onClick={() => onToggleUF?.(r.uf)}>
                  <td className="py-3 pl-5 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }} aria-hidden />
                      <span className="text-slate-800">{r.estado}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{r.regiao}</td>
                  <td className="py-3 px-3 text-slate-800">{formatNumber(r.estabelecimentos)}</td>
                  <td className="py-3 px-3 text-slate-800">{formatNumber(r.populacao)}</td>
                  <td className="py-3 px-3 text-slate-800">{r.estPor100k.toFixed(1)}</td>
                </tr>
                {selected ? (
                  <tr>
                    <td colSpan={5} className="bg-white">
                      <div className="px-5 py-4 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900">Estabelecimentos em {r.uf}</p>
                        <div
                          ref={(el) => {
                            listContainerRefs.current[r.uf] = el;
                          }}
                          style={loadingByUF[r.uf] && lastHeightsRef.current[r.uf] ? { minHeight: `${lastHeightsRef.current[r.uf]}px` } : undefined}
                        >
                          {(!dataByUF[r.uf] || (dataByUF[r.uf]?.length || 0) === 0) && loadingByUF[r.uf] ? (
                            <p className="text-xs text-slate-500 mt-1">Carregando…</p>
                          ) : !dataByUF[r.uf] || (dataByUF[r.uf]?.length || 0) === 0 ? (
                            <p className="text-xs text-slate-500 mt-1">Nenhum estabelecimento encontrado.</p>
                          ) : (
                            <>
                              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                                {dataByUF[r.uf]!.map((e) => (
                                  <li key={e.caracteristicas.codUnidade} className="w-full rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition">
                                    <p className="text-sm font-medium text-slate-900">{e.caracteristicas.nmFantasia || e.caracteristicas.nmRazaoSocial}</p>
                                    <p className="text-xs text-slate-600">{e.localizacao.endereco ?? "Endereço não informado"}</p>
                                    <p className="text-xs text-slate-500">{e.localizacao.bairro ?? ""}</p>
                                  </li>
                                ))}
                              </ul>
                              {loadingByUF[r.uf] ? <p className="text-xs text-slate-500 mt-2">Atualizando…</p> : null}
                            </>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <button
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
                            disabled={(pageByUF[r.uf] || 1) <= 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              onChangePageForUF?.(r.uf, Math.max(1, (pageByUF[r.uf] || 1) - 1));
                            }}
                          >
                            Anterior
                          </button>
                          <span className="text-xs text-[#004F6D]">Página {pageByUF[r.uf] || 1}</span>
                          <button
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white bg-[#004F6D] hover:opacity-95 transition disabled:opacity-50"
                            disabled={!hasNextByUF[r.uf]}
                            onClick={(e) => {
                              e.stopPropagation();
                              onChangePageForUF?.(r.uf, (pageByUF[r.uf] || 1) + 1);
                            }}
                          >
                            Próxima
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
