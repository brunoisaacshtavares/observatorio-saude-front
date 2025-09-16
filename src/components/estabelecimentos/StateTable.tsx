import { formatNumber } from "../../utils/formatters";
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
  selectedUF?: string | null;
  onSelectUF?: (uf: string | null) => void;
  estabelecimentosUF?: EstabelecimentoItem[];
  loadingEstabelecimentos?: boolean;
};

function getDotColorByRegion(regiao: Row["regiao"]): string {
  switch (regiao) {
    case "Sudeste":
      return "#004F6D";
    case "Sul":
      return "#004F7D";
    case "Nordeste":
      return "#FFD166";
    case "Norte":
      return "#E63946";
    case "Centro-Oeste":
      return "#004F7D";
    default:
      return "#004F6D";
  }
}

export default function StateTable({ rows, selectedUF, onSelectUF, estabelecimentosUF, loadingEstabelecimentos }: Props) {
  const sorted = [...rows].sort((a, b) => b.estabelecimentos - a.estabelecimentos);

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
            const selected = selectedUF === r.uf;
            return (
              <>
                <tr key={r.uf} className={`border-b border-slate-100 hover:bg-slate-50 transition ${selected ? "bg-slate-50" : ""}`} onClick={() => onSelectUF?.(selected ? null : r.uf)}>
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
                        {loadingEstabelecimentos ? (
                          <p className="text-xs text-slate-500 mt-1">Carregando…</p>
                        ) : !estabelecimentosUF || estabelecimentosUF.length === 0 ? (
                          <p className="text-xs text-slate-500 mt-1">Nenhum estabelecimento encontrado.</p>
                        ) : (
                          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                            {estabelecimentosUF.map((e) => (
                              <li key={e.caracteristicas.codUnidade} className="w-full rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition">
                                <p className="text-sm font-medium text-slate-900">{e.caracteristicas.nmFantasia || e.caracteristicas.nmRazaoSocial}</p>
                                <p className="text-xs text-slate-600">{e.localizacao.endereco ?? "Endereço não informado"}</p>
                                <p className="text-xs text-slate-500">{e.localizacao.bairro ?? ""}</p>
                              </li>
                            ))}
                          </ul>
                        )}
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
